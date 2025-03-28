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
        id: 'P001',
        transactionId: 'H001',
        amount: 125000000,
        date: new Date('2024-03-20'),
        type: 'import',
        status: 'completed',
        method: 'bank_transfer',
        note: 'Thanh toán nhập kho Laptop Dell XPS'
    },
    {
        id: 'P002',
        transactionId: 'H002',
        amount: 10000000,
        date: new Date('2024-03-21'),
        type: 'export',
        status: 'pending',
        method: 'cash',
        note: 'Thanh toán xuất kho Máy in HP'
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

    const months = ['T1', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'T8', 'T9', 'T10', 'T11', 'T12'];
    const importData = months.map(() => Math.floor(Math.random() * 50));
    const exportData = months.map(() => Math.floor(Math.random() * 50));

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
                    beginAtZero: true
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

function switchSection(sectionId) {
    // Ẩn section hiện tại
    document.querySelector(`.section.active`)?.classList.remove('active');
    document.querySelector(`.sidebar ul li.active`)?.classList.remove('active');

    // Hiển thị section mới
    document.querySelector(`#${sectionId}`)?.classList.add('active');
    document.querySelector(`[data-section="${sectionId}"]`)?.classList.add('active');

    // Cập nhật section hiện tại
    currentSection = sectionId;
    loadSectionData(sectionId);
}

// Load dữ liệu
async function loadInitialData() {
    try {
        // Trong môi trường development, sử dụng mock data
        devices = mockDevices;
        alerts = mockAlerts;
        transactions = mockTransactions;

        // Cập nhật UI
        updateDashboardStats();
        updateDevicesTable();
        updateAlerts();
        updateRecentTransactionsTable();
    } catch (error) {
        console.error('Error loading initial data:', error);
        showNotification('Không thể tải dữ liệu ban đầu', 'error');
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
    document.getElementById('total-devices').textContent = devices.length;

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
                <button onclick="viewDevice('${device.id}')" class="btn view-btn">
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
    const alertsContainer = document.querySelector('.alerts-list');
    if (!alertsContainer) return;

    const unreadCount = alerts.filter(alert => !alert.read).length;
    updateUnreadBadge(unreadCount);

    alertsContainer.innerHTML = alerts.map(alert => `
        <div class="alert-item ${alert.read ? '' : 'unread'}">
            <div class="alert-icon ${alert.severity}">
                ${getAlertIcon(alert.type)}
            </div>
            <div class="alert-content">
                <div class="alert-header">
                    <span class="alert-title">${alert.title}</span>
                    <span class="alert-time">${formatTimestamp(alert.timestamp)}</span>
                </div>
                <div class="alert-message">${alert.message}</div>
                <div class="alert-actions">
                    ${!alert.read ? `
                        <button onclick="markAlertRead('${alert.id}')" class="btn">
                            <i class="fas fa-check"></i> Đánh dấu đã đọc
                        </button>
                    ` : ''}
                    ${alert.deviceId ? `
                        <button onclick="viewDevice('${alert.deviceId}')" class="btn">
                            <i class="fas fa-eye"></i> Xem thiết bị
                        </button>
                    ` : ''}
                </div>
            </div>
        </div>
    `).join('');
}

function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) modal.style.display = 'none';
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
        if (device.quantity <= alertSettings.lowStockThreshold) {
            createAlert({
                type: ALERT_TYPES.LOW_STOCK,
                severity: ALERT_SEVERITY.HIGH,
                title: `${device.name} sắp hết hàng`,
                message: `Số lượng hiện tại: ${device.quantity}, dưới ngưỡng cảnh báo (${alertSettings.lowStockThreshold})`,
                deviceId: device.id
            });
        }
    });
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
    const alertsContainer = document.querySelector('.alerts-list');
    if (!alertsContainer) return;

    const unreadCount = alerts.filter(alert => !alert.read).length;
    updateUnreadBadge(unreadCount);

    alertsContainer.innerHTML = alerts.map(alert => `
        <div class="alert-item ${alert.read ? '' : 'unread'}">
            <div class="alert-icon ${alert.severity}">
                ${getAlertIcon(alert.type)}
            </div>
            <div class="alert-content">
                <div class="alert-header">
                    <span class="alert-title">${alert.title}</span>
                    <span class="alert-time">${formatTimestamp(alert.timestamp)}</span>
                </div>
                <div class="alert-message">${alert.message}</div>
                <div class="alert-actions">
                    ${!alert.read ? `
                        <button onclick="markAlertRead('${alert.id}')" class="btn">
                            <i class="fas fa-check"></i> Đánh dấu đã đọc
                        </button>
                    ` : ''}
                    ${alert.deviceId ? `
                        <button onclick="viewDevice('${alert.deviceId}')" class="btn">
                            <i class="fas fa-eye"></i> Xem thiết bị
                        </button>
                    ` : ''}
                </div>
            </div>
        </div>
    `).join('');
}

