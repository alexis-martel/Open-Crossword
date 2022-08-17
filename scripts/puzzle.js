"use strict";

const puzzleContainer = document.createElement("div");
puzzleContainer.classList.add("puzzle-container");
document.getElementById("game-view").appendChild(puzzleContainer);
document.getElementById("game-view").classList.add("game-view");

const gridContainer = document.createElement("div");
gridContainer.classList.add("grid-container");
puzzleContainer.appendChild(gridContainer);

const language = getLanguageData("languages/lang-eng.json");

class Puzzle {
    constructor(url) {
        // Fetch puzzle data from url
        fetch(url)
            .then((response) => response.json())
            .then((data) => populate(data));

        this.squares = []; // Stores all squares in the puzzle
        this.clues = []; // Stores all clues in the puzzle
        this.selectedSquare = null; // Stores the selected square
        this.selectedClue = null; // Stores the selected clue
        this.selectionDirection = "across"; // Stores the direction of the selection ("across" or "down")
        this.puzzleStopwatch = setInterval(incrementStopwatchTime, 1000);
        this.puzzleSeconds = 0;
    }

    selectNextSquare() {
        // Selects the next square in the puzzle
        if (this.selectionDirection === "across") {
            this.selectSquare(this.selectedSquare.x + 1, this.selectedSquare.y);
        } else if (this.selectionDirection === "down") {
            this.selectSquare(this.selectedSquare.x, this.selectedSquare.y + 1);
        }
    }

    selectSquare(x, y) {
        // Selects the square at the given x and y coordinates
        for (const square of this.squares) {
            if (square.x === x && square.y === y) {
                square.select();
            }
        }
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
            this.element.classList.add("invisible", "block");
        }

        if (this.clue) {
            this.clueElement = document.createElement("span");
            this.element.appendChild(this.clueElement);
            this.clueElement.classList.add("puzzle-square-clue");
            this.clueElement.textContent = this.clue;
        }
        if (this.answer) {
            this.textElement = document.createElement("input");
            this.textElement.type = "text";
            this.textElement.maxLength = 1;
            this.textElement.spellcheck = false;
            this.textElement.setAttribute("autocorrect", "off");
            this.textElement.setAttribute("autocomplete", "off");
            this.textElement.setAttribute("autocapitalize", "characters");
            this.element.appendChild(this.textElement);
            this.textElement.classList.add("puzzle-square-text");
            this.answer = this.answer.toUpperCase();
            this.element.onclick = () => {
                if (this.selected) {
                    if (puzzle.selectionDirection === "across") {
                        puzzle.selectionDirection = "down";
                    } else if (puzzle.selectionDirection === "down") {
                        puzzle.selectionDirection = "across";
                    }
                }
                this.select();

            }
        }
    }

    select() {
        for (const square of puzzle.squares) {
            square.deselect();
            square.element.classList.remove("highlighted");
        }
        this.selected = true;
        this.element.classList.add("selected");
        this.textElement.focus();
        puzzle.selectedSquare = this;


        // Highlight all squares in the same row or column as the selected square
        for (const square of puzzle.squares) {
            if (square.y === this.y && puzzle.selectionDirection === "across" && square.style === "cell") {
                square.element.classList.add("highlighted");
            } else if (square.x === this.x && puzzle.selectionDirection === "down" && square.style === "cell") {
                square.element.classList.add("highlighted");
            }
        }

        if (this.clue) {
            for (const clue of puzzle.clues) {
                if (clue.number === this.clue && this.style === "cell" && puzzle.selectionDirection === clue.direction) {
                    clue.select();
                }
            }
        }

    }

    deselect() {
        this.selected = false;
        this.element.classList.remove("selected");
        puzzle.selectedSquare = undefined;
    }
}

