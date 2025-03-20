import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = "https://cmggklinznikcdvmdekb.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNtZ2drbGluem5pa2Nkdm1kZWtiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDI0NDIzMjYsImV4cCI6MjA1ODAxODMyNn0.7ltLcaQteDNT-qFYenwMc5alhIuPndVXXvg5fdZw5Io";

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

document.addEventListener("DOMContentLoaded", function () {
    showSection("dashboard"); // Mặc định hiển thị Dashboard
    setupMenu();
    setupEventListeners();
    fetchDevices(); // Lấy dữ liệu từ Supabase
});

// Hiển thị section tương ứng
function showSection(sectionId) {
    document.querySelectorAll(".section").forEach((section) => {
        section.style.display = "none";
    });
    let activeSection = document.getElementById(sectionId);
    if (activeSection) {
        activeSection.style.display = "block";
    }
}

window.showSection = showSection;

// Thiết lập menu sidebar
function setupMenu() {
    document.querySelectorAll("nav ul li a").forEach((item) => {
        item.addEventListener("click", function (event) {
            event.preventDefault();
            let targetSection = this.getAttribute("data-target");
            if (targetSection) {
                showSection(targetSection);
            }
        });
    });
}

// Lấy danh sách thiết bị từ Supabase
async function fetchDevices() {
    let { data, error } = await supabase.from("devices").select("*");

    if (error) {
        console.error("Lỗi khi lấy dữ liệu:", error.message);
        return;
    }

    displayDevices(data);
    updateInventoryStats(data);
}

// Hiển thị danh sách thiết bị
function displayDevices(devices) {
    const tableBody = document.getElementById("device-table-body");
    if (!tableBody) return;
    tableBody.innerHTML = ""; // Xóa dữ liệu cũ

    devices.forEach((device) => {
        let row = document.createElement("tr");
        row.innerHTML = `
            <td>${device.id}</td>
            <td>${device.name}</td>
            <td>${device.type}</td>
            <td>${device.quantity}</td>
            <td>${device.status}</td>
            <td>
                <button class="edit-btn" onclick="openEditForm('${device.id}', '${device.name}', '${device.type}', '${device.quantity}', '${device.status}')">✏️ Sửa</button>
                <button class="delete-btn" onclick="deleteDevice('${device.id}')">🗑️ Xóa</button>
            </td>
        `;
        tableBody.appendChild(row);
    });
}

// Mở form thêm thiết bị
function openAddForm() {
    document.getElementById("device-form").reset();
    document.getElementById("device-id").value = "";
    document.getElementById("device-modal").style.display = "block";
}

// Mở form sửa thiết bị
function openEditForm(id, name, type, quantity, status) {
    document.getElementById("device-id").value = id;
    document.getElementById("device-name").value = name;
    document.getElementById("device-type").value = type;
    document.getElementById("device-quantity").value = quantity;
    document.getElementById("device-status").value = status;
    document.getElementById("device-modal").style.display = "block";
}

// Lưu thiết bị (thêm mới hoặc chỉnh sửa)
async function saveDevice() {
    let id = document.getElementById("device-id").value;
    let name = document.getElementById("device-name").value.trim();
    let type = document.getElementById("device-type").value.trim();
    let quantity = Number(document.getElementById("device-quantity").value);
    let status = document.getElementById("device-status").value;

    if (!name || !type || isNaN(quantity) || quantity < 0 || !status) {
        alert("Vui lòng nhập thông tin hợp lệ!");
        return;
    }

    if (id) {
        // Cập nhật thiết bị
        let { error } = await supabase.from("devices").update({ name, type, quantity, status }).eq("id", id);
        if (error) {
            console.error("Lỗi khi cập nhật thiết bị:", error.message);
        } else {
            alert("Cập nhật thiết bị thành công!");
        }
    } else {
        // Thêm thiết bị mới
        let { error } = await supabase.from("devices").insert([{ name, type, quantity, status }]);
        if (error) {
            console.error("Lỗi khi thêm thiết bị:", error.message);
        } else {
            alert("Thêm thiết bị thành công!");
        }
    }

    document.getElementById("device-modal").style.display = "none";
    fetchDevices();
}

// Xóa thiết bị
async function deleteDevice(deviceId) {
    if (!confirm("Bạn có chắc chắn muốn xóa thiết bị này không?")) return;

    let { error } = await supabase.from("devices").delete().eq("id", deviceId);
    if (error) {
        console.error("Lỗi khi xóa thiết bị:", error.message);
    } else {
        alert("Xóa thiết bị thành công!");
        fetchDevices();
    }
}

// Cập nhật số liệu hàng tồn kho
function updateInventoryStats(devices) {
    let totalItemsEl = document.getElementById("totalItems");
    let inventoryEl = document.getElementById("inventory");
    let transactionsEl = document.getElementById("transactions");

    if (!totalItemsEl || !inventoryEl || !transactionsEl) return;

    let totalItems = devices.length;
    let inventory = devices.reduce((sum, item) => sum + item.quantity, 0);
    let transactions = Math.floor(Math.random() * 100);

    totalItemsEl.textContent = totalItems;
    inventoryEl.textContent = inventory;
    transactionsEl.textContent = transactions;
}

// Gán sự kiện cho nút "Thêm thiết bị"
document.getElementById("add-device-btn")?.addEventListener("click", openAddForm);
document.getElementById("save-device-btn")?.addEventListener("click", saveDevice);
