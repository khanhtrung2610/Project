// Đảm bảo file là module
import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm";
import * as XLSX from "https://cdn.jsdelivr.net/npm/xlsx/xlsx.mjs";

// Cấu hình Supabase
const SUPABASE_URL = "https://cmggklinznikcdvmdekb.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...";

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

document.addEventListener("DOMContentLoaded", () => {
    setupMenu();
    fetchDevices();
    setupModalEvents();
    document.getElementById("export-excel-btn")?.addEventListener("click", exportToExcel);
});

// 🏷️ Thiết lập menu sidebar
function setupMenu() {
    document.querySelectorAll(".menu-item").forEach(item => {
        item.addEventListener("click", event => {
            event.preventDefault();
            showSection(item.getAttribute("data-target"));
        });
    });
}

// 🏷️ Hiển thị section tương ứng
function showSection(sectionId) {
    document.querySelectorAll(".section").forEach(section => section.style.display = "none");
    document.getElementById(sectionId)?.style.display = "block";
}

// 🏷️ Lấy danh sách thiết bị từ Supabase
async function fetchDevices() {
    try {
        const { data, error } = await supabase.from("devices").select("*");
        if (error) {
            alert("Lỗi khi lấy dữ liệu từ server. Vui lòng thử lại!");
            throw error;
        }
        displayDevices(data);
        updateInventoryStats(data);
    } catch (error) {
        console.error("Lỗi khi lấy dữ liệu:", error.message);
    }
}

// 🏷️ Hiển thị danh sách thiết bị
function displayDevices(devices) {
    const tableBody = document.getElementById("device-table-body");
    if (!tableBody) return;
    tableBody.innerHTML = devices.length === 0
        ? `<tr><td colspan="6" style="text-align:center;">Không có thiết bị nào</td></tr>`
        : devices.map(device => `
            <tr>
                <td>${device.id}</td>
                <td>${device.name}</td>
                <td>${device.type}</td>
                <td>${device.quantity}</td>
                <td>${device.status}</td>
                <td>
                    <button class="edit-btn" data-id="${device.id}">✏️ Sửa</button>
                    <button class="delete-btn" data-id="${device.id}">🗑️ Xóa</button>
                </td>
            </tr>`).join("");

    document.querySelectorAll(".edit-btn").forEach(btn => btn.addEventListener("click", openEditForm));
    document.querySelectorAll(".delete-btn").forEach(btn => btn.addEventListener("click", deleteDevice));
}

// 🏷️ Mở form nhập thiết bị (thêm/sửa)
function openForm(isEdit = false, device = {}) {
    document.getElementById("device-form").reset();
    document.getElementById("device-id").value = isEdit ? device.id : "";
    document.getElementById("device-name").value = device.name || "";
    document.getElementById("device-type").value = device.type || "";
    document.getElementById("device-quantity").value = device.quantity || "";
    document.getElementById("device-status").value = device.status || "available";
    document.getElementById("device-modal").style.display = "block";
}

// 🏷️ Mở form sửa thiết bị
function openEditForm(event) {
    const deviceId = event.target.dataset.id;
    const row = event.target.closest("tr").children;
    openForm(true, {
        id: deviceId,
        name: row[1].textContent,
        type: row[2].textContent,
        quantity: row[3].textContent,
        status: row[4].textContent
    });
}

// 🏷️ Lưu thiết bị (thêm mới hoặc cập nhật)
async function saveDevice() {
    const id = document.getElementById("device-id").value;
    const name = document.getElementById("device-name").value.trim();
    const type = document.getElementById("device-type").value.trim();
    const quantity = Number(document.getElementById("device-quantity").value);
    const status = document.getElementById("device-status").value;

    if (!name || !type || isNaN(quantity) || quantity < 0 || !status) {
        alert("Vui lòng nhập thông tin hợp lệ!");
        return;
    }

    try {
        let error;
        if (id) {
            ({ error } = await supabase.from("devices").update({ name, type, quantity, status }).eq("id", id));
        } else {
            ({ error } = await supabase.from("devices").insert([{ name, type, quantity, status }] ));
        }
        if (error) throw error;

        alert(id ? "Cập nhật thiết bị thành công!" : "Thêm thiết bị thành công!");
        closeModal();
        fetchDevices();
    } catch (error) {
        console.error("Lỗi khi lưu thiết bị:", error.message);
    }
}

// 🏷️ Xóa thiết bị
async function deleteDevice(event) {
    const deviceId = event.target.dataset.id;
    if (!confirm("Bạn có chắc chắn muốn xóa thiết bị này không?")) return;

    try {
        const { error } = await supabase.from("devices").delete().eq("id", deviceId);
        if (error) throw error;
        alert("Xóa thiết bị thành công!");
        fetchDevices();
    } catch (error) {
        console.error("Lỗi khi xóa thiết bị:", error.message);
    }
}

// 🏷️ Cập nhật số liệu hàng tồn kho
function updateInventoryStats(devices) {
    document.getElementById("totalItems").textContent = devices.length;
    document.getElementById("inventory").textContent = devices.reduce((sum, item) => sum + item.quantity, 0);
    document.getElementById("transactions").textContent = Math.floor(Math.random() * 100);
}

// 🏷️ Xuất dữ liệu ra Excel
function exportToExcel() {
    supabase.from("devices").select("*").then(({ data, error }) => {
        if (error) {
            alert("Lỗi khi lấy dữ liệu để xuất file Excel!");
            return;
        }

        const worksheet = XLSX.utils.json_to_sheet(data);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Devices");

        XLSX.writeFile(workbook, "danh_sach_thiet_bi.xlsx");
        alert("Xuất file Excel thành công!");
    });
}

// 🏷️ Đóng modal
function closeModal() {
    document.getElementById("device-modal").style.display = "none";
}

// 🏷️ Cài đặt sự kiện modal
function setupModalEvents() {
    document.getElementById("device-modal").addEventListener("click", (e) => {
        if (e.target.classList.contains("modal")) closeModal();
    });

    document.getElementById("add-device-btn")?.addEventListener("click", () => openForm());
    document.getElementById("save-device-btn")?.addEventListener("click", saveDevice);
    document.getElementById("close-modal-btn")?.addEventListener("click", closeModal);
}
