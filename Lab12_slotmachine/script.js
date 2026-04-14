function spin() {

let bet = document.getElementById("bet").value;

fetch("spin.php", {
method: "POST",
headers: {
"Content-Type": "application/x-www-form-urlencoded"
},
body: "bet=" + bet
})
.then(response => response.json())
.then(data => {

if (data.error) {
document.getElementById("result").textContent = data.error;
return;
}

document.getElementById("slot1").textContent = data.slots[0];
document.getElementById("slot2").textContent = data.slots[1];
document.getElementById("slot3").textContent = data.slots[2];

document.getElementById("credits").textContent = data.credits;

document.getElementById("result").textContent = data.message;

});
}