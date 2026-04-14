// Create one lottery ball object
function makeBall() {
  return {
    color: Math.random() < 0.5 ? "red" : "white",
    points: Math.floor(Math.random() * 101) // 0..100
  };
}

/* -------------------------
   Part B: Game with 100 balls
-------------------------- */
const balls = [];
for (let i = 0; i < 100; i++) {
  balls.push(makeBall());
}

let score = 0;
const drawn = new Array(100).fill(false);

while (true) {
  const input = prompt(
    "Enter an integer 0–99 to draw a ball.\nPress Cancel to quit."
  );

  if (input === null) break;

  const idx = Number(input);

  if (!Number.isInteger(idx)) {
    alert("Invalid input. Enter a whole number from 0 to 99.");
    continue;
  }

  if (idx < 0 || idx > 99) {
    alert("Invalid ball. Enter a number from 0 to 99.");
    continue;
  }

  if (drawn[idx]) {
    alert("You already drew that ball. Try a different number.");
    continue;
  }

  drawn[idx] = true;

  const ball = balls[idx];
  alert(`You drew ball #${idx}!\nColor: ${ball.color}\nPoints: ${ball.points}`);

  if (ball.color === "red") {
    score -= ball.points;
    alert(`Red ball! -${ball.points} points.\nGame over.`);
    break;
  } else {
    score += ball.points;
    alert(`White ball! +${ball.points} points.\nCurrent score: ${score}`);
  }
}

alert(`Total score: ${score}`);