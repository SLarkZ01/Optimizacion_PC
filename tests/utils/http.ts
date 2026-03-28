export interface JsonResponseInit {
  status?: number;
  headers?: HeadersInit;
}

export function jsonResponse<T>(data: T, init: JsonResponseInit = {}): Response {
  return new Response(JSON.stringify(data), {
    status: init.status ?? 200,
    headers: {
      "Content-Type": "application/json",
      ...(init.headers ?? {}),
    },
  });
}

export function textResponse(text: string, status = 200): Response {
  return new Response(text, {
    status,
    headers: {
      "Content-Type": "text/plain",
    },
  });
}
