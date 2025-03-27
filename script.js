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
    const alertTypes = ['low-stock', 'inventory'];
    
    alertTypes.forEach(type => {
        const container = document.getElementById(`${type}-alerts`);
        if (!container) return;

        const typeAlerts = alerts.filter(a => a.type === type);
        
        container.innerHTML = typeAlerts.length ? typeAlerts.map(alert => `
            <div class="alert-item ${alert.read ? 'read' : 'unread'} ${alert.severity}">
                <div class="alert-header">
                    <span class="alert-title">${alert.title}</span>
                    <span class="alert-time">${formatDate(alert.timestamp)}</span>
                </div>
                <div class="alert-message">${alert.message}</div>
                <div class="alert-actions">
                    ${!alert.read ? `
                        <button onclick="markAlertRead('${alert.id}')" class="btn">
                            <i class="fas fa-check"></i> Đánh dấu đã đọc
                        </button>
                    ` : ''}
                </div>
            </div>
        `).join('') : '<div class="no-alerts">Không có cảnh báo</div>';

        // Cập nhật số lượng
        const countElement = container.closest('.alert-group')?.querySelector('.alert-count');
        if (countElement) {
            countElement.textContent = typeAlerts.length;
        }
    });
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

function showNotification(message, type = 'success') {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.remove();
    }, 3000);
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
