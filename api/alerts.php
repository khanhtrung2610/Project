<?php
require_once 'cors.php';
header('Content-Type: application/json');
require_once 'config.php';

// Lấy danh sách cảnh báo
if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    $sql = "SELECT a.*, d.name as device_name 
            FROM alerts a 
            JOIN devices d ON a.device_id = d.id 
            ORDER BY a.created_at DESC";
    $result = $conn->query($sql);
    
    $alerts = array();
    while($row = $result->fetch_assoc()) {
        $alerts[] = $row;
    }
    
    echo json_encode($alerts);
}

// Thêm cảnh báo mới
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $data = json_decode(file_get_contents('php://input'), true);
    
    $id = $data['id'];
    $device_id = $data['device_id'];
    $type = $data['type'];
    $message = $data['message'];
    $status = $data['status'];
    
    $sql = "INSERT INTO alerts (id, device_id, type, message, status) 
            VALUES (?, ?, ?, ?, ?)";
    
    $stmt = $conn->prepare($sql);
    $stmt->bind_param("sssss", $id, $device_id, $type, $message, $status);
    
    if ($stmt->execute()) {
        echo json_encode(array("message" => "Thêm cảnh báo thành công"));
    } else {
        echo json_encode(array("error" => "Lỗi: " . $stmt->error));
    }
    
    $stmt->close();
}

// Cập nhật cảnh báo
if ($_SERVER['REQUEST_METHOD'] === 'PUT') {
    $data = json_decode(file_get_contents('php://input'), true);
    
    $id = $data['id'];
    $device_id = $data['device_id'];
    $type = $data['type'];
    $message = $data['message'];
    $status = $data['status'];
    
    $sql = "UPDATE alerts SET device_id=?, type=?, message=?, status=? 
            WHERE id=?";
    
    $stmt = $conn->prepare($sql);
    $stmt->bind_param("sssss", $device_id, $type, $message, $status, $id);
    
    if ($stmt->execute()) {
        echo json_encode(array("message" => "Cập nhật cảnh báo thành công"));
    } else {
        echo json_encode(array("error" => "Lỗi: " . $stmt->error));
    }
    
    $stmt->close();
}

// Xóa cảnh báo
if ($_SERVER['REQUEST_METHOD'] === 'DELETE') {
    $id = $_GET['id'];
    
    $sql = "DELETE FROM alerts WHERE id=?";
    
    $stmt = $conn->prepare($sql);
    $stmt->bind_param("s", $id);
    
    if ($stmt->execute()) {
        echo json_encode(array("message" => "Xóa cảnh báo thành công"));
    } else {
        echo json_encode(array("error" => "Lỗi: " . $stmt->error));
    }
    
    $stmt->close();
}

// Đánh dấu cảnh báo đã đọc
if ($_SERVER['REQUEST_METHOD'] === 'PATCH') {
    $id = $_GET['id'];
    
    $sql = "UPDATE alerts SET status='read' WHERE id=?";
    
    $stmt = $conn->prepare($sql);
    $stmt->bind_param("s", $id);
    
    if ($stmt->execute()) {
        echo json_encode(array("message" => "Đã đánh dấu cảnh báo đã đọc"));
    } else {
        echo json_encode(array("error" => "Lỗi: " . $stmt->error));
    }
    
    $stmt->close();
}

$conn->close();
?> 