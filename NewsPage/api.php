<?php
// Direct API endpoint for the News application
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE');
header('Access-Control-Allow-Headers: Content-Type');

// Include database connection
require_once 'Database/connection.php';

// Handle preflight OPTIONS request
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

// Get the action from the query string
$action = isset($_GET['action']) ? $_GET['action'] : 'get_all_news';

// Handle different actions
switch ($action) {
    case 'get_all_news':
        getAllNews($db);
        break;
    case 'get_news':
        if (isset($_GET['id'])) {
            getNewsById($db, $_GET['id']);
        } else {
            http_response_code(400);
            echo json_encode(['error' => 'News ID is required']);
        }
        break;
    case 'create_news':
        createNews($db);
        break;
    case 'update_news':
        if (isset($_GET['id'])) {
            updateNews($db, $_GET['id']);
        } else {
            http_response_code(400);
            echo json_encode(['error' => 'News ID is required for update']);
        }
        break;
    case 'delete_news':
        if (isset($_GET['id'])) {
            deleteNews($db, $_GET['id']);
        } else {
            http_response_code(400);
            echo json_encode(['error' => 'News ID is required for deletion']);
        }
        break;
    case 'get_comments':
        if (isset($_GET['news_id'])) {
            getCommentsByNewsId($db, $_GET['news_id']);
        } else {
            http_response_code(400);
            echo json_encode(['error' => 'News ID is required for comments']);
        }
        break;
    case 'create_comment':
        if (isset($_GET['news_id'])) {
            createComment($db, $_GET['news_id']);
        } else {
            http_response_code(400);
            echo json_encode(['error' => 'News ID is required for creating a comment']);
        }
        break;
    default:
        http_response_code(404);
        echo json_encode(['error' => 'Unknown action']);
        break;
}

// Get all news articles
function getAllNews($db) {
    try {
        $query = "SELECT * FROM news ORDER BY created_at DESC";
        $stmt = $db->prepare($query);
        $stmt->execute();
        
        $news = $stmt->fetchAll(PDO::FETCH_ASSOC);
        
        // Format the response
        foreach ($news as &$article) {
            $article['id'] = (string)$article['id']; // Convert to string to match frontend expectations
            $article['views'] = (int)$article['views'];
            $article['date'] = $article['created_at']; // For compatibility with frontend
            $article['image'] = $article['image_url'] ?: 'https://placehold.co/600x400?text=News+Article';
        }
        
        http_response_code(200);
        echo json_encode($news);
    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode(['error' => 'Database error: ' . $e->getMessage()]);
    }
}

// Get a specific news article by ID
function getNewsById($db, $id) {
    try {
        // Update views count
        $update = "UPDATE news SET views = views + 1 WHERE id = :id";
        $updateStmt = $db->prepare($update);
        $updateStmt->bindParam(':id', $id, PDO::PARAM_INT);
        $updateStmt->execute();
        
        // Get the article
        $query = "SELECT * FROM news WHERE id = :id";
        $stmt = $db->prepare($query);
        $stmt->bindParam(':id', $id, PDO::PARAM_INT);
        $stmt->execute();
        
        $article = $stmt->fetch(PDO::FETCH_ASSOC);
        
        if ($article) {
            // Format the response
            $article['id'] = (string)$article['id']; // Convert to string to match frontend expectations
            $article['views'] = (int)$article['views'];
            $article['date'] = $article['created_at']; // For compatibility with frontend
            $article['image'] = $article['image_url'] ?: 'https://placehold.co/600x400?text=News+Article';
            $article['createdAt'] = $article['created_at']; // For compatibility with frontend
            
            http_response_code(200);
            echo json_encode($article);
        } else {
            http_response_code(404);
            echo json_encode(['error' => 'News article not found']);
        }
    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode(['error' => 'Database error: ' . $e->getMessage()]);
    }
}

// Create a new news article
function createNews($db) {
    try {
        // Get JSON data from request body
        $data = json_decode(file_get_contents('php://input'), true);
        
        if (!$data) {
            http_response_code(400);
            echo json_encode(['error' => 'Invalid JSON data']);
            return;
        }
        
        // Validate required fields
        if (empty($data['title']) || empty($data['content']) || empty($data['author']) || empty($data['category'])) {
            http_response_code(400);
            echo json_encode(['error' => 'Missing required fields']);
            return;
        }
        
        // Prepare image URL (if provided)
        $imageUrl = null;
        if (!empty($data['image'])) {
            $imageUrl = $data['image'];
        }
        
        // Insert new article
        $query = "INSERT INTO news (title, content, author, category, image_url) 
                  VALUES (:title, :content, :author, :category, :image_url)";
        $stmt = $db->prepare($query);
        
        $stmt->bindParam(':title', $data['title'], PDO::PARAM_STR);
        $stmt->bindParam(':content', $data['content'], PDO::PARAM_STR);
        $stmt->bindParam(':author', $data['author'], PDO::PARAM_STR);
        $stmt->bindParam(':category', $data['category'], PDO::PARAM_STR);
        $stmt->bindParam(':image_url', $imageUrl, PDO::PARAM_STR);
        
        $stmt->execute();
        
        $newId = $db->lastInsertId();
        
        // Return the created article
        getNewsById($db, $newId);
        
    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode(['error' => 'Database error: ' . $e->getMessage()]);
    }
}

