import { useState, useCallback } from 'react';

interface CacheData {
    [key: string]: {
        data: any;
        timestamp: number;
    };
}

const CACHE_DURATION = 5 * 60 * 1000; // 5 phút

function useQueryCache() {
    const [cache, setCache] = useState<CacheData>({});

    const getCachedData = useCallback((key: string) => {
        const cachedItem = cache[key];
        if (!cachedItem) return null;

        const isExpired = Date.now() - cachedItem.timestamp > CACHE_DURATION;
        if (isExpired) {
            delete cache[key];
            return null;
        }

        return cachedItem.data;
    }, [cache]);

    const setCachedData = useCallback((key: string, data: any) => {
        setCache(prevCache => ({
            ...prevCache,
            [key]: {
                data,
                timestamp: Date.now()
            }
        }));
    }, []);

    return { getCachedData, setCachedData };
}

export default useQueryCache; 