<?php
require 'config.php';

header('Content-Type: application/json');

// Ensure the uploads directory exists
$uploads_dir = 'uploads';
if (!is_dir($uploads_dir)) {
    mkdir($uploads_dir, 0777, true);
}

// Check if the request method is POST
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    
    $title = $_POST['title'] ?? '';
    $description = $_POST['description'] ?? '';
    $date = $_POST['date'] ?? '';
    $location = $_POST['location'] ?? '';
    $imagePath = '';

    // Handle the image upload
    if (isset($_FILES['image']) && $_FILES['image']['error'] === UPLOAD_ERR_OK) {
        $imageName = basename($_FILES['image']['name']);
        $targetFilePath = $uploads_dir . '/' . $imageName;

        if (move_uploaded_file($_FILES['image']['tmp_name'], $targetFilePath)) {
            $imagePath = $targetFilePath;
        } else {
            echo json_encode(['error' => 'Image upload failed.']);
            exit();
        }
    }

    // Validate input
    if (empty($title) || empty($description) || empty($date) || empty($location)) {
        echo json_encode(['error' => 'All fields are required.']);
        exit();
    }

    try {
        $stmt = $pdo->prepare("INSERT INTO activities (title, description, date, location, image) VALUES (?, ?, ?, ?, ?)");
        $stmt->execute([$title, $description, $date, $location, $imagePath]);

        echo json_encode(['success' => 'Activity added successfully']);
    } catch (PDOException $e) {
        echo json_encode(['error' => $e->getMessage()]);
    }

} else {
    echo json_encode(['error' => 'Invalid request method']);
}
?>
