<?php
session_start();

if (!isset($_SESSION["secret"])) {
    header("Location: index.php");
    exit;
}

if ($_SERVER["REQUEST_METHOD"] === "POST") {
    $_SESSION["guess"] = $_POST["guess"];
    header("Location: result.php");
    exit;
}
?>

<!DOCTYPE html>
<html>
<head>
<title>Make a Guess</title>
<link rel="stylesheet" href="style.css">
</head>

<body>

<h1>Make a Guess</h1>

<p>
Guess between 
<?php echo $_SESSION["min"]; ?> 
and 
<?php echo $_SESSION["max"]; ?>
</p>

<form method="post">
<input type="number" name="guess" required>
<button type="submit">Guess</button>
</form>

</body>
</html>