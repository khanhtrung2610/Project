document.addEventListener("DOMContentLoaded", function () {
    showSection('dashboard'); // Mặc định hiển thị Dashboard
    setupMenu();
});

function showSection(sectionId) {
    document.querySelectorAll('.section').forEach(section => {
        section.classList.remove('active');
    });
    document.getElementById(sectionId).classList.add('active');
}
window.showSection = showSection;

function setupMenu() {
    document.querySelectorAll('.menu-item').forEach(item => {
        item.addEventListener('click', function () {
            let targetSection = this.getAttribute('data-target');
            showSection(targetSection);
        });
    });
}

// Thêm chức năng sửa thiết bị
function editDevice(event) {
    let row = event.target.closest("tr");
    let id = row.cells[0].textContent;
    let name = row.cells[1].textContent;
    let type = row.cells[2].textContent;
    let quantity = row.cells[3].textContent;
    
    let newName = prompt("Nhập tên thiết bị mới:", name);
    let newType = prompt("Nhập loại thiết bị mới:", type);
    let newQuantity = prompt("Nhập số lượng mới:", quantity);
    
    if (newName !== null) row.cells[1].textContent = newName;
    if (newType !== null) row.cells[2].textContent = newType;
    if (newQuantity !== null) row.cells[3].textContent = newQuantity;
}

// Thêm chức năng xóa thiết bị
function deleteDevice(event) {
    if (confirm("Bạn có chắc chắn muốn xóa thiết bị này không?")) {
        event.target.closest("tr").remove();
    }
}

// Thêm chức năng thêm thiết bị mới
function addDevice() {
    let id = prompt("Nhập ID thiết bị:");
    let name = prompt("Nhập tên thiết bị:");
    let type = prompt("Nhập loại thiết bị:");
    let quantity = prompt("Nhập số lượng:");

    if (id && name && type && quantity) {
        let tableBody = document.getElementById("device-table-body");
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
    } else {
        alert("Vui lòng nhập đầy đủ thông tin thiết bị!");
    }
}

// Gán sự kiện cho các nút
document.addEventListener("click", function (event) {
    if (event.target.classList.contains("edit-btn")) {
        editDevice(event);
    } else if (event.target.classList.contains("delete-btn")) {
        deleteDevice(event);
    }
});

// Gán sự kiện cho nút thêm thiết bị
document.getElementById("add-device-btn").addEventListener("click", addDevice);

// Cập nhật số liệu hàng hóa trong Dashboard
function updateInventoryStats() {
    document.getElementById("total-items").textContent = 55;
    document.getElementById("long-stock").textContent = 2;
    document.getElementById("out-of-stock").textContent = 38;
    document.getElementById("low-stock").textContent = 0;
    document.getElementById("damaged-items").textContent = 13;
}

document.addEventListener("DOMContentLoaded", updateInventoryStats);
