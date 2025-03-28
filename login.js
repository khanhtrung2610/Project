// Khởi tạo các biến
let currentUser = null;

// Danh sách người dùng mẫu (trong thực tế nên lưu trong database)
const users = [
    {
        username: 'admin',
        password: 'admin123', // Trong thực tế nên hash password
    }
];

// Xử lý form đăng nhập
document.getElementById('loginForm').addEventListener('submit', function(e) {
    e.preventDefault();
    
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    const remember = document.getElementById('remember').checked;
    
    // Kiểm tra thông tin đăng nhập
    const user = users.find(u => u.username === username && u.password === password);
    
    if (user) {
        currentUser = user;
        
        // Nếu chọn ghi nhớ đăng nhập
        if (remember) {
            localStorage.setItem('rememberedUser', JSON.stringify({
                username: username,
                remember: true
            }));
        } else {
            localStorage.removeItem('rememberedUser');
        }
        
        // Đăng nhập thành công
        loginSuccess();
    } else {
        showError('Tên đăng nhập hoặc mật khẩu không đúng');
    }
});

// Xử lý đăng nhập thành công
function loginSuccess() {
    // Lưu thông tin đăng nhập
    sessionStorage.setItem('isLoggedIn', 'true');
    sessionStorage.setItem('currentUser', JSON.stringify(currentUser));
    
    // Chuyển hướng đến trang chính
    window.location.href = 'index.html';
}

// Hiển thị thông báo lỗi
function showError(message) {
    const errorElement = document.getElementById('errorMessage');
    errorElement.textContent = message;
    errorElement.classList.add('show');
}

// Xử lý quên mật khẩu
function forgotPassword() {
    // Trong thực tế, gửi email đặt lại mật khẩu
    alert('Vui lòng liên hệ quản trị viên để đặt lại mật khẩu');
}

// Kiểm tra đăng nhập đã lưu
window.addEventListener('load', function() {
    const rememberedUser = localStorage.getItem('rememberedUser');
    if (rememberedUser) {
        const { username, remember } = JSON.parse(rememberedUser);
        if (remember) {
            document.getElementById('username').value = username;
            document.getElementById('remember').checked = true;
        }
    }
}); 