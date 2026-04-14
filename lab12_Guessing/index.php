<?php
session_start();

$error = "";

if ($_SERVER["REQUEST_METHOD"] === "POST") {
    $min = filter_input(INPUT_POST, "min", FILTER_VALIDATE_INT);
    $max = filter_input(INPUT_POST, "max", FILTER_VALIDATE_INT);

    if ($min === false || $max === false) {
        $error = "Enter valid numbers.";
    } elseif ($min >= $max) {
        $error = "Min must be less than max.";
    } else {
        $_SESSION["min"] = $min;
        $_SESSION["max"] = $max;
        $_SESSION["secret"] = rand($min, $max);

        header("Location: guess.php");
        exit;
    }
}
?>

<!DOCTYPE html>
<html>
<head>
    <title>Guessing Game</title>
    <link rel="stylesheet" href="style.css">
</head>
<body>

<h1>Guessing Game</h1>

<form method="post">
    <label>Minimum:</label>
    <input type="number" name="min" required>

    <br><br>

    <label>Maximum:</label>
    <input type="number" name="max" required>

    <br><br>

    <button type="submit">Start</button>
</form>

<p><?php echo $error; ?></p>

</body>
</html>