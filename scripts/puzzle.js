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
            // Check if the next square is a cell
            for (const square of this.squares) {
                if (square.x === this.selectedSquare.x + 1 && square.y === this.selectedSquare.y && square.style === "cell") {
                    square.select();
                    return;
                } else if (square.x === this.selectedSquare.x + 1 && square.y === this.selectedSquare.y && square.style === "block") {
                    // Select the next cell
                    for (const square of this.squares) {
                        if (square.x > this.selectedSquare.x && square.y === this.selectedSquare.y && square.style === "cell") {
                            square.select();
                            return;
                        }
                    }
                }
            }
        } else if (this.selectionDirection === "down") {

            // Check if the next square is a cell
            for (const square of this.squares) {
                if (square.y === this.selectedSquare.y + 1 && square.x === this.selectedSquare.x && square.style === "cell") {
                    square.select();
                    return;
                } else if (square.y === this.selectedSquare.y + 1 && square.x === this.selectedSquare.x && square.style === "block") {
                    // Select the next cell
                    for (const square of this.squares) {
                        if (square.y > this.selectedSquare.y && square.x === this.selectedSquare.x && square.style === "cell") {
                            square.select();
                            return;
                        }
                    }
                }
            }

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
        puzzle.selectedSquare = this;
        this.textElement.focus();


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
    constructor(clueTag, direction, clueHTML, parentElement) {
        this.element = document.createElement("li");
        this.element.classList.add("clue");
        this.tagElement = document.createElement("span");
        this.tagElement.classList.add("clue-tag");
        this.textElement = document.createElement("span");
        this.textElement.classList.add("clue-text");

        this.tagElement.textContent = clueTag;
        this.textElement.innerHTML = clueHTML;

        parentElement.appendChild(this.element);
        this.element.appendChild(this.tagElement);
        this.element.appendChild(this.textElement);

        this.number = parseInt(clueTag, 10);
        this.direction = direction;
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

class ControlButton {
    constructor(title, icon, parentElement) {
        this.element = document.createElement("button");
        this.element.title = title;
        this.element.innerHTML = icon;
        parentElement.appendChild(this.element);
    }
}

const icon = {
    "pauseSVG": `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48">
    <path d="M28.25 38V10H36v28ZM12 38V10h7.75v28Z"/>
</svg>`, "resetSVG": `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48">
    <path d="M24 44q-3.75 0-7.025-1.4-3.275-1.4-5.725-3.85Q8.8 36.3 7.4 33.025 6 29.75 6 26h3q0 6.25 4.375 10.625T24 41q6.25 0 10.625-4.375T39 26q0-6.25-4.25-10.625T24.25 11H23.1l3.65 3.65-2.05 2.1-7.35-7.35 7.35-7.35 2.05 2.05-3.9 3.9H24q3.75 0 7.025 1.4 3.275 1.4 5.725 3.85 2.45 2.45 3.85 5.725Q42 22.25 42 26q0 3.75-1.4 7.025-1.4 3.275-3.85 5.725-2.45 2.45-5.725 3.85Q27.75 44 24 44Z"/>
</svg>`, "revealSVG": `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48">
    <path d="M24 31.5q3.55 0 6.025-2.475Q32.5 26.55 32.5 23q0-3.55-2.475-6.025Q27.55 14.5 24 14.5q-3.55 0-6.025 2.475Q15.5 19.45 15.5 23q0 3.55 2.475 6.025Q20.45 31.5 24 31.5Zm0-2.9q-2.35 0-3.975-1.625T18.4 23q0-2.35 1.625-3.975T24 17.4q2.35 0 3.975 1.625T29.6 23q0 2.35-1.625 3.975T24 28.6Zm0 9.4q-7.3 0-13.2-4.15Q4.9 29.7 2 23q2.9-6.7 8.8-10.85Q16.7 8 24 8q7.3 0 13.2 4.15Q43.1 16.3 46 23q-2.9 6.7-8.8 10.85Q31.3 38 24 38Zm0-15Zm0 12q6.05 0 11.125-3.275T42.85 23q-2.65-5.45-7.725-8.725Q30.05 11 24 11t-11.125 3.275Q7.8 17.55 5.1 23q2.7 5.45 7.775 8.725Q17.95 35 24 35Z"/>
</svg>`, "shareSVG": `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48">
    <path d="M11 46q-1.2 0-2.1-.9Q8 44.2 8 43V17.55q0-1.2.9-2.1.9-.9 2.1-.9h8.45v3H11V43h26V17.55h-8.55v-3H37q1.2 0 2.1.9.9.9.9 2.1V43q0 1.2-.9 2.1-.9.9-2.1.9Zm11.45-15.35V7.8l-4.4 4.4-2.15-2.15L23.95 2 32 10.05l-2.15 2.15-4.4-4.4v22.85Z"/>
</svg>`, "verifySVG": `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48">
    <path d="M18.9 35.7 7.7 24.5l2.15-2.15 9.05 9.05 19.2-19.2 2.15 2.15Z"/>
</svg>`
}

// Get the language data from the specified URL
async function getLanguageData(url) {
    const request = new Request(url);
    const response = await fetch(request);
    return await response.json();
}

// Display the control buttons beneath the puzzle grid (e.g. "Check", "Reveal", "Pause", "Reset", "Share", "Settings")
function displayControlButtons() {
    let controlButtons = document.createElement("nav");
    controlButtons.classList.add("control-button-container");
    puzzleContainer.appendChild(controlButtons);

    let verifyButton = new ControlButton("Verify", icon["verifySVG"], controlButtons);
    verifyButton.element.onclick = () => {
        verifyPuzzle();
    }

    let revealButton = new ControlButton("Reveal", icon["revealSVG"], controlButtons);
    revealButton.element.onclick = () => {
        revealPuzzle();
    }

    let resetButton = new ControlButton("Reset", icon["resetSVG"], controlButtons);
    resetButton.element.onclick = () => {
        resetPuzzle();
    }

    let shareButton = new ControlButton("Share", icon["shareSVG"], controlButtons);
    shareButton.element.onclick = () => {
        sharePuzzle();
    }

    let pauseButton = new ControlButton("Pause", icon["pauseSVG"], controlButtons);
    let stopwatch = document.createElement("span");
    stopwatch.classList.add("stopwatch");
    stopwatch.id = "stopwatch";
    stopwatch.textContent = "00:00";
    pauseButton.element.appendChild(stopwatch);
    pauseButton.element.onclick = () => {
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

    gridContainer.style.gridTemplateColumns = `repeat(${obj["grid"][0].length}, 75px)`;
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
    window.alert(`Congratulations! You solved the puzzle in ${document.getElementById("stopwatch").textContent}!`);
}

function showNotSolvedScreen() {
    window.alert("Puzzle not solved.");
}

const infoContainer = document.createElement("div")
infoContainer.classList.add("info-container")
document.getElementById("game-view").appendChild(infoContainer);

async function populate(obj) {
    displayPuzzle(obj);
    populateClues(obj);
    populateInfo(obj);
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
    downClues.classList.add("clue-list");
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
    infoContainer.appendChild(infoList);

    // Set the puzzle's descriptive size (e.g. "Extra Small", "Small", "Medium", "Large", "Extra Large")
    let sizeName = "Error";
    switch (true) {
        case(puzzle.squares.length <= 9):
            sizeName = "Extra Small";
            break;
        case(puzzle.squares.length <= 36 && puzzle.squares.length > 9):
            sizeName = "Small";
            break;
        case(puzzle.squares.length <= 81 && puzzle.squares.length > 36):
            sizeName = "Medium";
            break;
        case(puzzle.squares.length <= 144 && puzzle.squares.length > 81):
            sizeName = "Large";
            break;
        case(puzzle.squares.length > 144):
            sizeName = "Extra Large";
            break;

    }

    new InfoItem("Title", obj["info"]["title"], infoList); // Title
    new InfoItem("Author", obj["info"]["author"], infoList); // Author
    new InfoItem("Description", obj["info"]["description"], infoList); // Description
    new InfoItem("Tags", obj["info"]["tags"], infoList); // Tags
    new InfoItem("Size", sizeName, infoList); // Size
    new InfoItem("Date Published", obj["info"]["date_published"], infoList); // Date Published
    new InfoItem("Language", obj["info"]["language"], infoList); // Language

    // Set the page's title to the puzzle's title
    document.title = `${obj["info"]["title"]}, by ${obj["info"]["author"]} - OpenCrossword`;
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
let puzzle;

if (params.has("p")) {
    let puzzleID = params.get("p").toString();
    let puzzleURL = "https://raw.githubusercontent.com/alexis-martel/Open-Crossword/master/data/puzzles/" + puzzleID + ".json";
    puzzle = new Puzzle(puzzleURL);
} else if (params.has("d")) {
    let puzzleData = params.get("d").toString();
    puzzle = new Puzzle("");
    console.log(puzzleData);
    populate(JSON.parse(puzzleData));
}