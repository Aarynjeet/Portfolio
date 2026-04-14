<?php

header("Content-Type: application/json");

$host = "localhost";
$dbname = "gilla156_db";
$username = "gilla156_local";
$password = "KRFI1A&Z";

if (!isset($_POST["min"]) || !isset($_POST["max"])) {
    echo json_encode(["error" => "Min and max required"]);
    exit();
}

$min = (int) $_POST["min"];
$max = (int) $_POST["max"];

if ($min > $max) {
    echo json_encode(["error" => "Minimum cannot be greater than maximum"]);
    exit();
}

try {
    $pdo = new PDO(
        "mysql:host=$host;dbname=$dbname;charset=utf8",
        $username,
        $password
    );

    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

    $sql = "SELECT Name, CountryCode, District, Population
            FROM City
            WHERE Population BETWEEN :min AND :max
            ORDER BY Population DESC";

    $stmt = $pdo->prepare($sql);

    $stmt->bindValue(":min", $min, PDO::PARAM_INT);
    $stmt->bindValue(":max", $max, PDO::PARAM_INT);

    $stmt->execute();

    $cities = $stmt->fetchAll(PDO::FETCH_ASSOC);

    echo json_encode($cities);

} catch (PDOException $e) {
    echo json_encode(["error" => "Database error"]);
}

?>