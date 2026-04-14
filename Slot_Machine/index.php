<?php

$slot1 = rand(1,7);
$slot2 = rand(1,7);
$slot3 = rand(1,7);

$message = "Try Again";

if($slot1 == $slot2 && $slot2 == $slot3){
    $message = "JACKPOT!";
}
else if($slot1 == $slot2 || $slot1 == $slot3 || $slot2 == $slot3){
    $message = "You Win!";
}

?>

<!DOCTYPE html>
<html>
<head>
    <title>Fruit Slot Machine</title>
    <link rel="stylesheet" href="css/style.css">
</head>

<body>

<h1>Fruit Slot Machine</h1>

<div class="machine">

<img src="images/Fruit<?php echo $slot1; ?>.png">
<img src="images/Fruit<?php echo $slot2; ?>.png">
<img src="images/Fruit<?php echo $slot3; ?>.png">

</div>

<h2><?php echo $message; ?></h2>

<a href="index.php" class="spin">Spin Again</a>

</body>
</html>