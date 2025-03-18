document.addEventListener("DOMContentLoaded", function () {
    showSection('dashboard'); // Mặc định hiển thị Dashboard
});

function showSection(sectionId) {
    // Ẩn tất cả các section
    document.querySelectorAll('.section').forEach(section => {
        section.classList.remove('active');
    });

    // Hiển thị section được chọn
    document.getElementById(sectionId).classList.add('active');
}

// Khi tải trang, đảm bảo phần "Dashboard" hiển thị mặc định
document.addEventListener("DOMContentLoaded", () => {
    showSection('dashboard');
});


// Gán vào window để có thể gọi từ HTML
window.showSection = showSection;