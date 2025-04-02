const API_URL = 'http://localhost:3002/api';

// Khởi tạo biến toàn cục
let currentSection = 'dashboard';
let devices = [];
let alerts = [];
let transactions = [];
let currentPage = 1;
const itemsPerPage = 10;

// Thêm biến lọc thanh toán
let paymentFilters = {
    startDate: null,
    endDate: null,
    status: 'all',
    method: 'all',
    searchTerm: ''
};

// Thêm biến lọc thiết bị
let deviceFilters = {
    searchTerm: '',
    category: '',
    status: '',
    sortBy: 'name'
};

// Các hàm tiện ích
function getDeviceStatus(device) {
    if (device.quantity === 0) return 'out-of-stock';
    if (device.quantity <= device.threshold) return 'low-stock';
    return 'in-stock';
}

function getStatusText(device) {
    const status = getDeviceStatus(device);
    const statusMap = {
        'in-stock': 'Còn hàng',
        'low-stock': 'Sắp hết',
        'out-of-stock': 'Hết hàng'
    };
    return statusMap[status] || status;
}

function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.innerHTML = `
        <div class="notification-content">
            <i class="fas ${getNotificationIcon(type)}"></i>
            <span>${message}</span>
        </div>
        <button onclick="this.parentElement.remove()" class="notification-close">
            <i class="fas fa-times"></i>
        </button>
    `;
    
    document.body.appendChild(notification);
    setTimeout(() => notification.remove(), 5000);
}

function updateElement(id, value) {
    const element = document.getElementById(id);
    if (element) element.textContent = value;
}

function getNotificationIcon(type) {
    switch (type) {
        case 'success':
            return 'fa-check-circle';
        case 'error':
            return 'fa-exclamation-circle';
        case 'warning':
            return 'fa-exclamation-triangle';
        default:
            return 'fa-info-circle';
    }
}

// Mock data cho testing
const mockDevices = [
    { id: 'D001', name: 'Laptop Dell XPS', category: 'laptop', quantity: 15, price: 25000000, threshold: 5 },
    { id: 'D002', name: 'Máy in HP LaserJet', category: 'printer', quantity: 8, price: 5000000, threshold: 3 },
    { id: 'D003', name: 'Router Cisco', category: 'network', quantity: 12, price: 2000000, threshold: 4 }
];

const mockAlerts = [
    {
        id: 'A001',
        type: 'low-stock',
        severity: 'high',
        title: 'Laptop Dell XPS sắp hết hàng',
        message: 'Số lượng hiện tại: 2, dưới ngưỡng cảnh báo',
        timestamp: new Date(),
        read: false
    },
    {
        id: 'A002',
        type: 'inventory',
        severity: 'medium',
        title: 'Tồn kho cao: Máy in HP',
        message: 'Số lượng tồn kho vượt quá 30 ngày',
        timestamp: new Date(),
        read: false
    }
];

// Mock data cho giao dịch
const mockTransactions = [
    {
        id: 'T001',
        type: 'import',
        deviceId: 'D001',
        deviceName: 'Laptop Dell XPS',
        quantity: 5,
        price: 25000000,
        totalAmount: 125000000,
        date: new Date('2024-03-20'),
        user: 'Admin',
        status: 'COMPLETED',
        note: 'Nhập hàng mới'
    },
    {
        id: 'T002',
        type: 'export',
        deviceId: 'D002',
        deviceName: 'Máy in HP LaserJet',
        quantity: 2,
        price: 5000000,
        totalAmount: 10000000,
        date: new Date('2024-03-21'),
        user: 'Admin',
        status: 'COMPLETED',
        note: 'Xuất cho phòng kế toán'
    }
];

let history = [...mockTransactions];
let historyFilters = {
    startDate: null,
    endDate: null,
    type: 'all',
    searchTerm: ''
};

// Hệ thống thông báo và cảnh báo
const ALERT_TYPES = {
    LOW_STOCK: 'low-stock',
    INVENTORY_MISMATCH: 'inventory-mismatch',
    LARGE_CHANGE: 'large-change'
};

const ALERT_SEVERITY = {
    HIGH: 'high',
    MEDIUM: 'medium',
    LOW: 'low'
};

// Thiết lập ngưỡng cảnh báo mặc định
const DEFAULT_ALERT_SETTINGS = {
    lowStockThreshold: 5, // Cảnh báo khi số lượng dưới 5
    inventoryMismatchThreshold: 0.1, // Cảnh báo khi chênh lệch >10%
    largeChangeThreshold: 0.2, // Cảnh báo khi thay đổi >20%
    notificationMethods: {
        inApp: true,
        email: false,
        sms: false
    }
};

let alertSettings = { ...DEFAULT_ALERT_SETTINGS };

// Mock data cho thanh toán
const mockPayments = [
    {
        id: "PAY001",
        transactionId: "TRX001",
        amount: 15000000,
        date: "2024-03-15",
        type: "import",
        status: "completed",
        method: "bank_transfer",
        note: "Thanh toán nhập kho laptop Dell"
    },
    {
        id: "PAY002", 
        transactionId: "TRX002",
        amount: 8500000,
        date: "2024-03-14",
        type: "export",
        status: "pending",
        method: "credit_card",
        note: "Thanh toán xuất kho máy in HP"
    },
    {
        id: "PAY003",
        transactionId: "TRX003", 
        amount: 5000000,
        date: "2024-03-13",
        type: "import",
        status: "completed",
        method: "cash",
        note: "Thanh toán nhập thiết bị mạng"
    },
    {
        id: "PAY004",
        transactionId: "TRX004",
        amount: 12000000,
        date: "2024-03-12",
        type: "export",
        status: "cancelled",
        method: "bank_transfer",
        note: "Hủy thanh toán xuất kho laptop Lenovo"
    },
    {
        id: "PAY005",
        transactionId: "TRX005",
        amount: 9500000,
        date: "2024-03-11",
        type: "import",
        status: "completed",
        method: "bank_transfer",
        note: "Thanh toán nhập kho máy tính để bàn"
    }
];

let payments = [...mockPayments];

// Các hằng số cho thanh toán
const PAYMENT_STATUS = {
    PENDING: 'pending',
    COMPLETED: 'completed',
    CANCELLED: 'cancelled'
};

const PAYMENT_METHODS = {
    CASH: 'cash',
    BANK_TRANSFER: 'bank_transfer',
    CREDIT_CARD: 'credit_card'
};

// Các hàm tiện ích
function formatCurrency(amount) {
    return new Intl.NumberFormat('vi-VN', {
        style: 'currency',
        currency: 'VND'
    }).format(amount);
}

function formatDate(date) {
    return new Date(date).toLocaleString('vi-VN');
}

// Các hàm xử lý biểu đồ
function updateStockTrendChart() {
    const ctx = document.getElementById('stockTrendChart')?.getContext('2d');
    if (!ctx) return;

    const labels = devices.map(d => d.name);
    const data = devices.map(d => d.quantity);

    // Kiểm tra và destroy chart cũ nếu tồn tại
    const existingChart = Chart.getChart(ctx.canvas);
    if (existingChart) {
        existingChart.destroy();
    }

    const newChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                label: 'Số lượng tồn kho',
                data: data,
                borderColor: '#3498db',
                tension: 0.4,
                fill: true,
                backgroundColor: 'rgba(52, 152, 219, 0.1)'
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        stepSize: 1
                    }
                }
            }
        }
    });

    window.stockTrendChart = newChart;
}

function updateCategoryDistributionChart() {
    const ctx = document.getElementById('categoryDistributionChart')?.getContext('2d');
    if (!ctx) return;

    const categories = {};
    devices.forEach(device => {
        categories[device.category] = (categories[device.category] || 0) + device.quantity;
    });

    // Kiểm tra và destroy chart cũ nếu tồn tại
    const existingChart = Chart.getChart(ctx.canvas);
    if (existingChart) {
        existingChart.destroy();
    }

    const newChart = new Chart(ctx, {
        type: 'pie',
        data: {
            labels: Object.keys(categories),
            datasets: [{
                data: Object.values(categories),
                backgroundColor: [
                    '#3498db',
                    '#2ecc71',
                    '#f1c40f',
                    '#e74c3c'
                ]
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'right'
                }
            }
        }
    });

    window.categoryDistributionChart = newChart;
}

function updateDemandForecastChart() {
    const ctx = document.getElementById('demandForecastChart')?.getContext('2d');
    if (!ctx) return;

    const months = ['T1', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'T8', 'T9', 'T10', 'T11', 'T12'];
    const forecastData = months.map(() => Math.floor(Math.random() * 100));

    // Kiểm tra và destroy chart cũ nếu tồn tại
    const existingChart = Chart.getChart(ctx.canvas);
    if (existingChart) {
        existingChart.destroy();
    }

    const newChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: months,
            datasets: [{
                label: 'Dự báo nhu cầu',
                data: forecastData,
                borderColor: '#2ecc71',
                tension: 0.4,
                fill: true,
                backgroundColor: 'rgba(46, 204, 113, 0.1)'
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false
                }
            },
            scales: {
                y: {
                    beginAtZero: true
                }
            }
        }
    });

    window.demandForecastChart = newChart;
}

function updateImportExportRatioChart() {
    const ctx = document.getElementById('importExportRatioChart')?.getContext('2d');
    if (!ctx) return;

    const today = new Date();
    const months = ['T1', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'T8', 'T9', 'T10', 'T11', 'T12'];
    
    // Tính toán số lượng nhập/xuất theo tháng
    const importData = months.map((_, index) => {
        return transactions.filter(t => {
            const transactionDate = new Date(t.date);
            return transactionDate.getMonth() === index &&
                   transactionDate.getFullYear() === today.getFullYear() &&
                   t.type === 'import';
        }).length;
    });

    const exportData = months.map((_, index) => {
        return transactions.filter(t => {
            const transactionDate = new Date(t.date);
            return transactionDate.getMonth() === index &&
                   transactionDate.getFullYear() === today.getFullYear() &&
                   t.type === 'export';
        }).length;
    });

    // Kiểm tra và destroy chart cũ nếu tồn tại
    const existingChart = Chart.getChart(ctx.canvas);
    if (existingChart) {
        existingChart.destroy();
    }

    const newChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: months,
            datasets: [
                {
                    label: 'Nhập kho',
                    data: importData,
                    backgroundColor: '#3498db'
                },
                {
                    label: 'Xuất kho',
                    data: exportData,
                    backgroundColor: '#e74c3c'
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'top'
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        stepSize: 1
                    }
                }
            }
        }
    });

    window.importExportRatioChart = newChart;
}

// Cập nhật tất cả biểu đồ
function updateCharts() {
    updateStockTrendChart();
    updateCategoryDistributionChart();
    updateDemandForecastChart();
    updateImportExportRatioChart();
}

// Khởi tạo ứng dụng
document.addEventListener('DOMContentLoaded', () => {
    initializeNavigation();
    loadInitialData();
    loadSavedTheme();
});

// Xử lý Navigation
function initializeNavigation() {
    const menuItems = document.querySelectorAll('.sidebar ul li');
    menuItems.forEach(item => {
        item.addEventListener('click', () => {
            const sectionId = item.getAttribute('data-section');
            switchSection(sectionId);
        });
    });
}

