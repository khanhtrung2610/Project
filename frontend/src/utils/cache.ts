interface CacheItem<T> {
    data: T;
    timestamp: number;
}

class Cache {
    private storage: { [key: string]: CacheItem<any> } = {};
    private readonly TTL: number = 5 * 60 * 1000; // 5 phút

    set<T>(key: string, data: T): void {
        this.storage[key] = {
            data,
            timestamp: Date.now()
        };
    }

    get<T>(key: string): T | null {
        const item = this.storage[key];
        if (!item) return null;

        if (Date.now() - item.timestamp > this.TTL) {
            delete this.storage[key];
            return null;
        }

        return item.data;
    }

    clear(): void {
        this.storage = {};
    }
}

export const cache = new Cache(); 