<?php
header('Content-Type: application/json');
require_once 'config.php';

// Lấy danh sách giao dịch
if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    $sql = "SELECT t.*, d.name as device_name 
            FROM transactions t 
            JOIN devices d ON t.device_id = d.id 
            ORDER BY t.created_at DESC";
    $result = $conn->query($sql);
    
    $transactions = array();
    while($row = $result->fetch_assoc()) {
        $transactions[] = $row;
    }
    
    echo json_encode($transactions);
}

// Thêm giao dịch mới
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $data = json_decode(file_get_contents('php://input'), true);
    
    $id = $data['id'];
    $type = $data['type'];
    $device_id = $data['device_id'];
    $quantity = $data['quantity'];
    $price = $data['price'];
    $total_amount = $data['total_amount'];
    $user = $data['user'];
    $note = $data['note'];
    
    // Bắt đầu transaction
    $conn->begin_transaction();
    
    try {
        // Thêm giao dịch
        $sql = "INSERT INTO transactions (id, type, device_id, quantity, price, total_amount, user, note) 
                VALUES (?, ?, ?, ?, ?, ?, ?, ?)";
        
        $stmt = $conn->prepare($sql);
        $stmt->bind_param("ssiidsss", $id, $type, $device_id, $quantity, $price, $total_amount, $user, $note);
        $stmt->execute();
        
        // Cập nhật số lượng thiết bị
        $update_quantity = $type === 'import' ? $quantity : -$quantity;
        $sql = "UPDATE devices SET quantity = quantity + ? WHERE id = ?";
        $stmt = $conn->prepare($sql);
        $stmt->bind_param("is", $update_quantity, $device_id);
        $stmt->execute();
        
        // Commit transaction
        $conn->commit();
        echo json_encode(array("message" => "Thêm giao dịch thành công"));
    } catch (Exception $e) {
        // Rollback nếu có lỗi
        $conn->rollback();
        echo json_encode(array("error" => "Lỗi: " . $e->getMessage()));
    }
    
    $stmt->close();
}

// Cập nhật giao dịch
if ($_SERVER['REQUEST_METHOD'] === 'PUT') {
    $data = json_decode(file_get_contents('php://input'), true);
    
    $id = $data['id'];
    $type = $data['type'];
    $device_id = $data['device_id'];
    $quantity = $data['quantity'];
    $price = $data['price'];
    $total_amount = $data['total_amount'];
    $user = $data['user'];
    $note = $data['note'];
    $status = $data['status'];
    
    $sql = "UPDATE transactions SET type=?, device_id=?, quantity=?, price=?, total_amount=?, user=?, note=?, status=? 
            WHERE id=?";
    
    $stmt = $conn->prepare($sql);
    $stmt->bind_param("ssiidsssss", $type, $device_id, $quantity, $price, $total_amount, $user, $note, $status, $id);
    
    if ($stmt->execute()) {
        echo json_encode(array("message" => "Cập nhật giao dịch thành công"));
    } else {
        echo json_encode(array("error" => "Lỗi: " . $stmt->error));
    }
    
    $stmt->close();
}

// Xóa giao dịch
if ($_SERVER['REQUEST_METHOD'] === 'DELETE') {
    $id = $_GET['id'];
    
    // Bắt đầu transaction
    $conn->begin_transaction();
    
    try {
        // Lấy thông tin giao dịch trước khi xóa
        $sql = "SELECT type, device_id, quantity FROM transactions WHERE id = ?";
        $stmt = $conn->prepare($sql);
        $stmt->bind_param("s", $id);
        $stmt->execute();
        $result = $stmt->get_result();
        $transaction = $result->fetch_assoc();
        
        // Xóa giao dịch
        $sql = "DELETE FROM transactions WHERE id = ?";
        $stmt = $conn->prepare($sql);
        $stmt->bind_param("s", $id);
        $stmt->execute();
        
        // Cập nhật lại số lượng thiết bị
        $update_quantity = $transaction['type'] === 'import' ? -$transaction['quantity'] : $transaction['quantity'];
        $sql = "UPDATE devices SET quantity = quantity + ? WHERE id = ?";
        $stmt = $conn->prepare($sql);
        $stmt->bind_param("is", $update_quantity, $transaction['device_id']);
        $stmt->execute();
        
        // Commit transaction
        $conn->commit();
        echo json_encode(array("message" => "Xóa giao dịch thành công"));
    } catch (Exception $e) {
        // Rollback nếu có lỗi
        $conn->rollback();
        echo json_encode(array("error" => "Lỗi: " . $e->getMessage()));
    }
    
    $stmt->close();
}

$conn->close();
?> 