// Cập nhật badge số thông báo chưa đọc
function updateUnreadBadge(count) {
    const badge = document.querySelector('.alerts-badge');
    if (badge) {
        badge.textContent = count;
        badge.style.display = count > 0 ? 'block' : 'none';
    }
}

// Lấy icon cho từng loại cảnh báo
function getAlertIcon(type) {
    switch (type) {
        case ALERT_TYPES.LOW_STOCK:
            return '<i class="fas fa-exclamation-triangle"></i>';
        case ALERT_TYPES.INVENTORY_MISMATCH:
            return '<i class="fas fa-balance-scale"></i>';
        case ALERT_TYPES.LARGE_CHANGE:
            return '<i class="fas fa-chart-line"></i>';
        default:
            return '<i class="fas fa-bell"></i>';
    }
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
    const form = event.target;
    
    alertSettings = {
        lowStockThreshold: parseInt(form.lowStockThreshold.value),
        inventoryMismatchThreshold: parseFloat(form.inventoryMismatchThreshold.value) / 100,
        largeChangeThreshold: parseFloat(form.largeChangeThreshold.value) / 100,
        notificationMethods: {
            inApp: form.notifyInApp.checked,
            email: form.notifyEmail.checked,
            sms: form.notifySMS.checked
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
    checkAndCreateAlerts();
    
    // Kiểm tra cảnh báo định kỳ (mỗi 5 phút)
    setInterval(checkAndCreateAlerts, 5 * 60 * 1000);
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
            return h.deviceName.toLowerCase().includes(searchTerm) ||
                   h.note.toLowerCase().includes(searchTerm);
        }
        return true;
    });

    // Sắp xếp theo ngày mới nhất
    filteredHistory.sort((a, b) => new Date(b.date) - new Date(a.date));

    tbody.innerHTML = filteredHistory.map(item => `
        <tr>
            <td>${item.id}</td>
            <td>
                <span class="status-badge ${item.type === 'import' ? 'import' : 'export'}">
                    ${item.type === 'import' ? 'Nhập kho' : 'Xuất kho'}
                </span>
            </td>
            <td>${item.deviceName}</td>
            <td>${item.quantity}</td>
            <td>${formatDate(item.date)}</td>
            <td>${item.user}</td>
            <td>${item.note}</td>
            <td>
                <button onclick="viewHistoryDetail('${item.id}')" class="btn view-btn">
                    <i class="fas fa-eye"></i>
                </button>
                <button onclick="viewPaymentByTransaction('${item.id}')" class="btn payment-btn">
                    <i class="fas fa-money-bill"></i>
                </button>
            </td>
        </tr>
    `).join('');
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
                    <select name="deviceId" required>
                        <option value="">Chọn thiết bị</option>
                        ${devices.map(d => `
                            <option value="${d.id}">${d.name}</option>
                        `).join('')}
                    </select>
                </div>
                <div class="form-group">
                    <label>Số lượng</label>
                    <input type="number" name="quantity" required min="1">
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

