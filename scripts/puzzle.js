"use strict";

const puzzleContainer = document.createElement("div");
puzzleContainer.classList.add("puzzle-container");
document.getElementById("game-view").appendChild(puzzleContainer);
document.getElementById("game-view").classList.add("game-view");

const gridContainer = document.createElement("div");
gridContainer.classList.add("grid-container");
puzzleContainer.appendChild(gridContainer);

class Puzzle {
    constructor(url) {
        // Fetch puzzle data from url
        fetch(url)
            .then((response) => response.json())
            .then((data) => populate(data));

        this.squares = []; // Stores all squares in the puzzle
        this.selectedSquare = null; // Stores the selected square
    }
}


class PuzzleSquare {
    constructor(x, y, style, clue, answer) {
        this.x = x; // x-coordinate
        this.y = y; // y-coordinate
        this.style = style; // Style of the square (e.g. "cell", "block", "circled")
        this.clue = clue; // Clue of the square (Number)
        this.answer = answer // Answer of the square (Character)
        this.element = document.createElement("span");
        this.element.classList.add("puzzle-square");
        gridContainer.appendChild(this.element);
        this.selected = false; // Whether the square is selected

        if (this.style === "block") {
            this.element.classList.add("block");
        }
        if (this.style === "circled") {
            this.element.classList.add("circled", "cell");
        }
        if (this.style === "cell") {
            this.element.classList.add("cell");
        }
        if (this.style === "invisible") {
            this.element.classList.add("invisible");
        }

        if (this.clue) {
            this.clueElement = document.createElement("span");
            this.element.appendChild(this.clueElement);
            this.clueElement.classList.add("puzzle-square-clue");
            this.clueElement.textContent = this.clue;
        }
        if (this.answer) {
            this.textElement = document.createElement("span")
            this.element.appendChild(this.textElement);
            this.textElement.classList.add("puzzle-square-text");
            this.answer = this.answer.toUpperCase();
            this.element.onclick = () => {
                this.select();
                checkPuzzle();
            }
        }
    }
    select() {
        for (const square of puzzle.squares) {
            square.deselect();
        }
        this.selected = true;
        this.element.classList.add("selected");
        puzzle.selectedSquare = this;

    }
    deselect() {
        this.selected = false;
        this.element.classList.remove("selected");
        puzzle.selectedSquare = undefined;
    }
}

// Display the control buttons beneath the puzzle grid (e.g. "Check", "Reveal", "Pause", "Reset", "Share", "Settings")
function displayControlButtons() {
    let controlButtons = document.createElement("span");
    controlButtons.classList.add("control-button-container");
    puzzleContainer.appendChild(controlButtons);

    let verifyButton = document.createElement("button");
    controlButtons.appendChild(verifyButton);
    verifyButton.textContent = "Verify";
    verifyButton.onclick = function () {
        verifyPuzzle();
    }

    let revealButton = document.createElement("button");
    controlButtons.appendChild(revealButton);
    revealButton.textContent = "Reveal";
    revealButton.onclick = function () {
        revealPuzzle();
    }

    let pauseButton = document.createElement("button");
    controlButtons.appendChild(pauseButton);
    pauseButton.textContent = "Pause";
    pauseButton.onclick = function () {
        pauseGame();
    }

    let resetButton = document.createElement("button");
    controlButtons.appendChild(resetButton);
    resetButton.textContent = "Reset";
    resetButton.onclick = function () {
        resetPuzzle();
    }

    let shareButton = document.createElement("button");
    controlButtons.appendChild(shareButton);
    shareButton.textContent = "Share";
    shareButton.onclick = function () {
        sharePuzzle();
    }
}

// Button-related functions

// Erases all incorrect squares
function verifyPuzzle() {
    for (const square of puzzle.squares) {
        if (square.style === "cell") {
            if (square.textElement.textContent !== square.answer) {
                square.textElement.textContent = undefined;
            }
        }
    }
    checkPuzzle();
}

// Reveals all squares
function revealPuzzle() {
    for (const square of puzzle.squares) {
        if (square.style === "cell") {
            square.textElement.textContent = square.answer;
        }
    }
    checkPuzzle();
}

// Pauses the game
function pauseGame() {
    window.alert("Game paused");
}

// Clears all squares
function resetPuzzle() {
    for (const square of puzzle.squares) {
        if (square.style === "cell") {
            square.textElement.textContent = undefined;
        }
    }

}

