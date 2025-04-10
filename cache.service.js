// Service quản lý cache
class CacheService {
    constructor() {
        this.cache = new Map();
        this.performance = require('./performance.config').checkPerformance();
    }

    // Lưu dữ liệu vào cache
    set(key, data, duration = null) {
        const cacheDuration = duration || this.performance.getCacheDuration();
        const expiry = Date.now() + cacheDuration;
        
        this.cache.set(key, {
            data,
            expiry
        });
        
        // Tự động xóa cache khi hết hạn
        setTimeout(() => {
            this.delete(key);
        }, cacheDuration);
    }

    // Lấy dữ liệu từ cache
    get(key) {
        const item = this.cache.get(key);
        
        if (!item) return null;
        
        // Kiểm tra hết hạn
        if (Date.now() > item.expiry) {
            this.delete(key);
            return null;
        }
        
        return item.data;
    }

    // Xóa cache
    delete(key) {
        this.cache.delete(key);
    }

    // Xóa tất cả cache
    clear() {
        this.cache.clear();
    }

    // Kiểm tra cache có tồn tại không
    has(key) {
        return this.cache.has(key);
    }

    // Lấy tất cả keys trong cache
    keys() {
        return Array.from(this.cache.keys());
    }

    // Lấy số lượng items trong cache
    size() {
        return this.cache.size;
    }
}

// Tạo instance duy nhất
const cacheService = new CacheService();

module.exports = cacheService; 