"use strict";

const puzzleContainer = document.createElement("div");
puzzleContainer.classList.add("oc-puzzle-container");
document.getElementById("oc-game-view").appendChild(puzzleContainer);
document.getElementById("oc-game-view").classList.add("oc-game-view");

const gridContainer = document.createElement("div");
gridContainer.classList.add("oc-grid-container");
puzzleContainer.appendChild(gridContainer);

class Puzzle {
    constructor(obj) {
        this.obj = obj;
        this.squares = []; // Stores all squares in the puzzle
        this.clues = []; // Stores all clues in the puzzle
        this.selectedSquare = null; // Stores the selected square
        this.selectionDirection = "across"; // Stores the direction of the selection ("across" or "down")
        this.puzzleStopwatch = setInterval(incrementStopwatchTime, 1000); // Start the stopwatch
        this.puzzleSeconds = 0; // Stores the seconds for which the puzzle has been running
    }

    populateGrid() {
        // Populates `puzzleContainer` with a grid of squares
        let squareX = 0; // x-coordinate of the current square
        let squareY = 0; // y-coordinate of the current square

        gridContainer.style.gridTemplateColumns = `repeat(${this.obj["grid"][0].length}, 75px)`;

        for (const i of this.obj["grid"]) {
            for (const j of i) {
                puzzle.squares.push(new PuzzleSquare(squareX, squareY, j["type"], j["clueNumber"], j["answer"], j["circled"]));
                squareX++;
            }
            squareY++;
            squareX = 0;
        }
    }

    populateClues() {
        // Populates `infoContainer` with the puzzle's clues
        let acrossLabel = document.createElement("h2");
        acrossLabel.classList.add("info-header");
        infoContainer.appendChild(acrossLabel);
        acrossLabel.textContent = "Across";

        let acrossClues = document.createElement("menu");
        acrossClues.classList.add("oc-clue-list");
        infoContainer.appendChild(acrossClues);

        for (const [clueTag, clueText] of Object.entries(this.obj["clues"]["across"])) {
            puzzle.clues.push(new PuzzleClue(clueTag, "across", clueText, acrossClues));
        }

        let downLabel = document.createElement("h2");
        downLabel.classList.add("info-header");
        infoContainer.appendChild(downLabel);
        downLabel.textContent = "Down";

        let downClues = document.createElement("menu");
        downClues.classList.add("oc-clue-list");
        infoContainer.appendChild(downClues);

        for (const [clueTag, clueText] of Object.entries(this.obj["clues"]["down"])) {
            puzzle.clues.push(new PuzzleClue(clueTag, "down", clueText, downClues));
        }
    }

    populateInfo() {
        // Populates `infoContainer` with information about the puzzle
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

        // Set the puzzle's descriptive size (e.g., "Extra Small", "Small", "Medium", "Large", "Extra Large")
        let sizeName;
        if (puzzle.squares.length <= 9) {
            sizeName = "Extra Small";
        } else if (puzzle.squares.length <= 36 && puzzle.squares.length > 9) {
            sizeName = "Small";
        } else if (puzzle.squares.length <= 81 && puzzle.squares.length > 36) {
            sizeName = "Medium";
        } else if (puzzle.squares.length <= 144 && puzzle.squares.length > 81) {
            sizeName = "Large";
        } else if (puzzle.squares.length > 144) {
            sizeName = "Extra Large";
        } else {
            sizeName = "Error";
        }

        new InfoItem("Title", this.obj["info"]["title"], infoList); // Title
        new InfoItem("Author", this.obj["info"]["author"], infoList); // Author
        new InfoItem("Description", this.obj["info"]["description"], infoList); // Description
        new InfoItem("Tags", this.obj["info"]["tags"], infoList); // Tags
        new InfoItem("Size", sizeName, infoList); // Size
        new InfoItem("Date Published", this.obj["info"]["date_published"], infoList); // Date Published
        new InfoItem("Language", this.obj["info"]["language"], infoList); // Language

        // Set the page's title to the puzzle's title
        document.title = `${this.obj["info"]["title"]}, by ${this.obj["info"]["author"]} - OpenCrossword`;
    }

