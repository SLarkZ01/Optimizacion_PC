import { vi } from "vitest";

export interface QueryResult<T = unknown> {
  data?: T;
  error?: unknown;
  count?: number | null;
}

interface StoredResult {
  data: unknown;
  error: unknown;
  count?: number | null;
}

type TableName = "customers" | "purchases" | "bookings";

interface TableState {
  selectQueue: StoredResult[];
  insertQueue: StoredResult[];
  updateQueue: StoredResult[];
}

const DEFAULT_RESULT: StoredResult = {
  data: null,
  error: null,
};

function toStoredResult<T>(result: QueryResult<T>): StoredResult {
  return {
    data: result.data ?? null,
    error: result.error ?? null,
    count: result.count,
  };
}

function buildTableState(): Record<TableName, TableState> {
  return {
    customers: { selectQueue: [], insertQueue: [], updateQueue: [] },
    purchases: { selectQueue: [], insertQueue: [], updateQueue: [] },
    bookings: { selectQueue: [], insertQueue: [], updateQueue: [] },
  };
}

export interface SupabaseMock {
  client: {
    from: ReturnType<typeof vi.fn>;
    rpc: ReturnType<typeof vi.fn>;
  };
  auth: {
    getUser: ReturnType<typeof vi.fn>;
    signInWithPassword: ReturnType<typeof vi.fn>;
    signOut: ReturnType<typeof vi.fn>;
    exchangeCodeForSession: ReturnType<typeof vi.fn>;
  };
  queue: {
    select: <T>(table: TableName, result: QueryResult<T>) => void;
    insert: <T>(table: TableName, result: QueryResult<T>) => void;
    update: <T>(table: TableName, result: QueryResult<T>) => void;
    rpc: <T>(fnName: string, result: QueryResult<T>) => void;
  };
  calls: {
    inserts: unknown[];
    updates: unknown[];
    selects: unknown[];
    filters: unknown[];
    rpc: unknown[];
  };
}

export function createSupabaseMock(): SupabaseMock {
  const tables = buildTableState();
  const rpcQueues = new Map<string, StoredResult[]>();

  const calls = {
    inserts: [] as unknown[],
    updates: [] as unknown[],
    selects: [] as unknown[],
    filters: [] as unknown[],
    rpc: [] as unknown[],
  };

  const auth = {
    getUser: vi.fn().mockResolvedValue({ data: { user: null }, error: null }),
    signInWithPassword: vi.fn().mockResolvedValue({ error: null }),
    signOut: vi.fn().mockResolvedValue({ error: null }),
    exchangeCodeForSession: vi.fn().mockResolvedValue({ error: null }),
  };

  function nextFromQueue(queue: StoredResult[]): StoredResult {
    return queue.shift() ?? DEFAULT_RESULT;
  }

  function createAwaitableChain(table: TableName, op: keyof TableState, payload: unknown) {
    const filters: Array<{ type: string; args: unknown[] }> = [];

    const chain: {
      select: (...args: unknown[]) => typeof chain;
      eq: (...args: unknown[]) => typeof chain;
      gte: (...args: unknown[]) => typeof chain;
      order: (...args: unknown[]) => typeof chain;
      limit: (...args: unknown[]) => typeof chain;
      range: (...args: unknown[]) => typeof chain;
      or: (...args: unknown[]) => typeof chain;
      single: () => Promise<StoredResult>;
      maybeSingle: () => Promise<StoredResult>;
      then: Promise<StoredResult>["then"];
      catch: Promise<StoredResult>["catch"];
      finally: Promise<StoredResult>["finally"];
    } = {
      select: (...args) => {
        filters.push({ type: "select", args });
        calls.filters.push({ table, op, type: "select", args });
        return chain;
      },
      eq: (...args) => {
        filters.push({ type: "eq", args });
        calls.filters.push({ table, op, type: "eq", args });
        return chain;
      },
      gte: (...args) => {
        filters.push({ type: "gte", args });
        calls.filters.push({ table, op, type: "gte", args });
        return chain;
      },
      order: (...args) => {
        filters.push({ type: "order", args });
        calls.filters.push({ table, op, type: "order", args });
        return chain;
      },
      limit: (...args) => {
        filters.push({ type: "limit", args });
        calls.filters.push({ table, op, type: "limit", args });
        return chain;
      },
      range: (...args) => {
        filters.push({ type: "range", args });
        calls.filters.push({ table, op, type: "range", args });
        return chain;
      },
      or: (...args) => {
        filters.push({ type: "or", args });
        calls.filters.push({ table, op, type: "or", args });
        return chain;
      },
      single: () => Promise.resolve(nextFromQueue(tables[table][op] as StoredResult[])),
      maybeSingle: () => Promise.resolve(nextFromQueue(tables[table][op] as StoredResult[])),
      then: (onFulfilled, onRejected) =>
        Promise.resolve(nextFromQueue(tables[table][op] as StoredResult[])).then(onFulfilled, onRejected),
      catch: (onRejected) => Promise.resolve(nextFromQueue(tables[table][op] as StoredResult[])).catch(onRejected),
      finally: (onFinally) => Promise.resolve(nextFromQueue(tables[table][op] as StoredResult[])).finally(onFinally),
    };

    const opName = op === "selectQueue" ? "select" : op === "insertQueue" ? "insert" : "update";
    if (opName === "select") {
      calls.selects.push({ table, payload, filters });
    }
    if (opName === "insert") {
      calls.inserts.push({ table, payload, filters });
    }
    if (opName === "update") {
      calls.updates.push({ table, payload, filters });
    }

    return chain;
  }

  const client = {
    from: vi.fn((tableName: TableName) => ({
      select: vi.fn((...args: unknown[]) =>
        createAwaitableChain(tableName, "selectQueue", args),
      ),
      insert: vi.fn((payload: unknown) =>
        createAwaitableChain(tableName, "insertQueue", payload),
      ),
      update: vi.fn((payload: unknown) =>
        createAwaitableChain(tableName, "updateQueue", payload),
      ),
    })),
    rpc: vi.fn((fnName: string, params?: unknown) => {
      calls.rpc.push({ fnName, params });
      const queue = rpcQueues.get(fnName) ?? [];
      const result = queue.shift() ?? DEFAULT_RESULT;
      rpcQueues.set(fnName, queue);
      return Promise.resolve(result);
    }),
  };

  return {
    client,
    auth,
    queue: {
      select: (table, result) => {
        tables[table].selectQueue.push(toStoredResult(result));
      },
      insert: (table, result) => {
        tables[table].insertQueue.push(toStoredResult(result));
      },
      update: (table, result) => {
        tables[table].updateQueue.push(toStoredResult(result));
      },
      rpc: (fnName, result) => {
        const queue = rpcQueues.get(fnName) ?? [];
        queue.push(toStoredResult(result));
        rpcQueues.set(fnName, queue);
      },
    },
    calls,
  };
}
