/*
 * ============================================
 * CS 1XD3 – Lab 8.2: Team Animation Exercise
 * Team Name : SEGA
 * Author(s) : Aarynjeet Gill & Shreyas Hegde
 * Date      : March 9, 2026
 * ============================================
 */


const canvas = document.getElementById("teamCanvas");
const ctx    = canvas.getContext("2d");

// ==========================
//  OBJECT 1 — Star-field
// ==========================
function createStar() {
    return {
        x:          Math.random() * canvas.width,
        y:          Math.random() * canvas.height,
        radius:     Math.random() * 2 + 0.5,
        speed:      Math.random() * 1.5 + 0.3,
        brightness: Math.random(),
        brightDir:  Math.random() < 0.5 ? 1 : -1
    };
}

const stars = [];
for (let i = 0; i < 120; i++) {
    stars.push(createStar());
}

function updateStar(s) {
    // Drift downward
    s.y += s.speed;
    if (s.y > canvas.height + s.radius) {
        s.y = -s.radius;
        s.x = Math.random() * canvas.width;
    }
    // Twinkle
    s.brightness += 0.02 * s.brightDir;
    if (s.brightness >= 1)   s.brightDir = -1;
    if (s.brightness <= 0.2) s.brightDir =  1;
}

function drawStar(s) {
    ctx.beginPath();
    ctx.arc(s.x, s.y, s.radius, 0, Math.PI * 2);
    ctx.fillStyle = "rgba(255,255,255," + s.brightness + ")";
    ctx.fill();
}

// ==========================
//  OBJECT 2 — Bouncing Shapes
// ==========================
function createShape(x, y, dx, dy, size, color, type) {
    return {
        x:        x,
        y:        y,
        dx:       dx,
        dy:       dy,
        size:     size,
        color:    color,
        type:     type,       // "circle" | "square" | "triangle"
        rotation: 0
    };
}

const shapes = [
    createShape(120, 80,   1.2,  0.8, 28, "rgba(0,96,168,0.35)",  "circle"),
    createShape(680, 420, -0.9,  1.1, 24, "rgba(0,150,220,0.30)", "square"),
    createShape(400, 100,  1.0, -0.7, 22, "rgba(255,180,0,0.25)", "triangle"),
    createShape(200, 380, -1.3, -1.0, 32, "rgba(0,70,140,0.30)",  "circle"),
    createShape(600, 250,  0.7,  1.3, 26, "rgba(0,120,200,0.28)", "square")
];

function updateShape(sh) {
    sh.x += sh.dx;
    sh.y += sh.dy;
    sh.rotation += 0.015;

    // Bounce off edges
    if (sh.x - sh.size < 0 || sh.x + sh.size > canvas.width)  sh.dx *= -1;
    if (sh.y - sh.size < 0 || sh.y + sh.size > canvas.height) sh.dy *= -1;
}

function drawShape(sh) {
    ctx.save();
    ctx.translate(sh.x, sh.y);
    ctx.rotate(sh.rotation);
    ctx.fillStyle = sh.color;

    if (sh.type === "circle") {
        ctx.beginPath();
        ctx.arc(0, 0, sh.size, 0, Math.PI * 2);
        ctx.fill();
    } else if (sh.type === "square") {
        ctx.fillRect(-sh.size, -sh.size, sh.size * 2, sh.size * 2);
    } else if (sh.type === "triangle") {
        ctx.beginPath();
        ctx.moveTo(0, -sh.size);
        ctx.lineTo(-sh.size, sh.size);
        ctx.lineTo(sh.size, sh.size);
        ctx.closePath();
        ctx.fill();
    }

    ctx.restore();
}

// ==========================
//  OBJECT 3 — Orbital Ring
// ==========================
const orbitalRing = {
    cx:       canvas.width / 2,
    cy:       canvas.height / 2 - 20,
    radiusX:  220,
    radiusY:  70,
    angle:    0,
    dotCount: 16,

    update: function () {
        this.angle += 0.012;
    },

    draw: function () {
        for (let i = 0; i < this.dotCount; i++) {
            const a  = this.angle + (i * Math.PI * 2 / this.dotCount);
            const dx = this.cx + Math.cos(a) * this.radiusX;
            const dy = this.cy + Math.sin(a) * this.radiusY;
            const r  = 4 + Math.sin(a * 2) * 2;

            const hue = (i * 22 + this.angle * 40) % 360;

            ctx.save();
            ctx.shadowColor = "hsl(" + hue + ",80%,60%)";
            ctx.shadowBlur  = 12;
            ctx.beginPath();
            ctx.arc(dx, dy, r, 0, Math.PI * 2);
            ctx.fillStyle = "hsl(" + hue + ",80%,60%)";
            ctx.fill();
            ctx.restore();
        }
    }
};