    selectNextSquare() {
        // Selects the next square in the puzzle
        if (this.selectionDirection === "across") {
            // Filters the squares array to the same y value as the selected square and a larger x value
            if (this.squares.filter((square) => square.y === this.selectedSquare.y && square.x > this.selectedSquare.x).length === 0 || this.squares.filter((square) => square.y === this.selectedSquare.y && square.x > this.selectedSquare.x)[0].style === ("block" || "invisible")) {
                // Select next clue if array is empty or next square is a block/invisible square
                clueBar.nextButton.element.click();
            } else {
                // Select next square if array is not empty and next square is not a block/invisible square
                this.squares.filter((square) => square.y === this.selectedSquare.y && square.x > this.selectedSquare.x)[0].select();
            }
        } else if (this.selectionDirection === "down") {
            // Filters the squares array to the same x value as the selected square and a larger x value
            if (this.squares.filter((square) => square.x === this.selectedSquare.x && square.y > this.selectedSquare.y).length === 0 || this.squares.filter((square) => square.x === this.selectedSquare.x && square.y > this.selectedSquare.y)[0].style === ("block" || "invisible")) {
                // Select next clue if array is empty or next square is a block/invisible square
                clueBar.nextButton.element.click();
            } else {
                // Select next square if array is not empty and next square is not a block/invisible square
                this.squares.filter((square) => square.x === this.selectedSquare.x && square.y > this.selectedSquare.y)[0].select();
            }
        }
    }

    selectPreviousSquare() {
        // Selects the previous square in the puzzle
        if (this.selectionDirection === "across") {
            // Filters the squares array to the same y value as the selected square and a smaller x value
            this.squares.filter((square) => square.y === this.selectedSquare.y && square.x < this.selectedSquare.x)[this.squares.filter((square) => square.y === this.selectedSquare.y && square.x < this.selectedSquare.x).length - 1].select();
        } else if (this.selectionDirection === "down") {
            // Filters the squares array to the same x value as the selected square and a smaller x value
            this.squares.filter((square) => square.x === this.selectedSquare.x && square.y < this.selectedSquare.y)[this.squares.filter((square) => square.x === this.selectedSquare.x && square.y < this.selectedSquare.y).length - 1].select();
        }
    }

    backCheck() {
        // Checks if the selected square does not have a number
        for (const clue of puzzle.clues) {
            if (!(clue.number === this.selectedSquare.clue && puzzle.selectionDirection === clue.direction)) {
                // Check if any previous squares has a clue
                if (this.selectionDirection === "across") {
                    let rowSquares = this.squares.filter(square => square.y === this.selectedSquare.y);
                    for (let i = rowSquares.indexOf(this.selectedSquare); i >= 0; i--) {
                        if (rowSquares[i].clue) {
                            for (const clue of puzzle.clues) {
                                if (clue.number === rowSquares[i].clue && puzzle.selectionDirection === clue.direction) {
                                    clue.select();
                                    return;
                                }
                            }
                        }
                    }
                } else if (this.selectionDirection === "down") {
                    let rowSquares = this.squares.filter(square => square.x === this.selectedSquare.x);
                    for (let i = rowSquares.indexOf(this.selectedSquare); i >= 0; i--) {
                        if (rowSquares[i].clue) {
                            for (const clue of puzzle.clues) {
                                if (clue.number === rowSquares[i].clue && puzzle.selectionDirection === clue.direction) {
                                    clue.select();
                                    return;
                                }
                            }
                        }
                    }
                }
            }
        }
    }
}

