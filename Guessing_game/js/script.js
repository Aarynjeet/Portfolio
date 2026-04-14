class GuessingGame {

    constructor(secret = Math.floor(Math.random() * 100 + 1), guesses = 0) {
        this.secret = secret;
        this.guesses = guesses;
    }

    guess(num) {

        this.guesses++;

        if(num === this.secret){
            return "correct";
        }

        if(num > this.secret){
            return "high";
        }

        return "low";
    }
}

let savedGame = localStorage.getItem("guessingGame");
let game;

if(savedGame){

    let data = JSON.parse(savedGame);
    game = new GuessingGame(data.secret, data.guesses);

}
else{

    game = new GuessingGame();
    localStorage.setItem("guessingGame", JSON.stringify(game));

}

const form = document.getElementById("guessForm");
const guessInput = document.getElementById("guessInput");
const message = document.getElementById("message");
const guessCount = document.getElementById("guessCount");

guessCount.textContent = "Guesses: " + game.guesses;

form.addEventListener("submit", function(e){

    e.preventDefault();

    let userGuess = Number(guessInput.value);

    let result = game.guess(userGuess);

    guessCount.textContent = "Guesses: " + game.guesses;

    if(result === "correct"){

        message.textContent = "Correct! Starting new game.";
        game = new GuessingGame();

    }
    else if(game.guesses >= 10){

        message.textContent = "Game Over. Starting new game.";
        game = new GuessingGame();

    }
    else if(result === "high"){

        message.textContent = "Too high.";

    }
    else{

        message.textContent = "Too low.";

    }

    localStorage.setItem("guessingGame", JSON.stringify(game));

    guessInput.value = "";

});