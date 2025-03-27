// Khởi tạo biến toàn cục
let currentSection = 'dashboard';
let devices = [];
let alerts = [];
let currentPage = 1;
const itemsPerPage = 10;

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

// Mock data cho lịch sử
const mockHistory = [
    {
        id: 'H001',
        type: 'import',
        deviceId: 'D001',
        deviceName: 'Laptop Dell XPS',
        quantity: 5,
        date: new Date('2024-03-20'),
        user: 'Admin',
        note: 'Nhập hàng mới'
    },
    {
        id: 'H002',
        type: 'export',
        deviceId: 'D002',
        deviceName: 'Máy in HP LaserJet',
        quantity: 2,
        date: new Date('2024-03-21'),
        user: 'Admin',
        note: 'Xuất cho phòng kế toán'
    }
];

let history = [...mockHistory];
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

// Khởi tạo ứng dụng
document.addEventListener('DOMContentLoaded', () => {
    initializeNavigation();
    loadInitialData();
    initializeCharts();
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

        // Cập nhật UI
        updateDashboardStats();
        updateDevicesTable();
        updateAlerts();
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
    // Cập nhật các thống kê
    updateElement('total-devices', devices.length);
    updateElement('imported-this-month', 20); // Mock data
    updateElement('exported-this-month', 10); // Mock data
    updateElement('low-stock-devices', devices.filter(d => d.quantity <= d.threshold).length);
}

// Xử lý Devices
function updateDevicesTable() {
    const tbody = document.querySelector('#devices-table');
    if (!tbody) return;

    const start = (currentPage - 1) * itemsPerPage;
    const end = start + itemsPerPage;
    const pageDevices = devices.slice(start, end);

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

    updatePagination();
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

// Xử lý Charts
function initializeCharts() {
    initializeStockTrendChart();
    initializeCategoryDistributionChart();
    initializeDemandForecastChart();
    initializeImportExportRatioChart();
}

function initializeStockTrendChart() {
    const ctx = document.getElementById('stockTrendChart')?.getContext('2d');
    if (!ctx) return;

    new Chart(ctx, {
        type: 'line',
        data: {
            labels: ['T1', 'T2', 'T3', 'T4', 'T5', 'T6'],
            datasets: [{
                label: 'Số lượng tồn kho',
                data: [65, 59, 80, 81, 56, 55],
                borderColor: '#4CAF50',
                tension: 0.1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false
        }
    });
}

// Các hàm tiện ích
function updateElement(id, value) {
    const element = document.getElementById(id);
    if (element) element.textContent = value;
}

function formatCurrency(amount) {
    return new Intl.NumberFormat('vi-VN', {
        style: 'currency',
        currency: 'VND'
    }).format(amount);
}

function formatDate(date) {
    return new Date(date).toLocaleString('vi-VN');
}

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

// CRUD Operations cho Devices
function showAddDeviceModal() {
    const modal = document.getElementById('device-form-modal');
    if (!modal) return;

    document.getElementById('device-form-title').textContent = 'Thêm thiết bị mới';
    document.getElementById('device-form').reset();
    modal.style.display = 'block';
}

function closeDeviceForm() {
    const modal = document.getElementById('device-form-modal');
    if (modal) modal.style.display = 'none';
}

function handleDeviceSubmit(event) {
    event.preventDefault();
    const form = event.target;
    
    const deviceData = {
        id: form.id?.value || `D${String(devices.length + 1).padStart(3, '0')}`,
        name: form['device-name'].value,
        category: form['device-category'].value,
        quantity: parseInt(form['device-quantity'].value),
        price: parseInt(form['device-price'].value),
        threshold: parseInt(form['device-threshold'].value),
        description: form['device-description'].value
    };

    if (form.id?.value) {
        // Edit existing device
        devices = devices.map(d => d.id === deviceData.id ? deviceData : d);
        showNotification('Cập nhật thiết bị thành công');
    } else {
        // Add new device
        devices.push(deviceData);
        showNotification('Thêm thiết bị thành công');
    }

    updateDevicesTable();
    updateDashboardStats();
    closeDeviceForm();
}

// Export các hàm cần thiết
window.showAddDeviceModal = showAddDeviceModal;
window.closeDeviceForm = closeDeviceForm;
window.handleDeviceSubmit = handleDeviceSubmit;
window.viewDevice = viewDevice;
window.editDevice = editDevice;
window.deleteDevice = deleteDevice;
window.markAlertRead = markAlertRead;

// Thêm các hàm còn thiếu
function viewDevice(deviceId) {
    const device = devices.find(d => d.id === deviceId);
    if (!device) {
        showNotification('Không tìm thấy thiết bị', 'error');
        return;
    }

    const modal = document.getElementById('device-detail-modal');
    if (!modal) return;

    modal.innerHTML = `
        <div class="modal-content">
            <h2>Chi tiết thiết bị</h2>
            <div class="device-info">
                <p><strong>ID:</strong> ${device.id}</p>
                <p><strong>Tên:</strong> ${device.name}</p>
                <p><strong>Danh mục:</strong> ${device.category}</p>
                <p><strong>Số lượng:</strong> ${device.quantity}</p>
                <p><strong>Giá:</strong> ${formatCurrency(device.price)}</p>
                <p><strong>Trạng thái:</strong> ${getStatusText(device)}</p>
                <p><strong>Ngưỡng cảnh báo:</strong> ${device.threshold}</p>
                <p><strong>Mô tả:</strong> ${device.description || 'Không có mô tả'}</p>
            </div>
            <div class="modal-actions">
                <button onclick="editDevice('${device.id}')" class="btn edit-btn">
                    <i class="fas fa-edit"></i> Sửa
                </button>
                <button onclick="closeModal('device-detail-modal')" class="btn">
                    <i class="fas fa-times"></i> Đóng
                </button>
            </div>
        </div>
    `;
    modal.style.display = 'block';
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
            <form id="device-form" onsubmit="handleDeviceSubmit(event)">
                <input type="hidden" name="id" value="${device.id}">
                <div class="form-group">
                    <label>Tên thiết bị</label>
                    <input type="text" name="device-name" value="${device.name}" required>
                </div>
                <div class="form-group">
                    <label>Danh mục</label>
                    <select name="device-category" required>
                        <option value="laptop" ${device.category === 'laptop' ? 'selected' : ''}>Laptop</option>
                        <option value="desktop" ${device.category === 'desktop' ? 'selected' : ''}>Desktop</option>
                        <option value="printer" ${device.category === 'printer' ? 'selected' : ''}>Máy in</option>
                        <option value="network" ${device.category === 'network' ? 'selected' : ''}>Thiết bị mạng</option>
                    </select>
                </div>
                <div class="form-group">
                    <label>Số lượng</label>
                    <input type="number" name="device-quantity" value="${device.quantity}" required min="0">
                </div>
                <div class="form-group">
                    <label>Giá</label>
                    <input type="number" name="device-price" value="${device.price}" required min="0">
                </div>
                <div class="form-group">
                    <label>Ngưỡng cảnh báo</label>
                    <input type="number" name="device-threshold" value="${device.threshold}" required min="0">
                </div>
                <div class="form-group">
                    <label>Mô tả</label>
                    <textarea name="device-description">${device.description || ''}</textarea>
                </div>
                <div class="modal-actions">
                    <button type="submit" class="btn save-btn">
                        <i class="fas fa-save"></i> Lưu
                    </button>
                    <button type="button" onclick="closeModal('device-form-modal')" class="btn">
                        <i class="fas fa-times"></i> Hủy
                    </button>
                </div>
            </form>
        </div>
    `;
    modal.style.display = 'block';
}

function deleteDevice(deviceId) {
    if (!confirm('Bạn có chắc chắn muốn xóa thiết bị này?')) return;

    const index = devices.findIndex(d => d.id === deviceId);
    if (index === -1) {
        showNotification('Không tìm thấy thiết bị', 'error');
        return;
    }

    devices.splice(index, 1);
    updateDevicesTable();
    updateDashboardStats();
    showNotification('Xóa thiết bị thành công');
}

function updatePagination() {
    const totalPages = Math.ceil(devices.length / itemsPerPage);
    const paginationEl = document.querySelector('.pagination');
    if (!paginationEl) return;

    const prevBtn = paginationEl.querySelector('#prev-page');
    const nextBtn = paginationEl.querySelector('#next-page');
    const pageInfo = paginationEl.querySelector('#page-info');

    if (prevBtn) prevBtn.disabled = currentPage === 1;
    if (nextBtn) nextBtn.disabled = currentPage === totalPages;
    if (pageInfo) pageInfo.textContent = `Trang ${currentPage} / ${totalPages}`;
}

function initializeCategoryDistributionChart() {
    const ctx = document.getElementById('categoryDistributionChart')?.getContext('2d');
    if (!ctx) return;

    // Tính toán số lượng thiết bị theo danh mục
    const categoryCount = devices.reduce((acc, device) => {
        acc[device.category] = (acc[device.category] || 0) + 1;
        return acc;
    }, {});

    new Chart(ctx, {
        type: 'pie',
        data: {
            labels: Object.keys(categoryCount),
            datasets: [{
                data: Object.values(categoryCount),
                backgroundColor: [
                    '#4CAF50',
                    '#2196F3',
                    '#FFC107',
                    '#F44336'
                ]
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false
        }
    });
}

function initializeDemandForecastChart() {
    const ctx = document.getElementById('demandForecastChart')?.getContext('2d');
    if (!ctx) return;

    new Chart(ctx, {
        type: 'line',
        data: {
            labels: ['T1', 'T2', 'T3', 'T4', 'T5', 'T6'],
            datasets: [{
                label: 'Dự báo nhu cầu',
                data: [30, 35, 40, 45, 50, 55],
                borderColor: '#2196F3',
                tension: 0.1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false
        }
    });
}

function initializeImportExportRatioChart() {
    const ctx = document.getElementById('importExportRatioChart')?.getContext('2d');
    if (!ctx) return;

    new Chart(ctx, {
        type: 'bar',
        data: {
            labels: ['T1', 'T2', 'T3', 'T4', 'T5', 'T6'],
            datasets: [
                {
                    label: 'Nhập kho',
                    data: [20, 25, 30, 35, 25, 20],
                    backgroundColor: '#4CAF50'
                },
                {
                    label: 'Xuất kho',
                    data: [15, 20, 25, 30, 20, 15],
                    backgroundColor: '#F44336'
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: {
                    beginAtZero: true
                }
            }
        }
    });
}

function updateCharts() {
    // Cập nhật dữ liệu cho các biểu đồ
    const stockTrendChart = Chart.getChart('stockTrendChart');
    const categoryDistChart = Chart.getChart('categoryDistributionChart');
    const demandForecastChart = Chart.getChart('demandForecastChart');
    const importExportChart = Chart.getChart('importExportRatioChart');

    if (stockTrendChart) {
        stockTrendChart.data.datasets[0].data = [65, 59, 80, 81, 56, 55];
        stockTrendChart.update();
    }

    if (categoryDistChart) {
        const categoryCount = devices.reduce((acc, device) => {
            acc[device.category] = (acc[device.category] || 0) + 1;
            return acc;
        }, {});
        categoryDistChart.data.labels = Object.keys(categoryCount);
        categoryDistChart.data.datasets[0].data = Object.values(categoryCount);
        categoryDistChart.update();
    }

    // Cập nhật các biểu đồ khác tương tự...
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
            </div>
            <div class="modal-actions">
                <button onclick="closeModal('history-detail-modal')" class="btn">
                    <i class="fas fa-times"></i> Đóng
                </button>
            </div>
        </div>
    `;
    
    modal.style.display = 'block';
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
    const filterForm = document.getElementById('history-filters');
    if (filterForm) {
        filterForm.reset();
        historyFilters = {
            startDate: null,
            endDate: null,
            type: 'all',
            searchTerm: ''
        };
        updateHistoryTable();
    }
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

function handleTransactionSubmit(event, type) {
    event.preventDefault();
    const form = event.target;
    
    const deviceId = form.deviceId.value;
    const device = devices.find(d => d.id === deviceId);
    if (!device) {
        showNotification('Không tìm thấy thiết bị', 'error');
        return;
    }

    const quantity = parseInt(form.quantity.value);
    
    // Kiểm tra số lượng xuất kho
    if (type === 'export' && quantity > device.quantity) {
        showNotification('Số lượng xuất vượt quá tồn kho', 'error');
        return;
    }

    // Cập nhật số lượng thiết bị
    device.quantity += type === 'import' ? quantity : -quantity;

    // Thêm vào lịch sử
    const transaction = {
        id: 'H' + Date.now(),
        type,
        deviceId,
        deviceName: device.name,
        quantity,
        date: new Date(),
        user: 'Admin', // Trong thực tế sẽ lấy từ user đang đăng nhập
        note: form.note.value
    };

    history.unshift(transaction);

    // Cập nhật UI
    updateDevicesTable();
    updateHistoryTable();
    updateDashboardStats();
    
    closeModal('transaction-modal');
    showNotification(
        `${type === 'import' ? 'Nhập' : 'Xuất'} kho thành công: ${quantity} ${device.name}`,
        'success'
    );
}

// Export các hàm cần thiết
window.addTransaction = addTransaction;
window.handleTransactionSubmit = handleTransactionSubmit;
window.viewHistoryDetail = viewHistoryDetail;
window.applyHistoryFilters = applyHistoryFilters;
window.resetHistoryFilters = resetHistoryFilters;

// Xử lý phần thanh toán
function loadPaymentsSection() {
    updatePaymentStats();
    updatePaymentsTable();
}

function updatePaymentStats() {
    const today = new Date();
    const thisMonth = payments.filter(p => {
        const paymentDate = new Date(p.date);
        return paymentDate.getMonth() === today.getMonth() &&
               paymentDate.getFullYear() === today.getFullYear();
    });

    const totalAmount = thisMonth.reduce((sum, p) => sum + p.amount, 0);
    const pendingAmount = thisMonth
        .filter(p => p.status === PAYMENT_STATUS.PENDING)
        .reduce((sum, p) => sum + p.amount, 0);

    // Cập nhật thống kê
    updateElement('total-payments', formatCurrency(totalAmount));
    updateElement('pending-payments', formatCurrency(pendingAmount));
    updateElement('payment-count', thisMonth.length);
}

function updatePaymentsTable() {
    const tbody = document.querySelector('#payments-table');
    if (!tbody) return;

    tbody.innerHTML = payments.map(payment => `
        <tr>
            <td>${payment.id}</td>
            <td>${formatDate(payment.date)}</td>
            <td>${formatCurrency(payment.amount)}</td>
            <td>
                <span class="status-badge ${payment.status}">
                    ${getPaymentStatusText(payment.status)}
                </span>
            </td>
            <td>
                <button onclick="viewPaymentDetail('${payment.id}')" class="btn view-btn">
                    <i class="fas fa-eye"></i>
                </button>
                ${payment.status === PAYMENT_STATUS.PENDING ? `
                    <button onclick="completePayment('${payment.id}')" class="btn complete-btn">
                        <i class="fas fa-check"></i>
                    </button>
                    <button onclick="cancelPayment('${payment.id}')" class="btn cancel-btn">
                        <i class="fas fa-times"></i>
                    </button>
                ` : ''}
            </td>
        </tr>
    `).join('');
}

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
                    <label>Loại:</label>
                    <span class="status-badge ${payment.type}">
                        ${payment.type === 'import' ? 'Nhập kho' : 'Xuất kho'}
                    </span>
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
                    <label>Trạng thái:</label>
                    <span class="status-badge ${payment.status}">
                        ${getPaymentStatusText(payment.status)}
                    </span>
                </div>
                <div class="info-group">
                    <label>Phương thức:</label>
                    <span>${getPaymentMethodText(payment.method)}</span>
                </div>
                <div class="info-group">
                    <label>Ghi chú:</label>
                    <span>${payment.note}</span>
                </div>
            </div>
            <div class="modal-actions">
                ${payment.status === PAYMENT_STATUS.PENDING ? `
                    <button onclick="completePayment('${payment.id}')" class="btn complete-btn">
                        <i class="fas fa-check"></i> Hoàn thành
                    </button>
                    <button onclick="cancelPayment('${payment.id}')" class="btn cancel-btn">
                        <i class="fas fa-times"></i> Hủy
                    </button>
                ` : ''}
                <button onclick="closeModal('payment-detail-modal')" class="btn">
                    <i class="fas fa-times"></i> Đóng
                </button>
            </div>
        </div>
    `;
    
    modal.style.display = 'block';
}

function completePayment(paymentId) {
    const payment = payments.find(p => p.id === paymentId);
    if (!payment) {
        showNotification('Không tìm thấy thông tin thanh toán', 'error');
        return;
    }

    payment.status = PAYMENT_STATUS.COMPLETED;
    updatePaymentsTable();
    closeModal('payment-detail-modal');
    showNotification('Đã hoàn thành thanh toán', 'success');
}

function cancelPayment(paymentId) {
    if (!confirm('Bạn có chắc chắn muốn hủy thanh toán này?')) return;

    const payment = payments.find(p => p.id === paymentId);
    if (!payment) {
        showNotification('Không tìm thấy thông tin thanh toán', 'error');
        return;
    }

    payment.status = PAYMENT_STATUS.CANCELLED;
    updatePaymentsTable();
    closeModal('payment-detail-modal');
    showNotification('Đã hủy thanh toán', 'success');
}

function createPayment(transactionData) {
    const payment = {
        id: 'P' + Date.now(),
        transactionId: transactionData.id,
        amount: calculateAmount(transactionData),
        date: new Date(),
        type: transactionData.type,
        status: PAYMENT_STATUS.PENDING,
        method: null,
        note: `Thanh toán ${transactionData.type === 'import' ? 'nhập' : 'xuất'} kho: ${transactionData.deviceName}`
    };

    const modal = document.getElementById('payment-form-modal');
    if (!modal) return;

    modal.innerHTML = `
        <div class="modal-content">
            <h2>Tạo thanh toán mới</h2>
            <form id="payment-form" onsubmit="handlePaymentSubmit(event, '${payment.id}')">
                <div class="form-group">
                    <label>Số tiền</label>
                    <input type="number" name="amount" value="${payment.amount}" required>
                </div>
                <div class="form-group">
                    <label>Phương thức thanh toán</label>
                    <select name="method" required>
                        <option value="">Chọn phương thức</option>
                        <option value="cash">Tiền mặt</option>
                        <option value="bank_transfer">Chuyển khoản</option>
                        <option value="credit_card">Thẻ tín dụng</option>
                    </select>
                </div>
                <div class="form-group">
                    <label>Ghi chú</label>
                    <textarea name="note">${payment.note}</textarea>
                </div>
                <div class="form-actions">
                    <button type="submit" class="btn primary-btn">
                        <i class="fas fa-save"></i> Lưu
                    </button>
                    <button type="button" onclick="closeModal('payment-form-modal')" class="btn">
                        <i class="fas fa-times"></i> Hủy
                    </button>
                </div>
            </form>
        </div>
    `;
    
    modal.style.display = 'block';
    return payment;
}

function handlePaymentSubmit(event, paymentId) {
    event.preventDefault();
    const form = event.target;
    
    const payment = {
        ...payments.find(p => p.id === paymentId) || {},
        amount: parseInt(form.amount.value),
        method: form.method.value,
        note: form.note.value
    };

    const index = payments.findIndex(p => p.id === paymentId);
    if (index === -1) {
        payments.push(payment);
    } else {
        payments[index] = payment;
    }

    updatePaymentsTable();
    closeModal('payment-form-modal');
    showNotification('Đã lưu thông tin thanh toán', 'success');
}

function calculateAmount(transaction) {
    const device = devices.find(d => d.id === transaction.deviceId);
    if (!device) return 0;
    return device.price * transaction.quantity;
}

function getPaymentStatusText(status) {
    const statusMap = {
        [PAYMENT_STATUS.PENDING]: 'Chờ thanh toán',
        [PAYMENT_STATUS.COMPLETED]: 'Đã thanh toán',
        [PAYMENT_STATUS.CANCELLED]: 'Đã hủy'
    };
    return statusMap[status] || status;
}

function getPaymentMethodText(method) {
    const methodMap = {
        [PAYMENT_METHODS.CASH]: 'Tiền mặt',
        [PAYMENT_METHODS.BANK_TRANSFER]: 'Chuyển khoản',
        [PAYMENT_METHODS.CREDIT_CARD]: 'Thẻ tín dụng'
    };
    return methodMap[method] || method;
}

// Export các hàm cần thiết
window.viewPaymentDetail = viewPaymentDetail;
window.completePayment = completePayment;
window.cancelPayment = cancelPayment;
window.createPayment = createPayment;
window.handlePaymentSubmit = handlePaymentSubmit;
