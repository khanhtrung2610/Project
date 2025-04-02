<?php
require_once 'cors.php';
header('Content-Type: application/json');
require_once 'config.php';

// Lấy danh sách thiết bị
if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    $sql = "SELECT * FROM devices";
    $result = $conn->query($sql);
    
    $devices = array();
    while($row = $result->fetch_assoc()) {
        $devices[] = $row;
    }
    
    echo json_encode($devices);
}

// Thêm thiết bị mới
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $data = json_decode(file_get_contents('php://input'), true);
    
    $id = $data['id'];
    $name = $data['name'];
    $category = $data['category'];
    $quantity = $data['quantity'];
    $price = $data['price'];
    $threshold = $data['threshold'];
    $description = $data['description'];
    
    $sql = "INSERT INTO devices (id, name, category, quantity, price, threshold, description) 
            VALUES (?, ?, ?, ?, ?, ?, ?)";
    
    $stmt = $conn->prepare($sql);
    $stmt->bind_param("ssiidss", $id, $name, $category, $quantity, $price, $threshold, $description);
    
    if ($stmt->execute()) {
        echo json_encode(array("message" => "Thêm thiết bị thành công"));
    } else {
        echo json_encode(array("error" => "Lỗi: " . $stmt->error));
    }
    
    $stmt->close();
}

// Cập nhật thiết bị
if ($_SERVER['REQUEST_METHOD'] === 'PUT') {
    $data = json_decode(file_get_contents('php://input'), true);
    
    $id = $data['id'];
    $name = $data['name'];
    $category = $data['category'];
    $quantity = $data['quantity'];
    $price = $data['price'];
    $threshold = $data['threshold'];
    $description = $data['description'];
    
    $sql = "UPDATE devices SET name=?, category=?, quantity=?, price=?, threshold=?, description=? 
            WHERE id=?";
    
    $stmt = $conn->prepare($sql);
    $stmt->bind_param("ssiidsss", $name, $category, $quantity, $price, $threshold, $description, $id);
    
    if ($stmt->execute()) {
        echo json_encode(array("message" => "Cập nhật thiết bị thành công"));
    } else {
        echo json_encode(array("error" => "Lỗi: " . $stmt->error));
    }
    
    $stmt->close();
}

// Xóa thiết bị
if ($_SERVER['REQUEST_METHOD'] === 'DELETE') {
    $id = $_GET['id'];
    
    $sql = "DELETE FROM devices WHERE id=?";
    
    $stmt = $conn->prepare($sql);
    $stmt->bind_param("s", $id);
    
    if ($stmt->execute()) {
        echo json_encode(array("message" => "Xóa thiết bị thành công"));
    } else {
        echo json_encode(array("error" => "Lỗi: " . $stmt->error));
    }
    
    $stmt->close();
}

$conn->close();
?> 