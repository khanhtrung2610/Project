document.addEventListener("DOMContentLoaded", function () {
    const sections = document.querySelectorAll(".section");
    const menuItems = document.querySelectorAll(".sidebar ul li");

    function getElement(selector) {
        const el = document.querySelector(selector);
        if (!el) console.error(`❌ Không tìm thấy ${selector}!`);
        return el;
    }

    const deviceTable = getElement("#devices-table");
    const transactionTable = getElement("#transaction-table");
    const paymentTable = getElement("#payment-table");
    const historyTable = getElement("#history-table");
    const alertContainer = getElement("#alert-container");
    const stockChartCanvas = getElement("#stockChart");

    let stockChartInstance = null;

    // Mảng lưu trữ dữ liệu thanh toán
    let payments = [];

    // Transaction Management
    let selectedProducts = [];
    let transactionType = 'import';

    // Alert Management
    let alerts = [];
    let alertSettings = {
        lowStockThreshold: 10,
        largeChangeThreshold: 50,
        notificationMethods: {
            system: true,
            email: true,
            sms: false
        },
        checkFrequency: 'realtime'
    };

    async function fetchData(endpoint) {
        try {
            const res = await fetch(`http://localhost:5001/api/${endpoint}`);
            if (!res.ok) throw new Error(`Lỗi ${res.status}: ${res.statusText}`);
            return await res.json();
        } catch (error) {
            console.error(`❌ Lỗi tải dữ liệu ${endpoint}:`, error);
            return null;
        }
    }

    async function loadDevices() {
        if (!deviceTable) return;
        const devices = await fetchData("devices");
        if (!devices) return;
        deviceTable.innerHTML = devices.length
            ? devices.map(device => `
                <tr>
                    <td>${device.id}</td>
                    <td>${device.name}</td>
                    <td>${device.quantity}</td>
                    <td>
                        <button class="edit-btn" onclick="editDevice(${device.id})">Sửa</button>
                        <button class="delete-btn" onclick="deleteDevice(${device.id})">Xóa</button>
                    </td>
                </tr>
            `).join("")
            : "<tr><td colspan='4'>Không có thiết bị nào</td></tr>";
    }

    async function loadTransactions() {
        if (!transactionTable) return;
        const transactions = await fetchData("transactions");
        if (!transactions) return;
        transactionTable.innerHTML = transactions.length
            ? transactions.map(transaction => `
                <tr>
                    <td>${transaction.id}</td>
                    <td>${transaction.time}</td>
                    <td>${transaction.device}</td>
                    <td>${transaction.quantity}</td>
                    <td>${transaction.type}</td>
                </tr>
            `).join("")
            : "<tr><td colspan='5'>Không có giao dịch nào</td></tr>";
    }

    async function loadPayments() {
        if (!paymentTable) return;
        
        paymentTable.innerHTML = payments.length
            ? payments.map(payment => `
                <tr data-payment-id="${payment.id}">
                    <td>${payment.id}</td>
                    <td>${payment.customer}</td>
                    <td>${payment.amount.toLocaleString()} VND</td>
                    <td>${formatDate(payment.date)}</td>
                    <td>${payment.method}</td>
                    <td>
                        <span class="status-badge ${payment.status}">${payment.status}</span>
                    </td>
                    <td class="actions">
                        <button onclick="viewPayment('${payment.id}')" class="btn view-btn">👁️</button>
                        <button onclick="editPayment('${payment.id}')" class="btn edit-btn">✏️</button>
                        <button onclick="deletePayment('${payment.id}')" class="btn delete-btn">🗑️</button>
                    </td>
                </tr>
            `).join("")
            : "<tr><td colspan='7'>Không có thanh toán nào</td></tr>";
    }

    async function loadHistory() {
        if (!historyTable) return;
        const history = await fetchData("history");
        if (!history) return;
        historyTable.innerHTML = history.length
            ? history.map(record => `
                <tr>
                    <td>${record.id}</td>
                    <td>${record.date}</td>
                    <td>${record.device}</td>
                    <td>${record.quantity}</td>
                    <td>${record.action}</td>
                </tr>
            `).join("")
            : "<tr><td colspan='5'>Không có lịch sử nào</td></tr>";
    }

    async function loadAlerts() {
        if (!alertContainer) return;
        const alerts = await fetchData("alerts");
        if (!alerts) return;
        alertContainer.innerHTML = alerts.length
            ? alerts.map(alert => `<div class="alert">${alert.message}</div>`).join("")
            : "<div class='alert'>Không có cảnh báo nào</div>";
    }

    async function loadStatistics() {
        const stats = await fetchData("statistics");
        if (!stats) return;
        updateDashboard(stats);
    }

    function updateDashboard(stats) {
        getElement("#total-devices").innerText = stats.totalDevices || 0;
        getElement("#imported-this-month").innerText = stats.importedThisMonth || 0;
        getElement("#exported-this-month").innerText = stats.exportedThisMonth || 0;
        getElement("#low-stock-devices").innerText = stats.lowStockDevices || 0;
    }

    async function loadCharts() {
        if (!stockChartCanvas) return;
        const stats = await fetchData("statistics");
        if (!stats) return;
        const ctx = stockChartCanvas.getContext("2d");
        if (stockChartInstance) {
            stockChartInstance.destroy();
            stockChartInstance = null;
        }
        stockChartInstance = new Chart(ctx, {
            type: "bar",
            data: {
                labels: ["Tổng thiết bị", "Nhập tháng này", "Xuất tháng này", "Thiết bị ít tồn"],
                datasets: [{
                    label: "Thống kê kho",
                    data: [stats.totalDevices, stats.importedThisMonth, stats.exportedThisMonth, stats.lowStockDevices],
                    backgroundColor: ["#3498db", "#2ecc71", "#e74c3c", "#f1c40f"],
                }],
            },
            options: {
                responsive: true,
                scales: { y: { beginAtZero: true } },
            },
        });
    }

    let debounceTimeout;
    menuItems.forEach((item) => {
        item.addEventListener("click", function () {
            clearTimeout(debounceTimeout);
            debounceTimeout = setTimeout(() => {
                menuItems.forEach(i => i.classList.remove("active"));
                this.classList.add("active");
                const target = this.dataset.section;
                sections.forEach(section => section.classList.toggle("active", section.id === target));
                switch (target) {
                    case "devices": loadDevices(); break;
                    case "transactions": loadTransactions(); break;
                    case "payments": loadPayments(); break;
                    case "history": loadHistory(); break;
                    case "alerts": loadAlerts(); break;
                    case "dashboard": loadStatistics(); loadCharts(); break;
                }
            }, 300);
        });
    });

    async function loadAllData() {
        await Promise.all([
            loadDevices(),
            loadTransactions(),
            loadPayments(),
            loadHistory(),
            loadAlerts(),
            loadStatistics(),
            loadCharts(),
        ]);
    }

    loadAllData();

    // Hàm định dạng ngày tháng
    function formatDate(dateString) {
        const date = new Date(dateString);
        return `${date.getHours()}:${String(date.getMinutes()).padStart(2, '0')} ${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()}`;
    }

    // Hàm hiển thị modal thêm thanh toán mới
    window.showAddPaymentModal = function() {
        const modal = document.getElementById('payment-modal');
        const form = document.getElementById('payment-form');
        const title = document.getElementById('payment-modal-title');
        
        if (!modal || !form || !title) return;
        
        title.textContent = 'Thêm thanh toán mới';
        form.reset();
        form.dataset.mode = 'add';
        delete form.dataset.paymentId;
        
        modal.style.display = 'block';
    }

    // Hàm xử lý submit form thanh toán
    window.handlePaymentSubmit = async function(event) {
        event.preventDefault();
        
        const form = event.target;
        const mode = form.dataset.mode;
        const paymentId = form.dataset.paymentId;
        
        const formData = {
            customer: form.customer.value,
            amount: parseInt(form.amount.value),
            method: form.method.value,
            status: form.status.value,
            note: form.note.value,
            date: new Date().toISOString()
        };

        try {
            if (mode === 'add') {
                // Thêm mới
                formData.id = 'PAY' + Date.now();
                payments.push(formData);
            } else {
                // Cập nhật
                const index = payments.findIndex(p => p.id === paymentId);
                if (index === -1) throw new Error('Không tìm thấy thanh toán');
                payments[index] = { ...payments[index], ...formData };
            }
            
            // Đóng modal
            const modal = document.getElementById('payment-modal');
            if (modal) modal.style.display = 'none';
            
            // Tải lại danh sách
            await loadPayments();
            alert(mode === 'add' ? 'Thêm thanh toán thành công!' : 'Cập nhật thanh toán thành công!');
        } catch (error) {
            console.error('Lỗi:', error);
            alert('Có lỗi xảy ra khi lưu thanh toán!');
        }
    }

    // Hàm xem chi tiết thanh toán
    window.viewPayment = async function(id) {
        try {
            const payment = payments.find(p => p.id === id);
            if (!payment) {
                throw new Error('Không tìm thấy thanh toán');
            }
            
            // Hiển thị modal xem chi tiết
            const modal = document.getElementById('view-payment-modal');
            if (!modal) return;
            
            modal.innerHTML = `
                <div class="modal-content">
                    <h2>Chi tiết thanh toán</h2>
                    <div class="payment-details">
                        <p><strong>Mã GD:</strong> ${payment.id}</p>
                        <p><strong>Khách hàng:</strong> ${payment.customer}</p>
                        <p><strong>Số tiền:</strong> ${payment.amount.toLocaleString()} VND</p>
                        <p><strong>Thời gian:</strong> ${formatDate(payment.date)}</p>
                        <p><strong>Phương thức:</strong> ${payment.method}</p>
                        <p><strong>Trạng thái:</strong> ${payment.status}</p>
                        <p><strong>Ghi chú:</strong> ${payment.note || '-'}</p>
                    </div>
                    <button onclick="closeViewModal()" class="btn">Đóng</button>
                </div>
            `;
            
            modal.style.display = 'block';
        } catch (error) {
            console.error('Lỗi:', error);
            alert('Không thể tải thông tin thanh toán!');
        }
    }

    // Hàm sửa thanh toán
    window.editPayment = async function(id) {
        try {
            const payment = payments.find(p => p.id === id);
            if (!payment) {
                throw new Error('Không tìm thấy thanh toán');
            }
            
            // Hiển thị modal sửa
            const modal = document.getElementById('payment-modal');
            const form = document.getElementById('payment-form');
            const title = document.getElementById('payment-modal-title');
            
            if (!modal || !form || !title) return;
            
            title.textContent = 'Sửa thanh toán';
            form.dataset.mode = 'edit';
            form.dataset.paymentId = id;
            
            // Điền thông tin vào form
            form.customer.value = payment.customer;
            form.amount.value = payment.amount;
            form.method.value = payment.method;
            form.status.value = payment.status;
            form.note.value = payment.note || '';
            
            modal.style.display = 'block';
        } catch (error) {
            console.error('Lỗi:', error);
            alert('Không thể tải thông tin thanh toán!');
        }
    }

    // Hàm xóa thanh toán
    window.deletePayment = async function(id) {
        if (!confirm('Bạn có chắc muốn xóa thanh toán này?')) return;
        
        try {
            const index = payments.findIndex(p => p.id === id);
            if (index === -1) {
                throw new Error('Không tìm thấy thanh toán');
            }
            
            // Xóa thanh toán khỏi mảng
            payments.splice(index, 1);
            
            // Cập nhật UI
            await loadPayments();
            alert('Xóa thanh toán thành công!');
        } catch (error) {
            console.error('Lỗi:', error);
            alert('Có lỗi xảy ra khi xóa thanh toán!');
        }
    }

    // Hàm đóng modal xem chi tiết
    window.closeViewModal = function() {
        const modal = document.getElementById('view-payment-modal');
        if (modal) modal.style.display = 'none';
    }

    // Thêm dữ liệu mẫu
    payments.push({
        id: 'PAY001',
        customer: 'Công ty A',
        amount: 5000000,
        date: '2025-03-20T13:52:00',
        method: 'Chuyển khoản',
        status: 'completed',
        note: 'Thanh toán đơn hàng'
    });

    // Switch between import/export
    document.querySelectorAll('.transaction-type button').forEach(button => {
        button.addEventListener('click', () => {
            document.querySelector('.transaction-type button.active').classList.remove('active');
            button.classList.add('active');
            transactionType = button.dataset.type;
            updateSupplierLabel();
        });
    });

    // Update supplier/receiver label based on transaction type
    function updateSupplierLabel() {
        const label = document.querySelector('label[for="supplier"]');
        label.textContent = transactionType === 'import' ? 'Nhà cung cấp' : 'Người nhận';
    }

    // Add product to the list
    function addProduct() {
        const deviceSelect = document.getElementById('device-select');
        const quantity = document.getElementById('quantity');
        
        if (!deviceSelect.value || !quantity.value || quantity.value < 1) {
            alert('Vui lòng chọn thiết bị và nhập số lượng hợp lệ');
            return;
        }

        const device = deviceSelect.options[deviceSelect.selectedIndex];
        const product = {
            id: deviceSelect.value,
            name: device.text,
            quantity: parseInt(quantity.value),
            unit: 'Cái' // You can make this dynamic based on device type
        };

        // Check if product already exists
        const existingProduct = selectedProducts.find(p => p.id === product.id);
        if (existingProduct) {
            existingProduct.quantity += product.quantity;
            updateProductsList();
        } else {
            selectedProducts.push(product);
            updateProductsList();
        }

        // Reset inputs
        deviceSelect.value = '';
        quantity.value = '';
        updateTotalItems();
    }

    // Update the products table
    function updateProductsList() {
        const tbody = document.getElementById('selected-products-list');
        tbody.innerHTML = '';

        selectedProducts.forEach((product, index) => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${product.id}</td>
                <td>${product.name}</td>
                <td>${product.quantity}</td>
                <td>${product.unit}</td>
                <td>
                    <i class="fas fa-times remove-product" onclick="removeProduct(${index})"></i>
                </td>
            `;
            tbody.appendChild(tr);
        });
    }

    // Remove product from the list
    function removeProduct(index) {
        selectedProducts.splice(index, 1);
        updateProductsList();
        updateTotalItems();
    }

    // Update total items count
    function updateTotalItems() {
        const total = selectedProducts.reduce((sum, product) => sum + product.quantity, 0);
        document.getElementById('total-items').textContent = total;
    }

    // Handle transaction submission
    document.querySelector('.complete-transaction').addEventListener('click', async () => {
        const warehouse = document.getElementById('warehouse').value;
        const transactionDate = document.getElementById('transaction-date').value;
        const supplier = document.getElementById('supplier').value;
        const notes = document.getElementById('notes').value;

        if (!warehouse || !transactionDate || !supplier || selectedProducts.length === 0) {
            alert('Vui lòng điền đầy đủ thông tin và chọn ít nhất một sản phẩm');
            return;
        }

        const transaction = {
            type: transactionType,
            warehouse,
            date: transactionDate,
            supplier,
            notes,
            products: selectedProducts
        };

        try {
            const response = await fetch('/api/transactions', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(transaction)
            });

            if (response.ok) {
                alert('Giao dịch đã được lưu thành công!');
                resetForm();
            } else {
                throw new Error('Có lỗi xảy ra');
            }
        } catch (error) {
            alert('Không thể lưu giao dịch: ' + error.message);
        }
    });

    // Save transaction as draft
    document.querySelector('.save-draft').addEventListener('click', () => {
        const transaction = {
            type: transactionType,
            warehouse: document.getElementById('warehouse').value,
            date: document.getElementById('transaction-date').value,
            supplier: document.getElementById('supplier').value,
            notes: document.getElementById('notes').value,
            products: selectedProducts,
            status: 'draft'
        };

        // Save to localStorage
        const drafts = JSON.parse(localStorage.getItem('transactionDrafts') || '[]');
        drafts.push(transaction);
        localStorage.setItem('transactionDrafts', JSON.stringify(drafts));
        alert('Đã lưu nháp thành công!');
    });

    // Reset form
    function resetForm() {
        document.getElementById('warehouse').value = '';
        document.getElementById('transaction-date').value = '';
        document.getElementById('supplier').value = '';
        document.getElementById('notes').value = '';
        selectedProducts = [];
        updateProductsList();
        updateTotalItems();
    }

    // Navigation
    document.addEventListener('DOMContentLoaded', () => {
        // Get all menu items and sections
        const menuItems = document.querySelectorAll('.sidebar ul li');
        const sections = document.querySelectorAll('.section');

        // Show dashboard by default
        document.getElementById('dashboard').classList.add('active');
        menuItems[0].classList.add('active');

        // Add click event to menu items
        menuItems.forEach(item => {
            item.addEventListener('click', () => {
                // Remove active class from all menu items and sections
                menuItems.forEach(i => i.classList.remove('active'));
                sections.forEach(s => s.classList.remove('active'));

                // Add active class to clicked menu item
                item.classList.add('active');

                // Show corresponding section
                const sectionId = item.getAttribute('data-section');
                document.getElementById(sectionId).classList.add('active');
            });
        });
    });

    // Initialize alerts
    function initializeAlerts() {
        // Load alert settings from localStorage
        const savedSettings = localStorage.getItem('alertSettings');
        if (savedSettings) {
            alertSettings = JSON.parse(savedSettings);
            updateAlertSettingsForm();
        }

        // Add event listeners for alert filters
        document.querySelectorAll('.alert-type-filters .filter-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                document.querySelector('.alert-type-filters .filter-btn.active').classList.remove('active');
                btn.classList.add('active');
                filterAlerts();
            });
        });

        document.querySelectorAll('.alert-severity-filters .filter-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                document.querySelector('.alert-severity-filters .filter-btn.active').classList.remove('active');
                btn.classList.add('active');
                filterAlerts();
            });
        });

        // Initialize alert settings form
        const alertSettingsForm = document.getElementById('alert-settings-form');
        if (alertSettingsForm) {
            alertSettingsForm.addEventListener('submit', handleAlertSettingsSubmit);
        }

        // Start alert checking based on frequency
        startAlertChecking();
    }

    // Check for alerts based on current inventory
    function checkAlerts() {
        const devices = []; // This should be your actual devices data
        const transactions = []; // This should be your actual transactions data

        // Check for low stock
        devices.forEach(device => {
            if (device.quantity <= alertSettings.lowStockThreshold) {
                createAlert({
                    type: 'low-stock',
                    severity: device.quantity <= alertSettings.lowStockThreshold / 2 ? 'high' : 'medium',
                    title: `Sắp hết hàng: ${device.name}`,
                    message: `Số lượng tồn kho: ${device.quantity} (Dưới ngưỡng ${alertSettings.lowStockThreshold})`,
                    deviceId: device.id
                });
            }
        });

        // Check for large changes
        transactions.forEach(transaction => {
            const changePercent = (transaction.quantity / getDeviceTotalQuantity(transaction.deviceId)) * 100;
            if (changePercent >= alertSettings.largeChangeThreshold) {
                createAlert({
                    type: 'transaction',
                    severity: 'high',
                    title: `Thay đổi lớn: ${transaction.deviceName}`,
                    message: `Thay đổi ${changePercent.toFixed(1)}% trong một giao dịch`,
                    transactionId: transaction.id
                });
            }
        });

        // Update UI
        displayAlerts();
    }

    // Create new alert
    function createAlert(alertData) {
        const alert = {
            id: 'ALT' + Date.now(),
            timestamp: new Date().toISOString(),
            read: false,
            ...alertData
        };

        alerts.unshift(alert);
        notifyUser(alert);
    }

    // Display alerts in UI
    function displayAlerts() {
        const containers = {
            'low-stock': document.getElementById('low-stock-alerts'),
            'inventory': document.getElementById('inventory-alerts'),
            'transaction': document.getElementById('transaction-alerts'),
            'system': document.getElementById('system-alerts')
        };

        // Clear existing alerts
        Object.values(containers).forEach(container => {
            if (container) container.innerHTML = '';
        });

        // Group and display alerts
        const filteredAlerts = filterAlerts();
        filteredAlerts.forEach(alert => {
            const container = containers[alert.type];
            if (!container) return;

            const alertElement = createAlertElement(alert);
            container.appendChild(alertElement);
        });

        // Update unread count
        updateUnreadCount();
    }

    // Create alert element
    function createAlertElement(alert) {
        const div = document.createElement('div');
        div.className = `alert-item ${alert.read ? 'read' : 'unread'}`;
        div.innerHTML = `
            <div class="alert-icon ${alert.severity}">
                ${getAlertIcon(alert.type)}
            </div>
            <div class="alert-content">
                <div class="alert-header">
                    <div class="alert-title">${alert.title}</div>
                    <div class="alert-time">${formatAlertTime(alert.timestamp)}</div>
                </div>
                <div class="alert-message">${alert.message}</div>
                <div class="alert-actions">
                    <button class="btn" onclick="markAsRead('${alert.id}')">
                        <i class="fas fa-check"></i> Đánh dấu đã đọc
                    </button>
                    ${getAlertActions(alert)}
                </div>
            </div>
        `;
        return div;
    }

    // Get alert icon based on type
    function getAlertIcon(type) {
        const icons = {
            'low-stock': '<i class="fas fa-box"></i>',
            'inventory': '<i class="fas fa-clipboard-check"></i>',
            'transaction': '<i class="fas fa-exchange-alt"></i>',
            'system': '<i class="fas fa-cog"></i>'
        };
        return icons[type] || '<i class="fas fa-bell"></i>';
    }

    // Get additional actions based on alert type
    function getAlertActions(alert) {
        switch (alert.type) {
            case 'low-stock':
                return `
                    <button class="btn" onclick="viewDevice('${alert.deviceId}')">
                        <i class="fas fa-eye"></i> Xem thiết bị
                    </button>
                    <button class="btn primary-btn" onclick="createImportTransaction('${alert.deviceId}')">
                        <i class="fas fa-plus"></i> Tạo nhập kho
                    </button>
                `;
            case 'transaction':
                return `
                    <button class="btn" onclick="viewTransaction('${alert.transactionId}')">
                        <i class="fas fa-eye"></i> Xem giao dịch
                    </button>
                `;
            default:
                return '';
        }
    }

    // Filter alerts based on current filters
    function filterAlerts() {
        const typeFilter = document.querySelector('.alert-type-filters .filter-btn.active')?.dataset.type;
        const severityFilter = document.querySelector('.alert-severity-filters .filter-btn.active')?.dataset.severity;

        return alerts.filter(alert => {
            const matchesType = typeFilter === 'all' || alert.type === typeFilter;
            const matchesSeverity = severityFilter === 'all' || alert.severity === severityFilter;
            return matchesType && matchesSeverity;
        });
    }

    // Mark alert as read
    function markAsRead(alertId) {
        const alert = alerts.find(a => a.id === alertId);
        if (alert) {
            alert.read = true;
            displayAlerts();
        }
    }

    // Mark all alerts as read
    function markAllAsRead() {
        alerts.forEach(alert => alert.read = true);
        displayAlerts();
    }

    // Show alert settings modal
    function showAlertSettings() {
        const modal = document.getElementById('alert-settings-modal');
        if (modal) modal.style.display = 'block';
    }

    // Close alert settings modal
    function closeAlertSettings() {
        const modal = document.getElementById('alert-settings-modal');
        if (modal) modal.style.display = 'none';
    }

    // Handle alert settings form submission
    function handleAlertSettingsSubmit(event) {
        event.preventDefault();

        alertSettings = {
            lowStockThreshold: parseInt(document.getElementById('low-stock-threshold').value),
            largeChangeThreshold: parseInt(document.getElementById('large-change-threshold').value),
            notificationMethods: {
                system: document.querySelector('.notification-methods input[type="checkbox"]:nth-child(1)').checked,
                email: document.querySelector('.notification-methods input[type="checkbox"]:nth-child(2)').checked,
                sms: document.querySelector('.notification-methods input[type="checkbox"]:nth-child(3)').checked
            },
            checkFrequency: document.getElementById('check-frequency').value
        };

        // Save settings to localStorage
        localStorage.setItem('alertSettings', JSON.stringify(alertSettings));

        // Restart alert checking with new settings
        startAlertChecking();

        // Close modal
        closeAlertSettings();
        alert('Đã lưu cài đặt thông báo!');
    }

    // Update alert settings form with current values
    function updateAlertSettingsForm() {
        document.getElementById('low-stock-threshold').value = alertSettings.lowStockThreshold;
        document.getElementById('large-change-threshold').value = alertSettings.largeChangeThreshold;
        document.getElementById('check-frequency').value = alertSettings.checkFrequency;

        const checkboxes = document.querySelectorAll('.notification-methods input[type="checkbox"]');
        checkboxes[0].checked = alertSettings.notificationMethods.system;
        checkboxes[1].checked = alertSettings.notificationMethods.email;
        checkboxes[2].checked = alertSettings.notificationMethods.sms;
    }

    // Start alert checking based on frequency
    function startAlertChecking() {
        // Clear existing interval if any
        if (window.alertCheckInterval) {
            clearInterval(window.alertCheckInterval);
        }

        // Set up new checking interval
        switch (alertSettings.checkFrequency) {
            case 'realtime':
                // Check every minute for demo purposes
                window.alertCheckInterval = setInterval(checkAlerts, 60000);
                break;
            case 'hourly':
                window.alertCheckInterval = setInterval(checkAlerts, 3600000);
                break;
            case 'daily':
                window.alertCheckInterval = setInterval(checkAlerts, 86400000);
                break;
            case 'weekly':
                window.alertCheckInterval = setInterval(checkAlerts, 604800000);
                break;
        }

        // Initial check
        checkAlerts();
    }

    // Helper function to format alert time
    function formatAlertTime(timestamp) {
        const date = new Date(timestamp);
        const now = new Date();
        const diff = now - date;

        if (diff < 60000) return 'Vừa xong';
        if (diff < 3600000) return `${Math.floor(diff / 60000)} phút trước`;
        if (diff < 86400000) return `${Math.floor(diff / 3600000)} giờ trước`;
        return `${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()}`;
    }

    // Notify user based on settings
    function notifyUser(alert) {
        if (alertSettings.notificationMethods.system) {
            // Show browser notification
            if (Notification.permission === "granted") {
                new Notification(alert.title, {
                    body: alert.message,
                    icon: '/path/to/icon.png'
                });
            }
        }

        if (alertSettings.notificationMethods.email) {
            // Send email notification (implement your email service)
            sendEmailNotification(alert);
        }

        if (alertSettings.notificationMethods.sms) {
            // Send SMS notification (implement your SMS service)
            sendSMSNotification(alert);
        }
    }

    // Update unread count
    function updateUnreadCount() {
        const unreadCount = alerts.filter(alert => !alert.read).length;
        // Update UI with unread count (implement as needed)
    }

    // Initialize alerts when document is ready
    document.addEventListener('DOMContentLoaded', initializeAlerts);
});
