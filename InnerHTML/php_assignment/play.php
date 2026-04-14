<?php
/*
 * play.php — Memory Match game page
 * CS 1XD3 Server-side Assignment
 * Author: Aarynjeet Gill
 * Date:   2026-03
 *
 * Receives a GET parameter:
 *   - email : the logged-in player's email address
 *
 * If the email parameter is missing or invalid, shows an
 * error message and does NOT run the game. Otherwise,
 * embeds the email safely into the page so JavaScript can
 * send it to leaderboard.php when the game ends.
 *
 * The game itself is the Memory Match JS app from the
 * previous assignment, adapted so that:
 *   - localStorage history is removed (DB handles this now)
 *   - A "Quit" button is always visible that goes to leaderboard.php
 *   - On game completion the page redirects to leaderboard.php
 *     with the email and final score as parameters
 */

/* -------------------------------------------------------
 * 1. Validate the email parameter
 * ------------------------------------------------------- */
$rawEmail = filter_input(INPUT_GET, "email", FILTER_SANITIZE_EMAIL);

$validEmail = false;
$email      = "";

if ($rawEmail && filter_var($rawEmail, FILTER_VALIDATE_EMAIL)) {
    // Extra check: domain must have a dot between alphanumeric chars
    $atPos  = strpos($rawEmail, "@");
    $domain = substr($rawEmail, $atPos + 1);
    if (preg_match('/[a-zA-Z0-9]\.[a-zA-Z0-9]/', $domain)) {
        $validEmail = true;
        $email      = strtolower(trim($rawEmail));
    }
}
?>
<!DOCTYPE html>
<!--
    Memory Match Game — Play Page
    CS 1XD3 Server-side Assignment
    Author: Aarynjeet Gill
    Date:   2026-03
    Description: The core Memory Match game. Requires a valid email
                 GET parameter. On completion, redirects to leaderboard.php.
-->
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0, user-scalable=no">
    <title>Memory Match — Play</title>
    <link rel="stylesheet" href="./css/style.css">
</head>
<body>

<?php if (!$validEmail): ?>

    <!-- ======================================================
         ERROR: No valid email — do not run the game
         ====================================================== -->
    <div id="app-container">
        <div class="screen" style="padding:2rem;text-align:center;">
            <div id="login-content">
                <div id="login-header">
                    <h1>🧠 Memory Match</h1>
                </div>
                <div id="login-card">
                    <div class="result-icon">⚠️</div>
                    <h2>Access Denied</h2>
                    <p class="login-desc">
                        You must sign in before playing.<br>
                        No valid email address was provided.
                    </p>
                    <a href="index.php" class="primary-btn" style="display:inline-block;margin-top:1rem;">
                        ← Go to Sign In
                    </a>
                </div>
            </div>
        </div>
    </div>

<?php else: ?>

    <!-- ======================================================
         GAME — valid email, run the app
         ====================================================== -->
    <div id="app-container">

        <!-- Quit / leaderboard bar — always visible during play -->
        <div id="quit-bar">
            <span id="playing-as">Playing as: <?= htmlspecialchars($email) ?></span>
            <!-- The quit form uses hidden inputs to send email via GET -->
            <form id="quit-form" action="leaderboard.php" method="GET">
                <input type="hidden" name="email" id="quit-email"
                       value="<?= htmlspecialchars($email) ?>">
                <input type="hidden" name="score" id="quit-score" value="0">
                <input type="hidden" name="moves" id="quit-moves" value="0">
                <input type="hidden" name="quit"  value="1">
                <button type="submit" id="quit-btn" class="quit-button">
                    🏁 Quit &amp; Leaderboard
                </button>
            </form>
        </div>

        <!-- ========== SPLASH SCREEN ========== -->
        <div id="splash-screen" class="screen">
            <canvas id="splash-canvas"></canvas>
            <button id="start-btn" class="hidden">Start Game</button>
        </div>

        <!-- ========== GAME SCREEN ========== -->
        <div id="game-screen" class="screen hidden">

            <!-- Status Bar -->
            <div id="status-bar">
                <div id="status-left">
                    <span id="round-display">Round 1 / 3</span>
                    <span id="score-display">Score: 0</span>
                </div>
                <div id="status-right">
                    <span id="moves-display">Moves: 0</span>
                    <span id="timer-display">⏱ 0:00</span>
                    <button id="help-btn">Help</button>
                    <button id="sound-btn">🔊</button>
                </div>
            </div>

            <!-- Progress Bar -->
            <div id="progress-bar-track">
                <div id="progress-bar-fill"></div>
            </div>

            <!-- Card Board -->
            <div id="board"></div>

            <!-- Feedback Message -->
            <div id="feedback-msg"></div>

            <!-- Overlay -->
            <div id="overlay" class="hidden"></div>

            <!-- Help Panel -->
            <div id="help-panel" class="popup hidden">
                <h3>How to Play</h3>
                <p>Tap two cards to flip them. If they show the same emoji they stay face-up.</p>
                <p>Find all pairs to complete the round. Fewer moves and less time means a higher score!</p>
                <p><strong>Rounds:</strong> The grid grows each round — 6 pairs, then 8, then 10.</p>
                <p><strong>Tip:</strong> Cards are shown briefly at the start — memorise them!</p>
                <p><strong>Sound:</strong> Tap the 🔊 button to toggle sound effects on or off.</p>
                <button id="close-help-btn" class="popup-btn">Got It!</button>
            </div>

            <!-- Round Complete Popup -->
            <div id="round-popup" class="popup hidden">
                <p id="round-popup-text"></p>
                <button id="next-round-btn" class="popup-btn">Next Round &#8594;</button>
            </div>

        </div>

        <!-- ========== END SCREEN ========== -->
        <div id="end-screen" class="screen hidden">
            <div id="end-content">
                <h1>&#127881; Game Over!</h1>
                <div id="end-scores">
                    <p id="final-score-text"></p>
                    <p id="final-moves-text"></p>
                </div>
                <p class="login-desc" style="margin-bottom:1rem;">
                    Saving your score and loading the leaderboard…
                </p>
                <!-- Hidden form used to POST game results to leaderboard.php -->
                <form id="end-form" action="leaderboard.php" method="GET">
                    <input type="hidden" name="email" value="<?= htmlspecialchars($email) ?>">
                    <input type="hidden" name="score" id="end-score-input" value="0">
                    <input type="hidden" name="moves" id="end-moves-input" value="0">
                    <input type="hidden" name="quit"  value="0">
                    <button type="submit" id="view-leaderboard-btn" class="primary-btn">
                        🏆 View Leaderboard
                    </button>
                </form>
            </div>
        </div>

    </div><!-- /app-container -->

    <!--
        Pass the PHP email to JavaScript safely.
        The script reads window.PLAYER_EMAIL before initialising the game.
    -->
    <script>
        /* PHP-injected player email — read-only, used by GameController */
        window.PLAYER_EMAIL = <?= json_encode($email) ?>;
    </script>

<?php endif; ?>

    <script src="./js/script.js"></script>
</body>
</html>