// Xử lý chuyển đổi section
function switchSection(sectionId) {
    // Ẩn tất cả các section
    document.querySelectorAll('.section').forEach(section => {
        section.classList.remove('active');
    });

    // Hiển thị section được chọn
    const selectedSection = document.getElementById(sectionId);
    if (selectedSection) {
        selectedSection.classList.add('active');
    currentSection = sectionId;

        // Cập nhật trạng thái active của menu item
        document.querySelectorAll('.top-nav ul li').forEach(item => {
            item.classList.remove('active');
            if (item.getAttribute('data-section') === sectionId) {
                item.classList.add('active');
            }
        });

        // Load dữ liệu cho section tương ứng
    loadSectionData(sectionId);
    }
}

// Load dữ liệu cho section
function loadSectionData(sectionId) {
    switch(sectionId) {
        case 'dashboard':
            loadDashboardData();
            break;
        case 'devices':
            loadDevices();
            break;
        case 'transactions':
            loadTransactions();
            break;
        case 'history':
            loadHistory();
            break;
        case 'alerts':
            loadAlerts();
            break;
        case 'payments':
            loadPayments();
            break;
    }
}

// Thêm event listeners cho menu items
document.addEventListener('DOMContentLoaded', function() {
    // Xử lý click cho menu items
    document.querySelectorAll('.top-nav ul li[data-section]').forEach(item => {
        item.addEventListener('click', function() {
            const sectionId = this.getAttribute('data-section');
            switchSection(sectionId);
        });
    });

    // Load dữ liệu ban đầu cho dashboard
    loadDashboardData();
});

// Load dữ liệu
async function loadInitialData() {
    try {
        const [devicesRes, alertsRes, transactionsRes, paymentsRes] = await Promise.all([
            fetch(`${API_URL}/devices`),
            fetch(`${API_URL}/alerts`),
            fetch(`${API_URL}/transactions`),
            fetch(`${API_URL}/payments`)
        ]);

        if (!devicesRes.ok || !alertsRes.ok || !transactionsRes.ok || !paymentsRes.ok) {
            throw new Error('Failed to fetch data from server');
        }

        devices = await devicesRes.json();
        alerts = await alertsRes.json();
        transactions = await transactionsRes.json();
        payments = await paymentsRes.json();
        history = [...transactions, ...payments].sort((a, b) => new Date(b.date) - new Date(a.date));

        updateDashboardStats();
        updateDevicesTable();
        updateAlerts();
        updateRecentTransactionsTable();
        } catch (error) {
        console.error('Error loading initial data:', error);
        showNotification('Lỗi khi tải dữ liệu', 'error');
    }
}

async function loadSectionData(section) {
    try {
        switch (section) {
            case 'dashboard':
                updateDashboardStats();
                updateCharts();
                break;
            case 'devices':
                handleDeviceSearch(); // Thêm khởi tạo tìm kiếm
                updateDevicesTable();
                break;
            case 'alerts':
                updateAlerts();
                break;
            case 'history':
                loadHistorySection();
                break;
            case 'payments':
                loadPaymentsSection();
                break;
            // Thêm các section khác khi cần
        }
    } catch (error) {
        console.error(`Error loading ${section} data:`, error);
        showNotification(`Không thể tải dữ liệu cho ${section}`, 'error');
    }
}

// Xử lý Dashboard
function updateDashboardStats() {
    // Cập nhật tổng thiết bị
    const totalDevices = devices.length;
    document.getElementById('total-devices').textContent = totalDevices;
    document.getElementById('total-devices-count').textContent = totalDevices;

    // Cập nhật nhập/xuất tháng này
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    const monthlyTransactions = history.filter(t => {
        const transactionDate = new Date(t.date);
        return transactionDate.getMonth() === currentMonth && 
               transactionDate.getFullYear() === currentYear;
    });

    document.getElementById('imported-this-month').textContent = 
        monthlyTransactions.filter(t => t.type === 'import').length;
    document.getElementById('exported-this-month').textContent = 
        monthlyTransactions.filter(t => t.type === 'export').length;

    // Cập nhật thiết bị sắp hết
    const lowStockDevices = devices.filter(d => d.quantity <= d.threshold).length;
    document.getElementById('low-stock-devices').textContent = lowStockDevices;
    document.getElementById('low-stock-count').textContent = lowStockDevices;

    // Cập nhật số lượng đang tồn kho
    const inStockCount = devices.reduce((total, device) => total + device.quantity, 0);
    document.getElementById('in-stock-count').textContent = inStockCount;

    // Cập nhật số lượng danh mục
    const categories = new Set(devices.map(device => device.category));
    document.getElementById('category-count').textContent = categories.size;

    // Cập nhật biểu đồ
    updateCharts();
}

// Xử lý Devices
function updateDevicesTable() {
    const tbody = document.querySelector('#devices-table');
    if (!tbody) return;

    // Lọc thiết bị theo điều kiện
    let filteredDevices = devices.filter(device => {
        // Lọc theo từ khóa tìm kiếm
        if (deviceFilters.searchTerm) {
            const searchTerm = deviceFilters.searchTerm.toLowerCase();
            return device.name.toLowerCase().includes(searchTerm) ||
                   device.id.toLowerCase().includes(searchTerm) ||
                   device.category.toLowerCase().includes(searchTerm);
        }
        return true;
    });

    // Lọc theo danh mục
    if (deviceFilters.category) {
        filteredDevices = filteredDevices.filter(device => 
            device.category === deviceFilters.category
        );
    }

    // Lọc theo trạng thái
    if (deviceFilters.status) {
        filteredDevices = filteredDevices.filter(device => 
            getDeviceStatus(device) === deviceFilters.status
        );
    }

    // Sắp xếp thiết bị
    filteredDevices.sort((a, b) => {
        switch (deviceFilters.sortBy) {
            case 'name':
                return a.name.localeCompare(b.name);
            case 'quantity':
                return b.quantity - a.quantity;
            case 'price':
                return b.price - a.price;
            default:
                return 0;
        }
    });

    // Phân trang
    const start = (currentPage - 1) * itemsPerPage;
    const end = start + itemsPerPage;
    const pageDevices = filteredDevices.slice(start, end);

    // Cập nhật bảng
    tbody.innerHTML = pageDevices.map(device => `
                <tr>
                    <td>${device.id}</td>
                    <td>${device.name}</td>
            <td>${device.category}</td>
                    <td>${device.quantity}</td>
            <td>${formatCurrency(device.price)}</td>
            <td>
                <span class="status ${getDeviceStatus(device)}">
                    ${getStatusText(device)}
                </span>
            </td>
            <td>
                <button onclick="viewDeviceDetail('${device.id}')" class="btn view-btn" title="Xem chi tiết">
                    <i class="fas fa-eye"></i>
                </button>
                <button onclick="editDevice('${device.id}')" class="btn edit-btn">
                    <i class="fas fa-edit"></i>
                </button>
                <button onclick="deleteDevice('${device.id}')" class="btn delete-btn">
                    <i class="fas fa-trash"></i>
                </button>
                    </td>
                </tr>
    `).join('');

    // Cập nhật phân trang
    updatePagination(filteredDevices.length);
}

// Thêm hàm xử lý tìm kiếm thiết bị
function handleDeviceSearch() {
    const searchInput = document.getElementById('device-search');
    const categoryFilter = document.getElementById('category-filter');
    const statusFilter = document.getElementById('status-filter');
    const sortBy = document.getElementById('sort-by');

    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            deviceFilters.searchTerm = e.target.value;
            currentPage = 1; // Reset về trang 1 khi tìm kiếm
            updateDevicesTable();
        });
    }

    if (categoryFilter) {
        categoryFilter.addEventListener('change', (e) => {
            deviceFilters.category = e.target.value;
            currentPage = 1; // Reset về trang 1 khi lọc
            updateDevicesTable();
        });
    }

    if (statusFilter) {
        statusFilter.addEventListener('change', (e) => {
            deviceFilters.status = e.target.value;
            currentPage = 1; // Reset về trang 1 khi lọc
            updateDevicesTable();
        });
    }

    if (sortBy) {
        sortBy.addEventListener('change', (e) => {
            deviceFilters.sortBy = e.target.value;
            currentPage = 1; // Reset về trang 1 khi sắp xếp
            updateDevicesTable();
        });
    }
}