// ==========================
//  OBJECT 4 — SEGA Logo Text
// ==========================
const logoText = {
    text:        "SEGA",
    x:           canvas.width / 2,
    y:           canvas.height / 2 - 20,
    scale:       0,
    targetScale: 1,
    opacity:     0,
    glowSize:    0,
    glowDir:     1,

    update: function () {
        // Zoom in
        if (this.scale < this.targetScale) {
            this.scale += 0.015;
            if (this.scale > this.targetScale) this.scale = this.targetScale;
        }
        // Fade in
        if (this.opacity < 1) {
            this.opacity += 0.012;
            if (this.opacity > 1) this.opacity = 1;
        }
        // Pulsing glow
        this.glowSize += 0.6 * this.glowDir;
        if (this.glowSize > 25) this.glowDir = -1;
        if (this.glowSize < 0)  this.glowDir =  1;
    },

    draw: function () {
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.scale(this.scale, this.scale);

        // Glow
        ctx.shadowColor = "#0060a8";
        ctx.shadowBlur  = this.glowSize + 15;

        // Main text
        ctx.font         = "bold 130px Arial, sans-serif";
        ctx.textAlign    = "center";
        ctx.textBaseline = "middle";
        ctx.fillStyle    = "rgba(0,96,168," + this.opacity + ")";
        ctx.fillText(this.text, 0, 0);

        // White outline
        ctx.strokeStyle = "rgba(255,255,255," + (this.opacity * 0.75) + ")";
        ctx.lineWidth   = 2;
        ctx.strokeText(this.text, 0, 0);

        ctx.restore();
    }
};

// ==========================
//  OBJECT 5 — Subtitle Text
// ==========================
const subtitle = {
    text:    "Web Development Team",
    x:       canvas.width / 2,
    y:       canvas.height / 2 + 65,
    opacity: 0,
    offsetY: 20,

    update: function () {
        // Appears after the logo is mostly scaled in
        if (logoText.scale > 0.75) {
            if (this.opacity < 1)  this.opacity += 0.018;
            if (this.offsetY > 0)  this.offsetY -= 0.4;
            if (this.opacity > 1)  this.opacity = 1;
            if (this.offsetY < 0)  this.offsetY = 0;
        }
    },

    draw: function () {
        ctx.font      = "22px Arial, sans-serif";
        ctx.textAlign = "center";
        ctx.fillStyle = "rgba(200,200,200," + this.opacity + ")";
        ctx.fillText(this.text, this.x, this.y + this.offsetY);
    }
};

// ==========================
//  OBJECT 6 — Credit Line
// ==========================
const creditLine = {
    text:    "CS 1XD3 — Lab 8.2 Animation Exercise",
    x:       canvas.width / 2,
    y:       canvas.height / 2 + 105,
    opacity: 0,

    update: function () {
        if (subtitle.opacity > 0.6) {
            if (this.opacity < 1) this.opacity += 0.012;
            if (this.opacity > 1) this.opacity = 1;
        }
    },

    draw: function () {
        ctx.font      = "16px Arial, sans-serif";
        ctx.textAlign = "center";
        ctx.fillStyle = "rgba(140,140,140," + this.opacity + ")";
        ctx.fillText(this.text, this.x, this.y);
    }
};

// ==========================
//  OBJECT 7 — Scan Line
// ==========================
const scanLine = {
    y:      0,
    speed:  1.5,
    height: 2,

    update: function () {
        this.y += this.speed;
        if (this.y > canvas.height) this.y = 0;
    },

    draw: function () {
        ctx.fillStyle = "rgba(0,96,168,0.08)";
        ctx.fillRect(0, this.y, canvas.width, this.height);
    }
};

// ============================================================
//  MAIN ANIMATION LOOP
// ============================================================
function animate() {

    // ---- Clear frame ----
    ctx.fillStyle = "#080820";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // ---- Update every object ----
    stars.forEach(updateStar);
    shapes.forEach(updateShape);
    orbitalRing.update();
    logoText.update();
    subtitle.update();
    creditLine.update();
    scanLine.update();

    // ---- Draw every object (back-to-front) ----
    stars.forEach(drawStar);
    shapes.forEach(drawShape);
    scanLine.draw();
    orbitalRing.draw();
    logoText.draw();
    subtitle.draw();
    creditLine.draw();

    requestAnimationFrame(animate);
}

// ---- Start the animation ----
animate();