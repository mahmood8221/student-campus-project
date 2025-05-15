<?php
// Include database connection
require_once '../Database/connection.php';

class NewsAPI {
    private $db;
    
    public function __construct() {
        global $db;
        $this->db = $db;
    }
    
    // Get all news articles
    public function getAllNews() {
        try {
            $query = "SELECT * FROM news ORDER BY created_at DESC";
            $stmt = $this->db->prepare($query);
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
    public function getNewsById($id) {
        try {
            // Update views count
            $update = "UPDATE news SET views = views + 1 WHERE id = :id";
            $updateStmt = $this->db->prepare($update);
            $updateStmt->bindParam(':id', $id, PDO::PARAM_INT);
            $updateStmt->execute();
            
            // Get the article
            $query = "SELECT * FROM news WHERE id = :id";
            $stmt = $this->db->prepare($query);
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
    public function createNews() {
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
            $stmt = $this->db->prepare($query);
            
            $stmt->bindParam(':title', $data['title'], PDO::PARAM_STR);
            $stmt->bindParam(':content', $data['content'], PDO::PARAM_STR);
            $stmt->bindParam(':author', $data['author'], PDO::PARAM_STR);
            $stmt->bindParam(':category', $data['category'], PDO::PARAM_STR);
            $stmt->bindParam(':image_url', $imageUrl, PDO::PARAM_STR);
            
            $stmt->execute();
            
            $newId = $this->db->lastInsertId();
            
            // Return the created article
            $this->getNewsById($newId);
            
        } catch (PDOException $e) {
            http_response_code(500);
            echo json_encode(['error' => 'Database error: ' . $e->getMessage()]);
        }
    }
    
    // Update an existing news article
    public function updateNews($id) {
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
            $checkStmt = $this->db->prepare($checkQuery);
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
            $stmt = $this->db->prepare($query);
            
            foreach ($params as $key => $value) {
                $stmt->bindValue($key, $value);
            }
            
            $stmt->execute();
            
            // Return the updated article
            $this->getNewsById($id);
            
        } catch (PDOException $e) {
            http_response_code(500);
            echo json_encode(['error' => 'Database error: ' . $e->getMessage()]);
        }
    }
    
    // Delete a news article
    public function deleteNews($id) {
        try {
            // Check if article exists
            $checkQuery = "SELECT id FROM news WHERE id = :id";
            $checkStmt = $this->db->prepare($checkQuery);
            $checkStmt->bindParam(':id', $id, PDO::PARAM_INT);
            $checkStmt->execute();
            
            if (!$checkStmt->fetch()) {
                http_response_code(404);
                echo json_encode(['error' => 'News article not found']);
                return;
            }
            
            // Delete the article
            $query = "DELETE FROM news WHERE id = :id";
            $stmt = $this->db->prepare($query);
            $stmt->bindParam(':id', $id, PDO::PARAM_INT);
            $stmt->execute();
            
            http_response_code(200);
            echo json_encode(['success' => true, 'message' => 'News article deleted successfully']);
            
        } catch (PDOException $e) {
            http_response_code(500);
            echo json_encode(['error' => 'Database error: ' . $e->getMessage()]);
        }
    }
}
?>
