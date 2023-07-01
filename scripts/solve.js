import decompressAndDecode from "./decompress.js";
import Grid from "./grid.js";
import GridSquare from "./grid-square.js";

"use strict";

const puzzleContainer = document.createElement("div");
puzzleContainer.classList.add("oc-puzzle-container");
document.getElementById("oc-game-view").appendChild(puzzleContainer);
document.getElementById("oc-game-view").classList.add("oc-game-view");

const gridContainer = document.createElement("div");
gridContainer.classList.add("oc-grid-container");
puzzleContainer.appendChild(gridContainer);

let l; // Stores language data

class Puzzle extends Grid {
    constructor(obj) {
        super(obj);
        this.clues = []; // Stores all clues in the puzzle
        this.puzzleStopwatch = setInterval(incrementStopwatchTime, 1000); // Start the stopwatch
        this.puzzleSeconds = 0; // Stores the seconds for which the puzzle has been running
    }

    displayTitle() {
        let titleElement = document.createElement("h2");
        titleElement.textContent = this.obj["info"]["title"];
        titleElement.classList.add("oc-puzzle-title");
        puzzleContainer.prepend(titleElement);
    }

    populateClues() {
        // Populates `infoContainer` with the puzzle's clues
        let acrossLabel = document.createElement("h2");
        acrossLabel.classList.add("info-header");
        infoContainer.appendChild(acrossLabel);
        acrossLabel.textContent = "Across".i18n();

        let acrossClues = document.createElement("menu");
        acrossClues.classList.add("oc-clue-list");
        infoContainer.appendChild(acrossClues);

        for (const clue of Object.entries(this.obj["clues"]["across"])) {
            let options = {
                "number": clue[0],
                "direction": "across",
                "html_content": clue[1]["content"],
                "hints": clue[1]["hints"],
                "links": clue[1]["links"]
            };
            puzzle.clues.push(new PuzzleClue(options, acrossClues));
        }

        let downLabel = document.createElement("h2");
        downLabel.classList.add("info-header");
        infoContainer.appendChild(downLabel);
        downLabel.textContent = "Down".i18n();

        let downClues = document.createElement("menu");
        downClues.classList.add("oc-clue-list");
        infoContainer.appendChild(downClues);

        for (const clue of Object.entries(this.obj["clues"]["down"])) {
            let options = {
                "number": clue[0],
                "direction": "down",
                "html_content": clue[1]["content"],
                "hints": clue[1]["hints"],
                "links": clue[1]["links"]
            };
            puzzle.clues.push(new PuzzleClue(options, downClues));
        }
    }

    populateInfo() {
        // Populates `infoContainer` with information about the puzzle
        let infoSeparator = document.createElement("hr");
        infoSeparator.classList.add("info-separator");
        infoContainer.appendChild(infoSeparator);

        let infoWrapper = document.createElement("details");
        let infoWrapperSummary = document.createElement("summary");
        infoWrapperSummary.innerHTML = `<h2>${"Info".i18n()}</h2>`;
        infoWrapperSummary.classList.add("info-header");
        infoWrapper.appendChild(infoWrapperSummary);

        let infoList = document.createElement("dl");
        infoList.classList.add("puzzle-info");
        infoWrapper.appendChild(infoList);

        infoContainer.appendChild(infoWrapper);

        // Set the puzzle's descriptive size (e.g., "Extra Small", "Small", "Medium", "Large", "Extra Large")
        let sizeName;
        if (puzzle.squares.length <= 9) {
            sizeName = "Extra Small".i18n();
        } else if (puzzle.squares.length <= 36 && puzzle.squares.length > 9) {
            sizeName = "Small".i18n();
        } else if (puzzle.squares.length <= 81 && puzzle.squares.length > 36) {
            sizeName = "Medium".i18n();
        } else if (puzzle.squares.length <= 144 && puzzle.squares.length > 81) {
            sizeName = "Large".i18n();
        } else if (puzzle.squares.length > 144) {
            sizeName = "Extra Large".i18n();
        } else {
            sizeName = "Error".i18n();
        }

        new InfoItem("Title".i18n(), this.obj["info"]["title"], infoList); // Title
        new InfoItem("Author".i18n(), this.obj["info"]["author"], infoList); // Author
        new InfoItem("Description".i18n(), this.obj["info"]["description"], infoList); // Description
        let tags = new InfoItem("Tags".i18n(), "", infoList); // Tags
        let tagsList = document.createElement("ul");
        tagsList.classList.add("oc-info-puzzle-tags-list");
        tags.descriptionDetailElement.appendChild(tagsList);
        for (const tag of this.obj["info"]["tags"]) {
            new InfoTag(tag, tagsList);
        }
        new InfoItem("Size".i18n(), sizeName, infoList); // Size
        new InfoItem("Date Published".i18n(), this.obj["info"]["date_published"], infoList); // Date Published
        new InfoItem("Language".i18n(), this.obj["info"]["language"], infoList); // Language
        new InfoItem("Puzzle Copyright".i18n(), `© ${this.obj["info"]["date_published"].split("-")[0]} ${this.obj["info"]["author"]}`, infoList)

        // Set the page's title to the puzzle's title
        document.title = `${this.obj["info"]["title"]}, by ${this.obj["info"]["author"]} - OpenCrossword`;
    }

