<?php
session_start();

header('Content-Type: application/json');

if (!isset($_SESSION["credits"])) {
echo json_encode(["error" => "No session"]);
exit;
}

$bet = intval($_POST["bet"]);

if ($bet < 1) {
echo json_encode(["error" => "Bet must be at least 1"]);
exit;
}

if ($bet > $_SESSION["credits"]) {
echo json_encode(["error" => "Not enough credits"]);
exit;
}

$fruits = ["🍒","🍋","🍊","🍉","⭐"];

$slot1 = $fruits[array_rand($fruits)];
$slot2 = $fruits[array_rand($fruits)];
$slot3 = $fruits[array_rand($fruits)];

$payout = 0;

if ($slot1 == $slot2 && $slot2 == $slot3) {
$payout = $bet * 5;
$message = "Jackpot!";
}
elseif ($slot1 == $slot2 || $slot2 == $slot3 || $slot1 == $slot3) {
$payout = $bet * 2;
$message = "You win!";
}
else {
$payout = -$bet;
$message = "You lose!";
}

$_SESSION["credits"] += $payout;

if ($_SESSION["credits"] <= 0) {
session_destroy();
echo json_encode([
"slots" => [$slot1,$slot2,$slot3],
"credits" => 0,
"message" => "Game Over"
]);
exit;
}

echo json_encode([
"slots" => [$slot1,$slot2,$slot3],
"credits" => $_SESSION["credits"],
"message" => $message
]);