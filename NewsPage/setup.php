<?php
// Setup script to initialize the database and seed data

echo "<h1>News Application Setup</h1>";

// Step 1: Create database and tables
echo "<h2>Step 1: Creating database and tables</h2>";
include_once 'Database/create_database.php';

// Step 2: Seed the database with sample data
echo "<h2>Step 2: Adding sample data</h2>";
include_once 'Database/seed_data.php';

echo "<h2>Setup Complete!</h2>";
echo "<p>You can now access the news application at: <a href='NewsPage/News.html'>News Page</a></p>";
?>
