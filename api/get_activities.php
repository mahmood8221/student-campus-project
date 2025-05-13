<?php
require 'config.php';

header('Content-Type: application/json');

if (!$pdo) {
    echo json_encode(["error" => "Database connection failed."]);
    exit;
}


try {
    $stmt = $pdo->query("SELECT * FROM activities");
    $activities = $stmt->fetchAll(PDO::FETCH_ASSOC);
    echo json_encode($activities);
} catch (PDOException $e) {
    echo json_encode(['error' => $e->getMessage()]);
}
?>
