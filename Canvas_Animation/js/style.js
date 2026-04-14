class Ball {

    constructor(x, y, xSpeed, ySpeed) {
        this.x = x;
        this.y = y;
        this.xSpeed = xSpeed;
        this.ySpeed = ySpeed;

        this.red = 255;
        this.green = 0;
        this.blue = 0;

        this.radius = 5;
    }

    setColor(red, green, blue) {
        this.red = red;
        this.green = green;
        this.blue = blue;
    }

    moveOneStep() {
        this.x += this.xSpeed;
        this.y += this.ySpeed;
    }

    draw(ctx) {
        ctx.fillStyle = "rgb(" + this.red + "," + this.green + "," + this.blue + ")";
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.closePath();
        ctx.fill();
    }
}

window.addEventListener("load", function () {

    const balls = [];
    const c = document.getElementById("animationCanvas");
    const ctx = c.getContext("2d");

    let timerId;

    for (let i = 0; i < 500; i++) {

        let x = Math.random() * c.width;
        let y = Math.random() * c.height;

        let xSpeed = Math.random() * 6 - 3;
        let ySpeed = Math.random() * 6 - 3;

        if (xSpeed === 0) xSpeed = 1;
        if (ySpeed === 0) ySpeed = 1;

        let ball = new Ball(x, y, xSpeed, ySpeed);

        let red = Math.floor(Math.random() * 256);
        let green = Math.floor(Math.random() * 256);
        let blue = Math.floor(Math.random() * 256);

        ball.setColor(red, green, blue);

        balls.push(ball);
    }

    function startAnimation(){
        timerId = setInterval(updateAnimation,16);
    }

    function updateAnimation(){

        ctx.clearRect(0,0,c.width,c.height);

        for(let b of balls){
            b.moveOneStep();
            b.draw(ctx);
        }

    }

    startAnimation();

});