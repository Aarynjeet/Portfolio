/*
 * Memory Match Game — Main Script
 * CS 1XD3 Lab 7.2
 * Author: Aarynjeet Gill
 * Date:   2026-03-5
 *
 * A memory card matching game with 3 rounds of increasing
 * difficulty, time-based scoring, sound effects via the
 * Web Audio API, and persistent history via localStorage.
 *
 * Architecture:
 *   Model      — Card, GameState, HistoryManager
 *   View       — SplashRenderer, GameView
 *   Audio      — SoundManager
 *   Controller — GameController
 *
 * All state lives in model objects. The view only reads
 * from the model and updates the DOM. No state is ever
 * read back from innerHTML or the DOM.
 */

window.addEventListener("load", function () {

    /* =========================================================
     *  AUDIO — SoundManager
     *  Generates all sound effects using the Web Audio API.
     *  No external audio files are required.
     * ========================================================= */
    class SoundManager {
        constructor() {
            this.enabled = true;
            this.ctx = null;
            this.initialised = false;
        }

        /**
         * Lazily create the AudioContext on first user gesture.
         * Many browsers block audio until a user interaction.
         */
        init() {
            if (this.initialised) return;
            try {
                var AudioCtx = window.AudioContext || window.webkitAudioContext;
                this.ctx = new AudioCtx();
                this.initialised = true;
            } catch (e) {
                this.enabled = false;
            }
        }

        /** Toggle sound on / off. */
        toggle() {
            this.enabled = !this.enabled;
            return this.enabled;
        }

        /**
         * Play a tone with the given parameters.
         * @param {number} freq     - Frequency in Hz
         * @param {string} type     - Oscillator type (sine, square, triangle, sawtooth)
         * @param {number} duration - Length in seconds
         * @param {number} volume   - Gain 0–1
         * @param {number} delay    - Start delay in seconds
         */
        playTone(freq, type, duration, volume, delay) {
            if (!this.enabled || !this.ctx) return;

            var now  = this.ctx.currentTime + (delay || 0);
            var osc  = this.ctx.createOscillator();
            var gain = this.ctx.createGain();

            osc.type = type || "sine";
            osc.frequency.setValueAtTime(freq, now);

            gain.gain.setValueAtTime(volume || 0.3, now);
            gain.gain.exponentialRampToValueAtTime(0.001, now + duration);

            osc.connect(gain);
            gain.connect(this.ctx.destination);
            osc.start(now);
            osc.stop(now + duration);
        }

        /** Short click when flipping a card. */
        playFlip() {
            this.playTone(800, "sine", 0.08, 0.2, 0);
        }

        /** Happy two-note chime when a match is found. */
        playMatch() {
            this.playTone(523, "sine",      0.15, 0.3, 0);
            this.playTone(659, "sine",      0.15, 0.3, 0.1);
            this.playTone(784, "triangle",  0.25, 0.2, 0.2);
        }

        /** Low buzz when a mismatch occurs. */
        playMismatch() {
            this.playTone(200, "square",   0.12, 0.15, 0);
            this.playTone(180, "square",   0.12, 0.15, 0.1);
        }

        /** Fanfare when a round is completed. */
        playRoundComplete() {
            this.playTone(523, "sine",     0.15, 0.3, 0);
            this.playTone(659, "sine",     0.15, 0.3, 0.12);
            this.playTone(784, "sine",     0.15, 0.3, 0.24);
            this.playTone(1047, "sine",    0.35, 0.35, 0.36);
        }

        /** Grand fanfare for game completion. */
        playGameComplete() {
            this.playTone(523, "sine",     0.12, 0.3, 0);
            this.playTone(659, "sine",     0.12, 0.3, 0.1);
            this.playTone(784, "sine",     0.12, 0.3, 0.2);
            this.playTone(1047, "sine",    0.12, 0.3, 0.3);
            this.playTone(1047, "triangle",0.5,  0.25, 0.45);
            this.playTone(1319, "sine",    0.5,  0.3, 0.55);
        }

        /** Simple click for UI button presses. */
        playClick() {
            this.playTone(600, "sine", 0.06, 0.15, 0);
        }

        /** Whoosh for card peek hide. */
        playPeekEnd() {
            this.playTone(400, "triangle", 0.2, 0.15, 0);
            this.playTone(300, "triangle", 0.2, 0.1,  0.1);
        }
    }

    /* =========================================================
     *  MODEL — Card
     *  Represents a single card on the board.
     * ========================================================= */
    class Card {
        /**
         * @param {number} id    - Unique position index on the board
         * @param {string} emoji - The emoji symbol on the face side
         */
        constructor(id, emoji) {
            this.id = id;
            this.emoji = emoji;
            this.isFlipped = false;
            this.isMatched = false;
        }

        /** Flip this card face-up. */
        flip() {
            this.isFlipped = true;
        }

        /** Flip this card face-down. */
        unflip() {
            this.isFlipped = false;
        }

        /** Mark this card as matched (permanently face-up). */
        match() {
            this.isMatched = true;
            this.isFlipped = true;
        }
    }

    /* =========================================================
     *  MODEL — GameState
     *  Stores every piece of mutable game data.
     * ========================================================= */
    class GameState {
        /** Set up the default configuration and call reset. */
        constructor() {
            this.totalRounds = 3;

            this.roundConfigs = [
                { pairs: 6,  cols: 4, rows: 3 },
                { pairs: 8,  cols: 4, rows: 4 },
                { pairs: 10, cols: 4, rows: 5 }
            ];

            this.reset();
        }

        /** Reset all state for a brand-new game. */
        reset() {
            this.currentRound = 0;
            this.totalScore   = 0;
            this.totalMoves   = 0;
            this.roundMoves   = 0;
            this.matchedPairs = 0;
            this.timerSeconds = 0;
            this.cards        = [];
            this.roundScores  = [];
            this.isLocked     = false;
            this.peekPhase    = true;
            this.firstCard    = null;
            this.secondCard   = null;
        }

        /** Return the config for the current round. */
        getCurrentConfig() {
            return this.roundConfigs[this.currentRound];
        }

        /** Return pair count for the current round. */
        getTotalPairs() {
            return this.getCurrentConfig().pairs;
        }

        /** True when all pairs in the current round are matched. */
        isRoundComplete() {
            return this.matchedPairs >= this.getTotalPairs();
        }

        /** True when the player has finished every round. */
        isGameComplete() {
            return this.currentRound >= this.totalRounds;
        }

        /**
         * Compute score for the current round.
         * base        = pairs * 100
         * timePenalty  = seconds * 2  (capped at 50% of base)
         * movePenalty  = (moves - pairs) * 10  (excess moves only)
         * @return {number} Computed round score (min 0).
         */
        calculateRoundScore() {
            var pairs       = this.getTotalPairs();
            var base        = pairs * 100;
            var timePenalty = Math.min(this.timerSeconds * 2, base * 0.5);
            var movePenalty = Math.max(0, (this.roundMoves - pairs) * 10);
            return Math.max(0, Math.round(base - timePenalty - movePenalty));
        }

        /** Record the round result and increment the round counter. */
        advanceRound() {
            var roundScore = this.calculateRoundScore();
            this.roundScores.push({
                round: this.currentRound + 1,
                score: roundScore,
                moves: this.roundMoves,
                time:  this.timerSeconds,
                pairs: this.getTotalPairs()
            });
            this.totalScore += roundScore;
            this.totalMoves += this.roundMoves;
            this.currentRound++;
        }

        /** Prepare model state for a new round. */
        initRound() {
            this.roundMoves   = 0;
            this.matchedPairs = 0;
            this.timerSeconds = 0;
            this.isLocked     = true;
            this.peekPhase    = true;
            this.firstCard    = null;
            this.secondCard   = null;
            this.cards        = this.generateCards();
        }

        /**
         * Build a shuffled array of Card objects for this round.
         * Uses the Fisher-Yates shuffle algorithm.
         * @return {Card[]} Shuffled array of Card instances.
         */
        generateCards() {
            var allEmojis = [
                "🐶", "🐱", "🐭", "🐹", "🐰", "🦊",
                "🐻", "🐼", "🐸", "🦁", "🐯", "🐨",
                "🐵", "🦄", "🐙", "🦋"
            ];

            var config   = this.getCurrentConfig();
            var selected = allEmojis.slice(0, config.pairs);
            var pool     = selected.concat(selected);

            // Fisher-Yates shuffle
            for (var i = pool.length - 1; i > 0; i--) {
                var j    = Math.floor(Math.random() * (i + 1));
                var temp = pool[i];
                pool[i]  = pool[j];
                pool[j]  = temp;
            }

            var cards = [];
            for (var k = 0; k < pool.length; k++) {
                cards.push(new Card(k, pool[k]));
            }
            return cards;
        }

        /**
         * Handle a card selection.
         * @param  {number} index - Board position tapped
         * @return {object|null}  - Action descriptor or null if ignored
         */
        selectCard(index) {
            if (this.isLocked) return null;

            var card = this.cards[index];
            if (card.isFlipped || card.isMatched) return null;

            card.flip();

            // First card of the pair
            if (this.firstCard === null) {
                this.firstCard = card;
                return { action: "first-flip", card: card };
            }

            // Second card of the pair
            this.secondCard = card;
            this.roundMoves++;
            this.isLocked = true;

            // Check for a match
            if (this.firstCard.emoji === this.secondCard.emoji) {
                this.firstCard.match();
                this.secondCard.match();
                this.matchedPairs++;

                var result = {
                    action: "match",
                    card1: this.firstCard,
                    card2: this.secondCard,
                    roundComplete: this.isRoundComplete()
                };

                this.firstCard  = null;
                this.secondCard = null;
                this.isLocked   = false;
                return result;
            }

            // Mismatch
            return {
                action: "mismatch",
                card1: this.firstCard,
                card2: this.secondCard
            };
        }

        /** Flip mismatched cards back down and unlock the board. */
        resetMismatch() {
            if (this.firstCard)  this.firstCard.unflip();
            if (this.secondCard) this.secondCard.unflip();
            this.firstCard  = null;
            this.secondCard = null;
            this.isLocked   = false;
        }
    }

    /* =========================================================
     *  MODEL — HistoryManager
     *  Reads and writes play history in localStorage.
     * ========================================================= */
    class HistoryManager {
        /**
         * @param {string} storageKey - The localStorage key to use
         */
        constructor(storageKey) {
            this.storageKey = storageKey;
        }

        /**
         * Load the history object from localStorage.
         * @return {object} { highScore: number, games: array }
         */
        load() {
            try {
                var raw = localStorage.getItem(this.storageKey);
                if (raw) return JSON.parse(raw);
            } catch (e) {
                // corrupted data — start fresh
            }
            return { highScore: 0, games: [] };
        }

        /**
         * Persist the history object to localStorage.
         * @param {object} history - The history object to save
         */
        save(history) {
            localStorage.setItem(this.storageKey, JSON.stringify(history));
        }

        /**
         * Record a completed game, update high score, keep last 5.
         * @param  {number} score - Final total score
         * @param  {number} moves - Final total moves
         * @return {object} Updated history object
         */
        addGame(score, moves) {
            var history = this.load();

            history.games.unshift({
                score: score,
                moves: moves,
                date: new Date().toLocaleDateString()
            });

            if (history.games.length > 5) {
                history.games = history.games.slice(0, 5);
            }

            if (score > history.highScore) {
                history.highScore = score;
            }

            this.save(history);
            return history;
        }
    }

    /* =========================================================
     *  VIEW — SplashRenderer
     *  Animated canvas banner for the splash screen.
     *  Dynamically sizes itself to the canvas element.
     * ========================================================= */
    class SplashRenderer {
        /**
         * @param {HTMLCanvasElement} canvas - The splash canvas element
         */
        constructor(canvas) {
            this.canvas    = canvas;
            this.ctx       = canvas.getContext("2d");
            this.particles = [];
            this.animFrame = null;
            this.startTime = 0;
            this.resize();
        }

        /** Match canvas internal resolution to its display size. */
        resize() {
            var rect     = this.canvas.getBoundingClientRect();
            this.width   = rect.width * window.devicePixelRatio;
            this.height  = rect.height * window.devicePixelRatio;
            this.canvas.width  = this.width;
            this.canvas.height = this.height;
            this.ctx.setTransform(
                window.devicePixelRatio, 0,
                0, window.devicePixelRatio,
                0, 0
            );
            this.displayWidth  = rect.width;
            this.displayHeight = rect.height;
        }

        /** Create floating emoji particles and start the animation loop. */
        start() {
            var emojis = ["🃏", "🎴", "🧠", "✨", "⭐", "💜", "💙"];

            for (var i = 0; i < 20; i++) {
                this.particles.push({
                    x:        Math.random() * this.displayWidth,
                    y:        Math.random() * this.displayHeight,
                    vx:       (Math.random() - 0.5) * 1.5,
                    vy:       (Math.random() - 0.5) * 1.5,
                    emoji:    emojis[Math.floor(Math.random() * emojis.length)],
                    size:     12 + Math.random() * (this.displayWidth * 0.03),
                    rotation: Math.random() * Math.PI * 2,
                    rotSpeed: (Math.random() - 0.5) * 0.04
                });
            }

            this.startTime = Date.now();
            this.animate();
        }

        /** Main animation loop. */
        animate() {
            var elapsed = (Date.now() - this.startTime) / 1000;
            var ctx = this.ctx;
            var w   = this.displayWidth;
            var h   = this.displayHeight;

            // Background gradient
            var bg = ctx.createLinearGradient(0, 0, w, h);
            bg.addColorStop(0, "#1a1a2e");
            bg.addColorStop(1, "#16213e");
            ctx.fillStyle = bg;
            ctx.fillRect(0, 0, w, h);

            // Draw particles
            for (var i = 0; i < this.particles.length; i++) {
                var p = this.particles[i];
                p.x += p.vx;
                p.y += p.vy;
                p.rotation += p.rotSpeed;

                if (p.x < -20)    p.x = w + 20;
                if (p.x > w + 20) p.x = -20;
                if (p.y < -20)    p.y = h + 20;
                if (p.y > h + 20) p.y = -20;

                ctx.save();
                ctx.translate(p.x, p.y);
                ctx.rotate(p.rotation);
                ctx.globalAlpha  = 0.45;
                ctx.font         = p.size + "px serif";
                ctx.textAlign    = "center";
                ctx.textBaseline = "middle";
                ctx.fillText(p.emoji, 0, 0);
                ctx.restore();
            }

            // Title — scales with canvas width
            var titleSize = Math.max(20, w * 0.08);
            var titleAlpha = Math.min(1, elapsed / 1.0);
            ctx.globalAlpha  = titleAlpha;
            ctx.shadowColor  = "#667eea";
            ctx.shadowBlur   = 25;
            ctx.fillStyle    = "#ffffff";
            ctx.font         = "bold " + titleSize + "px 'Segoe UI', sans-serif";
            ctx.textAlign    = "center";
            ctx.textBaseline = "middle";
            ctx.fillText("\uD83E\uDDE0 Memory Match", w / 2, h / 2 - titleSize * 0.5);
            ctx.shadowBlur = 0;

            // Subtitle
            var subSize  = Math.max(12, w * 0.035);
            var subAlpha = Math.min(1, Math.max(0, (elapsed - 0.8) / 0.8));
            ctx.globalAlpha = subAlpha;
            ctx.fillStyle   = "#a8a8d8";
            ctx.font        = subSize + "px 'Segoe UI', sans-serif";
            ctx.fillText("Test your memory in 3 rounds!", w / 2, h / 2 + titleSize * 0.3);

            // Decorative line
            var lineLen = w * 0.3;
            ctx.globalAlpha = subAlpha * 0.6;
            var lg = ctx.createLinearGradient(w / 2 - lineLen, 0, w / 2 + lineLen, 0);
            lg.addColorStop(0,   "transparent");
            lg.addColorStop(0.5, "#667eea");
            lg.addColorStop(1,   "transparent");
            ctx.strokeStyle = lg;
            ctx.lineWidth   = 2;
            ctx.beginPath();
            ctx.moveTo(w / 2 - lineLen, h / 2 + titleSize * 0.7);
            ctx.lineTo(w / 2 + lineLen, h / 2 + titleSize * 0.7);
            ctx.stroke();

            ctx.globalAlpha = 1;

            var self = this;
            this.animFrame = requestAnimationFrame(function () {
                self.animate();
            });
        }

        /** Stop the animation loop. */
        stop() {
            if (this.animFrame) {
                cancelAnimationFrame(this.animFrame);
                this.animFrame = null;
            }
        }
    }

    /* =========================================================
     *  VIEW — GameView
     *  All DOM manipulation happens here. The model never
     *  touches the DOM. The view never stores game state.
     * ========================================================= */
    class GameView {
        /** Cache references to every DOM element the view will touch. */
        constructor() {
            this.screens = {
                splash: document.getElementById("splash-screen"),
                game:   document.getElementById("game-screen"),
                end:    document.getElementById("end-screen")
            };

            this.roundDisplay   = document.getElementById("round-display");
            this.scoreDisplay   = document.getElementById("score-display");
            this.movesDisplay   = document.getElementById("moves-display");
            this.timerDisplay   = document.getElementById("timer-display");
            this.progressFill   = document.getElementById("progress-bar-fill");
            this.board          = document.getElementById("board");
            this.feedbackMsg    = document.getElementById("feedback-msg");
            this.overlay        = document.getElementById("overlay");
            this.helpPanel      = document.getElementById("help-panel");
            this.roundPopup     = document.getElementById("round-popup");
            this.roundPopupText = document.getElementById("round-popup-text");
            this.nextRoundBtn   = document.getElementById("next-round-btn");
            this.finalScoreText = document.getElementById("final-score-text");
            this.finalMovesText = document.getElementById("final-moves-text");
            this.highScoreText  = document.getElementById("high-score-text");
            this.historyList    = document.getElementById("history-list");
            this.soundBtn       = document.getElementById("sound-btn");
        }

        /* ---- Screen switching ---- */

        /**
         * Show the named screen and hide the other two.
         * @param {string} name - "splash", "game", or "end"
         */
        showScreen(name) {
            var keys = Object.keys(this.screens);
            for (var i = 0; i < keys.length; i++) {
                this.screens[keys[i]].classList.add("hidden");
            }
            this.screens[name].classList.remove("hidden");
        }

        /** Reveal the start button on the splash screen. */
        showStartButton() {
            document.getElementById("start-btn").classList.remove("hidden");
        }

        /* ---- Sound button ---- */

        /**
         * Update the sound toggle button appearance.
         * @param {boolean} enabled - Whether sound is on
         */
        updateSoundButton(enabled) {
            this.soundBtn.textContent = enabled ? "\uD83D\uDD0A" : "\uD83D\uDD07";
            if (enabled) {
                this.soundBtn.classList.remove("muted");
            } else {
                this.soundBtn.classList.add("muted");
            }
        }

        /* ---- Status bar ---- */

        /**
         * Update the round, score, and moves displays.
         * @param {number} round       - Current round (1-based)
         * @param {number} totalRounds - Total rounds
         * @param {number} score       - Running total score
         * @param {number} moves       - Moves this round
         */
        updateStatus(round, totalRounds, score, moves) {
            this.roundDisplay.textContent = "Round " + round + " / " + totalRounds;
            this.scoreDisplay.textContent = "Score: " + score;
            this.movesDisplay.textContent = "Moves: " + moves;
        }

        /**
         * Update the timer display.
         * @param {number} seconds - Elapsed seconds
         */
        updateTimer(seconds) {
            var m = Math.floor(seconds / 60);
            var s = seconds % 60;
            this.timerDisplay.textContent = "\u23F1 " + m + ":" + (s < 10 ? "0" : "") + s;
        }

        /**
         * Update the progress bar.
         * @param {number} matched - Matched pairs so far
         * @param {number} total   - Total pairs this round
         */
        updateProgress(matched, total) {
            var pct = total > 0 ? (matched / total) * 100 : 0;
            this.progressFill.style.width = pct + "%";
        }

        /* ---- Board rendering ---- */

        /**
         * Build the card grid. Cards start face-up (peek state).
         * @param {Card[]}   cards       - Array of Card objects
         * @param {number}   cols        - Grid columns
         * @param {number}   rows        - Grid rows
         * @param {function} onCardClick - Callback for card taps
         */
        buildBoard(cards, cols, rows, onCardClick) {
            this.board.innerHTML = "";
            this.board.style.gridTemplateColumns = "repeat(" + cols + ", 1fr)";

            for (var i = 0; i < cards.length; i++) {
                var el = document.createElement("div");
                el.classList.add("card", "peek");
                el.dataset.index = i;
                el.textContent = cards[i].emoji;

                (function (index) {
                    el.addEventListener("click", function () {
                        onCardClick(index);
                    });
                })(i);

                this.board.appendChild(el);
            }
        }

        /** Flip all cards face-down (end of peek phase). */
        flipAllDown() {
            var els = this.board.querySelectorAll(".card");
            for (var i = 0; i < els.length; i++) {
                els[i].classList.remove("peek");
                els[i].classList.add("face-down");
                els[i].textContent = "?";
            }
        }

        /**
         * Flip a single card face-up.
         * @param {number} index - Board position
         * @param {string} emoji - Emoji to display
         */
        flipCard(index, emoji) {
            var el = this.board.children[index];
            if (!el) return;
            el.classList.remove("face-down");
            el.classList.add("flipped");
            el.textContent = emoji;
        }

        /**
         * Flip a single card face-down (after mismatch).
         * @param {number} index - Board position
         */
        unflipCard(index) {
            var el = this.board.children[index];
            if (!el) return;
            el.classList.remove("flipped");
            el.classList.add("face-down");
            el.textContent = "?";
        }

        /**
         * Mark a card as permanently matched.
         * @param {number} index - Board position
         */
        markMatched(index) {
            var el = this.board.children[index];
            if (!el) return;
            el.classList.remove("flipped");
            el.classList.add("matched");
        }

        /* ---- Feedback ---- */

        /**
         * Flash a short feedback message.
         * @param {string} text - Message text
         * @param {string} type - "success" or "fail"
         */
        showFeedback(text, type) {
            this.feedbackMsg.textContent = text;
            this.feedbackMsg.className = "feedback " + type;
            var self = this;
            setTimeout(function () {
                self.feedbackMsg.textContent = "";
                self.feedbackMsg.className = "";
            }, 800);
        }

        /* ---- Overlay & popups ---- */

        showOverlay()  { this.overlay.classList.remove("hidden"); }
        hideOverlay()  { this.overlay.classList.add("hidden"); }

        showHelp() {
            this.showOverlay();
            this.helpPanel.classList.remove("hidden");
        }

        hideHelp() {
            this.helpPanel.classList.add("hidden");
            this.hideOverlay();
        }

        /**
         * Show the round-complete popup.
         * @param {string}  text    - Summary text
         * @param {boolean} isFinal - True if last round
         */
        showRoundPopup(text, isFinal) {
            this.roundPopupText.textContent = text;
            this.nextRoundBtn.textContent = isFinal
                ? "See Results"
                : "Next Round \u2192";
            this.showOverlay();
            this.roundPopup.classList.remove("hidden");
        }

        hideRoundPopup() {
            this.roundPopup.classList.add("hidden");
            this.hideOverlay();
        }

        /* ---- End screen ---- */

        /**
         * Populate and display the end screen.
         * @param {number} totalScore - Player final score
         * @param {number} totalMoves - Player total moves
         * @param {object} history    - History from HistoryManager
         */
        showEndScreen(totalScore, totalMoves, history) {
            this.finalScoreText.textContent = "Final Score: " + totalScore;
            this.finalMovesText.textContent = "Total Moves: " + totalMoves;

            var highText = "\uD83C\uDFC6 High Score: " + history.highScore;
            if (history.games.length > 0 &&
                history.games[0].score === history.highScore) {
                highText += " \u2B50 NEW!";
            }
            this.highScoreText.textContent = highText;

            this.historyList.innerHTML = "";
            if (history.games.length === 0) {
                var li = document.createElement("li");
                li.textContent = "No previous games.";
                this.historyList.appendChild(li);
            } else {
                for (var i = 0; i < history.games.length; i++) {
                    var g  = history.games[i];
                    var li = document.createElement("li");
                    li.textContent = g.date +
                        " \u2014 Score: " + g.score +
                        ", Moves: " + g.moves;
                    this.historyList.appendChild(li);
                }
            }

            this.showScreen("end");
        }
    }

    /* =========================================================
     *  CONTROLLER — GameController
     *  Wires model to view, handles events, timing, and audio.
     * ========================================================= */
    class GameController {
        /** Create model, view, audio, history, and initialize. */
        constructor() {
            this.model   = new GameState();
            this.view    = new GameView();
            this.sound   = new SoundManager();
            this.history = new HistoryManager("memoryMatchHistory");
            this.splash  = null;
            this.timerInterval = null;
            this.init();
        }

        /** Start splash animation and wire up buttons. */
        init() {
            var canvasEl = document.getElementById("splash-canvas");
            this.splash  = new SplashRenderer(canvasEl);
            this.splash.start();

            // Handle window resize so canvas stays sharp
            var self = this;
            window.addEventListener("resize", function () {
                if (self.splash && self.splash.animFrame) {
                    self.splash.resize();
                }
            });

            // Show start button after 2 seconds
            setTimeout(function () {
                self.view.showStartButton();
            }, 2000);

            this.attachEvents();
        }

        /** Attach every event listener (no inline handlers). */
        attachEvents() {
            var self = this;

            // Start button — also initialises audio context
            document.getElementById("start-btn")
                .addEventListener("click", function () {
                    self.sound.init();
                    self.sound.playClick();
                    self.startGame();
                });

            // Help button
            document.getElementById("help-btn")
                .addEventListener("click", function () {
                    self.sound.playClick();
                    self.view.showHelp();
                });

            // Close help
            document.getElementById("close-help-btn")
                .addEventListener("click", function () {
                    self.sound.playClick();
                    self.view.hideHelp();
                });

            // Overlay click closes help
            document.getElementById("overlay")
                .addEventListener("click", function () {
                    self.view.hideHelp();
                });

            // Sound toggle
            document.getElementById("sound-btn")
                .addEventListener("click", function () {
                    self.sound.init();
                    var nowEnabled = self.sound.toggle();
                    self.view.updateSoundButton(nowEnabled);
                    if (nowEnabled) self.sound.playClick();
                });

            // Next round / see results
            document.getElementById("next-round-btn")
                .addEventListener("click", function () {
                    self.sound.playClick();
                    self.view.hideRoundPopup();
                    if (self.model.isGameComplete()) {
                        self.endGame();
                    } else {
                        self.startRound();
                    }
                });

            // Play again
            document.getElementById("play-again-btn")
                .addEventListener("click", function () {
                    self.sound.playClick();
                    self.model.reset();
                    self.startGame();
                });
        }

        /* ---- Game flow ---- */

        /** Transition from splash to the first round. */
        startGame() {
            this.splash.stop();
            this.model.reset();
            this.view.showScreen("game");
            this.view.updateSoundButton(this.sound.enabled);
            this.startRound();
        }

        /** Initialize model for the round, build board, begin peek. */
        startRound() {
            this.model.initRound();
            var config = this.model.getCurrentConfig();
            var self   = this;

            this.view.updateStatus(
                this.model.currentRound + 1,
                this.model.totalRounds,
                this.model.totalScore,
                this.model.roundMoves
            );
            this.view.updateTimer(0);
            this.view.updateProgress(0, this.model.getTotalPairs());

            this.view.buildBoard(
                this.model.cards,
                config.cols,
                config.rows,
                function (index) { self.handleCardClick(index); }
            );

            // Peek time scales with pair count
            var peekTime = 1500 + this.model.getTotalPairs() * 150;

            setTimeout(function () {
                self.sound.playPeekEnd();
                self.view.flipAllDown();
                self.model.isLocked  = false;
                self.model.peekPhase = false;
                self.startTimer();
            }, peekTime);
        }

        /* ---- Timer ---- */

        startTimer() {
            this.stopTimer();
            var self = this;
            this.timerInterval = setInterval(function () {
                self.model.timerSeconds++;
                self.view.updateTimer(self.model.timerSeconds);
            }, 1000);
        }

        stopTimer() {
            if (this.timerInterval) {
                clearInterval(this.timerInterval);
                this.timerInterval = null;
            }
        }

        /* ---- Card interaction ---- */

        /**
         * Process a click on a card.
         * @param {number} index - Board position tapped
         */
        handleCardClick(index) {
            var result = this.model.selectCard(index);
            if (!result) return;

            var self = this;

            if (result.action === "first-flip") {
                this.sound.playFlip();
                this.view.flipCard(result.card.id, result.card.emoji);

            } else if (result.action === "match") {
                this.sound.playFlip();
                this.view.flipCard(result.card2.id, result.card2.emoji);

                setTimeout(function () {
                    self.sound.playMatch();
                    self.view.markMatched(result.card1.id);
                    self.view.markMatched(result.card2.id);
                    self.view.showFeedback("\u2705 Match!", "success");

                    self.view.updateStatus(
                        self.model.currentRound + 1,
                        self.model.totalRounds,
                        self.model.totalScore,
                        self.model.roundMoves
                    );
                    self.view.updateProgress(
                        self.model.matchedPairs,
                        self.model.getTotalPairs()
                    );

                    if (result.roundComplete) {
                        self.completeRound();
                    }
                }, 350);

            } else if (result.action === "mismatch") {
                this.sound.playFlip();
                this.view.flipCard(result.card2.id, result.card2.emoji);

                setTimeout(function () {
                    self.sound.playMismatch();
                    self.view.showFeedback("\u274C Try again", "fail");
                    self.view.unflipCard(result.card1.id);
                    self.view.unflipCard(result.card2.id);
                    self.model.resetMismatch();

                    self.view.updateStatus(
                        self.model.currentRound + 1,
                        self.model.totalRounds,
                        self.model.totalScore,
                        self.model.roundMoves
                    );
                }, 700);
            }
        }

        /* ---- Round / game completion ---- */

        completeRound() {
            this.stopTimer();
            this.model.advanceRound();

            var last = this.model.roundScores[this.model.roundScores.length - 1];
            var msg  = "Round " + last.round + " Complete!\n" +
                       "Score: " + last.score +
                       " | Moves: " + last.moves +
                       " | Time: " + last.time + "s";

            var isFinal = this.model.isGameComplete();
            var self    = this;

            setTimeout(function () {
                if (isFinal) {
                    self.sound.playGameComplete();
                } else {
                    self.sound.playRoundComplete();
                }
                self.view.showRoundPopup(msg, isFinal);
            }, 500);
        }

        endGame() {
            this.stopTimer();
            var updatedHistory = this.history.addGame(
                this.model.totalScore,
                this.model.totalMoves
            );
            this.view.showEndScreen(
                this.model.totalScore,
                this.model.totalMoves,
                updatedHistory
            );
        }
    }

    /* =========================================================
     *  LAUNCH
     * ========================================================= */
    new GameController();

});