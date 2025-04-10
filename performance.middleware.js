const { checkPerformance, optimizePerformance } = require('./performance.config');
const cacheService = require('./cache.service');

// Middleware kiểm tra hiệu suất
const performanceMiddleware = (req, res, next) => {
    const startTime = Date.now();
    const performance = checkPerformance();
    
    // Gắn thông tin hiệu suất vào request
    req.performance = {
        startTime,
        checkPerformance: performance
    };
    
    // Kiểm tra cache trước khi xử lý request
    if (performance.shouldCacheEndpoint(req.path)) {
        const cachedData = cacheService.get(req.path);
        if (cachedData) {
            return res.json(cachedData);
        }
    }
    
    // Ghi lại thời gian xử lý
    res.on('finish', () => {
        const responseTime = Date.now() - startTime;
        
        // Kiểm tra thời gian phản hồi
        if (!performance.checkApiResponseTime(responseTime)) {
            console.warn(`API response time (${responseTime}ms) exceeds limit`);
        }
        
        // Cache response nếu cần
        if (performance.shouldCacheEndpoint(req.path)) {
            cacheService.set(req.path, res.locals.data);
        }
    });
    
    next();
};

// Middleware tối ưu hóa hiệu suất
const optimizationMiddleware = (req, res, next) => {
    const optimizer = optimizePerformance();
    
    // Tối ưu hóa DOM
    optimizer.optimizeDOM();
    
    // Tối ưu hóa network
    optimizer.optimizeNetwork();
    
    // Tối ưu hóa JavaScript
    optimizer.optimizeJavaScript();
    
    next();
};

// Middleware giới hạn số lượng request
const rateLimitMiddleware = (req, res, next) => {
    const MAX_REQUESTS = 100; // Số request tối đa trong 1 phút
    const WINDOW_MS = 60000; // 1 phút
    
    // Đếm số request trong khoảng thời gian
    const requestCount = req.app.locals.requestCount || 0;
    const lastReset = req.app.locals.lastReset || Date.now();
    
    // Reset counter nếu đã qua 1 phút
    if (Date.now() - lastReset > WINDOW_MS) {
        req.app.locals.requestCount = 0;
        req.app.locals.lastReset = Date.now();
    }
    
    // Kiểm tra số lượng request
    if (requestCount >= MAX_REQUESTS) {
        return res.status(429).json({
            error: 'Too many requests',
            message: 'Please try again later'
        });
    }
    
    // Tăng counter
    req.app.locals.requestCount = (requestCount || 0) + 1;
    
    next();
};

module.exports = {
    performanceMiddleware,
    optimizationMiddleware,
    rateLimitMiddleware
}; 