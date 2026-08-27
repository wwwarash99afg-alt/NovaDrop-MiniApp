let points = 0;

function completeTask(task) {
  points += 100;

  document.getElementById("points").innerHTML =
    "Points: " + points;

  alert(task + " completed! +100 points");
}

function connectWallet() {
  alert("TON Wallet connection started...");
}

function joinChannel() {
  window.open("https://t.me/NovaDropOfficial", "_blank");
}
