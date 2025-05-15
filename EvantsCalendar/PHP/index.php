 
<!DOCTYPE html>
<html lang="en-US">
  <head>
    <title>PHP + MySQL</title>
    <meta charset="UTF-8">
  </head>
  <body>
<?php
  $host = "127.0.0.1";
  $user = getenv("db_user");
  $pass = getenv("db_pass");
  $db = getenv("db_name");

  $maxAttempts = 5;
  $attempt = 1;
  $connected = false;

  while (!$connected && $attempt <= $maxAttempts) {
    $conn = @new mysqli($host, $user, $pass, $db);
    if (!$conn->connect_error) {
      $connected = true;
      echo "<p>DATABASE connected successfully!</p>";
    } else {
      $attempt++;
      if ($attempt <= $maxAttempts) {
        sleep(2);
      }
    }
  }

  if (!$connected) {
    die("<p>Connection failed after $maxAttempts attempts: " . $conn->connect_error . "</p>");
  }

  $conn->close();
?>
  </body>
</html>
