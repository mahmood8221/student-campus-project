<?php
// Include database connection
require_once 'connection.php';

try {
    // Check if there are already news articles in the database
    $checkQuery = "SELECT COUNT(*) as count FROM news";
    $checkStmt = $db->prepare($checkQuery);
    $checkStmt->execute();
    $result = $checkStmt->fetch(PDO::FETCH_ASSOC);
    
    // Only seed data if the table is empty
    if ($result['count'] == 0) {
        // Sample news articles
        $newsArticles = [
            [
                'title' => 'Campus Event: Tech Fair 2025',
                'content' => 'Join us for the annual Tech Fair showcasing student innovations. This year\'s event will feature projects from computer science, engineering, and design students. Industry representatives will be present to offer feedback and potential internship opportunities. The fair will be held in the Student Union Building from 10 AM to 4 PM on May 20th, 2025. Refreshments will be provided.',
                'author' => 'Admin',
                'category' => 'events',
                'image_url' => 'https://placehold.co/600x400?text=Tech+Fair+2025',
                'views' => 150
            ],
            [
                'title' => 'New Student Club Launched',
                'content' => 'The Entrepreneurship Club is now accepting new members. This club aims to connect students interested in startups and business innovation. Weekly meetings will include guest speakers, workshops, and networking opportunities. Students from all majors are welcome to join. The first meeting will be held next Tuesday at 6 PM in Room 302 of the Business Building.',
                'author' => 'Jane Doe',
                'category' => 'clubs',
                'image_url' => 'https://placehold.co/600x400?text=New+Club',
                'views' => 98
            ],
            [
                'title' => 'Library Extends Hours During Finals Week',
                'content' => 'The university library will be extending its hours during finals week to accommodate student study needs. From May 25th to June 5th, the library will be open 24 hours a day. Additional study spaces will be set up on the second and third floors. Free coffee and snacks will be available from 10 PM to 2 AM each night, courtesy of the Student Government Association.',
                'author' => 'Library Staff',
                'category' => 'announcements',
                'image_url' => 'https://placehold.co/600x400?text=Library+Hours',
                'views' => 215
            ],
            [
                'title' => 'Computer Science Department Hosts Hackathon',
                'content' => 'The Computer Science Department is hosting its first-ever 48-hour hackathon next month. Students will work in teams to develop innovative solutions to real-world problems. Prizes include scholarships, tech gadgets, and internship opportunities with leading tech companies. Registration is open to all students regardless of major or programming experience. Mentors will be available to assist teams throughout the event.',
                'author' => 'CS Department',
                'category' => 'events',
                'image_url' => 'https://placehold.co/600x400?text=Hackathon',
                'views' => 178
            ],
            [
                'title' => 'Student Government Election Results Announced',
                'content' => 'The results of this year\'s Student Government Association elections have been finalized. Sarah Johnson has been elected as President, with Michael Chen as Vice President. The new administration has promised to focus on improving campus sustainability initiatives, expanding mental health resources, and increasing funding for student organizations. The inauguration ceremony will take place next Friday at 3 PM in the Main Auditorium.',
                'author' => 'Election Committee',
                'category' => 'announcements',
                'image_url' => 'https://placehold.co/600x400?text=Election+Results',
                'views' => 302
            ],
            [
                'title' => 'Drama Club Presents "A Midsummer Night\'s Dream"',
                'content' => 'The university Drama Club will be performing Shakespeare\'s "A Midsummer Night\'s Dream" next weekend. Shows will run Friday through Sunday at 7 PM in the Campus Theater. This modern adaptation sets the classic play in 1980s New York City with an original soundtrack composed by music students. Tickets are $5 for students and $10 for the general public, available at the box office or online.',
                'author' => 'Drama Club',
                'category' => 'clubs',
                'image_url' => 'https://placehold.co/600x400?text=Drama+Club',
                'views' => 87
            ]
        ];
        
        // Insert sample news articles
        $insertQuery = "INSERT INTO news (title, content, author, category, image_url, views) VALUES (:title, :content, :author, :category, :image_url, :views)";
        $insertStmt = $db->prepare($insertQuery);
        
        foreach ($newsArticles as $article) {
            $insertStmt->bindParam(':title', $article['title']);
            $insertStmt->bindParam(':content', $article['content']);
            $insertStmt->bindParam(':author', $article['author']);
            $insertStmt->bindParam(':category', $article['category']);
            $insertStmt->bindParam(':image_url', $article['image_url']);
            $insertStmt->bindParam(':views', $article['views']);
            $insertStmt->execute();
            
            // Get the last inserted ID to add comments
            $newsId = $db->lastInsertId();
            
            // Add some sample comments for each article
            $commentQuery = "INSERT INTO comments (news_id, user, text) VALUES (:news_id, :user, :text)";
            $commentStmt = $db->prepare($commentQuery);
            
            // Add 2-3 comments per article
            $numComments = rand(2, 3);
            $users = ['Student123', 'FacultyMember', 'AlumniUser', 'CampusVisitor', 'GradStudent'];
            $commentTexts = [
                'Great article! Thanks for sharing this information.',
                'I\'m looking forward to this event. Will there be any virtual attendance options?',
                'This is really helpful. Could you provide more details about the schedule?',
                'I participated last year and it was an amazing experience. Highly recommend!',
                'How can we get involved with organizing this next time?',
                'Thanks for keeping us updated on campus activities.',
                'This is exactly what our campus needed!'
            ];
            
            for ($i = 0; $i < $numComments; $i++) {
                $user = $users[array_rand($users)];
                $text = $commentTexts[array_rand($commentTexts)];
                
                $commentStmt->bindParam(':news_id', $newsId);
                $commentStmt->bindParam(':user', $user);
                $commentStmt->bindParam(':text', $text);
                $commentStmt->execute();
            }
        }
        
        echo "Sample data added successfully!";
    } else {
        echo "Database already contains news articles. Skipping seed data.";
    }
    
} catch (PDOException $e) {
    echo "Error: " . $e->getMessage();
}
?>