// Xử lý Alerts
function updateAlerts() {
    const alertsList = document.getElementById('alerts-list');
    if (!alertsList) return;

    // Update alert filters
    const searchInput = document.getElementById('alert-search-input');
    const typeFilter = document.getElementById('alert-list-type-filter');
    const severityFilter = document.getElementById('alert-list-severity-filter');

    if (alerts.length === 0) {
        alertsList.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-bell-slash"></i>
                <p>Không có cảnh báo nào</p>
            </div>
        `;
    } else {
        alertsList.innerHTML = alerts.map(alert => `
            <div class="alert-item ${alert.read ? '' : 'unread'} ${alert.severity}" 
                 onclick="viewAlertDetail('${alert.id}')">
                <div class="alert-icon ${alert.severity}">
                    <i class="fas ${getAlertIcon(alert.severity)}"></i>
                </div>
                <div class="alert-content">
                    <div class="alert-header">
                        <span class="alert-title">${alert.title || alert.deviceName}</span>
                        <span class="alert-time">${formatDate(alert.timestamp || alert.date)}</span>
                    </div>
                    <div class="alert-message">${alert.message}</div>
                </div>
            </div>
        `).join('');
    }

    // Cập nhật số lượng cảnh báo chưa đọc
    const unreadCount = alerts.filter(a => !a.read).length;
    const alertsBadge = document.querySelector('.alerts-badge');
    if (alertsBadge) {
        alertsBadge.textContent = unreadCount;
        alertsBadge.style.display = unreadCount > 0 ? 'flex' : 'none';
    }
}

function getAlertIcon(severity) {
    const iconMap = {
        'high': 'fa-exclamation-triangle',
        'medium': 'fa-exclamation-circle',
        'low': 'fa-info-circle'
    };
    return iconMap[severity] || 'fa-bell';
}

function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.style.display = 'none';
        // Reset form nếu có
        const form = modal.querySelector('form');
        if (form) {
            form.reset();
        }
    }
}

// Thêm hàm markAlertRead
function markAlertRead(alertId) {
    const alert = alerts.find(a => a.id === alertId);
    if (!alert) {
        showNotification('Không tìm thấy cảnh báo', 'error');
        return;
    }

    alert.read = true;
    updateAlerts();
    showNotification('Đã đánh dấu cảnh báo là đã đọc');
    saveDataToStorage(); // Thêm dòng này
}

// Thêm hàm markAllAlertsAsRead
function markAllAlertsAsRead() {
    alerts.forEach(alert => alert.read = true);
    updateAlerts();
    showNotification('Đã đánh dấu tất cả cảnh báo là đã đọc');
}

// Export thêm hàm mới
window.markAllAlertsAsRead = markAllAlertsAsRead;

// Kiểm tra và tạo cảnh báo
function checkAndCreateAlerts() {
    // Kiểm tra tồn kho thấp
    devices.forEach(device => {
        // Cảnh báo tồn kho thấp
        if (device.quantity <= alertSettings.lowStockThreshold) {
            createAlert({
                type: ALERT_TYPES.LOW_STOCK,
                severity: ALERT_SEVERITY.HIGH,
                title: `${device.name} sắp hết hàng`,
                message: `Số lượng hiện tại: ${device.quantity}, dưới ngưỡng cảnh báo (${alertSettings.lowStockThreshold})`,
                deviceId: device.id,
                deviceName: device.name
            });
        }

        // Cảnh báo tồn kho cao
        if (device.quantity > device.threshold * 3) {
            createAlert({
                type: ALERT_TYPES.INVENTORY_MISMATCH,
                severity: ALERT_SEVERITY.MEDIUM,
                title: `${device.name} tồn kho cao`,
                message: `Số lượng hiện tại: ${device.quantity}, vượt quá 3 lần ngưỡng cảnh báo (${device.threshold})`,
                deviceId: device.id,
                deviceName: device.name
            });
        }

        // Cảnh báo thay đổi lớn trong 24h
        const recentTransactions = transactions.filter(t => {
            const transactionDate = new Date(t.date);
            const now = new Date();
            const hoursDiff = (now - transactionDate) / (1000 * 60 * 60);
            return hoursDiff <= 24 && t.deviceId === device.id;
        });

        if (recentTransactions.length > 0) {
            const totalChange = recentTransactions.reduce((sum, t) => {
                return sum + (t.type === 'import' ? t.quantity : -t.quantity);
            }, 0);

            const changePercentage = Math.abs(totalChange / device.quantity);
            if (changePercentage > alertSettings.largeChangeThreshold) {
                createAlert({
                    type: ALERT_TYPES.LARGE_CHANGE,
                    severity: ALERT_SEVERITY.HIGH,
                    title: `${device.name} có thay đổi lớn`,
                    message: `Thay đổi trong 24h: ${totalChange > 0 ? '+' : ''}${totalChange} (${(changePercentage * 100).toFixed(1)}%)`,
                    deviceId: device.id,
                    deviceName: device.name
                });
            }
        }
    });
}

// Thêm hàm kiểm tra cảnh báo định kỳ
function startAlertMonitoring() {
    // Kiểm tra ngay khi khởi động
    checkAndCreateAlerts();
    
    // Kiểm tra mỗi 5 phút
    setInterval(checkAndCreateAlerts, 5 * 60 * 1000);
}

// Cập nhật hàm initializeApp
function initializeApp() {
    // ... existing initialization code ...
    
    // Khởi tạo hệ thống cảnh báo
    startAlertMonitoring();
}

// Tạo cảnh báo mới
function createAlert(alertData) {
    const alert = {
        id: 'A' + Date.now(),
        timestamp: new Date(),
        read: false,
        ...alertData
    };

    alerts.unshift(alert);
    showNotification(alert.title, alert.severity);
    updateAlerts();
}

// Cập nhật giao diện cảnh báo
function updateAlerts() {
    const alertsList = document.getElementById('alerts-list');
    if (!alertsList) return;

    if (alerts.length === 0) {
        alertsList.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-bell-slash"></i>
                <p>Không có cảnh báo nào</p>
            </div>
        `;
    } else {
        alertsList.innerHTML = alerts.map(alert => `
            <div class="alert-item ${alert.read ? '' : 'unread'} ${alert.severity}" 
                 onclick="viewAlertDetail('${alert.id}')">
                <div class="alert-icon ${alert.severity}">
                    <i class="fas ${getAlertIcon(alert.severity)}"></i>
                </div>
                <div class="alert-content">
                    <div class="alert-header">
                        <span class="alert-title">${alert.title || alert.deviceName}</span>
                        <span class="alert-time">${formatDate(alert.timestamp || alert.date)}</span>
                    </div>
                    <div class="alert-message">${alert.message}</div>
                </div>
            </div>
        `).join('');
    }

    // Cập nhật số lượng cảnh báo chưa đọc
    const unreadCount = alerts.filter(a => !a.read).length;
    const alertsBadge = document.querySelector('.alerts-badge');
    if (alertsBadge) {
        alertsBadge.textContent = unreadCount;
        alertsBadge.style.display = unreadCount > 0 ? 'flex' : 'none';
    }
}

function getAlertIcon(severity) {
    const iconMap = {
        'high': 'fa-exclamation-triangle',
        'medium': 'fa-exclamation-circle',
        'low': 'fa-info-circle'
    };
    return iconMap[severity] || 'fa-bell';
}

// Format timestamp
function formatTimestamp(timestamp) {
    const date = new Date(timestamp);
    return date.toLocaleString('vi-VN');
}

// Lấy icon cho thông báo
function getNotificationIcon(type) {
    switch (type) {
        case ALERT_SEVERITY.HIGH:
            return 'fa-exclamation-circle';
        case ALERT_SEVERITY.MEDIUM:
            return 'fa-exclamation-triangle';
        case ALERT_SEVERITY.LOW:
            return 'fa-info-circle';
        default:
            return 'fa-bell';
    }
}

// Mở modal cài đặt cảnh báo
function showAlertSettings() {
    const modal = document.getElementById('alert-settings-modal');
    if (!modal) return;

    modal.innerHTML = `
        <div class="modal-content">
            <h2>Cài đặt cảnh báo</h2>
            <form id="alert-settings-form" onsubmit="saveAlertSettings(event)">
                <div class="settings-form-group">
                    <label>Ngưỡng cảnh báo tồn kho thấp</label>
                    <input type="number" name="lowStockThreshold" 
                           value="${alertSettings.lowStockThreshold}" min="1" required>
                </div>
                <div class="settings-form-group">
                    <label>Ngưỡng cảnh báo chênh lệch kiểm kê (%)</label>
                    <input type="number" name="inventoryMismatchThreshold" 
                           value="${alertSettings.inventoryMismatchThreshold * 100}" min="1" max="100" required>
                </div>
                <div class="settings-form-group">
                    <label>Ngưỡng cảnh báo thay đổi lớn (%)</label>
                    <input type="number" name="largeChangeThreshold" 
                           value="${alertSettings.largeChangeThreshold * 100}" min="1" max="100" required>
                </div>
                <div class="settings-form-group">
                    <label>Phương thức thông báo</label>
                    <div class="notification-methods">
                        <label class="notification-method">
                            <input type="checkbox" name="notifyInApp" 
                                   ${alertSettings.notificationMethods.inApp ? 'checked' : ''}>
                            Trong ứng dụng
                        </label>
                        <label class="notification-method">
                            <input type="checkbox" name="notifyEmail" 
                                   ${alertSettings.notificationMethods.email ? 'checked' : ''}>
                            Email
                        </label>
                        <label class="notification-method">
                            <input type="checkbox" name="notifySMS" 
                                   ${alertSettings.notificationMethods.sms ? 'checked' : ''}>
                            SMS
                        </label>
                    </div>
                </div>
                <div class="form-actions">
                    <button type="submit" class="btn primary-btn">
                        <i class="fas fa-save"></i> Lưu
                    </button>
                    <button type="button" onclick="closeModal('alert-settings-modal')" class="btn">
                        <i class="fas fa-times"></i> Hủy
                    </button>
                </div>
            </form>
        </div>
    `;
    
    modal.style.display = 'block';
}

// Lưu cài đặt cảnh báo
function saveAlertSettings(event) {
    event.preventDefault();
    const typeFilter = document.getElementById('alert-settings-type-filter');
    const severityFilter = document.getElementById('alert-settings-severity-filter');
    
    alertSettings = {
        lowStockThreshold: parseInt(typeFilter.value),
        inventoryMismatchThreshold: parseFloat(severityFilter.value) / 100,
        largeChangeThreshold: parseFloat(severityFilter.value) / 100,
        notificationMethods: {
            inApp: document.getElementById('notifyInApp').checked,
            email: document.getElementById('notifyEmail').checked,
            sms: document.getElementById('notifySMS').checked
        }
    };
    
    closeModal('alert-settings-modal');
    showNotification('Đã lưu cài đặt cảnh báo');
    checkAndCreateAlerts(); // Kiểm tra lại các cảnh báo với cài đặt mới
}

// Thêm vào hàm initializeApp
function initializeApp() {
    // ... existing initialization code ...
    
    // Khởi tạo hệ thống cảnh báo
    startAlertMonitoring();
}

// Export các hàm cần thiết
window.markAlertRead = markAlertRead;
window.showAlertSettings = showAlertSettings;
window.saveAlertSettings = saveAlertSettings;

// Xử lý phần lịch sử
function loadHistorySection() {
    updateHistoryStats();
    updateHistoryTable();
}

function updateHistoryStats() {
    const today = new Date();
    const thisMonth = history.filter(h => {
        const historyDate = new Date(h.date);
        return historyDate.getMonth() === today.getMonth() &&
               historyDate.getFullYear() === today.getFullYear();
    });

    const importCount = thisMonth.filter(h => h.type === 'import').length;
    const exportCount = thisMonth.filter(h => h.type === 'export').length;
    
    // Cập nhật thống kê
    updateElement('import-count', importCount);
    updateElement('export-count', exportCount);
    updateElement('total-transactions', history.length);
}

function updateHistoryTable() {
    const tbody = document.querySelector('#history-table tbody');
    if (!tbody) return;

    // Lọc dữ liệu theo điều kiện
    let filteredHistory = history.filter(h => {
        if (historyFilters.type !== 'all' && h.type !== historyFilters.type) return false;
        if (historyFilters.startDate && new Date(h.date) < new Date(historyFilters.startDate)) return false;
        if (historyFilters.endDate && new Date(h.date) > new Date(historyFilters.endDate)) return false;
        if (historyFilters.searchTerm) {
            const searchTerm = historyFilters.searchTerm.toLowerCase();
            return (h.deviceName || '').toLowerCase().includes(searchTerm) ||
                   (h.note || '').toLowerCase().includes(searchTerm);
        }
        return true;
    });

    // Sắp xếp theo ngày mới nhất
    filteredHistory.sort((a, b) => new Date(b.date) - new Date(a.date));

    tbody.innerHTML = filteredHistory.map(item => {
        const totalAmount = item.quantity * item.price;
        return `
            <tr>
                <td>${formatDate(item.date)}</td>
                <td>
                    <span class="status-badge ${item.type}">
                        ${item.type === 'import' ? 'Nhập kho' : 'Xuất kho'}
                    </span>
                </td>
                <td>${item.deviceName || 'Chưa cập nhật'}</td>
                <td>${item.quantity}</td>
                <td>${formatCurrency(item.price)}</td>
                <td>${formatCurrency(totalAmount)}</td>
                <td>${item.user || 'admin'}</td>
                <td>
                    <span class="status-badge">Còn hàng</span>
                </td>
            </tr>
        `;
    }).join('');
}

