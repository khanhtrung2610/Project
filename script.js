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
});
