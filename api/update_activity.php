<?php
require 'config.php';
header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    echo json_encode(["error" => "Invalid request method"]);
    exit;
}

$data = json_decode(file_get_contents('php://input'), true);

if (!isset($data['id']) || !isset($data['title']) || !isset($data['description']) || !isset($data['date']) || !isset($data['location'])) {
    echo json_encode(["error" => "ID and all fields except image are required"]);
    exit;
}

$id = $data['id'];
$title = $data['title'];
$description = $data['description'];
$date = $data['date'];
$location = $data['location'];

try {
    $stmt = $pdo->prepare("UPDATE club_activities SET title = ?, description = ?, date = ?, location = ? WHERE id = ?");
    $stmt->execute([$title, $description, $date, $location, $id]);

    echo json_encode(["message" => "Activity updated successfully"]);
} catch (PDOException $e) {
    echo json_encode(["error" => $e->getMessage()]);
}
?>