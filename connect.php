<?php
$host = "localhost";
$dbname = "gilla156_db";
$username = "gilla156_local";
$password = "KRFI1A&Z";

try {
    $pdo = new PDO("mysql:host=$host;dbname=$dbname", $username, $password);
    echo "Connected successfully";
} catch (PDOException $e) {
    echo "Connection failed: " . $e->getMessage();
}
?>
