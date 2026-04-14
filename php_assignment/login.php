<?php
/*
 * login.php — Authentication / Registration handler
 * CS 1XD3 Server-side Assignment
 * Author: Aarynjeet Gill
 * Date:   2026-03-30
 */

require_once __DIR__ . "/php/db.php";

/* -------------------------------------------------------
 * 1. Receive and sanitise HTTP POST parameters
 * ------------------------------------------------------- */

// filter_input returns NULL if the key doesn't exist, FALSE on failure
$rawEmail     = filter_input(INPUT_POST, "email",     FILTER_SANITIZE_EMAIL);
$rawBirthdate = filter_input(INPUT_POST, "birthdate", FILTER_SANITIZE_SPECIAL_CHARS);

// Validate email is present and well-formed
if (!$rawEmail || !filter_var($rawEmail, FILTER_VALIDATE_EMAIL)) {
    $error = "Invalid or missing email address.";
}

// Validate birthdate looks like YYYY-MM-DD
if (!isset($error)) {
    if (!$rawBirthdate || !preg_match('/^\d{4}-\d{2}-\d{2}$/', $rawBirthdate)) {
        $error = "Invalid or missing birth date.";
    }
}

/* -------------------------------------------------------
 * 2. If parameters are bad, show error and bail out early
 * ------------------------------------------------------- */
if (isset($error)) {
    $pageTitle   = "Error";
    $isError     = true;
    $errorMsg    = htmlspecialchars($error);
    $showForm    = false;
    renderPage();
    exit;
}

$email     = strtolower(trim($rawEmail));
$birthdate = $rawBirthdate;

/* -------------------------------------------------------
 * 3. Query the database
 * ------------------------------------------------------- */
$isNewUser      = false;
$wrongPassword  = false;
$dbError        = false;

try {
    $pdo = getDB();

    // Look up the email
    $stmt = $pdo->prepare("SELECT birthdate FROM players WHERE email = :email LIMIT 1");
    $stmt->execute([":email" => $email]);
    $row = $stmt->fetch();

    if ($row === false) {
        // --- New user: INSERT into players ---
        $insert = $pdo->prepare(
            "INSERT INTO players (email, birthdate, created_at)
             VALUES (:email, :birthdate, NOW())"
        );
        $insert->execute([
            ":email"     => $email,
            ":birthdate" => $birthdate,
        ]);
        $isNewUser = true;

    } elseif ($row["birthdate"] === $birthdate) {
        // --- Returning user: credentials match ---
        $isNewUser = false;

    } else {
        // --- Email taken but birthdate doesn't match ---
        $wrongPassword = true;
    }

} catch (PDOException $e) {
    $dbError    = true;
    $dbErrorMsg = "A database error occurred. Please try again later.";
    // Do not expose $e->getMessage() to the user in production
}

/* -------------------------------------------------------
 * 4. Render the result page
 * ------------------------------------------------------- */
renderPage();

/**
 * Output the full HTML response page.
 * Variables used: $email, $isNewUser, $wrongPassword, $dbError,
 *                 $dbErrorMsg, $isError, $errorMsg.
 */
function renderPage() {
    global $email, $isNewUser, $wrongPassword, $dbError, $dbErrorMsg, $isError, $errorMsg;
?>
<!DOCTYPE html>
<!--
    Memory Match Game — Login Result
    CS 1XD3 Server-side Assignment
    Author: Aarynjeet Gill
    Date:   2026-03
-->
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0, user-scalable=no">
    <title>Memory Match — Welcome</title>
    <link rel="stylesheet" href="./css/style.css">
</head>
<body>

    <div id="app-container">
        <div id="login-screen" class="screen">
            <div id="login-content">

                <div id="login-header">
                    <h1>🧠 Memory Match</h1>
                </div>

                <div id="login-card">

                <?php if (isset($isError) && $isError): ?>

                    <!-- Bad HTTP parameters -->
                    <div class="result-icon">⚠️</div>
                    <h2>Input Error</h2>
                    <p class="login-desc"><?= $errorMsg ?></p>
                    <a href="index.php" class="primary-btn" style="display:inline-block;margin-top:1rem;">
                        ← Back to Sign In
                    </a>

                <?php elseif ($dbError): ?>

                    <!-- Database error -->
                    <div class="result-icon">⚠️</div>
                    <h2>Oops!</h2>
                    <p class="login-desc"><?= htmlspecialchars($dbErrorMsg) ?></p>
                    <a href="index.php" class="primary-btn" style="display:inline-block;margin-top:1rem;">
                        ← Try Again
                    </a>

                <?php elseif ($wrongPassword): ?>

                    <!-- Email exists but birthdate is wrong -->
                    <div class="result-icon">🔒</div>
                    <h2>Email Already Taken</h2>
                    <p class="login-desc">
                        The email address <strong><?= htmlspecialchars($email) ?></strong>
                        is already registered, but the birth date you entered doesn't match.
                    </p>
                    <p class="login-desc">Please try a different email address or check your birth date.</p>
                    <a href="index.php" class="primary-btn" style="display:inline-block;margin-top:1rem;">
                        ← Back to Sign In
                    </a>

                <?php elseif ($isNewUser): ?>

                    <!-- Brand new player -->
                    <div class="result-icon">🎉</div>
                    <h2>Welcome to Memory Match!</h2>
                    <p class="login-desc">
                        Nice to meet you, <strong><?= htmlspecialchars($email) ?></strong>!<br>
                        Your account has been created. Get ready to test your memory!
                    </p>
                    <a href="play.php?email=<?= urlencode($email) ?>" class="primary-btn" style="display:inline-block;margin-top:1rem;">
                        Start Playing 🎮
                    </a>

                <?php else: ?>

                    <!-- Returning player -->
                    <div class="result-icon">👋</div>
                    <h2>Welcome Back!</h2>
                    <p class="login-desc">
                        Great to see you again, <strong><?= htmlspecialchars($email) ?></strong>!<br>
                        You've been here before — let's see if you can beat your high score!
                    </p>
                    <a href="play.php?email=<?= urlencode($email) ?>" class="primary-btn" style="display:inline-block;margin-top:1rem;">
                        Play Again 🎮
                    </a>

                <?php endif; ?>

                </div><!-- /login-card -->

            </div><!-- /login-content -->
        </div><!-- /login-screen -->
    </div><!-- /app-container -->

</body>
</html>
<?php
} // end renderPage()
