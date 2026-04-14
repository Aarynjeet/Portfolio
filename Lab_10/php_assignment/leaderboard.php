<?php
/*
 * leaderboard.php — Score recorder and leaderboard display
 * CS 1XD3 Server-side Assignment
 * Author: Aarynjeet Gill
 * Date:   2026-03
 *
 * Receives GET parameters from play.php:
 *   - email : player's email address
 *   - score : final integer score (0 if quit early)
 *   - moves : total moves made during the game
 *   - quit  : 1 if the user quit early, 0 if they finished
 *
 * Steps:
 *   1. Validate all parameters with filter functions
 *   2. INSERT a row into the results table
 *   3. SELECT stats for this user (total games, avg score, best score)
 *   4. SELECT the top 5 players by best score (DESC)
 *   5. Render the leaderboard page
 *
 * Uses PDO with prepared, parameterized statements throughout.
 */

require_once __DIR__ . "/php/db.php";

/* -------------------------------------------------------
 * 1. Validate HTTP GET parameters
 * ------------------------------------------------------- */

$rawEmail = filter_input(INPUT_GET, "email", FILTER_SANITIZE_EMAIL);
$rawScore = filter_input(INPUT_GET, "score", FILTER_VALIDATE_INT,
    ["options" => ["min_range" => 0, "max_range" => 9999999]]);
$rawMoves = filter_input(INPUT_GET, "moves", FILTER_VALIDATE_INT,
    ["options" => ["min_range" => 0, "max_range" => 9999999]]);
$rawQuit  = filter_input(INPUT_GET, "quit",  FILTER_VALIDATE_INT,
    ["options" => ["min_range" => 0, "max_range" => 1]]);

// Validate email format
$validEmail = false;
if ($rawEmail && filter_var($rawEmail, FILTER_VALIDATE_EMAIL)) {
    $atPos  = strpos($rawEmail, "@");
    $domain = substr($rawEmail, $atPos + 1);
    if (preg_match('/[a-zA-Z0-9]\.[a-zA-Z0-9]/', $domain)) {
        $validEmail = true;
    }
}

// Fall back to safe defaults if parameters are invalid
$email    = $validEmail ? strtolower(trim($rawEmail)) : null;
$score    = ($rawScore !== false && $rawScore !== null) ? (int)$rawScore : 0;
$moves    = ($rawMoves !== false && $rawMoves !== null) ? (int)$rawMoves : 0;
$wasQuit  = ($rawQuit  !== false && $rawQuit  !== null) ? (int)$rawQuit  : 1;
$finished = ($wasQuit == 0);

/* -------------------------------------------------------
 * 2. Database operations — only if we have a valid email
 * ------------------------------------------------------- */

$userStats  = null;
$topPlayers = [];
$dbError    = false;
$inserted   = false;

if ($email) {
    try {
        $pdo = getDB();

        // ---- INSERT the game result ----
        $stmt = $pdo->prepare(
            "INSERT INTO results (email, score, moves, finished, played_at)
             VALUES (:email, :score, :moves, :finished, NOW())"
        );
        $stmt->execute([
            ":email"    => $email,
            ":score"    => $score,
            ":moves"    => $moves,
            ":finished" => $finished ? 1 : 0,
        ]);
        $inserted = true;

        // ---- SELECT stats for this user ----
        $statStmt = $pdo->prepare(
            "SELECT
                COUNT(*)                                  AS total_games,
                SUM(CASE WHEN finished = 1 THEN 1 ELSE 0 END) AS completed_games,
                MAX(score)                                AS best_score,
                ROUND(AVG(score), 0)                      AS avg_score,
                SUM(moves)                                AS total_moves
             FROM results
             WHERE email = :email"
        );
        $statStmt->execute([":email" => $email]);
        $userStats = $statStmt->fetch();

        // ---- SELECT top 5 players by best score ----
        // We join with players to check existence, group by email
        $topStmt = $pdo->prepare(
            "SELECT
                email,
                MAX(score)                                    AS best_score,
                COUNT(*)                                      AS total_games,
                SUM(CASE WHEN finished = 1 THEN 1 ELSE 0 END) AS wins,
                ROUND(AVG(score), 0)                          AS avg_score
             FROM results
             GROUP BY email
             ORDER BY best_score DESC
             LIMIT 5"
        );
        $topStmt->execute();
        $topPlayers = $topStmt->fetchAll();

    } catch (PDOException $e) {
        $dbError = true;
        // Do not expose DB details
    }
}

/* -------------------------------------------------------
 * 3. Determine rank of this user in the leaderboard
 * ------------------------------------------------------- */
$userRank = null;
if ($email && !empty($topPlayers)) {
    foreach ($topPlayers as $i => $player) {
        if ($player["email"] === $email) {
            $userRank = $i + 1;
            break;
        }
    }
}
?>
<!DOCTYPE html>
<!--
    Memory Match Game — Leaderboard
    CS 1XD3 Server-side Assignment
    Author: Aarynjeet Gill
    Date:   2026-03
-->
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0, user-scalable=no">
    <title>Memory Match — Leaderboard</title>
    <link rel="stylesheet" href="./css/style.css">
