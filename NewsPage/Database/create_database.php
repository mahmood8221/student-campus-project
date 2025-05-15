<?php

try {
    // Connect to MySQL server
    $db = new PDO('mysql:host=localhost;charset=utf8', 'root', '');
    $db->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

    // Create database
    $db->exec("CREATE DATABASE IF NOT EXISTS my_datbase_cs333");

    // Connect to the newly created database
    $db->exec("USE my_datbase_cs333");

    // SQL statements to create tables
    $sql = "
    CREATE TABLE IF NOT EXISTS news (
        id INT AUTO_INCREMENT PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        content TEXT NOT NULL,
        author VARCHAR(100) NOT NULL,
        category VARCHAR(50) NOT NULL,
        image_url TEXT,
        views INT DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS comments (
        id INT AUTO_INCREMENT PRIMARY KEY,
        news_id INT NOT NULL,
        user VARCHAR(100) NOT NULL,
        text TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (news_id) REFERENCES news(id) ON DELETE CASCADE
    );
    ";

    // Execute the SQL
    $db->exec($sql);
    $db = null; // Close the connection
    
    echo "Database and tables created successfully!";
} catch (PDOException $ex) {
    echo "Error occurred! " . $ex->getMessage();
    exit;
}
?>