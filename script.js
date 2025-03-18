document.addEventListener("DOMContentLoaded", function () {
    showSection('dashboard'); // Mặc định hiển thị Dashboard

    // Thêm sự kiện click cho tất cả nút "Sửa"
    document.querySelectorAll(".edit-btn").forEach(button => {
        button.addEventListener("click", openEditForm);
    });
});

// Hàm hiển thị từng section
function showSection(sectionId) {
    document.querySelectorAll('.section').forEach(section => {
        section.classList.remove('active');
    });
    document.getElementById(sectionId).classList.add('active');
}

// Gán vào window để có thể gọi từ HTML
window.showSection = showSection;

let editingRow = null; // Biến lưu trữ hàng đang chỉnh sửa

// Mở form sửa khi nhấn "Sửa"
function openEditForm(event) {
    editingRow = event.target.closest("tr");

    if (!editingRow) return; // Kiểm tra nếu không tìm thấy hàng

    document.getElementById("edit-id").value = editingRow.cells[0].textContent;
    document.getElementById("edit-name").value = editingRow.cells[1].textContent;
    document.getElementById("edit-type").value = editingRow.cells[2].textContent;
    document.getElementById("edit-quantity").value = editingRow.cells[3].textContent;

    document.getElementById("edit-form").style.display = "block";
}

// Lưu thiết bị sau khi chỉnh sửa
function saveDevice() {
    if (!editingRow) return;

    editingRow.cells[1].textContent = document.getElementById("edit-name").value;
    editingRow.cells[2].textContent = document.getElementById("edit-type").value;
    editingRow.cells[3].textContent = document.getElementById("edit-quantity").value;

    document.getElementById("edit-form").style.display = "none";
}

// Hủy chỉnh sửa
function cancelEdit() {
    document.getElementById("edit-form").style.display = "none";
}

// Gán sự kiện cho nút lưu & hủy
document.getElementById("save-btn").addEventListener("click", saveDevice);
document.getElementById("cancel-btn").addEventListener("click", cancelEdit);
