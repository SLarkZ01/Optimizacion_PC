"use client";

import { useCallback, useRef, useState, useTransition } from "react";

interface UseDetailSheetOptions<T> {
  fetchData: () => Promise<T | null>;
}

interface UseDetailSheetResult<T> {
  open: boolean;
  isPending: boolean;
  error: boolean;
  data: T | null;
  handleOpenChange: (nextOpen: boolean) => void;
  retry: () => void;
}

export function useDetailSheet<T>({
  fetchData,
}: UseDetailSheetOptions<T>): UseDetailSheetResult<T> {
  const [open, setOpen] = useState(false);
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState(false);
  const [isPending, startTransition] = useTransition();
  const hasLoadedRef = useRef(false);

  const loadData = useCallback(() => {
    startTransition(async () => {
      try {
        const nextData = await fetchData();
        setData(nextData);
        setError(nextData === null);
      } catch {
        setError(true);
      }
    });
  }, [fetchData]);

  const handleOpenChange = useCallback(
    (nextOpen: boolean) => {
      setOpen(nextOpen);
      if (nextOpen && !hasLoadedRef.current) {
        hasLoadedRef.current = true;
        loadData();
      }
    },
    [loadData],
  );

  const retry = useCallback(() => {
    setError(false);
    loadData();
  }, [loadData]);

  return {
    open,
    isPending,
    error,
    data,
    handleOpenChange,
    retry,
  };
}
