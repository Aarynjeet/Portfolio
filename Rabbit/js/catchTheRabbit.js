window.onload = function () {
    let rabbits = [
        document.getElementById("rabbit1"),
        document.getElementById("rabbit2"),
        document.getElementById("rabbit3"),
        document.getElementById("rabbit4")
    ];

    let noeggs = document.getElementById("noeggs");
    let slow = document.getElementById("slow");

    let current = 0;
    let attempts = 0;

    function moveRabbit() {
        attempts++;

        rabbits[current].style.visibility = "hidden";
        current = (current + 1) % 4;
        rabbits[current].style.visibility = "visible";

        if (attempts >= 4) {
            noeggs.style.visibility = "visible";
        }

        if (attempts >= 20) {
            slow.style.visibility = "visible";
        }
    }

    for (let rabbit of rabbits) {
        rabbit.addEventListener("mouseover", moveRabbit);
    }
};