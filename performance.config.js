// Cấu hình hiệu suất
const PERFORMANCE_CONFIG = {
    // Giới hạn thời gian phản hồi API (ms)
    API_RESPONSE_TIME_LIMIT: 500,
    
    // Số lượng người dùng tối đa
    MAX_CONCURRENT_USERS: 100,
    
    // Thời gian tải trang tối đa (ms)
    PAGE_LOAD_TIME_LIMIT: 2000,
    
    // Số lượng bản ghi tối đa
    MAX_RECORDS: 10000,
    
    // Thời gian cache (phút)
    CACHE_DURATION: 5,
    
    // Danh sách API cần cache
    CACHED_ENDPOINTS: [
        '/api/devices',
        '/api/categories',
        '/api/alerts'
    ]
};

// Hàm kiểm tra hiệu suất
function checkPerformance() {
    const startTime = performance.now();
    
    return {
        // Kiểm tra thời gian phản hồi API
        checkApiResponseTime: (responseTime) => {
            return responseTime <= PERFORMANCE_CONFIG.API_RESPONSE_TIME_LIMIT;
        },
        
        // Kiểm tra số lượng người dùng
        checkConcurrentUsers: (currentUsers) => {
            return currentUsers <= PERFORMANCE_CONFIG.MAX_CONCURRENT_USERS;
        },
        
        // Kiểm tra thời gian tải trang
        checkPageLoadTime: () => {
            const loadTime = performance.now() - startTime;
            return loadTime <= PERFORMANCE_CONFIG.PAGE_LOAD_TIME_LIMIT;
        },
        
        // Kiểm tra số lượng bản ghi
        checkRecordCount: (count) => {
            return count <= PERFORMANCE_CONFIG.MAX_RECORDS;
        },
        
        // Lấy thời gian cache
        getCacheDuration: () => {
            return PERFORMANCE_CONFIG.CACHE_DURATION * 60 * 1000; // Chuyển đổi sang mili giây
        },
        
        // Kiểm tra endpoint có cần cache không
        shouldCacheEndpoint: (endpoint) => {
            return PERFORMANCE_CONFIG.CACHED_ENDPOINTS.includes(endpoint);
        }
    };
}

// Hàm tối ưu hóa hiệu suất
function optimizePerformance() {
    // Tối ưu hóa DOM
    const optimizeDOM = () => {
        // Sử dụng documentFragment để tối ưu việc thêm nhiều phần tử
        const fragment = document.createDocumentFragment();
        
        // Sử dụng requestAnimationFrame cho animation
        window.requestAnimationFrame(() => {
            // Code animation
        });
        
        // Sử dụng IntersectionObserver để lazy load
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    // Load content khi cần thiết
                }
            });
        });
    };
    
    // Tối ưu hóa network
    const optimizeNetwork = () => {
        // Sử dụng HTTP/2
        // Nén dữ liệu
        // Sử dụng CDN
    };
    
    // Tối ưu hóa JavaScript
    const optimizeJavaScript = () => {
        // Sử dụng Web Workers cho các tác vụ nặng
        // Debounce và throttle các sự kiện
        // Sử dụng memoization
    };
    
    return {
        optimizeDOM,
        optimizeNetwork,
        optimizeJavaScript
    };
}

module.exports = {
    PERFORMANCE_CONFIG,
    checkPerformance,
    optimizePerformance
}; 