function viewHistoryDetail(historyId) {
    const item = history.find(h => h.id === historyId);
    if (!item) {
        showNotification('Không tìm thấy thông tin', 'error');
        return;
    }

    const modal = document.getElementById('history-detail-modal');
    if (!modal) return;

    // Tìm thông tin thanh toán liên quan
    const relatedPayment = payments.find(p => p.transactionId === item.id);

    modal.innerHTML = `
        <div class="modal-content">
            <h2>Chi tiết giao dịch</h2>
            <div class="history-info">
                <div class="info-group">
                    <label>Mã giao dịch:</label>
                    <span>${item.id}</span>
                </div>
                <div class="info-group">
                    <label>Loại:</label>
                    <span class="status-badge ${item.type === 'import' ? 'import' : 'export'}">
                        ${item.type === 'import' ? 'Nhập kho' : 'Xuất kho'}
                    </span>
                </div>
                <div class="info-group">
                    <label>Thiết bị:</label>
                    <span>${item.deviceName}</span>
                </div>
                <div class="info-group">
                    <label>Số lượng:</label>
                    <span>${item.quantity}</span>
                </div>
                <div class="info-group">
                    <label>Ngày:</label>
                    <span>${formatDate(item.date)}</span>
                </div>
                <div class="info-group">
                    <label>Người thực hiện:</label>
                    <span>${item.user}</span>
                </div>
                <div class="info-group">
                    <label>Ghi chú:</label>
                    <span>${item.note}</span>
                </div>
                ${relatedPayment ? `
                <div class="info-group payment-info">
                    <label>Trạng thái thanh toán:</label>
                    <span class="status-badge ${relatedPayment.status}">
                        ${getPaymentStatusText(relatedPayment.status)}
                    </span>
                </div>
                ` : ''}
            </div>
            <div class="modal-actions">
                ${relatedPayment ? `
                <button onclick="viewPaymentDetail('${relatedPayment.id}')" class="btn payment-btn">
                    <i class="fas fa-money-bill"></i> Xem thanh toán
                </button>
                ` : ''}
                <button onclick="closeModal('history-detail-modal')" class="btn">
                    <i class="fas fa-times"></i> Đóng
                </button>
            </div>
        </div>
    `;
    
    modal.style.display = 'block';
}

function viewPaymentByTransaction(transactionId) {
    const payment = payments.find(p => p.transactionId === transactionId);
    if (payment) {
        viewPaymentDetail(payment.id);
    } else {
        showNotification('Không tìm thấy thông tin thanh toán', 'warning');
    }
}

function applyHistoryFilters() {
    historyFilters = {
        startDate: document.getElementById('start-date')?.value || null,
        endDate: document.getElementById('end-date')?.value || null,
        type: document.getElementById('transaction-type')?.value || 'all',
        searchTerm: document.getElementById('history-search')?.value || ''
    };
    updateHistoryTable();
}

function resetHistoryFilters() {
    // Reset các input và select
    const startDateInput = document.getElementById('start-date');
    const endDateInput = document.getElementById('end-date');
    const typeSelect = document.getElementById('transaction-type');
    const searchInput = document.getElementById('history-search');

    if (startDateInput) startDateInput.value = '';
    if (endDateInput) endDateInput.value = '';
    if (typeSelect) typeSelect.value = 'all';
    if (searchInput) searchInput.value = '';

    // Reset bộ lọc
    historyFilters = {
        startDate: null,
        endDate: null,
        type: 'all',
        searchTerm: ''
    };

    // Cập nhật bảng
    updateHistoryTable();
}

// Thêm hàm xử lý nhập/xuất kho
function addTransaction(type) {
    const modal = document.getElementById('transaction-modal');
    if (!modal) return;

    modal.innerHTML = `
        <div class="modal-content">
            <h2>${type === 'import' ? 'Nhập kho' : 'Xuất kho'}</h2>
            <form id="transaction-form" onsubmit="handleTransactionSubmit(event, '${type}')">
                <div class="form-group">
                    <label>Thiết bị</label>
                    <select name="deviceId" id="device-select" required onchange="updateTransactionPrice(this.value, '${type}')">
                        <option value="">Chọn thiết bị</option>
                        ${devices.map(d => `
                            <option value="${d.id}" data-price="${d.price}">${d.name} (Còn: ${d.quantity})</option>
                        `).join('')}
                    </select>
                </div>
                <div class="form-group">
                    <label>Số lượng</label>
                    <input type="number" name="quantity" id="quantity-input" required min="1" onchange="updateTransactionPrice(document.getElementById('device-select').value, '${type}')">
                </div>
                <div class="form-group">
                    <label>Đơn giá</label>
                    <input type="number" name="price" id="price-input" readonly>
                </div>
                <div class="form-group">
                    <label>Thành tiền</label>
                    <input type="number" name="totalAmount" id="total-amount" readonly>
                </div>
                <div class="form-group">
                    <label>Ghi chú</label>
                    <textarea name="note"></textarea>
                </div>
                <div class="form-actions">
                    <button type="submit" class="btn primary-btn">
                        <i class="fas fa-save"></i> Lưu
                    </button>
                    <button type="button" onclick="closeModal('transaction-modal')" class="btn">
                        <i class="fas fa-times"></i> Hủy
                    </button>
                </div>
            </form>
        </div>
    `;
    
    modal.style.display = 'block';
}

// Thêm hàm cập nhật giá và thành tiền
function updateTransactionPrice(deviceId, type) {
    const device = devices.find(d => d.id === deviceId);
    if (!device) return;

    const quantityInput = document.getElementById('quantity-input');
    const priceInput = document.getElementById('price-input');
    const totalAmountInput = document.getElementById('total-amount');

    // Cập nhật đơn giá
    priceInput.value = device.price;

    // Tính thành tiền
    const quantity = parseInt(quantityInput.value) || 0;
    const totalAmount = quantity * device.price;
    totalAmountInput.value = totalAmount;

    // Kiểm tra số lượng xuất kho
    if (type === 'export' && quantity > device.quantity) {
        showNotification('Số lượng xuất không được vượt quá số lượng trong kho', 'error');
        quantityInput.value = device.quantity;
        totalAmountInput.value = device.quantity * device.price;
    }
}

// Cập nhật hàm handleTransactionSubmit để sử dụng API
async function handleTransactionSubmit(event, type) {
    event.preventDefault();
    const form = document.getElementById('transaction-form');
    const deviceSelect = document.getElementById('device-select');
    const quantityInput = document.getElementById('quantity-input');
    const priceInput = document.getElementById('price-input');
    const totalAmountInput = document.getElementById('total-amount');
    
    try {
        const deviceId = form.deviceId.value;
        const device = devices.find(d => d.id === deviceId);
        if (!device) {
            throw new Error('Không tìm thấy thiết bị');
        }

        const quantity = parseInt(quantityInput.value) || 0;
        const price = parseFloat(priceInput.value);
        const totalAmount = parseFloat(totalAmountInput.value);

        // Kiểm tra số lượng xuất kho
        if (type === 'export' && quantity > device.quantity) {
            throw new Error('Số lượng xuất không được vượt quá số lượng trong kho');
        }

        const transactionData = {
            type,
            deviceId,
            deviceName: device.name,
            quantity,
            price,
            totalAmount,
            date: new Date().toISOString(),
            user: 'Admin', // Thay thế bằng user thực tế
            status: 'COMPLETED',
            note: form.note.value
        };

        // Gọi API để tạo giao dịch mới
        const response = await fetch(`${API_URL}/transactions`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(transactionData)
        });

        if (!response.ok) {
            throw new Error('Lỗi khi tạo giao dịch');
        }

        // Tải lại dữ liệu từ server
        await loadInitialData();

        // Đóng modal
        closeModal('transaction-modal');
        
        // Hiển thị thông báo thành công
        showNotification('Giao dịch được thực hiện thành công', 'success');
    } catch (error) {
        console.error('Error submitting transaction:', error);
        showNotification(error.message || 'Có lỗi xảy ra khi thực hiện giao dịch', 'error');
    }
}

// Thêm hàm generateTransactionId
function generateTransactionId() {
    return 'T' + Date.now() + Math.random().toString(36).substr(2, 5);
}

// Cập nhật hàm updatePagination để nhận tổng số thiết bị
function updatePagination(totalItems) {
    const totalPages = Math.ceil(totalItems / itemsPerPage);
    const paginationEl = document.querySelector('.pagination');
    if (!paginationEl) return;

    let paginationHTML = `
        <button id="prev-page" onclick="prevPage()" ${currentPage === 1 ? 'disabled' : ''}>
            <i class="fas fa-chevron-left"></i>
        </button>
        <span id="page-info">Trang ${currentPage} / ${totalPages}</span>
        <button id="next-page" onclick="nextPage()" ${currentPage === totalPages ? 'disabled' : ''}>
            <i class="fas fa-chevron-right"></i>
        </button>
    `;

    paginationEl.innerHTML = paginationHTML;
}

function prevPage() {
    if (currentPage > 1) {
        currentPage--;
        updateDevicesTable();
    }
}

function nextPage() {
    const totalPages = Math.ceil(devices.length / itemsPerPage);
    if (currentPage < totalPages) {
        currentPage++;
        updateDevicesTable();
    }
}

// Export các hàm phân trang
window.prevPage = prevPage;
window.nextPage = nextPage;

// Thêm hàm applyPaymentFilters
function applyPaymentFilters() {
    paymentFilters = {
        startDate: document.getElementById('payment-start-date')?.value || null,
        endDate: document.getElementById('payment-end-date')?.value || null,
        status: document.getElementById('payment-status')?.value || 'all',
        method: document.getElementById('payment-method')?.value || 'all',
        searchTerm: document.getElementById('payment-search')?.value || ''
    };
    updatePaymentsTable();
}

function resetPaymentFilters() {
    const filterForm = document.getElementById('payment-filters');
    if (filterForm) {
        filterForm.reset();
        paymentFilters = {
            startDate: null,
            endDate: null,
            status: 'all',
            method: 'all',
            searchTerm: ''
        };
        updatePaymentsTable();
    }
}

// Export các hàm mới
window.applyPaymentFilters = applyPaymentFilters;
window.resetPaymentFilters = resetPaymentFilters;

// Cập nhật hàm updateRecentTransactionsTable
function updateRecentTransactionsTable() {
    const tbody = document.querySelector('#recent-transactions-table tbody');
    if (!tbody) return;

    // Lấy ngày 3 ngày trước
    const threeDaysAgo = new Date();
    threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);

    // Lọc giao dịch trong 3 ngày gần nhất
    const recentTransactions = transactions
        .filter(t => new Date(t.date) >= threeDaysAgo)
        .sort((a, b) => new Date(b.date) - new Date(a.date));

    tbody.innerHTML = recentTransactions.map(transaction => `
        <tr>
            <td>${formatDate(transaction.date)}</td>
            <td>
                <span class="transaction-type ${transaction.type}">
                    <i class="fas fa-${transaction.type === 'import' ? 'arrow-down' : 'arrow-up'}"></i>
                    ${transaction.type === 'import' ? 'Nhập kho' : 'Xuất kho'}
                </span>
            </td>
            <td>${transaction.deviceName}</td>
            <td>${transaction.quantity}</td>
            <td>${formatCurrency(transaction.price)}</td>
            <td>${formatCurrency(transaction.totalAmount)}</td>
            <td>${transaction.user}</td>
            <td>
                <span class="status-badge status-${transaction.status.toLowerCase()}">
                    ${getStatusText(transaction.status)}
                </span>
            </td>
                </tr>
    `).join('');
}

