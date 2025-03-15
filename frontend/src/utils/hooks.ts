import { useState, useEffect, useCallback } from 'react';
import { cache } from './cache';

export function useDebounce<T>(value: T, delay: number): T {
    const [debouncedValue, setDebouncedValue] = useState<T>(value);

    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedValue(value);
        }, delay);

        return () => {
            clearTimeout(timer);
        };
    }, [value, delay]);

    return debouncedValue;
}

export function useCachedApi<T>(
    key: string,
    fetchFn: () => Promise<T>,
    dependencies: any[] = []
): { data: T | null; loading: boolean; error: Error | null; refetch: () => void } {
    const [data, setData] = useState<T | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<Error | null>(null);

    const fetchData = useCallback(async (useCache: boolean = true) => {
        if (useCache) {
            const cachedData = cache.get<T>(key);
            if (cachedData) {
                setData(cachedData);
                return;
            }
        }

        setLoading(true);
        setError(null);

        try {
            const result = await fetchFn();
            setData(result);
            cache.set(key, result);
        } catch (err) {
            setError(err as Error);
        } finally {
            setLoading(false);
        }
    }, [key, fetchFn]);

    useEffect(() => {
        fetchData();
    }, [...dependencies, fetchData]);

    return { data, loading, error, refetch: () => fetchData(false) };
} 