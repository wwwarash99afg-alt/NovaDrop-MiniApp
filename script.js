let points = 0;

function completeTask(task, reward) {
  points += reward;

  document.getElementById("points").innerHTML = points;

  alert(task + " completed! +" + reward + " points");
}

function connectWallet() {
  completeTask("TON Wallet", 100);
}

function joinChannel() {
  window.open("https://t.me/NovaDropOfficial", "_blank");
  completeTask("Join Channel", 100);
}

function inviteFriends() {
  completeTask("Invite Friends", 50);
}

function dailyReward() {
  completeTask("Daily Check-in", 10);
}
