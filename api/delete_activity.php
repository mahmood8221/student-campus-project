<?php
require 'config.php';

// Check if the request method is DELETE
if ($_SERVER['REQUEST_METHOD'] === 'DELETE') {
    // Get the input data
    $data = json_decode(file_get_contents("php://input"), true);
    $id = $data['id'] ?? null;

    // Validate input
    if (!$id) {
        echo json_encode(['error' => 'ID is required']);
        exit();
    }

    try {
        $stmt = $pdo->prepare("DELETE FROM activities WHERE id = ?");
        $stmt->execute([$id]);

        if ($stmt->rowCount() > 0) {
            echo json_encode(['success' => 'Activity deleted successfully']);
        } else {
            echo json_encode(['error' => 'Activity not found']);
        }
    } catch (PDOException $e) {
        echo json_encode(['error' => $e->getMessage()]);
    }
} else {
    echo json_encode(['error' => 'Invalid request method']);
}
?>