// Thêm hàm cập nhật thống kê giao dịch
function updateTransactionStats() {
    const today = new Date();
    const thisMonth = transactions.filter(t => {
        const transactionDate = new Date(t.date);
        return transactionDate.getMonth() === today.getMonth() &&
               transactionDate.getFullYear() === today.getFullYear();
    });

    // Tính tổng số giao dịch nhập/xuất trong tháng
    const importCount = thisMonth.filter(t => t.type === 'import').length;
    const exportCount = thisMonth.filter(t => t.type === 'export').length;

    // Tính tổng giá trị nhập/xuất trong tháng
    const importValue = thisMonth
        .filter(t => t.type === 'import')
        .reduce((sum, t) => sum + t.totalAmount, 0);
    const exportValue = thisMonth
        .filter(t => t.type === 'export')
        .reduce((sum, t) => sum + t.totalAmount, 0);

    // Cập nhật các phần tử trên giao diện
    updateElement('import-count', importCount);
    updateElement('export-count', exportCount);
    updateElement('import-value', formatCurrency(importValue));
    updateElement('export-value', formatCurrency(exportValue));
    updateElement('total-transactions', transactions.length);

    // Cập nhật biểu đồ tỷ lệ nhập/xuất
    updateImportExportRatioChart();
}

// Thêm hàm loadPaymentsSection
function loadPaymentsSection() {
    // Update payment stats
    let totalPayments = payments.length;
    let completedPayments = payments.filter(p => p.status === 'completed').length;
    let pendingPayments = payments.filter(p => p.status === 'pending').length;
    let totalAmount = payments.reduce((sum, p) => sum + (p.status !== 'cancelled' ? p.amount : 0), 0);

    document.getElementById('total-payments').textContent = totalPayments;
    document.getElementById('completed-payments').textContent = completedPayments;
    document.getElementById('pending-payments').textContent = pendingPayments;
    document.getElementById('total-amount').textContent = formatCurrency(totalAmount);

    // Update payments table
    const tableBody = document.getElementById('payments-table');
    tableBody.innerHTML = '';

    payments.forEach(payment => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${payment.id}</td>
            <td>${payment.transactionId}</td>
            <td>${formatCurrency(payment.amount)}</td>
            <td>${formatDate(payment.date)}</td>
            <td>
                <span class="status-badge ${payment.type}">
                    ${payment.type === 'import' ? 'Nhập kho' : 'Xuất kho'}
                </span>
            </td>
            <td>
                <span class="status-badge ${payment.status}">
                    ${getPaymentStatusText(payment.status)}
                </span>
            </td>
            <td>
                <span class="payment-method ${payment.method}">
                    ${getPaymentMethodText(payment.method)}
                </span>
            </td>
            <td>${payment.note}</td>
            <td>
                <div class="actions">
                    <button class="btn view-btn" onclick="viewPaymentDetail('${payment.id}')">
                    <i class="fas fa-eye"></i>
                </button>
                    <button class="btn edit-btn" onclick="editPayment('${payment.id}')">
                    <i class="fas fa-edit"></i>
                </button>
                    <button class="btn delete-btn" onclick="deletePayment('${payment.id}')">
                        <i class="fas fa-trash"></i>
                </button>
            </div>
            </td>
        `;
        tableBody.appendChild(row);
    });
}

function getPaymentStatusText(status) {
    const statusTexts = {
        'pending': 'Chờ xử lý',
        'completed': 'Hoàn thành',
        'cancelled': 'Đã hủy'
    };
    return statusTexts[status] || status;
}

function getPaymentMethodText(method) {
    const methodTexts = {
        'cash': 'Tiền mặt',
        'bank_transfer': 'Chuyển khoản',
        'credit_card': 'Thẻ tín dụng'
    };
    return methodTexts[method] || method;
}

function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN');
}

function formatCurrency(amount) {
    return new Intl.NumberFormat('vi-VN', {
        style: 'currency',
        currency: 'VND'
    }).format(amount);
}

// Hàm import thiết bị từ Excel
function importDevicesFromExcel() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.xlsx, .xls';
    input.onchange = function(e) {
        const file = e.target.files[0];
        const reader = new FileReader();
        reader.onload = function(e) {
            try {
                const data = new Uint8Array(e.target.result);
                const workbook = XLSX.read(data, { type: 'array' });
                const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
                const jsonData = XLSX.utils.sheet_to_json(firstSheet);

                // Chuyển đổi dữ liệu Excel thành định dạng thiết bị
                const newDevices = jsonData.map(row => ({
                    id: row['Mã'] || generateDeviceId(),
                    name: row['Tên thiết bị'],
                    category: row['Danh mục'],
                    quantity: parseInt(row['Số lượng']) || 0,
                    price: parseFloat(row['Đơn giá']) || 0,
                    threshold: parseInt(row['Ngưỡng cảnh báo']) || 5,
                    description: row['Mô tả'] || ''
                }));

                // Thêm các thiết bị mới vào danh sách
                devices = [...devices, ...newDevices];
                
                // Cập nhật UI
                updateDevicesTable();
                updateDashboardStats();
                
                showNotification(`Đã import ${newDevices.length} thiết bị thành công`, 'success');
            } catch (error) {
                console.error('Error importing devices:', error);
                showNotification('Có lỗi xảy ra khi import file Excel', 'error');
            }
        };
        reader.readAsArrayBuffer(file);
    };
    input.click();
}

// Hàm xuất thiết bị ra Excel
function exportDevicesToExcel() {
    try {
        const wb = XLSX.utils.book_new();
        const data = devices.map(device => ({
            'Mã': device.id,
            'Tên thiết bị': device.name,
            'Danh mục': device.category,
            'Số lượng': device.quantity,
            'Đơn giá': device.price,
            'Ngưỡng cảnh báo': device.threshold,
            'Mô tả': device.description || '',
            'Trạng thái': getDeviceStatusText(getDeviceStatus(device))
        }));

        const ws = XLSX.utils.json_to_sheet(data);
        XLSX.utils.book_append_sheet(wb, ws, 'Danh sách thiết bị');
        XLSX.writeFile(wb, `Danh_sach_thiet_bi_${formatDate(new Date())}.xlsx`);
        
        showNotification('Đã xuất file Excel thành công', 'success');
    } catch (error) {
        console.error('Error exporting devices:', error);
        showNotification('Có lỗi xảy ra khi xuất file Excel', 'error');
    }
}

// Hàm xuất thiết bị ra PDF
function exportDevicesToPDF() {
    try {
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF();

        // Thêm tiêu đề
        doc.setFontSize(16);
        doc.text('Danh Sách Thiết Bị', 14, 15);
        doc.setFontSize(10);
        doc.text(`Ngày xuất: ${formatDate(new Date())}`, 14, 25);

        // Chuẩn bị dữ liệu cho bảng
        const data = devices.map(device => [
            device.id,
            device.name,
            device.category,
            device.quantity.toString(),
            formatCurrency(device.price),
            device.threshold.toString(),
            getDeviceStatusText(getDeviceStatus(device))
        ]);

        // Tạo bảng
        doc.autoTable({
            head: [['Mã', 'Tên thiết bị', 'Danh mục', 'Số lượng', 'Đơn giá', 'Ngưỡng cảnh báo', 'Trạng thái']],
            body: data,
            startY: 30,
            theme: 'grid',
            styles: {
                fontSize: 8,
                cellPadding: 2
            },
            headStyles: {
                fillColor: [52, 152, 219],
                textColor: 255,
                fontStyle: 'bold'
            },
            alternateRowStyles: {
                fillColor: [245, 245, 245]
            }
        });

        doc.save(`Danh_sach_thiet_bi_${formatDate(new Date())}.pdf`);
        showNotification('Đã xuất file PDF thành công', 'success');
    } catch (error) {
        console.error('Error exporting devices to PDF:', error);
        showNotification('Có lỗi xảy ra khi xuất file PDF', 'error');
    }
}

// Hàm import thanh toán từ Excel
function importPaymentsFromExcel() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.xlsx, .xls';
    input.onchange = function(e) {
        const file = e.target.files[0];
        const reader = new FileReader();
        reader.onload = function(e) {
            try {
                const data = new Uint8Array(e.target.result);
                const workbook = XLSX.read(data, { type: 'array' });
                const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
                const jsonData = XLSX.utils.sheet_to_json(firstSheet);

                // Chuyển đổi dữ liệu Excel thành định dạng thanh toán
                const newPayments = jsonData.map(row => {
                    // Xử lý loại thanh toán
                    let type = 'import';
                    if (row['Loại']) {
                        const typeStr = row['Loại'].toString().toLowerCase();
                        type = typeStr.includes('xuất') ? 'export' : 'import';
                    }

                    // Xử lý trạng thái
                    let status = 'pending';
                    if (row['Trạng thái']) {
                        const statusStr = row['Trạng thái'].toString().toLowerCase();
                        if (statusStr.includes('hoàn thành')) status = 'completed';
                        else if (statusStr.includes('hủy')) status = 'cancelled';
                    }

                    // Xử lý phương thức thanh toán
                    let method = 'cash';
                    if (row['Phương thức']) {
                        const methodStr = row['Phương thức'].toString().toLowerCase();
                        if (methodStr.includes('chuyển khoản')) method = 'bank_transfer';
                        else if (methodStr.includes('thẻ')) method = 'credit_card';
                    }

                    // Xử lý ngày tháng
                    let date = new Date().toISOString();
                    if (row['Ngày']) {
                        try {
                            const dateObj = new Date(row['Ngày']);
                            if (!isNaN(dateObj)) {
                                date = dateObj.toISOString();
                            }
                        } catch (error) {
                            console.warn('Invalid date format:', row['Ngày']);
                        }
                    }

                    return {
                        id: row['Mã thanh toán'] || generatePaymentId(),
                        transactionId: row['Mã giao dịch'] || '',
                        amount: parseFloat(row['Số tiền']) || 0,
                        date: date,
                        type: type,
                        status: status,
                        method: method,
                        note: row['Ghi chú'] || ''
                    };
                });

                // Thêm các thanh toán mới vào danh sách
                payments = [...payments, ...newPayments];
                
                // Reset trang hiện tại về 1
                currentPage = 1;
                
                // Cập nhật UI
                loadPaymentsSection();
                
                showNotification(`Đã import ${newPayments.length} thanh toán thành công`, 'success');
            } catch (error) {
                console.error('Error importing payments:', error);
                showNotification('Có lỗi xảy ra khi import file Excel', 'error');
            }
        };
        reader.readAsArrayBuffer(file);
    };
    input.click();
}

// Hàm xuất thanh toán ra Excel
function exportPaymentsToExcel() {
    try {
        const wb = XLSX.utils.book_new();
        const data = payments.map(payment => ({
            'Mã thanh toán': payment.id,
            'Mã giao dịch': payment.transactionId,
            'Số tiền': payment.amount,
            'Ngày': formatDate(payment.date),
            'Loại': payment.type === 'import' ? 'Nhập kho' : 'Xuất kho',
            'Trạng thái': getPaymentStatusText(payment.status),
            'Phương thức': getPaymentMethodText(payment.method),
            'Ghi chú': payment.note || ''
        }));

        const ws = XLSX.utils.json_to_sheet(data);
        XLSX.utils.book_append_sheet(wb, ws, 'Danh sách thanh toán');
        XLSX.writeFile(wb, `Danh_sach_thanh_toan_${formatDate(new Date())}.xlsx`);
        
        showNotification('Đã xuất file Excel thành công', 'success');
    } catch (error) {
        console.error('Error exporting payments:', error);
        showNotification('Có lỗi xảy ra khi xuất file Excel', 'error');
    }
}

// Hàm xuất thanh toán ra PDF
function exportPaymentsToPDF() {
    try {
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF();

        // Thêm tiêu đề
        doc.setFontSize(16);
        doc.text('Danh Sách Thanh Toán', 14, 15);
        doc.setFontSize(10);
        doc.text(`Ngày xuất: ${formatDate(new Date())}`, 14, 25);

        // Chuẩn bị dữ liệu cho bảng
        const data = payments.map(payment => [
            payment.id,
            payment.transactionId,
            formatCurrency(payment.amount),
            formatDate(payment.date),
            payment.type === 'import' ? 'Nhập kho' : 'Xuất kho',
            getPaymentStatusText(payment.status),
            getPaymentMethodText(payment.method)
        ]);

        // Tạo bảng
        doc.autoTable({
            head: [['Mã thanh toán', 'Mã giao dịch', 'Số tiền', 'Ngày', 'Loại', 'Trạng thái', 'Phương thức']],
            body: data,
            startY: 30,
            theme: 'grid',
            styles: {
                fontSize: 8,
                cellPadding: 2
            },
            headStyles: {
                fillColor: [52, 152, 219],
                textColor: 255,
                fontStyle: 'bold'
            },
            alternateRowStyles: {
                fillColor: [245, 245, 245]
            }
        });

        doc.save(`Danh_sach_thanh_toan_${formatDate(new Date())}.pdf`);
        showNotification('Đã xuất file PDF thành công', 'success');
    } catch (error) {
        console.error('Error exporting payments to PDF:', error);
        showNotification('Có lỗi xảy ra khi xuất file PDF', 'error');
    }
}

// Hàm tạo ID thiết bị
function generateDeviceId() {
    const prefix = 'D';
    const timestamp = Date.now().toString().slice(-6);
    const random = Math.random().toString(36).substr(2, 3).toUpperCase();
    return `${prefix}${timestamp}${random}`;
}

// Hàm tạo ID thanh toán
function generatePaymentId() {
    const prefix = 'P';
    const timestamp = Date.now().toString().slice(-6);
    const random = Math.random().toString(36).substr(2, 3).toUpperCase();
    return `${prefix}${timestamp}${random}`;
}

// Export các hàm mới
window.importDevicesFromExcel = importDevicesFromExcel;
window.exportDevicesToExcel = exportDevicesToExcel;
window.exportDevicesToPDF = exportDevicesToPDF;
window.importPaymentsFromExcel = importPaymentsFromExcel;
window.exportPaymentsToExcel = exportPaymentsToExcel;
window.exportPaymentsToPDF = exportPaymentsToPDF;
window.generateDeviceId = generateDeviceId;
window.generatePaymentId = generatePaymentId;

// Hàm chuyển đổi trạng thái thanh toán
function getPaymentStatusText(status) {
    const statusMap = {
        'pending': 'Chờ xử lý',
        'completed': 'Hoàn thành',
        'cancelled': 'Đã hủy'
    };
    return statusMap[status] || status;
}

// Hàm chuyển đổi phương thức thanh toán
function getPaymentMethodText(method) {
    const methodMap = {
        'cash': 'Tiền mặt',
        'bank_transfer': 'Chuyển khoản',
        'credit_card': 'Thẻ tín dụng'
    };
    return methodMap[method] || method;
}

// Export các hàm mới
window.getPaymentStatusText = getPaymentStatusText;
window.getPaymentMethodText = getPaymentMethodText;

function createPayment() {
    // Hiển thị modal tạo payment
    const modal = document.getElementById('paymentModal');
    if (!modal) {
        showNotification('Không tìm thấy modal thanh toán', 'error');
        return;
    }

    // Tạo nội dung modal với form
    modal.innerHTML = `
        <div class="modal-content">
            <h2 id="paymentModalTitle">Tạo Phiếu Thu Mới</h2>
            <form id="paymentForm">
                <div class="form-group">
                    <label>Số tiền</label>
                    <input type="number" id="paymentAmount" required min="0">
                </div>
                <div class="form-group">
                    <label>Phương thức thanh toán</label>
                    <select id="paymentMethod" required>
                        <option value="">Chọn phương thức</option>
                        <option value="cash">Tiền mặt</option>
                        <option value="bank_transfer">Chuyển khoản</option>
                        <option value="credit_card">Thẻ tín dụng</option>
                    </select>
                </div>
                <div class="form-group">
                    <label>Trạng thái</label>
                    <select id="paymentStatus" required>
                        <option value="">Chọn trạng thái</option>
                        <option value="pending">Chờ xử lý</option>
                        <option value="completed">Hoàn thành</option>
                        <option value="cancelled">Đã hủy</option>
                    </select>
                </div>
                <div class="form-group">
                    <label>Ghi chú</label>
                    <textarea id="paymentDescription"></textarea>
                </div>
                <div class="form-actions">
                    <button type="button" id="submitPayment" class="btn primary-btn" onclick="handleCreatePayment()">
                        <i class="fas fa-save"></i> Tạo
                    </button>
                    <button type="button" class="btn" onclick="closeModal('paymentModal')">
                        <i class="fas fa-times"></i> Hủy
                    </button>
                </div>
            </form>
        </div>
    `;
    
    modal.style.display = 'block';
}

// Cập nhật hàm handleCreatePayment để sử dụng API
async function handleCreatePayment() {
    // Lấy dữ liệu từ form
    const amount = document.getElementById('paymentAmount').value;
    const method = document.getElementById('paymentMethod').value;
    const status = document.getElementById('paymentStatus').value;
    const description = document.getElementById('paymentDescription').value;
    
    // Validate dữ liệu
    if (!amount || !method || !status) {
        alert('Vui lòng điền đầy đủ thông tin!');
        return;
    }

    try {
    // Tạo payment mới
    const newPayment = {
        amount: parseFloat(amount),
        method: method,
        status: status,
        description: description,
        date: new Date().toISOString(),
        createdBy: JSON.parse(sessionStorage.getItem('currentUser')).username
    };

        // Gọi API để tạo thanh toán mới
        const response = await fetch(`${API_URL}/payments`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(newPayment)
        });

        if (!response.ok) {
            throw new Error('Lỗi khi tạo thanh toán');
        }

        // Tải lại dữ liệu từ server
        await loadInitialData();

    // Đóng modal
    const modal = document.getElementById('paymentModal');
    modal.style.display = 'none';

    // Hiển thị thông báo
    showNotification('Tạo phiếu thu thành công!', 'success');
    } catch (error) {
        console.error('Error creating payment:', error);
        showNotification(error.message || 'Có lỗi xảy ra', 'error');
    }
}

// Theme handling
function toggleTheme() {
    const body = document.body;
    const themeIcon = document.querySelector('.theme-toggle i');
    
    if (body.getAttribute('data-theme') === 'dark') {
        body.removeAttribute('data-theme');
        themeIcon.classList.remove('fa-sun');
        themeIcon.classList.add('fa-moon');
        localStorage.setItem('theme', 'light');
    } else {
        body.setAttribute('data-theme', 'dark');
        themeIcon.classList.remove('fa-moon');
        themeIcon.classList.add('fa-sun');
        localStorage.setItem('theme', 'dark');
    }

    // Cập nhật lại các biểu đồ
    updateCharts();
}

// Load saved theme
function loadSavedTheme() {
    const savedTheme = localStorage.getItem('theme');
    const themeIcon = document.querySelector('.theme-toggle i');
    
    if (savedTheme === 'dark') {
        document.body.setAttribute('data-theme', 'dark');
        themeIcon.classList.remove('fa-moon');
        themeIcon.classList.add('fa-sun');
    }
}

function viewAlertDetail(alertId) {
    // Tìm cảnh báo theo ID
    const alert = alerts.find(a => a.id === alertId);
    if (!alert) return;

    // Ẩn phần "no alert selected"
    const noAlertSelected = document.querySelector('.no-alert-selected');
    if (noAlertSelected) {
        noAlertSelected.style.display = 'none';
    }

    // Hiển thị và cập nhật nội dung chi tiết
    const detailContent = document.getElementById('alert-detail-content');
    if (detailContent) {
        detailContent.style.display = 'flex';
        
        // Cập nhật các thông tin
        detailContent.querySelector('.alert-title').textContent = alert.title || alert.deviceName;
        detailContent.querySelector('.alert-timestamp').textContent = formatDate(alert.timestamp || alert.date);
        detailContent.querySelector('.alert-type').textContent = getAlertTypeText(alert.type);
        detailContent.querySelector('.alert-severity').textContent = getSeverityText(alert.severity);
        detailContent.querySelector('.alert-device').textContent = alert.deviceName;
        detailContent.querySelector('.alert-message').textContent = alert.message;

        // Cập nhật trạng thái các nút
        const viewDeviceBtn = detailContent.querySelector('.view-device-btn');
        if (viewDeviceBtn) {
            viewDeviceBtn.onclick = () => viewDeviceDetail(alert.deviceId);
        }

        const markReadBtn = detailContent.querySelector('.mark-read-btn');
        if (markReadBtn) {
            markReadBtn.onclick = () => markAlertRead(alert.id);
        }

        // Đánh dấu item được chọn trong danh sách
        const alertItems = document.querySelectorAll('.alert-item');
        alertItems.forEach(item => item.classList.remove('selected'));
        const selectedItem = document.querySelector(`.alert-item[onclick*="${alertId}"]`);
        if (selectedItem) {
            selectedItem.classList.add('selected');
        }
    }
}

function getAlertTypeText(type) {
    const typeMap = {
        'low-stock': 'Sắp hết hàng',
        'inventory': 'Tồn kho',
        'system': 'Hệ thống',
        'transaction': 'Giao dịch'
    };
    return typeMap[type] || type;
}

function getSeverityText(severity) {
    const severityMap = {
        'high': 'Cao',
        'medium': 'Trung bình',
        'low': 'Thấp'
    };
    return severityMap[severity] || severity;
}

function markAlertAsRead(alertId) {
    // Tìm và cập nhật trạng thái của cảnh báo
    const alert = alerts.find(a => a.id === alertId);
    if (alert) {
        alert.read = true;
        // Cập nhật UI
        updateAlerts();
        // Đóng modal
        closeModal('alertDetailModal');
        // Hiển thị thông báo
        showNotification('Đã đánh dấu cảnh báo là đã đọc', 'success');
    }
}

// Export các hàm mới
window.viewAlertDetail = viewAlertDetail;
window.markAlertAsRead = markAlertAsRead;

// Thêm hàm xử lý thiết bị
function addDevice() {
    const modal = document.getElementById('device-form-modal');
    if (!modal) return;

    modal.innerHTML = `
        <div class="modal-content">
            <div class="modal-header">
                <h2>Thêm thiết bị mới</h2>
                <button type="button" class="close-btn" onclick="closeModal('device-form-modal')">
                    <i class="fas fa-times"></i>
                </button>
            </div>
            <form id="device-form" onsubmit="handleDeviceSubmit(event)">
                <div class="form-group">
                    <label>Tên thiết bị</label>
                    <input type="text" id="device-name" required>
                </div>
                <div class="form-group">
                    <label>Danh mục</label>
                    <select id="device-category" required>
                        <option value="">Chọn danh mục</option>
                        <option value="laptop">Laptop</option>
                        <option value="printer">Máy in</option>
                        <option value="network">Thiết bị mạng</option>
                        <option value="other">Khác</option>
                    </select>
                </div>
                <div class="form-group">
                    <label>Số lượng</label>
                    <input type="number" id="device-quantity" min="0" required>
                </div>
                <div class="form-group">
                    <label>Đơn giá</label>
                    <input type="number" id="device-price" min="0" required>
                </div>
                <div class="form-group">
                    <label>Ngưỡng cảnh báo</label>
                    <input type="number" id="device-threshold" min="1" value="5">
                </div>
                <div class="form-group">
                    <label>Mô tả</label>
                    <textarea id="device-description"></textarea>
                </div>
                <div class="form-actions">
                    <button type="button" class="btn" onclick="closeModal('device-form-modal')">
                        <i class="fas fa-times"></i> Hủy
                    </button>
                    <button type="submit" class="btn primary-btn">
                        <i class="fas fa-save"></i> Lưu
                    </button>
                </div>
            </form>
        </div>
    `;
    
    modal.style.display = 'block';
    
    // Thêm event listener để đóng modal khi click bên ngoài
    modal.onclick = function(event) {
        if (event.target === modal) {
            closeModal('device-form-modal');
        }
    };

    // Thêm event listener cho phím ESC
    document.addEventListener('keydown', function(event) {
        if (event.key === 'Escape') {
            closeModal('device-form-modal');
        }
    });
}

function editDevice(deviceId) {
    const device = devices.find(d => d.id === deviceId);
    if (!device) {
        showNotification('Không tìm thấy thiết bị', 'error');
        return;
    }

    const modal = document.getElementById('device-form-modal');
    if (!modal) return;

    modal.innerHTML = `
        <div class="modal-content">
            <h2>Chỉnh sửa thiết bị</h2>
            <form id="device-form" onsubmit="handleDeviceSubmit(event, '${deviceId}')">
                <div class="form-group">
                    <label>Tên thiết bị</label>
                    <input type="text" id="device-name" value="${device.name}" required>
                </div>
                <div class="form-group">
                    <label>Danh mục</label>
                    <select id="device-category" required>
                        <option value="">Chọn danh mục</option>
                        <option value="laptop" ${device.category === 'laptop' ? 'selected' : ''}>Laptop</option>
                        <option value="printer" ${device.category === 'printer' ? 'selected' : ''}>Máy in</option>
                        <option value="network" ${device.category === 'network' ? 'selected' : ''}>Thiết bị mạng</option>
                        <option value="other" ${device.category === 'other' ? 'selected' : ''}>Khác</option>
                    </select>
                </div>
                <div class="form-group">
                    <label>Số lượng</label>
                    <input type="number" id="device-quantity" value="${device.quantity}" min="0" required>
                </div>
                <div class="form-group">
                    <label>Đơn giá</label>
                    <input type="number" id="device-price" value="${device.price}" min="0" required>
                </div>
                <div class="form-group">
                    <label>Ngưỡng cảnh báo</label>
                    <input type="number" id="device-threshold" value="${device.threshold}" min="1">
                </div>
                <div class="form-group">
                    <label>Mô tả</label>
                    <textarea id="device-description">${device.description || ''}</textarea>
                </div>
                <div class="form-actions">
                    <button type="submit" class="btn primary-btn">
                        <i class="fas fa-save"></i> Lưu
                    </button>
                    <button type="button" class="btn" onclick="closeModal('device-form-modal')">
                        <i class="fas fa-times"></i> Hủy
                    </button>
                </div>
            </form>
        </div>
    `;
    
    modal.style.display = 'block';
}

// Cập nhật hàm deleteDevice để sử dụng API
async function deleteDevice(deviceId) {
    if (!confirm('Bạn có chắc chắn muốn xóa thiết bị này?')) {
        return;
    }

    try {
        const response = await fetch(`${API_URL}/devices/${deviceId}`, {
            method: 'DELETE'
        });

        if (!response.ok) {
            throw new Error('Lỗi khi xóa thiết bị');
        }

        // Tải lại dữ liệu từ server
        await loadInitialData();
        
        showNotification('Đã xóa thiết bị thành công', 'success');
    } catch (error) {
        console.error('Error deleting device:', error);
        showNotification(error.message || 'Có lỗi xảy ra', 'error');
    }
}

// Cập nhật hàm handleDeviceSubmit để sử dụng API
async function handleDeviceSubmit(event, deviceId = null) {
    event.preventDefault();
    
    const form = event.target;
    const deviceData = {
        name: form.querySelector('#device-name').value,
        category: form.querySelector('#device-category').value,
        quantity: parseInt(form.querySelector('#device-quantity').value),
        price: parseFloat(form.querySelector('#device-price').value),
        threshold: parseInt(form.querySelector('#device-threshold').value),
        description: form.querySelector('#device-description').value
    };

    try {
        let response;
        if (deviceId) {
            // Cập nhật thiết bị hiện có
            response = await fetch(`${API_URL}/devices/${deviceId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(deviceData)
            });
        } else {
            // Thêm thiết bị mới
            response = await fetch(`${API_URL}/devices`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(deviceData)
            });
        }

        if (!response.ok) {
            throw new Error('Lỗi khi lưu thiết bị');
        }

        // Tải lại dữ liệu từ server
        await loadInitialData();
        
        // Đóng modal
        closeModal('device-form-modal');
        
        // Hiển thị thông báo
        showNotification(
            deviceId ? 'Cập nhật thiết bị thành công' : 'Thêm thiết bị thành công',
            'success'
        );
    } catch (error) {
        console.error('Error handling device:', error);
        showNotification(error.message || 'Có lỗi xảy ra', 'error');
    }
}

