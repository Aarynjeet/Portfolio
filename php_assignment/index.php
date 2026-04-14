<?php
/*
 * index.php — Memory Match: Login / Registration
 * CS 1XD3 Server-side Assignment
 * Author: Aarynjeet Gill
 * Date:   2026-03-30
 */
?>
<!DOCTYPE html>

<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0, user-scalable=no">
    <title>Memory Match — Sign In</title>
    <link rel="stylesheet" href="./css/style.css">
</head>
<body>

    <div id="app-container">
        <div id="login-screen" class="screen">

            <div id="login-content">
                <div id="login-header">
                    <h1>🧠 Memory Match</h1>
                    <p class="subtitle">Test your memory in 3 exciting rounds!</p>
                </div>

                <div id="login-card">
                    <h2>Welcome!</h2>
                    <p class="login-desc">Enter your email and birth date to play.<br>
                    New players will be registered automatically.</p>

                    <!-- Email/birthdate form — POSTs to login.php -->
                    <form id="login-form" action="login.php" method="POST" novalidate>

                        <div class="form-group">
                            <label for="email">Email Address</label>
                            <input
                                type="email"
                                id="email"
                                name="email"
                                placeholder="you@example.com"
                                required
                                maxlength="255"
                                autocomplete="email"
                            >
                            <!-- JS injects error messages here -->
                            <span id="email-error" class="field-error" aria-live="polite"></span>
                        </div>

                        <div class="form-group">
                            <label for="birthdate">Birth Date <span class="hint">(used as your password)</span></label>
                            <input
                                type="date"
                                id="birthdate"
                                name="birthdate"
                                required
                                max="2010-12-31"
                                min="1900-01-01"
                            >
                            <span id="date-error" class="field-error" aria-live="polite"></span>
                        </div>

                        <button type="submit" id="login-btn" class="primary-btn">
                            Play Now 🎮
                        </button>

                    </form>
                </div>

                <p class="footer-note">🔒 Your birth date is stored securely to identify you.<br>
                Don't share this with others.</p>
            </div>

        </div>
    </div>

    <script src="./js/login.js"></script>
</body>
</html>