// Update an existing news article
function updateNews($db, $id) {
    try {
        // Get JSON data from request body
        $data = json_decode(file_get_contents('php://input'), true);
        
        if (!$data) {
            http_response_code(400);
            echo json_encode(['error' => 'Invalid JSON data']);
            return;
        }
        
        // Check if article exists
        $checkQuery = "SELECT id FROM news WHERE id = :id";
        $checkStmt = $db->prepare($checkQuery);
        $checkStmt->bindParam(':id', $id, PDO::PARAM_INT);
        $checkStmt->execute();
        
        if (!$checkStmt->fetch()) {
            http_response_code(404);
            echo json_encode(['error' => 'News article not found']);
            return;
        }
        
        // Build update query dynamically based on provided fields
        $updateFields = [];
        $params = [':id' => $id];
        
        if (isset($data['title'])) {
            $updateFields[] = "title = :title";
            $params[':title'] = $data['title'];
        }
        
        if (isset($data['content'])) {
            $updateFields[] = "content = :content";
            $params[':content'] = $data['content'];
        }
        
        if (isset($data['author'])) {
            $updateFields[] = "author = :author";
            $params[':author'] = $data['author'];
        }
        
        if (isset($data['category'])) {
            $updateFields[] = "category = :category";
            $params[':category'] = $data['category'];
        }
        
        if (isset($data['image'])) {
            $updateFields[] = "image_url = :image_url";
            $params[':image_url'] = $data['image'];
        }
        
        if (empty($updateFields)) {
            http_response_code(400);
            echo json_encode(['error' => 'No fields to update']);
            return;
        }
        
        // Execute update query
        $query = "UPDATE news SET " . implode(', ', $updateFields) . " WHERE id = :id";
        $stmt = $db->prepare($query);
        
        foreach ($params as $key => $value) {
            $stmt->bindValue($key, $value);
        }
        
        $stmt->execute();
        
        // Return the updated article
        getNewsById($db, $id);
        
    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode(['error' => 'Database error: ' . $e->getMessage()]);
    }
}

// Delete a news article
function deleteNews($db, $id) {
    try {
        // Check if article exists
        $checkQuery = "SELECT id FROM news WHERE id = :id";
        $checkStmt = $db->prepare($checkQuery);
        $checkStmt->bindParam(':id', $id, PDO::PARAM_INT);
        $checkStmt->execute();
        
        if (!$checkStmt->fetch()) {
            http_response_code(404);
            echo json_encode(['error' => 'News article not found']);
            return;
        }
        
        // Delete the article
        $query = "DELETE FROM news WHERE id = :id";
        $stmt = $db->prepare($query);
        $stmt->bindParam(':id', $id, PDO::PARAM_INT);
        $stmt->execute();
        
        http_response_code(200);
        echo json_encode(['success' => true, 'message' => 'News article deleted successfully']);
        
    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode(['error' => 'Database error: ' . $e->getMessage()]);
    }
}

// Get comments for a specific news article
function getCommentsByNewsId($db, $news_id) {
    try {
        $query = "SELECT * FROM comments WHERE news_id = :news_id ORDER BY created_at DESC";
        $stmt = $db->prepare($query);
        $stmt->bindParam(':news_id', $news_id, PDO::PARAM_INT);
        $stmt->execute();
        
        $comments = $stmt->fetchAll(PDO::FETCH_ASSOC);
        
        // Format the response
        foreach ($comments as &$comment) {
            $comment['id'] = (string)$comment['id']; // Convert to string to match frontend expectations
        }
        
        http_response_code(200);
        echo json_encode($comments);
    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode(['error' => 'Database error: ' . $e->getMessage()]);
    }
}

// Create a new comment for a news article
function createComment($db, $news_id) {
    try {
        // Get JSON data from request body
        $data = json_decode(file_get_contents('php://input'), true);
        
        if (!$data) {
            http_response_code(400);
            echo json_encode(['error' => 'Invalid JSON data']);
            return;
        }
        
        // Validate required fields
        if (empty($data['user']) || empty($data['text'])) {
            http_response_code(400);
            echo json_encode(['error' => 'Missing required fields']);
            return;
        }
        
        // Check if the news article exists
        $checkQuery = "SELECT id FROM news WHERE id = :id";
        $checkStmt = $db->prepare($checkQuery);
        $checkStmt->bindParam(':id', $news_id, PDO::PARAM_INT);
        $checkStmt->execute();
        
        if (!$checkStmt->fetch()) {
            http_response_code(404);
            echo json_encode(['error' => 'News article not found']);
            return;
        }
        
        // Insert new comment
        $query = "INSERT INTO comments (news_id, user, text) VALUES (:news_id, :user, :text)";
        $stmt = $db->prepare($query);
        
        $stmt->bindParam(':news_id', $news_id, PDO::PARAM_INT);
        $stmt->bindParam(':user', $data['user'], PDO::PARAM_STR);
        $stmt->bindParam(':text', $data['text'], PDO::PARAM_STR);
        
        $stmt->execute();
        
        $newId = $db->lastInsertId();
        
        // Get the created comment
        $getQuery = "SELECT * FROM comments WHERE id = :id";
        $getStmt = $db->prepare($getQuery);
        $getStmt->bindParam(':id', $newId, PDO::PARAM_INT);
        $getStmt->execute();
        
        $comment = $getStmt->fetch(PDO::FETCH_ASSOC);
        $comment['id'] = (string)$comment['id']; // Convert to string to match frontend expectations
        
        http_response_code(201);
        echo json_encode($comment);
        
    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode(['error' => 'Database error: ' . $e->getMessage()]);
    }
}
?>
