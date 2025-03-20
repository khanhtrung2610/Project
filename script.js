document.addEventListener("DOMContentLoaded", function () {
    showSection('dashboard'); // Mặc định hiển thị Dashboard
    setupMenu();
    setupEventListeners();
    updateInventoryStats();
});

// Hiển thị section tương ứng
function showSection(sectionId) {
    document.querySelectorAll('.section').forEach(section => {
        section.style.display = 'none';
    });
    let activeSection = document.getElementById(sectionId);
    if (activeSection) {
        activeSection.style.display = 'block';
    }
}

window.showSection = showSection;

// Thiết lập menu sidebar
function setupMenu() {
    document.querySelectorAll("nav ul li a").forEach(item => {
        item.addEventListener("click", function (event) {
            event.preventDefault(); // Ngăn chuyển trang
            let targetSection = this.getAttribute("data-target"); // ✅ Sửa lỗi
            if (targetSection) {
                showSection(targetSection);
            }
        });
    });
}

// Gán sự kiện click cho các nút chỉnh sửa & xóa thiết bị
function setupEventListeners() {
    document.getElementById("add-device-btn")?.addEventListener("click", addDevice);

    document.addEventListener("click", function (event) {
        let row = event.target.closest("tr");
        if (!row) return;

        if (event.target.classList.contains("edit-btn")) {
            editDevice(row);
        } else if (event.target.classList.contains("delete-btn")) {
            deleteDevice(row);
        }
    });
}

// Chỉnh sửa thiết bị
function editDevice(row) {
    let cells = row.getElementsByTagName("td");
    if (cells.length < 4) return;

    let newName = prompt("Nhập tên thiết bị mới:", cells[1].textContent);
    let newType = prompt("Nhập loại thiết bị mới:", cells[2].textContent);
    let newQuantity = prompt("Nhập số lượng mới:", cells[3].textContent);

    if (newName !== null && newName.trim() !== "") cells[1].textContent = newName;
    if (newType !== null && newType.trim() !== "") cells[2].textContent = newType;
    if (newQuantity !== null && !isNaN(newQuantity) && Number(newQuantity) >= 0) {
        cells[3].textContent = newQuantity;
    }
}

// Xóa thiết bị
function deleteDevice(row) {
    if (confirm("Bạn có chắc chắn muốn xóa thiết bị này không?")) {
        row.remove();
    }
}

// Thêm thiết bị mới
function addDevice() {
    let id = prompt("Nhập ID thiết bị:").trim();
    let name = prompt("Nhập tên thiết bị:").trim();
    let type = prompt("Nhập loại thiết bị:").trim();
    let quantity = prompt("Nhập số lượng:").trim();

    if (!id || !name || !type || !quantity || isNaN(quantity) || Number(quantity) < 0) {
        alert("Vui lòng nhập đầy đủ thông tin hợp lệ!");
        return;
    }

    let tableBody = document.getElementById("device-table-body");
    if (!tableBody) return;

    let newRow = document.createElement("tr");
    newRow.innerHTML = `
        <td>${id}</td>
        <td>${name}</td>
        <td>${type}</td>
        <td>${quantity}</td>
        <td>
            <button class="edit-btn">✏️ Sửa</button>
            <button class="delete-btn">🗑️ Xóa</button>
        </td>
    `;
    tableBody.appendChild(newRow);
}

// Cập nhật số liệu hàng tồn kho
function updateInventoryStats() {
    let inventoryStats = {
        totalItems: 55,
        inventory: 50,       // ✅ Sửa ID
        transactions: 20      // ✅ Sửa ID
    };

    Object.keys(inventoryStats).forEach(key => {
        let element = document.getElementById(key);
        if (element) {
            element.textContent = inventoryStats[key];
        }
    });
}
