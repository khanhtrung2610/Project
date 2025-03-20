document.addEventListener("DOMContentLoaded", function () {
    showSection('dashboard'); // Mặc định hiển thị Dashboard
    setupMenu();
    setupEventListeners();
    updateInventoryStats();
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

function setupEventListeners() {
    document.getElementById("add-device-btn").addEventListener("click", addDevice);
    document.addEventListener("click", function (event) {
        if (event.target.classList.contains("edit-btn")) {
            editDevice(event);
        } else if (event.target.classList.contains("delete-btn")) {
            deleteDevice(event);
        }
    });
}

function editDevice(event) {
    let row = event.target.closest("tr");
    let cells = row.getElementsByTagName("td");

    let newName = prompt("Nhập tên thiết bị mới:", cells[1].textContent);
    let newType = prompt("Nhập loại thiết bị mới:", cells[2].textContent);
    let newQuantity = prompt("Nhập số lượng mới:", cells[3].textContent);

    if (newName) cells[1].textContent = newName;
    if (newType) cells[2].textContent = newType;
    if (newQuantity) cells[3].textContent = newQuantity;
}

function deleteDevice(event) {
    if (confirm("Bạn có chắc chắn muốn xóa thiết bị này không?")) {
        event.target.closest("tr").remove();
    }
}

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

function updateInventoryStats() {
    let inventoryStats = {
        totalItems: 55,
        longStock: 2,
        outOfStock: 38,
        lowStock: 0,
        damagedItems: 13
    };

    for (let key in inventoryStats) {
        document.getElementById(key).textContent = inventoryStats[key];
    }
}