    selectNextSquare() {
        // Selects the next square in the puzzle
        if (this.selectionDirection === "across") {
            // Filters the squares array to the same y value as the selected square and a larger x value
            if (this.squares.filter((square) => square.y === this.selectedSquare.y && square.x > this.selectedSquare.x).length === 0 || this.squares.filter((square) => square.y === this.selectedSquare.y && square.x > this.selectedSquare.x)[0].style !== "cell") {
                // Select next clue if array is empty or next square is a block/invisible square
                clueBar.nextButton.element.click();
            } else {
                // Select next square if array is not empty and next square is not a block/invisible square
                this.squares.filter((square) => square.y === this.selectedSquare.y && square.x > this.selectedSquare.x)[0].select();
            }
        } else if (this.selectionDirection === "down") {
            // Filters the squares array to the same x value as the selected square and a larger x value
            if (this.squares.filter((square) => square.x === this.selectedSquare.x && square.y > this.selectedSquare.y).length === 0 || this.squares.filter((square) => square.x === this.selectedSquare.x && square.y > this.selectedSquare.y)[0].style !== "cell") {
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
            if (this.squares.filter((square) => square.y === this.selectedSquare.y && square.x < this.selectedSquare.x).length === 0 || this.squares.filter((square) => square.y === this.selectedSquare.y && square.x < this.selectedSquare.x)[this.squares.filter((square) => square.y === this.selectedSquare.y && square.x < this.selectedSquare.x).length - 1].style !== "cell") {
                // Select previous clue if array is empty or previous square is a block/invisible square
                clueBar.previousButton.element.click();
            } else {
                // Select previous square if array is not empty and previous square is not a block/invisible square
                this.squares.filter((square) => square.y === this.selectedSquare.y && square.x < this.selectedSquare.x)[this.squares.filter((square) => square.y === this.selectedSquare.y && square.x < this.selectedSquare.x).length - 1].select();
            }
        } else if (this.selectionDirection === "down") {
            // Filters the squares array to the same x value as the selected square and a smaller x value
            if (this.squares.filter((square) => square.x === this.selectedSquare.x && square.y < this.selectedSquare.y).length === 0 || this.squares.filter((square) => square.x === this.selectedSquare.x && square.y < this.selectedSquare.y)[this.squares.filter((square) => square.x === this.selectedSquare.x && square.y < this.selectedSquare.y).length - 1].style !== "cell") {
                // Select previous clue if array is empty or previous square is a block/invisible square
                clueBar.previousButton.element.click();
            } else {
                // Select previous square if array is not empty and previous square is not a block/invisible square
                this.squares.filter((square) => square.x === this.selectedSquare.x && square.y < this.selectedSquare.y)[this.squares.filter((square) => square.x === this.selectedSquare.x && square.y < this.selectedSquare.y).length - 1].select();
            }
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
                                    return clue.number;
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
                                    return clue.number;
                                }
                            }
                        }
                    }
                }
            }
        }
    }
}

