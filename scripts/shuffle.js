"use strict";

let shuffleButton = document.getElementById("shuffle-button");
shuffleButton.onclick = () => {
    shufflePuzzles();
}

function shufflePuzzles() {
// Choose a random <tr> element
    let rows = document.getElementsByTagName("tr");
    let randomRow = rows[Math.floor(Math.random() * rows.length)];
    if (randomRow.id === "puzzle-browser-header") {
        shufflePuzzles(); // Select a new row if the random row is the header
    }

    // Navigate to the link in the random row
    let link = randomRow.getElementsByTagName("a")[0];
    window.location.href = link.href;
}