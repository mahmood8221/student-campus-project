<?php
// API Router - Simplified version
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE');
header('Access-Control-Allow-Headers: Content-Type');

// Handle preflight OPTIONS request
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

// Parse request URI to determine the endpoint
$request_uri = $_SERVER['REQUEST_URI'];
$path = parse_url($request_uri, PHP_URL_PATH);

// Check if this is a comments request
// Pattern: /News/api/news/ID/comments
if (preg_match('#/News/api/news/([0-9]+)/comments#', $path, $matches)) {
    $news_id = $matches[1];
    
    require_once 'comments.php';
    $comments_api = new CommentsAPI();
    
    if ($_SERVER['REQUEST_METHOD'] === 'GET') {
        $comments_api->getCommentsByNewsId($news_id);
    } elseif ($_SERVER['REQUEST_METHOD'] === 'POST') {
        $comments_api->createComment($news_id);
    } else {
        http_response_code(405);
        echo json_encode(['error' => 'Method not allowed for comments']);
    }
} 
// Regular news endpoints
else {
    require_once 'news.php';
    $news_api = new NewsAPI();
    
    if ($_SERVER['REQUEST_METHOD'] === 'GET') {
        if (isset($_GET['id'])) {
            $news_api->getNewsById($_GET['id']);
        } else {
            $news_api->getAllNews();
        }
    } elseif ($_SERVER['REQUEST_METHOD'] === 'POST') {
        $news_api->createNews();
    } elseif ($_SERVER['REQUEST_METHOD'] === 'PUT') {
        if (isset($_GET['id'])) {
            $news_api->updateNews($_GET['id']);
        } else {
            http_response_code(400);
            echo json_encode(['error' => 'News ID is required for update']);
        }
    } elseif ($_SERVER['REQUEST_METHOD'] === 'DELETE') {
        if (isset($_GET['id'])) {
            $news_api->deleteNews($_GET['id']);
        } else {
            http_response_code(400);
            echo json_encode(['error' => 'News ID is required for deletion']);
        }
    } else {
        http_response_code(405);
        echo json_encode(['error' => 'Method not allowed for news']);
    }
}

?>
