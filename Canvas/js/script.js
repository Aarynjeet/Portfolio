window.addEventListener("load", function () {
    const canvas = document.getElementById("testCanvas");
    const ctx = canvas.getContext("2d");

    const btn1 = document.getElementById("btn1");
    const btn2 = document.getElementById("btn2");
    const btn3 = document.getElementById("btn3");
    const btn4 = document.getElementById("btn4");

    let nextHouseX = 25;
    const houseSpacing = 110;
    const groundY = 360;

    drawBackground();

    function drawBackground() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // sky
        ctx.fillStyle = "rgb(5, 21, 66)";
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // ground/road
        ctx.fillStyle = "rgb(34, 49, 84)";
        ctx.fillRect(0, groundY, canvas.width, canvas.height - groundY);
    }

    function drawHouse(x) {
        const y = 250;

        ctx.strokeStyle = "rgb(240, 235, 210)";
        ctx.lineWidth = 3;

        // body
        ctx.strokeRect(x, y, 56, 70);

        // roof
        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.lineTo(x + 28, y - 35);
        ctx.lineTo(x + 56, y);
        ctx.closePath();
        ctx.stroke();

        // door
        ctx.strokeRect(x + 24, y + 35, 16, 35);

        // window
        ctx.strokeRect(x + 9, y + 20, 18, 18);
    }

    function drawCar() {
        const x = nextHouseX - houseSpacing + 8;
        const y = groundY + 8;

        ctx.strokeStyle = "lightskyblue";
        ctx.lineWidth = 3;

        // bottom body
        ctx.strokeRect(x + 10, y, 70, 22);

        // top body
        ctx.beginPath();
        ctx.moveTo(x + 12, y);
        ctx.lineTo(x + 32, y - 15);
        ctx.lineTo(x + 55, y - 15);
        ctx.lineTo(x + 70, y);
        ctx.stroke();

        // wheels
        ctx.beginPath();
        ctx.arc(x + 28, y + 22, 10, 0, Math.PI * 2);
        ctx.stroke();

        ctx.beginPath();
        ctx.arc(x + 60, y + 22, 10, 0, Math.PI * 2);
        ctx.stroke();
    }

    function drawStarShape(x, y, size, color) {
        ctx.fillStyle = color;
        ctx.beginPath();

        for (let i = 0; i < 10; i++) {
            let angle = (Math.PI / 5) * i - Math.PI / 2;
            let radius = i % 2 === 0 ? size : size / 2;
            let px = x + Math.cos(angle) * radius;
            let py = y + Math.sin(angle) * radius;

            if (i === 0) {
                ctx.moveTo(px, py);
            } else {
                ctx.lineTo(px, py);
            }
        }

        ctx.closePath();
        ctx.fill();
    }

    function drawRandomStar() {
        const x = Math.random() * (canvas.width - 40) + 20;
        const y = Math.random() * 180 + 20;
        const size = Math.random() * 8 + 8;

        const colors = [
            "gold",
            "violet",
            "plum",
            "deepskyblue",
            "lightpink",
            "mediumpurple"
        ];

        const color = colors[Math.floor(Math.random() * colors.length)];
        drawStarShape(x, y, size, color);
    }

    btn1.onclick = function () {
        drawBackground();
        nextHouseX = 25;
    };

    btn2.onclick = function () {
        drawHouse(nextHouseX);
        nextHouseX += houseSpacing;
    };

    btn3.onclick = function () {
        if (nextHouseX > 25) {
            drawCar();
        }
    };

    btn4.onclick = function () {
        drawRandomStar();
    };
});