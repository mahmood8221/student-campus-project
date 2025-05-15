 
<?php
require_once 'db_connect.php';

if ($_SERVER["REQUEST_METHOD"] == "POST") {
    $title = $_POST['title'];
    $date = $_POST['date'];

    // Handle image upload
    $image_data = null;
    if(isset($_FILES['image']) && $_FILES['image']['size'] > 0) {
        $image_data = file_get_contents($_FILES['image']['tmp_name']);
    }

    // Validate date format
    $dateObj = DateTime::createFromFormat('Y-m-d', $date);
    if (!$dateObj || $dateObj->format('Y-m-d') !== $date) {
        echo json_encode(["success" => false, "error" => "Invalid date format. Please use YYYY-MM-DD format."]);
        exit;
    }

    $time = $_POST['time'];
    $location = $_POST['location'];
    $organizer = $_POST['organizer'];
    $description = $_POST['description'];
    $category = $_POST['category'];

    $sql = "INSERT INTO events (title, date, time, location, organizer, description, category, image_data) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)";

    $stmt = $conn->prepare($sql);
    $stmt->bind_param("ssssssss", $title, $date, $time, $location, $organizer, $description, $category, $image_data);

    if ($stmt->execute()) {
        echo json_encode(["success" => true]);
    } else {
        echo json_encode(["success" => false, "error" => $conn->error]);
    }

    $stmt->close();
}

if ($_SERVER["REQUEST_METHOD"] == "GET") {
    $page = isset($_GET['page']) ? (int)$_GET['page'] : 1;
    $eventsPerPage = 6;
    $offset = ($page - 1) * $eventsPerPage;

    // Get total count
    $countSql = "SELECT COUNT(*) as total FROM events";
    $countResult = $conn->query($countSql);
    $totalEvents = $countResult->fetch_assoc()['total'];
    $totalPages = ceil($totalEvents / $eventsPerPage);

    // Get paginated results
    $sql = "SELECT * FROM events ORDER BY date, time LIMIT ? OFFSET ?";
    $stmt = $conn->prepare($sql);
    $stmt->bind_param("ii", $eventsPerPage, $offset);
    $stmt->execute();
    $result = $stmt->get_result();

    $events = [];
    while($row = $result->fetch_assoc()) {
        if($row['image_data']) {
            $row['image_data'] = base64_encode($row['image_data']);
        }
        $events[] = $row;
    }

    echo json_encode([
        'events' => $events,
        'totalPages' => $totalPages,
        'currentPage' => $page
    ]);
}

$conn->close();
?>
