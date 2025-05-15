<?php
// Include database connection
require_once '../Database/connection.php';

class CommentsAPI {
    private $db;
    
    public function __construct() {
        global $db;
        $this->db = $db;
    }
    
    // Get comments for a specific news article
    public function getCommentsByNewsId($news_id) {
        try {
            $query = "SELECT * FROM comments WHERE news_id = :news_id ORDER BY created_at DESC";
            $stmt = $this->db->prepare($query);
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
    public function createComment($news_id) {
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
            $checkStmt = $this->db->prepare($checkQuery);
            $checkStmt->bindParam(':id', $news_id, PDO::PARAM_INT);
            $checkStmt->execute();
            
            if (!$checkStmt->fetch()) {
                http_response_code(404);
                echo json_encode(['error' => 'News article not found']);
                return;
            }
            
            // Insert new comment
            $query = "INSERT INTO comments (news_id, user, text) VALUES (:news_id, :user, :text)";
            $stmt = $this->db->prepare($query);
            
            $stmt->bindParam(':news_id', $news_id, PDO::PARAM_INT);
            $stmt->bindParam(':user', $data['user'], PDO::PARAM_STR);
            $stmt->bindParam(':text', $data['text'], PDO::PARAM_STR);
            
            $stmt->execute();
            
            $newId = $this->db->lastInsertId();
            
            // Get the created comment
            $getQuery = "SELECT * FROM comments WHERE id = :id";
            $getStmt = $this->db->prepare($getQuery);
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
}
?>