// Export các hàm mới
window.addDevice = addDevice;
window.editDevice = editDevice;
window.deleteDevice = deleteDevice;
window.handleDeviceSubmit = handleDeviceSubmit;

function viewPaymentDetail(paymentId) {
    const payment = payments.find(p => p.id === paymentId);
    if (!payment) {
        showNotification('Không tìm thấy thông tin thanh toán', 'error');
        return;
    }

    const modal = document.getElementById('payment-detail-modal');
    if (!modal) return;

    modal.innerHTML = `
        <div class="modal-content">
            <h2>Chi tiết thanh toán</h2>
            <div class="payment-info">
                <div class="info-group">
                    <label>Mã thanh toán:</label>
                    <span>${payment.id}</span>
                </div>
                <div class="info-group">
                    <label>Mã giao dịch:</label>
                    <span>${payment.transactionId}</span>
                </div>
                <div class="info-group">
                    <label>Số tiền:</label>
                    <span>${formatCurrency(payment.amount)}</span>
                </div>
                <div class="info-group">
                    <label>Ngày:</label>
                    <span>${formatDate(payment.date)}</span>
                </div>
                <div class="info-group">
                    <label>Loại:</label>
                    <span class="status-badge ${payment.type}">
                        ${payment.type === 'import' ? 'Nhập kho' : 'Xuất kho'}
                    </span>
                </div>
                <div class="info-group">
                    <label>Trạng thái:</label>
                    <span class="status-badge ${payment.status}">
                        ${getPaymentStatusText(payment.status)}
                    </span>
                </div>
                <div class="info-group">
                    <label>Phương thức:</label>
                    <span class="payment-method ${payment.method}">
                        ${getPaymentMethodText(payment.method)}
                    </span>
                </div>
                <div class="info-group">
                    <label>Ghi chú:</label>
                    <span>${payment.note || 'Không có'}</span>
                </div>
            </div>
            <div class="modal-actions">
                <button onclick="editPayment('${payment.id}')" class="btn edit-btn">
                    <i class="fas fa-edit"></i> Chỉnh sửa
                </button>
                <button onclick="closeModal('payment-detail-modal')" class="btn">
                    <i class="fas fa-times"></i> Đóng
                </button>
            </div>
        </div>
    `;
    
    modal.style.display = 'block';
}

