<?php
require_once 'cors.php';
header('Content-Type: application/json');
require_once 'config.php';

// Lấy danh sách thanh toán
if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    $sql = "SELECT p.*, t.type as transaction_type, t.total_amount, d.name as device_name 
            FROM payments p 
            JOIN transactions t ON p.transaction_id = t.id 
            JOIN devices d ON t.device_id = d.id 
            ORDER BY p.created_at DESC";
    $result = $conn->query($sql);
    
    $payments = array();
    while($row = $result->fetch_assoc()) {
        $payments[] = $row;
    }
    
    echo json_encode($payments);
}

// Thêm thanh toán mới
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $data = json_decode(file_get_contents('php://input'), true);
    
    $id = $data['id'];
    $transaction_id = $data['transaction_id'];
    $amount = $data['amount'];
    $payment_method = $data['payment_method'];
    $status = $data['status'];
    $note = $data['note'];
    
    $sql = "INSERT INTO payments (id, transaction_id, amount, payment_method, status, note) 
            VALUES (?, ?, ?, ?, ?, ?)";
    
    $stmt = $conn->prepare($sql);
    $stmt->bind_param("ssdsss", $id, $transaction_id, $amount, $payment_method, $status, $note);
    
    if ($stmt->execute()) {
        echo json_encode(array("message" => "Thêm thanh toán thành công"));
    } else {
        echo json_encode(array("error" => "Lỗi: " . $stmt->error));
    }
    
    $stmt->close();
}

// Cập nhật thanh toán
if ($_SERVER['REQUEST_METHOD'] === 'PUT') {
    $data = json_decode(file_get_contents('php://input'), true);
    
    $id = $data['id'];
    $transaction_id = $data['transaction_id'];
    $amount = $data['amount'];
    $payment_method = $data['payment_method'];
    $status = $data['status'];
    $note = $data['note'];
    
    $sql = "UPDATE payments SET transaction_id=?, amount=?, payment_method=?, status=?, note=? 
            WHERE id=?";
    
    $stmt = $conn->prepare($sql);
    $stmt->bind_param("sdssss", $transaction_id, $amount, $payment_method, $status, $note, $id);
    
    if ($stmt->execute()) {
        echo json_encode(array("message" => "Cập nhật thanh toán thành công"));
    } else {
        echo json_encode(array("error" => "Lỗi: " . $stmt->error));
    }
    
    $stmt->close();
}

// Xóa thanh toán
if ($_SERVER['REQUEST_METHOD'] === 'DELETE') {
    $id = $_GET['id'];
    
    $sql = "DELETE FROM payments WHERE id=?";
    
    $stmt = $conn->prepare($sql);
    $stmt->bind_param("s", $id);
    
    if ($stmt->execute()) {
        echo json_encode(array("message" => "Xóa thanh toán thành công"));
    } else {
        echo json_encode(array("error" => "Lỗi: " . $stmt->error));
    }
    
    $stmt->close();
}

$conn->close();
?> 