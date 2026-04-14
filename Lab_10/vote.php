<?php
$host = "localhost";
$dbname = "gilla156_db";
$username = "gilla156_local";
$password = "KRFI1A&Z";

$message = "";

if ($_SERVER["REQUEST_METHOD"] === "POST") {
    $pollid = filter_input(INPUT_POST, "pollid", FILTER_VALIDATE_INT);
    $option = filter_input(INPUT_POST, "option", FILTER_VALIDATE_INT);

    if ($pollid === false || $pollid === null || $pollid < 1) {
        $message = "Invalid poll ID.";
    } elseif ($option === false || $option === null || $option < 1 || $option > 4) {
        $message = "Invalid option. Choose 1, 2, 3, or 4.";
    } else {
        try {
            $pdo = new PDO("mysql:host=$host;dbname=$dbname", $username, $password);
            $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

            $stmt = $pdo->prepare("SELECT * FROM poll WHERE ID = ?");
            $stmt->execute([$pollid]);
            $poll = $stmt->fetch(PDO::FETCH_ASSOC);

            if (!$poll) {
                $message = "Invalid poll ID. Poll not found.";
            } else {
                $optionText = $poll["option" . $option];

                if ($optionText === null || trim($optionText) === "") {
                    $message = "That option does not exist for this poll.";
                } else {
                    $column = "vote" . $option;
                    $sql = "UPDATE poll SET $column = $column + 1 WHERE ID = ?";
                    $update = $pdo->prepare($sql);
                    $update->execute([$pollid]);
                    $message = "Vote recorded successfully.";
                }
            }
        } catch (PDOException $e) {
            $message = "Could not connect to the database or update the vote.";
        }
    }
}
?>

<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="utf-8">
    <title>Vote in Poll</title>
</head>
<body>
    <h1>Vote in a Poll</h1>

    <?php if ($message !== ""): ?>
        <p><?php echo htmlspecialchars($message); ?></p>
    <?php endif; ?>

    <form method="post" action="vote.php">
        <label for="pollid">Poll ID:</label>
        <input type="number" name="pollid" id="pollid" min="1" required>
        <br><br>

        <label for="option">Option:</label>
        <select name="option" id="option" required>
            <option value="">Choose one</option>
            <option value="1">1</option>
            <option value="2">2</option>
            <option value="3">3</option>
            <option value="4">4</option>
        </select>
        <br><br>

        <button type="submit">Vote</button>
    </form>
</body>
</html>