// Open a share dialog
function sharePuzzle() {
    if (navigator.share) {
        navigator.share({
            title: "Play crossword puzzle", url: 'window.location.href'
        }).catch(console.error);
    } else {
        console.error("Your browser does not support the WebShare API");
        // TODO: Show alternate share menu
    }
}

// Show the grid
function displayPuzzle(obj) {
    let squareX = 0; // x-coordinate of the current square
    let squareY = 0; // y-coordinate of the current square

    gridContainer.style.gridTemplateColumns = `repeat(${obj["grid"][1].length}, 1fr)`;
    // TODO: Set gridTemplateColumns to the maximum number of columns in the grid

    for (const i of obj["grid"]) {

        for (const j of i) {
            puzzle.squares.push(new PuzzleSquare(squareX, squareY, j[2], j[0], j[1]));
            squareX++;
        }
        squareY++;
        squareX = 0;
    }

}

// Check if the puzzle is solved
function checkPuzzle() {
    let solved = true;
    let full = true;
    for (const square of puzzle.squares) {
        if (square.style === "cell" && square.textElement.textContent !== square.answer) {
            solved = false;
        }
        if (square.style === "cell" && square.textElement.textContent === "") {
            full = false;
        }
    }
    if (solved) {
        showSolvedScreen();
    } else if (full === true) {
        window.alert("Puzzle not solved."); // Only show alert if every square is not filled
    }
}

// Display a "game over" alert
function showSolvedScreen() {
    window.alert("Puzzle solved!");

}

const infoContainer = document.createElement("div")
infoContainer.classList.add("info-container")
document.getElementById("game-view").appendChild(infoContainer);

async function populate(obj) {
    populateClues(obj);
    populateInfo(obj);
    displayPuzzle(obj);
    displayControlButtons();


}

function populateClues(obj) {

    let acrossLabel = document.createElement("h2");
    acrossLabel.classList.add("info-header");
    infoContainer.appendChild(acrossLabel);
    acrossLabel.textContent = "Across";

    for (const [clueTag, clueText] of Object.entries(obj["clues"]["Across"])) {

        let clueTextbox = document.createElement("a");
        clueTextbox.classList.add("clue-text");
        clueTextbox.href = "#"; // Change this to JS function later

        infoContainer.appendChild(clueTextbox);
        clueTextbox.innerHTML = `<span class="clue-label">${clueTag}: </span>${clueText}`;

    }

    let downLabel = document.createElement("h2");
    downLabel.classList.add("info-header");
    infoContainer.appendChild(downLabel);
    downLabel.textContent = "Down";
    for (const [clueTag, clueText] of Object.entries(obj["clues"]["Down"])) {

        let clueTextbox = document.createElement("a");
        clueTextbox.classList.add("clue-text");
        clueTextbox.href = "#"; // Change this to JS function later

        infoContainer.appendChild(clueTextbox);
        clueTextbox.innerHTML = `<span class="clue-label">${clueTag}: </span>${clueText}`;
    }

}

function populateInfo(obj) {
    let infoSeparator = document.createElement("hr");
    infoSeparator.classList.add("info-separator");
    infoContainer.appendChild(infoSeparator);

    let infoLabel = document.createElement("h2");
    infoLabel.classList.add("info-header");
    infoContainer.appendChild(infoLabel);
    infoLabel.textContent = "Info";

    let infoList = document.createElement("dl");
    infoList.classList.add("puzzle-info");
    infoContainer.appendChild(infoList)

    for (const [infoTag, infoText] of Object.entries(obj["info"])) {

        let infoLabel = document.createElement("dt");
        infoLabel.classList.add("info-label");
        infoLabel.textContent = infoTag;
        infoList.appendChild(infoLabel);

        let infoTextbox = document.createElement("dd");
        infoTextbox.classList.add("info-text");
        infoTextbox.textContent = infoText;
        infoList.appendChild(infoTextbox);
    }

}

let puzzle = new Puzzle("https://raw.githubusercontent.com/alexis-martel/Open-Crossword/da94017c08aa038694eef9df1f4019d4f11faea9/data/crossword.json");

document.addEventListener("keyup", (e) => {

    let pressedKey = String(e.key)
    if (pressedKey === "Backspace") {
        puzzle.selectedSquare.textElement.textContent = undefined;
        return
    }

    let found = pressedKey.match(/[a-z]/gi)
    if (!found || found.length > 1) {
        return
    } else {
        puzzle.selectedSquare.textElement.textContent = pressedKey.toUpperCase();
    }
    checkPuzzle();
})