async function handleTransactionSubmit(event, type) {
    event.preventDefault();
    const form = event.target;
    const formData = new FormData(form);
    
    try {
        const transactionData = {
            id: generateTransactionId(),
            type,
            deviceId: formData.get('deviceId'),
            deviceName: getDeviceName(formData.get('deviceId')),
            quantity: parseInt(formData.get('quantity')),
            price: parseFloat(formData.get('price')),
            totalAmount: parseFloat(formData.get('totalAmount')),
            date: new Date().toISOString(),
            user: 'Admin', // Thay thế bằng user thực tế
            status: 'COMPLETED',
            note: formData.get('note')
        };

        // Thêm giao dịch mới vào mảng transactions
        transactions.unshift(transactionData);

        // Cập nhật số lượng thiết bị
        updateDeviceQuantity(transactionData);

        // Cập nhật UI
        updateRecentTransactionsTable();
        updateTransactionStats();
        updateHistoryTable();
        updateDevicesTable();

        // Đóng modal
        closeModal('transaction-modal');
        
        // Hiển thị thông báo thành công
        showNotification('Giao dịch được thực hiện thành công', 'success');
    } catch (error) {
        console.error('Error submitting transaction:', error);
        showNotification('Có lỗi xảy ra khi thực hiện giao dịch', 'error');
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

// Hàm cập nhật bảng giao dịch gần đây
function updateRecentTransactionsTable() {
    const tbody = document.querySelector('#recent-transactions-table tbody');
    tbody.innerHTML = '';

    // Lấy 10 giao dịch gần nhất
    const recentTransactions = transactions
        .sort((a, b) => new Date(b.date) - new Date(a.date))
        .slice(0, 10);

    recentTransactions.forEach(transaction => {
        const row = document.createElement('tr');
        row.innerHTML = `
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
        `;
        tbody.appendChild(row);
    });
}

// Hàm lấy text trạng thái
function getStatusText(status) {
    switch(status) {
        case 'COMPLETED': return 'Hoàn thành';
        case 'PENDING': return 'Chờ xử lý';
        case 'CANCELLED': return 'Đã hủy';
        default: return status;
    }
}

// Cập nhật hàm loadInitialData để hiển thị giao dịch gần đây
async function loadInitialData() {
    try {
        // Trong môi trường development, sử dụng mock data
        devices = mockDevices;
        alerts = mockAlerts;
        transactions = mockTransactions;

        // Cập nhật UI
        updateDashboardStats();
        updateDevicesTable();
        updateAlerts();
        updateRecentTransactionsTable();
    } catch (error) {
        console.error('Error loading initial data:', error);
        showNotification('Không thể tải dữ liệu ban đầu', 'error');
    }
}

// Hàm xuất file Excel
function exportToExcel() {
    try {
        // Tạo workbook mới
        const wb = XLSX.utils.book_new();
        
        // Chuẩn bị dữ liệu cho bảng
        const data = history.map(item => ({
            'Mã GD': item.id,
            'Loại': item.type === 'import' ? 'Nhập kho' : 'Xuất kho',
            'Thiết bị': item.deviceName,
            'Số lượng': item.quantity,
            'Đơn giá': formatCurrency(item.price),
            'Thành tiền': formatCurrency(item.totalAmount),
            'Ngày': formatDate(item.date),
            'Người thực hiện': item.user,
            'Trạng thái': getStatusText(item.status),
            'Ghi chú': item.note
        }));

        // Tạo worksheet từ dữ liệu
        const ws = XLSX.utils.json_to_sheet(data);
        
        // Thêm worksheet vào workbook
        XLSX.utils.book_append_sheet(wb, ws, 'Lịch sử giao dịch');
        
        // Xuất file
        XLSX.writeFile(wb, `Lich_su_giao_dich_${formatDate(new Date())}.xlsx`);
        
        showNotification('Đã xuất file Excel thành công', 'success');
    } catch (error) {
        console.error('Error exporting to Excel:', error);
        showNotification('Có lỗi xảy ra khi xuất file Excel', 'error');
    }
}

// Hàm xuất file PDF
function exportToPDF() {
    try {
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF();

        // Thêm tiêu đề
        doc.setFontSize(16);
        doc.text('Lịch Sử Giao Dịch', 14, 15);
        doc.setFontSize(10);
        doc.text(`Ngày xuất: ${formatDate(new Date())}`, 14, 25);

        // Chuẩn bị dữ liệu cho bảng
        const data = history.map(item => [
            item.id,
            item.type === 'import' ? 'Nhập kho' : 'Xuất kho',
            item.deviceName,
            item.quantity.toString(),
            formatCurrency(item.price),
            formatCurrency(item.totalAmount),
            formatDate(item.date),
            item.user,
            getStatusText(item.status),
            item.note
        ]);

        // Tạo bảng
        doc.autoTable({
            head: [['Mã GD', 'Loại', 'Thiết bị', 'Số lượng', 'Đơn giá', 'Thành tiền', 'Ngày', 'Người thực hiện', 'Trạng thái', 'Ghi chú']],
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

        // Xuất file
        doc.save(`Lich_su_giao_dich_${formatDate(new Date())}.pdf`);
        
        showNotification('Đã xuất file PDF thành công', 'success');
    } catch (error) {
        console.error('Error exporting to PDF:', error);
        showNotification('Có lỗi xảy ra khi xuất file PDF', 'error');
    }
}

// Export các hàm xuất file
window.exportToExcel = exportToExcel;
window.exportToPDF = exportToPDF;

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
                const newPayments = jsonData.map(row => ({
                    id: row['Mã thanh toán'] || generatePaymentId(),
                    transactionId: row['Mã giao dịch'],
                    amount: parseFloat(row['Số tiền']) || 0,
                    date: new Date(row['Ngày']),
                    type: row['Loại'],
                    status: row['Trạng thái'],
                    method: row['Phương thức'],
                    note: row['Ghi chú'] || ''
                }));

                // Thêm các thanh toán mới vào danh sách
                payments = [...payments, ...newPayments];
                
                // Cập nhật UI
                updatePaymentsTable();
                updatePaymentStats();
                
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

// Export các hàm mới
window.importDevicesFromExcel = importDevicesFromExcel;
window.exportDevicesToExcel = exportDevicesToExcel;
window.exportDevicesToPDF = exportDevicesToPDF;
window.importPaymentsFromExcel = importPaymentsFromExcel;
window.exportPaymentsToExcel = exportPaymentsToExcel;
window.exportPaymentsToPDF = exportPaymentsToPDF;
