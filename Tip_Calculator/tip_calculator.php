<?php
function clean($str) {
    return htmlspecialchars(trim($str), ENT_QUOTES, 'UTF-8');
}

function showErrors($errors) {
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Error</title>
    <link rel="stylesheet" href="style.css">
</head>
<body>
    <div class="error-box">
        <h1>⚠️ Error</h1>
        <ul>
            <?php foreach ($errors as $err): ?>
                <li><?= htmlspecialchars($err) ?></li>
            <?php endforeach; ?>
        </ul>
        <a href="index.html">← Go back and try again</a>
    </div>
</body>
</html>
<?php
    exit;
}

$errors = [];

$required = ['serverName', 'email', 'emailConfirm', 'billAmount', 'tipPercent', 'creditCard'];
foreach ($required as $field) {
    if (!isset($_POST[$field]) || trim($_POST[$field]) === '') {
        $errors[] = "Missing required field: $field";
    }
}

if (!empty($errors)) {
    showErrors($errors);
}

$serverName   = clean($_POST['serverName']);
$email        = clean($_POST['email']);
$emailConfirm = clean($_POST['emailConfirm']);
$billAmount   = $_POST['billAmount'];
$tipPercent   = $_POST['tipPercent'];
$creditCard   = clean($_POST['creditCard']);

if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    $errors[] = "Invalid email address format.";
}

if ($email !== $emailConfirm) {
    $errors[] = "Email addresses do not match.";
}

if (!is_numeric($billAmount) || floatval($billAmount) <= 0) {
    $errors[] = "Bill amount must be a positive number.";
}

if (!preg_match('/^\d+$/', $tipPercent)) {
    $errors[] = "Tip percentage must be a non-negative integer.";
}

if (!preg_match('/^\d{16}$/', $creditCard)) {
    $errors[] = "Credit card number must be exactly 16 digits.";
}

if (!empty($errors)) {
    showErrors($errors);
}

$billAmount  = floatval($billAmount);
$tipPercent  = intval($tipPercent);
$tipAmount   = round($billAmount * $tipPercent / 100, 2);
$totalAmount = round($billAmount + $tipAmount, 2);

$maskedCC = str_repeat('•', 12) . substr($creditCard, -4);
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Tip Receipt</title>
    <link rel="stylesheet" href="style.css">
</head>
<body>
    <div class="receipt">
        <h1>🧾 Tip Receipt</h1>
        <table>
            <tr>
                <td>Server:</td>
                <td><?= $serverName ?></td>
            </tr>
            <tr>
                <td>Customer Email:</td>
                <td><?= $email ?></td>
            </tr>
            <tr>
                <td>Credit Card:</td>
                <td><?= $maskedCC ?></td>
            </tr>
            <tr class="divider">
                <td>Bill Amount:</td>
                <td>$<?= number_format($billAmount, 2) ?></td>
            </tr>
            <tr>
                <td>Tip (<?= $tipPercent ?>%):</td>
                <td>$<?= number_format($tipAmount, 2) ?></td>
            </tr>
            <tr class="total">
                <td>Total:</td>
                <td>$<?= number_format($totalAmount, 2) ?></td>
            </tr>
        </table>
        <a href="index.html">← Calculate another tip</a>
    </div>
</body>
</html>