class PuzzleClue {
    constructor(clueTag, direction, clueText, parentElement) {
        this.element = document.createElement("li");
        this.element.classList.add("clue");
        this.tagElement = document.createElement("span");
        this.tagElement.classList.add("clue-tag");
        this.textElement = document.createElement("span");
        this.textElement.classList.add("clue-text");

        this.tagElement.textContent = clueTag;
        this.textElement.textContent = clueText;

        parentElement.appendChild(this.element);
        this.element.appendChild(this.tagElement);
        this.element.appendChild(this.textElement);

        this.number = parseInt(clueTag, 10);
        this.direction = direction;
        this.content = clueText;
        this.selected = false;
        this.element.onclick = () => {
            this.select();
            for (const square of puzzle.squares) {
                if (square.clue === this.number && square.style === "cell") {
                    square.select();
                }
            }
        }
    }

    select() {
        for (const clue of puzzle.clues) {
            clue.deselect();
        }
        this.element.classList.add("selected");
        puzzle.selectedClue = this;
        puzzle.selectionDirection = this.direction;
    }

    deselect() {
        this.selected = false;
        this.element.classList.remove("selected");
        puzzle.selectedClue = undefined;
    }
}

class InfoItem {
    constructor(title, text, parentElement) {
        this.descriptionTermElement = document.createElement("dt");
        this.descriptionTermElement.classList.add("info-label")
        this.descriptionTermElement.textContent = title;
        this.descriptionDetailElement = document.createElement("dd");
        this.descriptionDetailElement.classList.add("info-text");
        this.descriptionDetailElement.textContent = text;
        parentElement.appendChild(this.descriptionTermElement);
        parentElement.appendChild(this.descriptionDetailElement);
    }

}

// Get the language data from the specified URL
async function getLanguageData(url) {
    const request = new Request(url);
    const response = await fetch(request);
    return await response.json();
}

// Display the control buttons beneath the puzzle grid (e.g. "Check", "Reveal", "Pause", "Reset", "Share", "Settings")
function displayControlButtons() {
    let controlButtons = document.createElement("span");
    controlButtons.classList.add("control-button-container");
    puzzleContainer.appendChild(controlButtons);

    let verifyButton = document.createElement("button");
    controlButtons.appendChild(verifyButton);
    verifyButton.textContent = "done";
    verifyButton.classList.add("material-icons");
    verifyButton.onclick = () => {
        verifyPuzzle();
    }

    let revealButton = document.createElement("button");
    controlButtons.appendChild(revealButton);
    revealButton.textContent = "visibility";
    revealButton.classList.add("material-icons");
    revealButton.onclick = () => {
        revealPuzzle();
    }

    let resetButton = document.createElement("button");
    controlButtons.appendChild(resetButton);
    resetButton.textContent = "restart_alt";
    resetButton.classList.add("material-icons");
    resetButton.onclick = () => {
        resetPuzzle();
    }

    let shareButton = document.createElement("button");
    controlButtons.appendChild(shareButton);
    shareButton.textContent = "ios_share";
    shareButton.classList.add("material-icons");
    shareButton.onclick = () => {
        sharePuzzle();
    }

    let pauseButton = document.createElement("button");
    controlButtons.appendChild(pauseButton);
    let stopwatch = document.createElement("span");
    stopwatch.classList.add("stopwatch");
    stopwatch.id = "stopwatch";
    pauseButton.textContent = "pause";
    stopwatch.textContent = "00:00";
    pauseButton.classList.add("material-icons");
    pauseButton.appendChild(stopwatch);
    pauseButton.onclick = () => {
        pauseGame();
    }
}

// Button-related functions

// Erases all incorrect squares
function verifyPuzzle() {
    for (const square of puzzle.squares) {
        if (square.style === "cell") {
            if (square.textElement.value.toUpperCase() !== square.answer.toUpperCase()) {
                square.textElement.value = "";
            }
        }
    }
    checkPuzzle();
}

