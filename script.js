document.addEventListener("DOMContentLoaded", function () {
    showSection('dashboard'); // Mặc định hiển thị Dashboard
});

function showSection(sectionId) {
    document.querySelectorAll('.section').forEach(section => {
        section.classList.remove('active');
    });
    document.getElementById(sectionId).classList.add('active');
}

// Gán vào window để có thể gọi từ HTML
window.showSection = showSection;