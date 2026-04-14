<?php
session_start();

$secret = $_SESSION["secret"];
$guess = $_SESSION["guess"];

$correct = false;

if ($guess == $secret) {
    $message = "Correct!";
    $correct = true;

    session_destroy();
} elseif ($guess < $secret) {
    $message = "Too low";
} else {
    $message = "Too high";
}
?>

<!DOCTYPE html>
<html>
<head>
<title>Result</title>
<link rel="stylesheet" href="style.css">
</head>

<body>

<h1>Result</h1>

<p>Your guess: <?php echo $guess; ?></p>
<p><?php echo $message; ?></p>

<?php if ($correct): ?>
<a href="index.php">Play Again</a>
<?php else: ?>
<a href="guess.php">Try Again</a>
<?php endif; ?>

</body>
</html>