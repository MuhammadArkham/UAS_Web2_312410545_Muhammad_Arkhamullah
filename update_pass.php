<?php
$hash = password_hash('Admin123!', PASSWORD_BCRYPT);
$mysqli = new mysqli("127.0.0.1", "root", "", "e_report");
$stmt = $mysqli->prepare("UPDATE users SET password = ? WHERE email = 'admin@ereport.com'");
$stmt->bind_param("s", $hash);
$stmt->execute();
echo "Updated password to: " . $hash . "\n";