// Export hàm mới
window.viewPaymentDetail = viewPaymentDetail;

// Hàm xuất dữ liệu thanh toán ra Excel
function exportToExcel() {
    try {
        // Tạo mảng dữ liệu để xuất
        const exportData = payments.map(payment => ({
            'Mã thanh toán': payment.id,
            'Mã giao dịch': payment.transactionId,
            'Số tiền': payment.amount,
            'Ngày': formatDate(payment.date),
            'Loại': payment.type === 'import' ? 'Nhập kho' : 'Xuất kho',
            'Trạng thái': getPaymentStatusText(payment.status),
            'Phương thức': getPaymentMethodText(payment.method),
            'Ghi chú': payment.note
        }));

        // Tạo workbook và worksheet
        const wb = XLSX.utils.book_new();
        const ws = XLSX.utils.json_to_sheet(exportData);

        // Thêm worksheet vào workbook
        XLSX.utils.book_append_sheet(wb, ws, 'Thanh toán');

        // Xuất file
        const fileName = `Thanh_toan_${formatDate(new Date())}.xlsx`;
        XLSX.writeFile(wb, fileName);

        showNotification('Xuất Excel thành công', 'success');
    } catch (error) {
        console.error('Lỗi khi xuất Excel:', error);
        showNotification('Có lỗi xảy ra khi xuất Excel', 'error');
    }
}

// Hàm xuất dữ liệu thanh toán ra PDF
function exportToPDF() {
    try {
        // Tạo nội dung PDF
        const docDefinition = {
            content: [
                { text: 'Danh sách thanh toán', style: 'header' },
                { text: `Ngày xuất: ${formatDate(new Date())}`, style: 'subheader' },
                {
                    table: {
                        headerRows: 1,
                        widths: ['auto', 'auto', 'auto', 'auto', 'auto', 'auto', 'auto', '*'],
                        body: [
                            // Header
                            [
                                'Mã thanh toán',
                                'Mã giao dịch',
                                'Số tiền',
                                'Ngày',
                                'Loại',
                                'Trạng thái',
                                'Phương thức',
                                'Ghi chú'
                            ],
                            // Data rows
                            ...payments.map(payment => [
                                payment.id,
                                payment.transactionId,
                                formatCurrency(payment.amount),
                                formatDate(payment.date),
                                payment.type === 'import' ? 'Nhập kho' : 'Xuất kho',
                                getPaymentStatusText(payment.status),
                                getPaymentMethodText(payment.method),
                                payment.note || ''
                            ])
                        ]
                    }
                }
            ],
            styles: {
                header: {
                    fontSize: 18,
                    bold: true,
                    margin: [0, 0, 0, 10]
                },
                subheader: {
                    fontSize: 14,
                    bold: true,
                    margin: [0, 10, 0, 5]
                }
            },
            defaultStyle: {
                font: 'Roboto'
            }
        };

        // Tạo và tải file PDF
        const fileName = `Thanh_toan_${formatDate(new Date())}.pdf`;
        pdfMake.createPdf(docDefinition).download(fileName);

        showNotification('Xuất PDF thành công', 'success');
    } catch (error) {
        console.error('Lỗi khi xuất PDF:', error);
        showNotification('Có lỗi xảy ra khi xuất PDF', 'error');
    }
}

