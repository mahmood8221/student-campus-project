<?php
require 'config.php';

header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST");
header("Access-Control-Allow-Headers: Content-Type");

$response = [];
$uploadDir = "uploads/";

if (!is_dir($uploadDir)) {
    mkdir($uploadDir, 0777, true);
}

if ($_SERVER["REQUEST_METHOD"] === "POST") {
    $title = $_POST['title'];
    $description = $_POST['description'];
    $date = $_POST['date'];
    $location = $_POST['location'];
    $image = '';

    if (isset($_FILES['image'])) {
        $image = basename($_FILES['image']['name']);
        $targetPath = $uploadDir . $image;

        if (!move_uploaded_file($_FILES['image']['tmp_name'], $targetPath)) {
            $response["error"] = "Failed to upload image.";
            echo json_encode($response);
            exit;
        }
    }

    try {
        $stmt = $pdo->prepare("INSERT INTO club_activities (title, description, date, location, image) VALUES (?, ?, ?, ?, ?)");
        $stmt->execute([$title, $description, $date, $location, $image]);

        $response["success"] = true;
    } catch (PDOException $e) {
        $response["error"] = $e->getMessage();
    }
}

echo json_encode($response);
?>
