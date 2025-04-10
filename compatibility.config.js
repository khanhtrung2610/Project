// Cấu hình tương thích
const COMPATIBILITY_CONFIG = {
    // Các trình duyệt được hỗ trợ
    SUPPORTED_BROWSERS: {
        chrome: '>= 88',
        firefox: '>= 78',
        safari: '>= 14',
        edge: '>= 88',
        opera: '>= 74'
    },
    
    // Các độ phân giải màn hình được hỗ trợ
    SUPPORTED_RESOLUTIONS: [
        '1920x1080',  // Desktop
        '1366x768',   // Laptop
        '1024x768',   // Tablet
        '768x1024',   // Tablet dọc
        '414x896',    // Mobile
        '375x812'     // Mobile nhỏ
    ],
    
    // Các hệ điều hành được hỗ trợ
    SUPPORTED_OS: [
        'Windows 10',
        'Windows 11',
        'macOS 10.15+',
        'Ubuntu 20.04+',
        'CentOS 7+'
    ],
    
    // Các thiết bị được hỗ trợ
    SUPPORTED_DEVICES: [
        'Desktop',
        'Laptop',
        'Tablet',
        'Mobile'
    ]
};

// Hàm kiểm tra tương thích trình duyệt
function checkBrowserCompatibility() {
    const userAgent = navigator.userAgent.toLowerCase();
    const browserInfo = {
        isChrome: /chrome/.test(userAgent),
        isFirefox: /firefox/.test(userAgent),
        isSafari: /safari/.test(userAgent) && !/chrome/.test(userAgent),
        isEdge: /edg/.test(userAgent),
        isOpera: /opera/.test(userAgent)
    };
    
    return browserInfo;
}

// Hàm kiểm tra độ phân giải màn hình
function checkResolutionCompatibility() {
    const width = window.innerWidth;
    const height = window.innerHeight;
    const currentResolution = `${width}x${height}`;
    
    return COMPATIBILITY_CONFIG.SUPPORTED_RESOLUTIONS.includes(currentResolution);
}

// Hàm điều chỉnh giao diện theo thiết bị
function adjustLayoutForDevice() {
    const width = window.innerWidth;
    
    if (width >= 1200) {
        // Desktop layout
        document.body.classList.add('desktop-layout');
    } else if (width >= 768) {
        // Tablet layout
        document.body.classList.add('tablet-layout');
    } else {
        // Mobile layout
        document.body.classList.add('mobile-layout');
    }
}

// Hàm kiểm tra và áp dụng dark mode
function checkAndApplyDarkMode() {
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    
    if (prefersDark) {
        document.body.classList.add('dark-mode');
    }
}

// Hàm kiểm tra tính năng hỗ trợ
function checkFeatureSupport() {
    const features = {
        localStorage: 'localStorage' in window,
        sessionStorage: 'sessionStorage' in window,
        geolocation: 'geolocation' in navigator,
        webWorker: 'Worker' in window,
        serviceWorker: 'serviceWorker' in navigator,
        pushNotification: 'PushManager' in window,
        fetch: 'fetch' in window
    };
    
    return features;
}

// Hàm xử lý lỗi tương thích
function handleCompatibilityError(error) {
    console.error('Compatibility Error:', error);
    
    // Hiển thị thông báo cho người dùng
    const errorMessage = document.createElement('div');
    errorMessage.className = 'compatibility-error';
    errorMessage.innerHTML = `
        <h3>⚠️ Cảnh báo tương thích</h3>
        <p>${error.message}</p>
        <p>Vui lòng kiểm tra trình duyệt và thiết bị của bạn.</p>
    `;
    
    document.body.appendChild(errorMessage);
}

module.exports = {
    COMPATIBILITY_CONFIG,
    checkBrowserCompatibility,
    checkResolutionCompatibility,
    adjustLayoutForDevice,
    checkAndApplyDarkMode,
    checkFeatureSupport,
    handleCompatibilityError
}; 