</head>
<body>

    <div id="app-container">
        <div class="screen" style="padding: var(--space-lg) var(--space-md);">

            <div id="leaderboard-header">
                <h1>🧠 Memory Match</h1>
                <h2>🏆 Leaderboard</h2>
            </div>

            <?php if ($dbError): ?>

                <!-- Database error -->
                <div id="login-card" style="margin-bottom: var(--space-lg);">
                    <div class="result-icon">⚠️</div>
                    <p class="login-desc">A database error occurred while saving your score. Sorry!</p>
                </div>

            <?php elseif (!$email): ?>

                <!-- No valid email -->
                <div id="login-card" style="margin-bottom: var(--space-lg);">
                    <div class="result-icon">⚠️</div>
                    <p class="login-desc">No player email provided. Please sign in to play.</p>
                </div>

            <?php else: ?>

                <!-- This game's result banner -->
                <div id="login-card" class="result-banner" style="margin-bottom: var(--space-lg);">
                    <?php if ($finished): ?>
                        <div class="result-icon">🎉</div>
                        <h3>Game Complete!</h3>
                        <p class="login-desc">
                            You finished all 3 rounds as <strong><?= htmlspecialchars($email) ?></strong>.<br>
                            Score this game: <strong><?= number_format($score) ?></strong> |
                            Total moves: <strong><?= number_format($moves) ?></strong>
                        </p>
                    <?php else: ?>
                        <div class="result-icon">🚪</div>
                        <h3>You Quit Early</h3>
                        <p class="login-desc">
                            Score saved for <strong><?= htmlspecialchars($email) ?></strong>:
                            <strong><?= number_format($score) ?></strong> points.
                        </p>
                    <?php endif; ?>

                    <?php if ($userRank !== null): ?>
                        <p class="rank-badge">🥇 You're #<?= $userRank ?> on the leaderboard!</p>
                    <?php endif; ?>
                </div>

                <!-- Your personal stats -->
                <?php if ($userStats && $userStats["total_games"] > 0): ?>
                <div class="stats-section">
                    <h3>📊 Your Stats</h3>
                    <div class="stats-grid">
                        <div class="stat-box">
                            <span class="stat-value"><?= number_format($userStats["total_games"]) ?></span>
                            <span class="stat-label">Games Played</span>
                        </div>
                        <div class="stat-box">
                            <span class="stat-value"><?= number_format($userStats["completed_games"]) ?></span>
                            <span class="stat-label">Completed</span>
                        </div>
                        <div class="stat-box">
                            <span class="stat-value"><?= number_format($userStats["best_score"]) ?></span>
                            <span class="stat-label">Best Score</span>
                        </div>
                        <div class="stat-box">
                            <span class="stat-value"><?= number_format($userStats["avg_score"]) ?></span>
                            <span class="stat-label">Avg Score</span>
                        </div>
                        <div class="stat-box">
                            <span class="stat-value"><?= number_format($userStats["total_moves"]) ?></span>
                            <span class="stat-label">Total Moves</span>
                        </div>
                    </div>
                </div>
                <?php endif; ?>

                <!-- Top 5 players -->
                <?php if (!empty($topPlayers)): ?>
                <div class="stats-section">
                    <h3>🏅 Top 5 Players</h3>
                    <table class="leaderboard-table">
                        <thead>
                            <tr>
                                <th>Rank</th>
                                <th>Player</th>
                                <th>Best Score</th>
                                <th>Games</th>
                                <th>Wins</th>
                                <th>Avg Score</th>
                            </tr>
                        </thead>
                        <tbody>
                            <?php foreach ($topPlayers as $rank => $player):
                                $rankNum    = $rank + 1;
                                $isYou      = ($player["email"] === $email);
                                $medal      = ["🥇","🥈","🥉","4️⃣","5️⃣"][$rank] ?? ($rankNum . ".");
                                // Mask email for privacy: show first 3 chars + ***@domain
                                $parts      = explode("@", $player["email"]);
                                $localShort = substr($parts[0], 0, 3) . "***";
                                $displayEmail = $localShort . "@" . ($parts[1] ?? "");
                            ?>
                            <tr class="<?= $isYou ? "highlight-row" : "" ?>">
                                <td><?= $medal ?></td>
                                <td>
                                    <?= htmlspecialchars($displayEmail) ?>
                                    <?= $isYou ? " <span class='you-tag'>You</span>" : "" ?>
                                </td>
                                <td><?= number_format($player["best_score"]) ?></td>
                                <td><?= number_format($player["total_games"]) ?></td>
                                <td><?= number_format($player["wins"]) ?></td>
                                <td><?= number_format($player["avg_score"]) ?></td>
                            </tr>
                            <?php endforeach; ?>
                        </tbody>
                    </table>
                </div>
                <?php else: ?>
                    <p class="login-desc" style="margin:1rem 0;">No scores recorded yet — you'll be first!</p>
                <?php endif; ?>

            <?php endif; ?>

            <!-- Action buttons -->
            <div class="leaderboard-actions">
                <?php if ($email): ?>
                    <a href="play.php?email=<?= urlencode($email) ?>" class="primary-btn">
                        Play Again 🎮
                    </a>
                <?php endif; ?>
                <a href="index.php" class="secondary-btn">
                    Sign Out 🚪
                </a>
            </div>

        </div><!-- /screen -->
    </div><!-- /app-container -->

</body>
</html>
