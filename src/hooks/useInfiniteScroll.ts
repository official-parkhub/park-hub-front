'use client';

import { startTransition, useCallback, useEffect, useRef, useState } from 'react';

type UseInfiniteScrollReturn<T> = {
  items: T[];
  loading: boolean;
  error: string | null;
  hasMore: boolean;
  loadMore: () => void;
  sentinelRef: React.RefObject<HTMLDivElement | null>;
};

export function useInfiniteScroll<T>(
  fetchFn: (params: { skip: number; limit: number }) => Promise<T[]>,
  initialLimit: number = 10,
): UseInfiniteScrollReturn<T> {
  const [items, setItems] = useState<T[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState<boolean>(true);
  const [isInitialLoad, setIsInitialLoad] = useState<boolean>(true);

  const sentinelRef = useRef<HTMLDivElement>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);
  const isLoadingRef = useRef<boolean>(false);
  const hasMoreRef = useRef<boolean>(true);
  const loadMoreRef = useRef<() => void>(() => {});

  useEffect(() => {
    hasMoreRef.current = hasMore;
  }, [hasMore]);

  const loadMore = useCallback(async () => {
    if (isLoadingRef.current || !hasMore) {
      return;
    }

    isLoadingRef.current = true;
    setLoading(true);
    setError(null);

    try {
      const skip = items.length;
      const newItems = await fetchFn({ skip, limit: initialLimit });

      if (!Array.isArray(newItems)) {
        setError('Erro: resposta inválida da API');
        return;
      }

      if (newItems.length < initialLimit) {
        setHasMore(false);
      }

      setItems(prevItems => [...prevItems, ...newItems]);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao carregar dados';
      setError(errorMessage);
    } finally {
      setLoading(false);
      isLoadingRef.current = false;
    }
  }, [fetchFn, initialLimit, items.length, hasMore]);

  useEffect(() => {
    loadMoreRef.current = loadMore;
  }, [loadMore]);

  useEffect(() => {
    if (isInitialLoad) {
      startTransition(() => {
        setIsInitialLoad(false);
      });
      loadMore();
    }
  }, [isInitialLoad, loadMore]);

  useEffect(() => {
    const sentinel = sentinelRef.current;

    if (!sentinel) {
      return;
    }

    observerRef.current = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;

        if (
          entry
          && entry.isIntersecting
          && !isLoadingRef.current
          && hasMoreRef.current
        ) {
          loadMoreRef.current();
        }
      },
      {
        root: null,
        rootMargin: '100px',
        threshold: 0.1,
      },
    );

    observerRef.current.observe(sentinel);

    return () => {
      if (observerRef.current && sentinel) {
        observerRef.current.unobserve(sentinel);
        observerRef.current.disconnect();
      }
    };
  }, [hasMore]);

  return {
    items,
    loading,
    error,
    hasMore,
    loadMore,
    sentinelRef,
  };
}