class PuzzleSquare extends GridSquare {
    constructor(parentGrid, x, y, style, clue, answer, circled, shadeLevel) {
        super(parentGrid, x, y, style, clue, answer, circled, shadeLevel);
        if (this.textElement) {
            this.textElement.oninput = (e) => {
                parentGrid.selectedSquare.element.classList.remove("oc-cell-invalid");
                if (e.data) {
                    parentGrid.selectNextSquare();
                    checkPuzzle();
                    if (document.getElementById("oc-verify-automatically").checked) verifyPuzzle();
                }
            };
        }
    }
}

class PuzzleClue {
    constructor(options, parentElement) {
        let clueTag = options["number"];
        let direction = options["direction"];
        let clueHTML = options["html_content"];
        let clueHints = options["hints"];
        let clueLinks = options["links"];

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
        this.links = clueLinks;
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
        clueBar.displayClue();
        for (const clue of puzzle.clues) {
            clue.element.classList.remove("highlighted");
        }
        if (this.links) {
            this.highlightLinks();
        }
    }

    deselect() {
        this.selected = false;
        this.element.classList.remove("selected");
        puzzle.selectedClue = undefined;
    }

    highlight() {
        this.element.classList.add("highlighted");
    }

    highlightLinks() {
        for (const link of this.links) {
            const [number, direction] = link.split("-");
            for (const clue of puzzle.clues) {
                if (clue.number === parseInt(number, 10) && clue.direction === direction.toLowerCase()) {
                    clue.highlight();
                }
            }
        }
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

class ControlInput {
    constructor(type, title, label, parentElement, id) {
        this.labelElement = document.createElement("label");
        this.element = document.createElement("input");
        this.labelElement.appendChild(this.element);
        this.element.type = type;
        this.element.title = title;
        this.element.id = id;
        this.labelElement.innerHTML += label;
        parentElement.appendChild(this.labelElement);
    }
}

class ClueBar {
    constructor(parentElement) {
        this.element = document.createElement("nav");
        this.element.classList.add("oc-clue-bar");
        this.clueContentWrapper = document.createElement("span");
        this.clueContentWrapper.classList.add("oc-clue-content-wrapper");
        this.controlWrapper = document.createElement("nav");
        this.controlWrapper.classList.add("oc-clue-bar-control-wrapper");
        parentElement.insertBefore(this.element, parentElement.firstChild);
        this.element.appendChild(this.clueContentWrapper);
        this.element.appendChild(this.controlWrapper);

        this.previousButton = new ControlButton("Previous Clue".i18n(), icon["chevronPreviousSVG"], this.controlWrapper);
        this.previousButton.element.onclick = () => {
            // Select the previous clue in the list
            if (puzzle.clues.indexOf(puzzle.selectedClue) - 1 >= 0) {
                puzzle.clues[puzzle.clues.indexOf(puzzle.selectedClue) - 1].element.click();
            } else {
                puzzle.clues[puzzle.clues.length - 1].element.click();
            }
            this.selectFirstBlankSquareInWord();
        }
        this.nextButton = new ControlButton("Next Clue".i18n(), icon["chevronNextSVG"], this.controlWrapper);
        this.nextButton.element.onclick = () => {
            // Select the next clue in the list
            if (puzzle.clues.indexOf(puzzle.selectedClue) + 1 < puzzle.clues.length) {
                puzzle.clues[puzzle.clues.indexOf(puzzle.selectedClue) + 1].element.click();
            } else {
                puzzle.clues[0].element.click();
            }
            // Selects the next blank in word
            if (puzzle.selectedSquare.textElement.value !== null) {
                this.selectFirstBlankSquareInWord();
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
        document.addEventListener("keydown", (event) => {
            if (event.key === "Enter") {
                if (event.shiftKey) {
                    this.previousButton.element.click();
                } else {
                    this.nextButton.element.click();
                }
            }
        });
    }

    displayClue() {
        if (!puzzle.selectedClue) {
            this.element.style.display = "none";
        } else {
            this.element.style.display = "flex";
            this.clueContentWrapper.innerHTML = `<span class="oc-clue-bar-number-direction">${puzzle.selectedClue.number}-${puzzle.selectedClue.direction.toCapitalized().i18n()}</span> ${puzzle.selectedClue.HTMLContent}`;
        }
    }

    selectFirstBlankSquareInWord() {
        if (puzzle.selectionDirection === "across") {
            let nextNonCellSquare = puzzle.squares.filter(square => square.y === puzzle.selectedSquare.y && square.x > puzzle.selectedSquare.x).find(square => square.style !== "cell");
            try {
                puzzle.squares.filter(square => square.y === puzzle.selectedSquare.y && square.x >= puzzle.selectedSquare.x && square.x < nextNonCellSquare.x).find(square => square.textElement.value === "").select();
            } catch (TypeError) {
                puzzle.squares.filter(square => square.y === puzzle.selectedSquare.y && square.x >= puzzle.selectedSquare.x).find(square => square.textElement.value === "").select();
            }
        } else if (puzzle.selectionDirection === "down") {
            let nextNonCellSquare = puzzle.squares.filter(square => square.x === puzzle.selectedSquare.x && square.y > puzzle.selectedSquare.y).find(square => square.style !== "cell");
            try {
                puzzle.squares.filter(square => square.x === puzzle.selectedSquare.x && square.y >= puzzle.selectedSquare.y && square.y < nextNonCellSquare.y).find(square => square.textElement.value === "").select();
            } catch (TypeError) {
                puzzle.squares.filter(square => square.x === puzzle.selectedSquare.x && square.y >= puzzle.selectedSquare.y).find(square => square.textElement.value === "").select();
            }
        }
    }
}

class InfoTag {
    constructor(content, parentElement) {
        this.element = document.createElement("li");
        this.element.classList.add("oc-info-tag");
        this.element.textContent = content;
        parentElement.appendChild(this.element);
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
    "specialSVG": `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48"><path d="m19.2 36.4-4.75-10.45L4 21.2l10.45-4.75L19.2 6l4.75 10.45L34.4 21.2l-10.45 4.75ZM36.4 42l-2.35-5.25-5.25-2.35 5.25-2.4 2.35-5.2 2.4 5.2 5.2 2.4-5.2 2.35Z"/></svg>`,
    "helpSVG": `<svg viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg"><path d="M24.2 35.65q.8 0 1.35-.55t.55-1.35q0-.8-.55-1.35t-1.35-.55q-.8 0-1.35.55t-.55 1.35q0 .8.55 1.35t1.35.55Zm-1.75-7.3h2.95q0-1.3.325-2.375T27.75 23.5q1.55-1.3 2.2-2.55.65-1.25.65-2.75 0-2.65-1.725-4.25t-4.575-1.6q-2.45 0-4.325 1.225T17.25 16.95l2.65 1q.55-1.4 1.65-2.175 1.1-.775 2.6-.775 1.7 0 2.75.925t1.05 2.375q0 1.1-.65 2.075-.65.975-1.9 2.025-1.5 1.3-2.225 2.575-.725 1.275-.725 3.375ZM24 44q-4.1 0-7.75-1.575-3.65-1.575-6.375-4.3-2.725-2.725-4.3-6.375Q4 28.1 4 24q0-4.15 1.575-7.8 1.575-3.65 4.3-6.35 2.725-2.7 6.375-4.275Q19.9 4 24 4q4.15 0 7.8 1.575 3.65 1.575 6.35 4.275 2.7 2.7 4.275 6.35Q44 19.85 44 24q0 4.1-1.575 7.75-1.575 3.65-4.275 6.375t-6.35 4.3Q28.15 44 24 44Zm0-3q7.1 0 12.05-4.975Q41 31.05 41 24q0-7.1-4.95-12.05Q31.1 7 24 7q-7.05 0-12.025 4.95Q7 16.9 7 24q0 7.05 4.975 12.025Q16.95 41 24 41Zm0-17Z"/></svg>`,
    "copySVG": `<svg xmlns="http://www.w3.org/2000/svg" height="48" viewBox="0 96 960 960" width="48"><path d="M180 975q-24 0-42-18t-18-42V312h60v603h474v60H180Zm120-120q-24 0-42-18t-18-42V235q0-24 18-42t42-18h440q24 0 42 18t18 42v560q0 24-18 42t-42 18H300Zm0-60h440V235H300v560Zm0 0V235v560Z"/></svg>`,
    "embedSVG": `<svg xmlns="http://www.w3.org/2000/svg" height="48" viewBox="0 96 960 960" width="48"><path d="M320 814 80 574l242-242 43 43-199 199 197 197-43 43Zm318 2-43-43 199-199-197-197 43-43 240 240-242 242Z"/></svg>`,
    "closeSVG": `<svg xmlns="http://www.w3.org/2000/svg" height="48" viewBox="0 96 960 960" width="48""><path d="m249 849-42-42 231-231-231-231 42-42 231 231 231-231 42 42-231 231 231 231-42 42-231-231-231 231Z"/></svg>`
}

function displayControlButtons() {
    // Display the control buttons beneath the puzzle grid (e.g. "Check", "Reveal", "Pause", "Reset", "Share", "Settings")
    let controlButtons = document.createElement("nav");
    controlButtons.classList.add("oc-control-button-container");
    puzzleContainer.appendChild(controlButtons);

    let verifyButton = new ControlButton("Verify".i18n(), icon["verifySVG"], controlButtons);
    verifyButton.element.onclick = () => {
        verifyPuzzle();
    }
    let revealButton = document.createElement("details");
    revealButton.classList.add("oc-reveal-button");
    let revealButtonSummary = document.createElement("summary");
    revealButtonSummary.innerHTML = icon["revealSVG"];
    let revealOptions = document.createElement("nav");
    revealOptions.classList.add("oc-reveal-options");
    let revealPuzzleButton = new ControlButton("Reveal Puzzle".i18n(), null, revealOptions);
    revealPuzzleButton.element.textContent = "Puzzle".i18n();
    revealPuzzleButton.element.onclick = () => {
        revealPuzzle();
        revealButton.removeAttribute("open");
    }
    let revealWordButton = new ControlButton("Reveal Word".i18n(), null, revealOptions);
    revealWordButton.element.textContent = "Word".i18n();
    revealWordButton.element.onclick = () => {
        revealWord();
        revealButton.removeAttribute("open");
    }
    let revealSquareButton = new ControlButton("Reveal Square".i18n(), null, revealOptions);
    revealSquareButton.element.textContent = "Square".i18n();
    revealSquareButton.element.onclick = () => {
        revealSquare();
        revealButton.removeAttribute("open");

    }
    revealButton.appendChild(revealButtonSummary);
    revealButton.appendChild(revealOptions);
    controlButtons.appendChild(revealButton);
    let resetButton = new ControlButton("Reset".i18n(), icon["resetSVG"], controlButtons);
    resetButton.element.onclick = () => {
        resetPuzzle();
    }
    let shareButton = new ControlButton("Share".i18n(), icon["shareSVG"], controlButtons);
    shareButton.element.onclick = () => {
        displayShareDialog();
    }
    let remixButton = new ControlButton("Remix".i18n(), icon["specialSVG"], controlButtons);
    remixButton.element.onclick = () => {
        let encodedPuzzleLink = encodeURIComponent(window.location.href);
        window.open(`${document.baseURI}compose.html?l=${encodedPuzzleLink}`);
    }
    let helpButton = new ControlButton("Shortcuts Help".i18n(), icon["helpSVG"], controlButtons);
    helpButton.element.onclick = () => {
        window.alert(`Keyboard Shortcuts:
\t▲, ▼, ◀, ▶: Moves the cursor
\tEnter: Selects next word
\tDelete: Deletes the previous character
\t⌦: Deletes the next character
\tSpacebar: Selects next empty cell
\tTab: Toggles the selection direction`.i18n());
    }
    let pauseButton = new ControlButton("Pause".i18n(), icon["pauseSVG"], controlButtons);
    let stopwatch = document.createElement("span");
    stopwatch.classList.add("oc-stopwatch");
    stopwatch.id = "oc-stopwatch";
    stopwatch.textContent = "00:00";
    pauseButton.element.appendChild(stopwatch);
    pauseButton.element.onclick = () => {
        pauseGame();
    }
    let verifyAutomaticallyCheckbox = new ControlInput("checkbox", "Verify the puzzle automatically on each keystroke".i18n(), "Verify automatically".i18n(), controlButtons, "oc-verify-automatically");
    verifyAutomaticallyCheckbox.labelElement.style.display = "block";
    document.getElementById("oc-verify-automatically").onclick = () => {
        verifyPuzzle();
    }
}

function displayShareDialog() {
    let dialog = document.createElement("dialog");
    dialog.classList.add("oc-dialog");
    let dialogTitleBar = document.createElement("div");
    let dialogTitle = document.createElement("h2");
    dialogTitle.textContent = "Share".i18n();
    let titleBarSeparator = document.createElement("hr");
    let shareArea = document.createElement("div");
    let shareButton = new ControlButton("Share".i18n(), icon["shareSVG"], shareArea);
    shareButton.element.onclick = () => {
        navigator.share({
            title: "OpenCrossword", url: window.location.href
        }).catch(console.error);
    }
    let copyLinkButton = new ControlButton("Copy Link".i18n(), icon["copySVG"], shareArea);
    copyLinkButton.element.onclick = () => {
        navigator.clipboard.writeText(window.location.href).then(() => {
            /* clipboard successfully set */
            window.alert("Link copied to clipboard".i18n());
        }, () => {
            /* clipboard write failed */
            window.alert("Failed to copy link to clipboard".i18n());
        });
    }
    let embedPuzzleButton = new ControlButton("Copy Embed Code".i18n(), icon["embedSVG"], shareArea);
    embedPuzzleButton.element.onclick = () => {
        let transformedLink = window.location.href.replace("/solve", "/frames/player-embed");
        navigator.clipboard.writeText(`<iframe width="100%" height="100vh" src="${transformedLink}"/>`).then(() => {
            /* clipboard successfully set */
            window.alert("Code copied to clipboard".i18n());
        }, () => {
            /* clipboard write failed */
            window.alert("Failed to copy code to clipboard".i18n());
        });
    }
    let remixButton = new ControlButton("Remix".i18n(), icon["specialSVG"], shareArea);
    remixButton.element.onclick = () => {
        let encodedPuzzleLink = encodeURIComponent(window.location.href);
        window.open(`${document.baseURI}compose.html?l=${encodedPuzzleLink}`);
    }
    let dialogCloseButton = new ControlButton("Close".i18n(), icon["closeSVG"], dialogTitleBar);
    dialogCloseButton.element.onclick = () => {
        dialog.close();
        dialog.remove();
    }
    dialogTitleBar.appendChild(dialogTitle);
    dialog.appendChild(dialogTitleBar);
    dialog.appendChild(titleBarSeparator);
    dialog.appendChild(shareArea);
    document.body.appendChild(dialog);
    dialog.showModal();
}

function verifyPuzzle() {
    // Marks all incorrect squares
    for (const square of puzzle.squares) {
        if (square.style === "cell") {
            if (square.textElement.value.toUpperCase() !== square.answer.toUpperCase() && square.textElement.value !== "") {
                square.element.classList.add("oc-cell-invalid");
            }
        }
    }
}

function revealPuzzle() {
    // Reveals all squares
    if (window.confirm("Are you sure you want to reveal the puzzle?".i18n())) {
        for (const square of puzzle.squares) {
            square.element.classList.remove("oc-cell-invalid");
            if (square.style === "cell") {
                square.textElement.value = square.answer;
            }
        }
    }
    checkPuzzle();
}

function revealWord() {
    for (const square of puzzle.squares) {
        if (square.element.classList.contains("highlighted")) {
            try {
                square.textElement.value = square.answer;
            } catch { }
        }
    }
}
function revealSquare() {
    puzzle.selectedSquare.textElement.value = puzzle.selectedSquare.answer;
}

function pauseGame() {
    // Pauses the game
    window.alert("Game paused".i18n());
}

function resetPuzzle() {
    // Clears all squares
    if (window.confirm("Are you sure you want to reset the puzzle?".i18n())) {
        for (const square of puzzle.squares) {
            if (square.style === "cell") {
                square.textElement.value = "";
                square.element.classList.remove("oc-cell-invalid");
            }
        }
        puzzle.puzzleSeconds = 0;
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
    window.alert("Congratulations! You solved the puzzle in".i18n() + " " + document.getElementById("oc-stopwatch").textContent);
}

function showNotSolvedScreen() {
    window.alert("Puzzle not solved".i18n());
}

const infoContainer = document.createElement("div")
infoContainer.classList.add("oc-info-container")
document.getElementById("oc-game-view").appendChild(infoContainer);

function populate(obj) {
    showSplashScreen(obj);
    document.getElementById("oc-splash-screen").onsubmit = () => {
        clueBar = new ClueBar(document.getElementById("oc-game-view"));
        puzzle = new Puzzle(obj);
        puzzle.displayTitle();
        puzzle.populate(gridContainer, PuzzleSquare);
        puzzle.populateClues();
        puzzle.populateInfo();
        displayControlButtons();
    }
}

Number.prototype.toFormattedTime = function() {
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

String.prototype.toCapitalized = function() {
    return this.charAt(0).toUpperCase() + this.slice(1);
}

String.prototype.i18n = function() {
    // Translates the string to the current language, if available
    if (l[`${this}`]) {
        return l[`${this}`];
    } else {
        return this;
    }
}

function incrementStopwatchTime() {
    document.getElementById("oc-stopwatch").textContent = puzzle.puzzleSeconds.toFormattedTime();
    puzzle.puzzleSeconds += 1;
}

function endStopwatch() {
    clearInterval(puzzle.puzzleStopwatch);
}

function setLanguage(data) {
    l = data;
}

function showSplashScreen(obj) {
    let splashScreen = document.createElement("dialog");
    splashScreen.id = "oc-splash-screen";
    splashScreen.classList.add("oc-splash-screen");
    splashScreen.innerHTML = `<div>
        <h1>OpenCrossword<br>Player</h1>
        <p><b>${obj["info"]["title"]} - ${obj["info"]["author"]}</b><br>${obj["info"]["description"]}</p>
        <img alt="OpenCrossword banner" src="${document.baseURI}images/splash-screen.jpg">
    </div>
    <form method="dialog">
        <input class="oc-splash-screen-info-input" type="submit" value="${"Play".i18n()}">
    </form>`;
    document.body.appendChild(splashScreen);
    splashScreen.showModal();
}

async function getPuzzleObject(URLParams) {
    // Returns a puzzle object based on the URL parameters
    let obj = {};
    if (URLParams.has("p")) {
        let fileURL = `${document.baseURI}data/puzzles/${URLParams.get("p").toString()}.json`;
        let response = await fetch(fileURL);
        obj = await response.json();
    } else if (URLParams.has("d")) {
        obj = JSON.parse(await URLParams.get("d").toString());
    } else if (URLParams.has("dc")) {
        if (!"CompressionStream" in window) throw new Error("CompressionStream not supported");
        obj = JSON.parse(await decompressAndDecode(URLParams.get("dc").toString()));
    } else {
        throw new Error("Invalid parameters");
    }
    return obj;
}

async function getLanguageObject(language) {
    // Returns a language object of the specified locale
    try {
        return await fetch(`${document.baseURI}languages/${language}.json`);
    } catch {
        return await fetch(`${document.baseURI}languages/en.json`);
    }
}

async function startOCPlayer() {
    let params = new URLSearchParams(document.location.search);
    let data = await getPuzzleObject(params);
    let language = await getLanguageObject(data["info"]["language"]);
    setLanguage(language);
    populate(data);
    console.info("%cStarted OpenCrossword Player…", "font-family: \"Times New Roman\", Times, serif; font-weight: bold; font-size: 20px;");
}

let puzzle;
let clueBar;

startOCPlayer();