// Export các hàm mới
window.exportToExcel = exportToExcel;
window.exportToPDF = exportToPDF;

function showAddDeviceModal() {
    const modal = document.getElementById('device-form-modal');
    const form = document.getElementById('device-form');
    const title = document.getElementById('device-form-title');

    // Reset form
    form.reset();
    
    // Set title for adding new device
    title.textContent = 'Thêm thiết bị mới';
    
    // Clear the device ID if it was set
    form.removeAttribute('data-device-id');
    
    // Show the modal
    modal.style.display = 'block';
}

function getDeviceStatusText(device) {
    if (!device || typeof device.quantity !== 'number' || !device.threshold) {
        return 'Không xác định';
    }

    if (device.quantity <= 0) {
        return 'Hết hàng';
    } else if (device.quantity <= device.threshold) {
        return 'Sắp hết';
    } else {
        return 'Còn hàng';
    }
}

// Cập nhật hàm exportDevicesToExcel để sử dụng getDeviceStatusText
function exportDevicesToExcel() {
    try {
        // Tạo mảng dữ liệu để xuất
        const exportData = devices.map(device => ({
            'Mã thiết bị': device.id,
            'Tên thiết bị': device.name,
            'Danh mục': device.category,
            'Số lượng': device.quantity,
            'Đơn giá': device.price,
            'Trạng thái': getDeviceStatusText(device),
            'Ngưỡng cảnh báo': device.threshold,
            'Mô tả': device.description || ''
        }));

        // Tạo workbook và worksheet
        const wb = XLSX.utils.book_new();
        const ws = XLSX.utils.json_to_sheet(exportData);

        // Thêm worksheet vào workbook
        XLSX.utils.book_append_sheet(wb, ws, 'Thiết bị');

        // Xuất file
        const fileName = `Thiet_bi_${formatDate(new Date())}.xlsx`;
        XLSX.writeFile(wb, fileName);

        showNotification('Xuất Excel thành công', 'success');
    } catch (error) {
        console.error('Error exporting devices:', error);
        showNotification('Có lỗi xảy ra khi xuất Excel', 'error');
    }
}

// Export các hàm mới
window.showAddDeviceModal = showAddDeviceModal;
window.getDeviceStatusText = getDeviceStatusText;

function closeDeviceForm() {
    const modal = document.getElementById('device-form-modal');
    if (modal) {
        modal.style.display = 'none';
        // Reset form if it exists
        const form = document.getElementById('device-form');
        if (form) {
            form.reset();
        }
    }
}

// Export the new function
window.closeDeviceForm = closeDeviceForm;

// Hàm lưu dữ liệu vào localStorage
function saveDataToStorage() {
    localStorage.setItem('devices', JSON.stringify(devices));
    localStorage.setItem('alerts', JSON.stringify(alerts));
    localStorage.setItem('transactions', JSON.stringify(transactions));
    localStorage.setItem('payments', JSON.stringify(payments));
    localStorage.setItem('history', JSON.stringify(history));
}

// Hàm khôi phục dữ liệu từ localStorage
function loadDataFromStorage() {
    const savedDevices = localStorage.getItem('devices');
    const savedAlerts = localStorage.getItem('alerts');
    const savedTransactions = localStorage.getItem('transactions');
    const savedPayments = localStorage.getItem('payments');
    const savedHistory = localStorage.getItem('history');

    if (savedDevices) devices = JSON.parse(savedDevices);
    if (savedAlerts) alerts = JSON.parse(savedAlerts);
    if (savedTransactions) transactions = JSON.parse(savedTransactions);
    if (savedPayments) payments = JSON.parse(savedPayments);
    if (savedHistory) history = JSON.parse(savedHistory);
}

// Hàm load dữ liệu dashboard
async function loadDashboardData() {
    try {
        // Cập nhật thống kê
        updateDashboardStats();
        
        // Cập nhật các biểu đồ
        updateCharts();
        
        // Cập nhật bảng giao dịch gần đây
        updateRecentTransactionsTable();
        
        // Cập nhật danh sách cảnh báo
        updateAlerts();
    } catch (error) {
        console.error('Error loading dashboard data:', error);
        showNotification('Lỗi khi tải dữ liệu dashboard', 'error');
    }
}

// Hàm chỉnh sửa thanh toán
function editPayment(paymentId) {
    const payment = payments.find(p => p.id === paymentId);
    if (!payment) {
        showNotification('Không tìm thấy thông tin thanh toán', 'error');
        return;
    }

    const modal = document.getElementById('payment-modal');
    if (!modal) return;

    modal.innerHTML = `
        <div class="modal-content">
            <h2>Chỉnh sửa thanh toán</h2>
            <form id="payment-form" onsubmit="handlePaymentSubmit(event, '${paymentId}')">
                <div class="form-group">
                    <label>Số tiền</label>
                    <input type="number" id="payment-amount" value="${payment.amount}" required min="0">
                </div>
                <div class="form-group">
                    <label>Phương thức thanh toán</label>
                    <select id="payment-method" required>
                        <option value="cash" ${payment.method === 'cash' ? 'selected' : ''}>Tiền mặt</option>
                        <option value="bank_transfer" ${payment.method === 'bank_transfer' ? 'selected' : ''}>Chuyển khoản</option>
                        <option value="credit_card" ${payment.method === 'credit_card' ? 'selected' : ''}>Thẻ tín dụng</option>
                    </select>
                </div>
                <div class="form-group">
                    <label>Trạng thái</label>
                    <select id="payment-status" required>
                        <option value="pending" ${payment.status === 'pending' ? 'selected' : ''}>Chờ xử lý</option>
                        <option value="completed" ${payment.status === 'completed' ? 'selected' : ''}>Hoàn thành</option>
                        <option value="cancelled" ${payment.status === 'cancelled' ? 'selected' : ''}>Đã hủy</option>
                    </select>
                </div>
                <div class="form-group">
                    <label>Ghi chú</label>
                    <textarea id="payment-note">${payment.note || ''}</textarea>
                </div>
                <div class="form-actions">
                    <button type="submit" class="btn primary-btn">
                        <i class="fas fa-save"></i> Lưu
                    </button>
                    <button type="button" class="btn" onclick="closeModal('payment-modal')">
                        <i class="fas fa-times"></i> Hủy
                    </button>
                </div>
            </form>
        </div>
    `;
    
    modal.style.display = 'block';
}

// Hàm xử lý submit form thanh toán
async function handlePaymentSubmit(event, paymentId = null) {
    event.preventDefault();
    
    const form = event.target;
    const paymentData = {
        amount: parseFloat(form.querySelector('#payment-amount').value),
        method: form.querySelector('#payment-method').value,
        status: form.querySelector('#payment-status').value,
        note: form.querySelector('#payment-note').value
    };

    try {
        let response;
        if (paymentId) {
            // Cập nhật thanh toán hiện có
            response = await fetch(`${API_URL}/payments/${paymentId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(paymentData)
            });
        } else {
            // Thêm thanh toán mới
            response = await fetch(`${API_URL}/payments`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(paymentData)
            });
        }

        if (!response.ok) {
            throw new Error('Lỗi khi lưu thanh toán');
        }

        // Tải lại dữ liệu từ server
        await loadInitialData();
        
        // Đóng modal
        closeModal('payment-modal');
        
        // Hiển thị thông báo
        showNotification(
            paymentId ? 'Cập nhật thanh toán thành công' : 'Thêm thanh toán thành công',
            'success'
        );
    } catch (error) {
        console.error('Error handling payment:', error);
        showNotification(error.message || 'Có lỗi xảy ra', 'error');
    }
}

// Export các hàm mới
window.editPayment = editPayment;
window.handlePaymentSubmit = handlePaymentSubmit;

// Hàm xóa thanh toán
async function deletePayment(paymentId) {
    if (!confirm('Bạn có chắc chắn muốn xóa thanh toán này?')) {
        return;
    }

    try {
        const response = await fetch(`${API_URL}/payments/${paymentId}`, {
            method: 'DELETE'
        });

        if (!response.ok) {
            throw new Error('Lỗi khi xóa thanh toán');
        }

        // Tải lại dữ liệu từ server
        await loadInitialData();
        
        showNotification('Đã xóa thanh toán thành công', 'success');
    } catch (error) {
        console.error('Error deleting payment:', error);
        showNotification(error.message || 'Có lỗi xảy ra', 'error');
    }
}

// Export hàm mới
window.deletePayment = deletePayment;

// Hàm xem chi tiết thiết bị
function viewDeviceDetail(deviceId) {
    const device = devices.find(d => d.id === deviceId);
    if (!device) {
        showNotification('Không tìm thấy thông tin thiết bị', 'error');
        return;
    }

    const modal = document.getElementById('device-detail-modal');
    if (!modal) return;

    modal.innerHTML = `
        <div class="modal-content">
            <h2>Chi tiết thiết bị</h2>
            <div class="device-info">
                <div class="info-group">
                    <label>Mã thiết bị:</label>
                    <span>${device.id}</span>
                </div>
                <div class="info-group">
                    <label>Tên thiết bị:</label>
                    <span>${device.name}</span>
                </div>
                <div class="info-group">
                    <label>Danh mục:</label>
                    <span>${device.category}</span>
                </div>
                <div class="info-group">
                    <label>Số lượng:</label>
                    <span>${device.quantity}</span>
                </div>
                <div class="info-group">
                    <label>Đơn giá:</label>
                    <span>${formatCurrency(device.price)}</span>
                </div>
                <div class="info-group">
                    <label>Ngưỡng cảnh báo:</label>
                    <span>${device.threshold}</span>
                </div>
                <div class="info-group">
                    <label>Trạng thái:</label>
                    <span class="status ${getDeviceStatus(device)}">
                        ${getStatusText(device)}
                    </span>
                </div>
                <div class="info-group">
                    <label>Mô tả:</label>
                    <span>${device.description || 'Không có'}</span>
                </div>
            </div>
            <div class="modal-actions">
                <button onclick="editDevice('${device.id}')" class="btn edit-btn">
                    <i class="fas fa-edit"></i> Chỉnh sửa
                </button>
                <button onclick="closeModal('device-detail-modal')" class="btn">
                    <i class="fas fa-times"></i> Đóng
                </button>
            </div>
        </div>
    `;
    
    modal.style.display = 'block';
}

// Export hàm mới
window.viewDeviceDetail = viewDeviceDetail;
