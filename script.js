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
        const payments = await fetchData("payments");
        if (!payments) return;
        paymentTable.innerHTML = payments.length
            ? payments.map(payment => `
                <tr>
                    <td>${payment.id}</td>
                    <td>${payment.customer}</td>
                    <td>${payment.amount.toLocaleString()} VND</td>
                    <td>${payment.date}</td>
                    <td>${payment.method}</td>
                    <td>${payment.status}</td>
                </tr>
            `).join("")
            : "<tr><td colspan='6'>Không có thanh toán nào</td></tr>";
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
});
