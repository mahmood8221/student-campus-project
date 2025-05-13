<?php
require 'config.php';

// Check if the request method is POST
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    // Get the input data
    $data = json_decode(file_get_contents("php://input"), true);

    $title = $data['title'] ?? '';
    $description = $data['description'] ?? '';
    $date = $data['date'] ?? '';
    $location = $data['location'] ?? '';
    $image = $data['image'] ?? '';

    // Validate the input
    if (empty($title) || empty($description) || empty($date) || empty($location)) {
        echo json_encode(['error' => 'All fields except image are required']);
        exit();
    }

    try {
        $stmt = $pdo->prepare("INSERT INTO activities (title, description, date, location, image) VALUES (?, ?, ?, ?, ?)");
        $stmt->execute([$title, $description, $date, $location, $image]);
        echo json_encode(['success' => 'Activity added successfully']);
    } catch (PDOException $e) {
        echo json_encode(['error' => $e->getMessage()]);
    }
} else {
    echo json_encode(['error' => 'Invalid request method']);
}
?>
