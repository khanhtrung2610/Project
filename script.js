document.addEventListener("DOMContentLoaded", function () {
    showSection('dashboard'); // Mặc định hiển thị Dashboard
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

// Biến lưu trữ hàng đang chỉnh sửa
let editingRow = null;

// Xử lý sự kiện khi nhấn nút "Sửa"
document.addEventListener("click", function (event) {
    if (event.target.classList.contains("edit-btn")) {
        editingRow = event.target.closest("tr");
        let id = editingRow.cells[0].textContent;
        let name = editingRow.cells[1].textContent;
        let type = editingRow.cells[2].textContent;
        let quantity = editingRow.cells[3].textContent;
        
        document.getElementById("edit-id").value = id;
        document.getElementById("edit-name").value = name;
        document.getElementById("edit-type").value = type;
        document.getElementById("edit-quantity").value = quantity;

        document.getElementById("edit-form").style.display = "block";
    }
});

// Hàm lưu thiết bị sau khi chỉnh sửa
function saveDevice() {
    if (editingRow) {
        editingRow.cells[1].textContent = document.getElementById("edit-name").value;
        editingRow.cells[2].textContent = document.getElementById("edit-type").value;
        editingRow.cells[3].textContent = document.getElementById("edit-quantity").value;
    }

    document.getElementById("edit-form").style.display = "none";
}

// Hàm hủy chỉnh sửa
function cancelEdit() {
    document.getElementById("edit-form").style.display = "none";
}
