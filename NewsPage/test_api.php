<?php
// Test script to check if the API is working correctly

echo "<h1>API Test</h1>";

// Test 1: Create database and tables
echo "<h2>Step 1: Creating database and tables</h2>";
include_once 'Database/create_database.php';

// Test 2: Get all news articles
echo "<h2>Test 2: Get all news articles</h2>";
$url = "http://localhost/News/api";
$response = file_get_contents($url);
echo "<pre>" . htmlspecialchars($response) . "</pre>";

// Test 3: Get a specific news article
echo "<h2>Test 3: Get a specific news article (ID=1)</h2>";
$url = "http://localhost/News/api?id=1";
$response = @file_get_contents($url);
if ($response === false) {
    echo "Error: Unable to fetch article with ID=1. Make sure you've seeded the database.";
} else {
    echo "<pre>" . htmlspecialchars($response) . "</pre>";
}

// Test 4: Get comments for a news article
echo "<h2>Test 4: Get comments for a news article (ID=1)</h2>";
$url = "http://localhost/News/api/news/1/comments";
$response = @file_get_contents($url);
if ($response === false) {
    echo "Error: Unable to fetch comments for article with ID=1.";
} else {
    echo "<pre>" . htmlspecialchars($response) . "</pre>";
}

echo "<h2>Test Complete</h2>";
echo "<p>If you see JSON data above, the API is working correctly.</p>";
echo "<p>You can now access the news application at: <a href='NewsPage/News.html'>News Page</a></p>";
echo "<p>If you don't see any data, make sure to run the <a href='setup.php'>setup script</a> first to seed the database.</p>";
?>