class PuzzleSquare {
    constructor(x, y, style, clue, answer, circled) {
        this.x = x; // x-coordinate
        this.y = y; // y-coordinate
        this.style = style; // Style of the square (e.g. "cell", "block", "invisible")
        this.clue = clue; // Clue of the square (Number)
        this.answer = answer // Answer of the square (Character)
        this.element = document.createElement("span");
        this.element.classList.add("oc-puzzle-square");
        gridContainer.appendChild(this.element);
        this.selected = false; // Whether the square is selected

        if (this.style === "block") {
            this.element.classList.add("oc-block");
        }
        if (circled) {
            this.element.classList.add("oc-cell");
            this.element.classList.add("oc-cell-circled");
        }
        if (this.style === "cell") {
            this.element.classList.add("oc-cell");
        }
        if (this.style === "invisible") {
            this.element.classList.add("oc-invisible", "oc-block");
        }

        if (this.clue) {
            this.clueElement = document.createElement("span");
            this.element.appendChild(this.clueElement);
            this.clueElement.classList.add("oc-puzzle-square-clue");
            this.clueElement.textContent = this.clue;
        }
        if (this.answer) {
            this.textElement = document.createElement("input");
            this.textElement.type = "text";
            this.textElement.maxLength = 1;
            this.textElement.spellcheck = false;
            this.textElement.enterKeyHint = "next";
            this.textElement.setAttribute("autocorrect", "off");
            this.textElement.setAttribute("autocomplete", "off");
            this.textElement.setAttribute("autocapitalize", "characters");
            this.element.appendChild(this.textElement);
            this.textElement.classList.add("oc-puzzle-square-text");
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
        if (this.textElement) {
            this.textElement.oninput = (e) => {
                if (!e.data) {
                    // If the delete key is pressed, select the previous square
                    puzzle.selectPreviousSquare();
                } else {
                    puzzle.selectNextSquare();
                }
                checkPuzzle();
                puzzle.selectedSquare.element.classList.remove("oc-cell-invalid");
            };
        }
    }

    select() {
        // Makes this square the current selection
        for (const square of puzzle.squares) {
            // Deselect all squares
            square.deselect();
            square.element.classList.remove("highlighted");
        }
        this.selected = true;
        this.element.classList.add("selected");
        puzzle.selectedSquare = this;
        this.textElement.focus();
        this.textElement.select(); // Select the entered text so it can be overwritten

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
        puzzle.backCheck();
    }

    deselect() {
        this.selected = false;
        this.element.classList.remove("selected");
        puzzle.selectedSquare = undefined;
    }
}

class PuzzleClue {
    constructor(clueTag, direction, clueHTML, parentElement) {
        this.HTMLContent = clueHTML;
        this.element = document.createElement("li");
        this.element.classList.add("oc-clue");
        this.tagElement = document.createElement("span");
        this.tagElement.classList.add("oc-clue-tag");
        this.textElement = document.createElement("span");
        this.textElement.classList.add("clue-text");
        this.tagElement.textContent = clueTag;
        this.textElement.innerHTML = clueHTML;
        this.element.appendChild(this.tagElement);
        this.element.appendChild(this.textElement);
        parentElement.appendChild(this.element);
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
        clueBar.displayClue()
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
        this.descriptionTermElement.classList.add("oc-info-label")
        this.descriptionTermElement.textContent = title;
        this.descriptionDetailElement = document.createElement("dd");
        this.descriptionDetailElement.classList.add("oc-info-text");
        this.descriptionDetailElement.innerHTML = text;
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

class ClueBar {
    constructor(parentElement) {
        this.element = document.createElement("nav");
        this.element.classList.add("oc-clue-bar");
        this.clueContentWrapper = document.createElement("span");
        this.controlWrapper = document.createElement("nav");
        this.controlWrapper.classList.add("oc-clue-bar-control-wrapper");
        parentElement.insertBefore(this.element, parentElement.firstChild);
        this.element.appendChild(this.clueContentWrapper);
        this.element.appendChild(this.controlWrapper);

        this.previousButton = new ControlButton("Next Clue", icon["chevronPreviousSVG"], this.controlWrapper);
        this.previousButton.element.onclick = () => {
            // Select the previous clue in the list
            if (puzzle.clues.indexOf(puzzle.selectedClue) - 1 >= 0) {
                puzzle.clues[puzzle.clues.indexOf(puzzle.selectedClue) - 1].element.click();
            } else {
                puzzle.clues[puzzle.clues.length - 1].element.click();
            }
        }
        this.nextButton = new ControlButton("Next Clue", icon["chevronNextSVG"], this.controlWrapper);
        this.nextButton.element.onclick = () => {
            // Select the next clue in the list
            if (puzzle.clues.indexOf(puzzle.selectedClue) + 1 < puzzle.clues.length) {
                puzzle.clues[puzzle.clues.indexOf(puzzle.selectedClue) + 1].element.click();
            } else {
                puzzle.clues[0].element.click();
            }
        }
        this.clueContentWrapper.onclick = () => {
            if (puzzle.selectionDirection === "across") {
                puzzle.selectionDirection = "down";
            } else if (puzzle.selectionDirection === "down") {
                puzzle.selectionDirection = "across";
            }
            puzzle.selectedSquare.select(); // Refresh grid
        }
    }

    displayClue() {
        if (!puzzle.selectedClue) {
            this.element.style.display = "none";
        } else {
            this.element.style.display = "block";
            this.clueContentWrapper.innerHTML = `<span class="oc-clue-bar-number-direction">${puzzle.selectedClue.number}-${puzzle.selectedClue.direction.toCapitalized()}</span> ${puzzle.selectedClue.HTMLContent}`;
        }
    }
}

const icon = {
    "pauseSVG": `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48"><path d="M28.25 38V10H36v28ZM12 38V10h7.75v28Z"/></svg>`,
    "resetSVG": `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48"><path d="M24 44q-3.75 0-7.025-1.4-3.275-1.4-5.725-3.85Q8.8 36.3 7.4 33.025 6 29.75 6 26h3q0 6.25 4.375 10.625T24 41q6.25 0 10.625-4.375T39 26q0-6.25-4.25-10.625T24.25 11H23.1l3.65 3.65-2.05 2.1-7.35-7.35 7.35-7.35 2.05 2.05-3.9 3.9H24q3.75 0 7.025 1.4 3.275 1.4 5.725 3.85 2.45 2.45 3.85 5.725Q42 22.25 42 26q0 3.75-1.4 7.025-1.4 3.275-3.85 5.725-2.45 2.45-5.725 3.85Q27.75 44 24 44Z"/></svg>`,
    "revealSVG": `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48"><path d="M24 31.5q3.55 0 6.025-2.475Q32.5 26.55 32.5 23q0-3.55-2.475-6.025Q27.55 14.5 24 14.5q-3.55 0-6.025 2.475Q15.5 19.45 15.5 23q0 3.55 2.475 6.025Q20.45 31.5 24 31.5Zm0-2.9q-2.35 0-3.975-1.625T18.4 23q0-2.35 1.625-3.975T24 17.4q2.35 0 3.975 1.625T29.6 23q0 2.35-1.625 3.975T24 28.6Zm0 9.4q-7.3 0-13.2-4.15Q4.9 29.7 2 23q2.9-6.7 8.8-10.85Q16.7 8 24 8q7.3 0 13.2 4.15Q43.1 16.3 46 23q-2.9 6.7-8.8 10.85Q31.3 38 24 38Zm0-15Zm0 12q6.05 0 11.125-3.275T42.85 23q-2.65-5.45-7.725-8.725Q30.05 11 24 11t-11.125 3.275Q7.8 17.55 5.1 23q2.7 5.45 7.775 8.725Q17.95 35 24 35Z"/></svg>`,
    "shareSVG": `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48"><path d="M11 46q-1.2 0-2.1-.9Q8 44.2 8 43V17.55q0-1.2.9-2.1.9-.9 2.1-.9h8.45v3H11V43h26V17.55h-8.55v-3H37q1.2 0 2.1.9.9.9.9 2.1V43q0 1.2-.9 2.1-.9.9-2.1.9Zm11.45-15.35V7.8l-4.4 4.4-2.15-2.15L23.95 2 32 10.05l-2.15 2.15-4.4-4.4v22.85Z"/></svg>`,
    "verifySVG": `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48"><path d="M18.9 35.7 7.7 24.5l2.15-2.15 9.05 9.05 19.2-19.2 2.15 2.15Z"/></svg>`,
    "circleSVG": `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48"><path d="M24 44q-4.1 0-7.75-1.575-3.65-1.575-6.375-4.3-2.725-2.725-4.3-6.375Q4 28.1 4 24q0-4.15 1.575-7.8 1.575-3.65 4.3-6.35 2.725-2.7 6.375-4.275Q19.9 4 24 4q4.15 0 7.8 1.575 3.65 1.575 6.35 4.275 2.7 2.7 4.275 6.35Q44 19.85 44 24q0 4.1-1.575 7.75-1.575 3.65-4.275 6.375t-6.35 4.3Q28.15 44 24 44Zm0-3q7.1 0 12.05-4.975Q41 31.05 41 24q0-7.1-4.95-12.05Q31.1 7 24 7q-7.05 0-12.025 4.95Q7 16.9 7 24q0 7.05 4.975 12.025Q16.95 41 24 41Zm0-17Z"/></svg>`,
    "chevronNextSVG": `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48"><path d="m18.75 36-2.15-2.15 9.9-9.9-9.9-9.9 2.15-2.15L30.8 23.95Z"/></svg>`,
    "chevronPreviousSVG": `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48"><path d="M28.05 36 16 23.95 28.05 11.9l2.15 2.15-9.9 9.9 9.9 9.9Z"/></svg>`,
    "specialSVG": `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48"><path d="m19.2 36.4-4.75-10.45L4 21.2l10.45-4.75L19.2 6l4.75 10.45L34.4 21.2l-10.45 4.75ZM36.4 42l-2.35-5.25-5.25-2.35 5.25-2.4 2.35-5.2 2.4 5.2 5.2 2.4-5.2 2.35Z"/></svg>`
}

function displayControlButtons() {
    // Display the control buttons beneath the puzzle grid (e.g. "Check", "Reveal", "Pause", "Reset", "Share", "Settings")
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
    let remixButton = new ControlButton("Remix", icon["specialSVG"], controlButtons);
    remixButton.element.innerHTML += "Remix";
    remixButton.element.onclick = () => {
        let encodedPuzzleLink = encodeURIComponent(window.location.href);
        window.open(`${document.baseURI}compose.html?l=${encodedPuzzleLink}`);
    }
    let pauseButton = new ControlButton("Pause", icon["pauseSVG"], controlButtons);
    let stopwatch = document.createElement("span");
    stopwatch.classList.add("oc-stopwatch");
    stopwatch.id = "oc-stopwatch";
    stopwatch.textContent = "00:00";
    pauseButton.element.appendChild(stopwatch);
    pauseButton.element.onclick = () => {
        pauseGame();
    }
}

function verifyPuzzle() {
    // Erases all incorrect squares
    for (const square of puzzle.squares) {
        if (square.style === "cell") {
            if (square.textElement.value.toUpperCase() !== square.answer.toUpperCase() && square.textElement.value !== "") {
                square.element.classList.add("oc-cell-invalid");
            }
        }
    }
    checkPuzzle();
}

function revealPuzzle() {
    // Reveals all squares
    if (window.confirm("Are you sure you want to reveal the puzzle?")) {
        for (const square of puzzle.squares) {
            square.element.classList.remove("oc-cell-invalid");
            if (square.style === "cell") {
                square.textElement.value = square.answer;
            }
        }
    }
    checkPuzzle();
}

function pauseGame() {
    // Pauses the game
    window.alert("Game paused");
}

function resetPuzzle() {
    // Clears all squares
    if (window.confirm("Are you sure you want to reset the puzzle?")) {
        for (const square of puzzle.squares) {
            if (square.style === "cell") {
                square.textElement.value = "";
                square.element.classList.remove("oc-cell-invalid");
            }
        }
        puzzle.puzzleSeconds = 0;
    }
}

function sharePuzzle() {
    // Open a share dialog
    if (navigator.share) {
        navigator.share({
            title: "OpenCrossword", url: window.location.href
        }).catch(console.error);
    } else {
        navigator.clipboard.writeText(window.location.href).then(() => {
            /* clipboard successfully set */
            window.alert("Link copied to clipboard");
        }, () => {
            /* clipboard write failed */
            window.alert("Failed to copy link to clipboard");
        });
    }
}

function checkPuzzle() {
    // Check if the puzzle is solved
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

function showSolvedScreen() {
    // Display a "game over" alert
    endStopwatch();
    window.alert(`Congratulations! You solved the puzzle in ${document.getElementById("oc-stopwatch").textContent}!`);
}

function showNotSolvedScreen() {
    window.alert("Puzzle not solved.");
}

const infoContainer = document.createElement("div")
infoContainer.classList.add("oc-info-container")
document.getElementById("oc-game-view").appendChild(infoContainer);

function populate(obj) {
    clueBar = new ClueBar(puzzleContainer);
    puzzle = new Puzzle(obj);
    puzzle.populateGrid(obj);
    puzzle.populateClues(obj);
    puzzle.populateInfo(obj);
    displayControlButtons();
}

Number.prototype.toFormattedTime = function () {
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

String.prototype.toCapitalized = function () {
    return this.charAt(0).toUpperCase() + this.slice(1);
}

function incrementStopwatchTime() {
    document.getElementById("oc-stopwatch").textContent = puzzle.puzzleSeconds.toFormattedTime();
    puzzle.puzzleSeconds += 1;
}

function endStopwatch() {
    clearInterval(puzzle.puzzleStopwatch);
}

function startOC() {
    let params = new URLSearchParams(document.location.search);
    if (params.has("p")) {
        let puzzleID = params.get("p").toString();
        let puzzleURL = `${document.baseURI}data/puzzles/${puzzleID}.json`;
        // Fetch puzzle data from url
        fetch(puzzleURL).then((response) => response.json()).then((data) => {
            populate(data);
        });
    } else if (params.has("d")) {
        let puzzleData = params.get("d").toString();
        populate(JSON.parse(puzzleData));
    }
}

let puzzle;
let clueBar;

startOC();