<?php
// Allow from any origin
if (isset($_SERVER['HTTP_ORIGIN'])) {
    header("Access-Control-Allow-Origin: {$_SERVER['HTTP_ORIGIN']}");
}

// Allow credentials
header('Access-Control-Allow-Credentials: true');

// Allow methods
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');

// Allow headers
header('Access-Control-Allow-Headers: Content-Type, Authorization');

// Handle preflight requests
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}
?> 