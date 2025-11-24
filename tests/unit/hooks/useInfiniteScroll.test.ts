import { renderHook, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { useInfiniteScroll } from '@/hooks/useInfiniteScroll';

describe('useInfiniteScroll', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should use default limit of 10 when not provided', async () => {
    const mockFetch = vi.fn(async () => []);
    renderHook(() => useInfiniteScroll(mockFetch));

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith({ skip: 0, limit: 10 });
    });
  });

  it('should handle errors during fetch', async () => {
    const mockFetch = vi.fn().mockRejectedValue(new Error('Network error'));
    const { result } = renderHook(() => useInfiniteScroll(mockFetch, 10));
    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.error).toBe('Network error');

    expect(result.current.items).toHaveLength(0);

    expect(result.current.hasMore).toBe(true);
  });

  it('should not load more if hasMore is false', async () => {
    const mockFetch = vi.fn().mockResolvedValue([{ id: 1, name: 'Item 1' }]);
    const { result } = renderHook(() => useInfiniteScroll(mockFetch, 10));
    await waitFor(() => {
      expect(result.current.loading).toBe(false);

      expect(result.current.hasMore).toBe(false);
    });
    const initialCallCount = mockFetch.mock.calls.length;
    result.current.loadMore();

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledTimes(initialCallCount);
    });
  });

  it('should provide sentinel ref for Intersection Observer', () => {
    const mockFetch = vi.fn().mockResolvedValue([]);
    const { result } = renderHook(() => useInfiniteScroll(mockFetch, 10));
    expect(result.current.sentinelRef).toBeDefined();

    expect(result.current.sentinelRef.current).toBeNull();
  });
});
