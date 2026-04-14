<?php
session_start();

if (!isset($_SESSION["credits"])) {
    $_SESSION["credits"] = 10;
}
?>

<!DOCTYPE html>
<html>
<head>
<title>Slot Machine</title>
<link rel="stylesheet" href="style.css">
</head>

<body>

<h1>Slot Machine</h1>

<p>Credits: <span id="credits"><?php echo $_SESSION["credits"]; ?></span></p>

<label>Bet:</label>
<input type="number" id="bet" value="1" min="1">

<br><br>

<button onclick="spin()">Spin</button>

<h2 id="result"></h2>

<div id="slots">
<span id="slot1">🍒</span>
<span id="slot2">🍒</span>
<span id="slot3">🍒</span>
</div>

<script src="script.js"></script>

</body>
</html>