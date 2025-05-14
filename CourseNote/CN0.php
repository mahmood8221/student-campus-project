<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header('Content-Type: application/json');
/*
// Database configuration
$servername = "localhost";
$username = "root";
$password = "";
$dbname = "campus_hub";

// Create connection
$conn = new mysqli($servername, $username, $password, $dbname);

// Check connection
if ($conn->connect_error) {
    echo json_encode(["status" => "error", "message" => "Connection failed: " . $conn->connect_error]);
    exit();
}*/



$host = "";
$user = getenv("db_user");
$pass = getenv("db_pass");
$db = getenv("db_name");
$conn = new mysqli($host, $user, $pass, $db);
if ($conn->connect_error)
    die("Connection failed: " . $conn->connect_error);


// Create notes table if not exists
$sql = "CREATE TABLE IF NOT EXISTS notes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    course VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    file_path VARCHAR(255) DEFAULT NULL
)";
$conn->query($sql);

// Handling GET request to retrieve notes
if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    $result = $conn->query("SELECT * FROM notes ORDER BY id DESC");
    $notes = [];
    while ($row = $result->fetch_assoc()) {
    $note = [
        'title' => $row['title'],
        'course' => $row['course'],
        'content' => $row['content'],
    ];

    if (!empty($row['file_path'])) {
        $note['file'] = [
            'name' => basename($row['file_path']),
            'url' => $row['file_path']
        ];
    }

    $notes[] = $note;
}

    echo json_encode($notes);
    exit();
}

// Handling POST request to add a new note
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $title = $_POST['title'] ?? '';
    $course = $_POST['course'] ?? '';
    $content = $_POST['content'] ?? '';
    $file_path = null;

    // Validate input
    if (empty($title) || empty($course) || empty($content)) {
        echo json_encode(["status" => "error", "message" => "Please fill in all fields."]);
        exit();
    }

    // Handle file upload if present
    if (!empty($_FILES['file']['name'])) {
        $target_dir = "uploads/";
        $target_file = $target_dir . basename($_FILES['file']['name']);
        if (move_uploaded_file($_FILES['file']['tmp_name'], $target_file)) {
            $file_path = $target_file;
        } else {
            echo json_encode(["status" => "error", "message" => "File upload failed."]);
            exit();
        }
    }

    // Insert note into database
    
    $stmt = $conn->prepare("INSERT INTO notes (title, course, content, file_path) VALUES (?, ?, ?, ?)");
    $stmt->bind_param("ssss", $title, $course, $content, $file_path);
   if ($stmt->execute()) {
    echo json_encode(["status" => "success", "message" => "Note added successfully."]);
} else {
    echo json_encode(["status" => "error", "message" => "Failed to add note: " . $stmt->error]);

}

    $stmt->close();
    exit();
}

// Close connection
$conn->close();
echo json_encode(["status" => "error", "message" => "Invalid request."]);
?>