// Reveals all squares
function revealPuzzle() {
    if (window.confirm("Are you sure you want to reveal the puzzle?")) {
        for (const square of puzzle.squares) {
            if (square.style === "cell") {
                square.textElement.value = square.answer;
            }
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
    if (window.confirm("Are you sure you want to reset the puzzle?")) {
        for (const square of puzzle.squares) {
            if (square.style === "cell") {
                square.textElement.value = "";
            }
        }
        puzzle.puzzleSeconds = 0;
    }

}

// Open a share dialog
function sharePuzzle() {
    if (navigator.share) {
        navigator.share({
            title: "OpenCrossword", url: window.location.href
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
        if (square.style === "cell" && square.textElement.value.toUpperCase() !== square.answer.toUpperCase()) {
            solved = false;
        }
        if (square.style === "cell" && square.textElement.value === "") {
            full = false;
        }
    }
    if (solved) {
        showSolvedScreen();
    } else if (full === true) {
        showNotSolvedScreen(); // Only show alert if every square is not filled
    }
}

// Display a "game over" alert
function showSolvedScreen() {
    endStopwatch();
    window.alert(`Congratulations! You solved the puzzle in ${document.getElementById("stopwatch").textContent} seconds.`);
}

function showNotSolvedScreen() {
    window.alert("Puzzle not solved.");
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

    let acrossClues = document.createElement("menu");
    acrossClues.classList.add("clue-list");
    infoContainer.appendChild(acrossClues);

    for (const [clueTag, clueText] of Object.entries(obj["clues"]["across"])) {
        puzzle.clues.push(new PuzzleClue(clueTag, "across", clueText, acrossClues));
    }

    let downLabel = document.createElement("h2");
    downLabel.classList.add("info-header");
    infoContainer.appendChild(downLabel);
    downLabel.textContent = "Down";

    let downClues = document.createElement("menu");
    acrossClues.classList.add("clue-list");
    infoContainer.appendChild(downClues);

    for (const [clueTag, clueText] of Object.entries(obj["clues"]["down"])) {
        puzzle.clues.push(new PuzzleClue(clueTag, "down", clueText, downClues));
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

    new InfoItem("Title", obj["info"]["title"], infoList); // Title
    new InfoItem("Author", obj["info"]["author"], infoList); // Author
    new InfoItem("Description", obj["info"]["description"], infoList); // Description
    new InfoItem("Tags", obj["info"]["tags"], infoList); // Tags
    new InfoItem("Size", obj["info"]["size"], infoList); // Size
    new InfoItem("Date Published", obj["info"]["date_published"], infoList); // Date Published
    new InfoItem("Language", obj["info"]["language"], infoList); // Language


}

Number.prototype.toHumanReadable = function () {
    let hours = Math.floor(this / 3600);
    let minutes = Math.floor((this - (hours * 3600)) / 60);
    let seconds = this - (hours * 3600) - (minutes * 60);

    if (hours < 10) {
        hours = "0" + hours;
    }
    if (minutes < 10) {
        minutes = "0" + minutes;
    }
    if (seconds < 10) {
        seconds = "0" + seconds;
    }
    if (hours > 0) {
        return hours + ':' + minutes + ':' + seconds;
    } else {
        return minutes + ':' + seconds;
    }
}

document.addEventListener("keydown", (e) => {

    let pressedKey = String(e.key);
    // Clear contents of the textbox on new keypress
    let found = pressedKey.match(/[a-z]/gi)
    if (!found || found.length > 1) {

    } else {
        puzzle.selectedSquare.textElement.value = "";
    }
})

document.addEventListener("keyup", (e) => {

    let pressedKey = String(e.key);

    let found = pressedKey.match(/[a-z]/gi)
    if (!found || found.length > 1) {
        return;
    } else {
        puzzle.selectNextSquare();
    }
    checkPuzzle();
})

function incrementStopwatchTime() {
    document.getElementById("stopwatch").textContent = puzzle.puzzleSeconds.toHumanReadable();
    puzzle.puzzleSeconds += 1;
}

function endStopwatch() {
    clearInterval(puzzle.puzzleStopwatch);
}

let params = new URLSearchParams(document.location.search);
let puzzleID = params.get("p").toString();
let puzzleURL = "https://raw.githubusercontent.com/alexis-martel/Open-Crossword/master/data/puzzles" + puzzleID + ".json";
let puzzle = new Puzzle(puzzleURL);
