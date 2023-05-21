export default class Grid {
    constructor(obj) {
        this.obj = obj;
        this.squares = []; // Stores all squares in the puzzle
        this.selectedSquare = null; // Stores the selected square
        this.selectionDirection = "across"; // Stores the direction of the selection ("across" or "down")

    }

    populate(parentElement, Square) {
        this.element = parentElement;

        // Populates `puzzleContainer` with a grid of squares
        let squareX = 0; // x-coordinate of the current square
        let squareY = 0; // y-coordinate of the current square

        this.element.style.gridTemplateColumns = `repeat(${this.obj["grid"][0].length}, 1fr)`;

        for (const i of this.obj["grid"]) {
            for (const j of i) {
                this.squares.push(new Square(this, squareX, squareY, j["type"], j["clueNumber"], j["answer"], j["circled"], j["shadeLevel"]));
                squareX++;
            }
            squareY++;
            squareX = 0;
        }

        document.onkeydown = (event) => {
            if (event.key === "ArrowUp") {
                event.preventDefault();
                if (this.selectionDirection === "down") {
                    this.selectPreviousSquare();
                } else {
                    this.selectionDirection = "down";
                    this.selectedSquare.select(); // Refresh the grid
                }
            } else if (event.key === "ArrowDown") {
                event.preventDefault();
                if (this.selectionDirection === "down") {
                    this.selectNextSquare();
                } else {
                    this.selectionDirection = "down";
                    this.selectedSquare.select(); // Refresh the grid
                }
            } else if (event.key === "ArrowLeft") {
                event.preventDefault();
                if (this.selectionDirection === "across") {
                    this.selectPreviousSquare();
                } else {
                    this.selectionDirection = "across";
                    this.selectedSquare.select(); // Refresh the grid
                }
            } else if (event.key === "ArrowRight") {
                event.preventDefault();
                if (this.selectionDirection === "across") {
                    this.selectNextSquare();
                } else {
                    this.selectionDirection = "across";
                    this.selectedSquare.select(); // Refresh the grid
                }
            } else if (event.key === "Backspace") {
                this.selectPreviousSquare();
            } else if (event.key === "Delete") {
                this.selectNextSquare();
            } else if (event.key === " " || event.key === "Spacebar") {
                this.selectNextBlankSquare();
            } else if (event.key === "Tab") {
                // Switch selection direction
                if (this.selectionDirection === "across") {
                    this.selectionDirection = "down";
                } else if (this.selectionDirection === "down") {
                    this.selectionDirection = "across";
                }
                this.selectedSquare.select(); // Refresh the grid
            }
        }
    }

    selectNextSquare() {
        // Selects the next square in the puzzle
        if (this.selectionDirection === "across") {
            // Filters the squares array to the same y value as the selected square and a larger x value
            if (!(this.squares.filter((square) => square.y === this.selectedSquare.y && square.x > this.selectedSquare.x).length === 0 || this.squares.filter((square) => square.y === this.selectedSquare.y && square.x > this.selectedSquare.x)[0].style !== "cell")) {
                // Select next square if array is not empty and next square is not a block/invisible square
                this.squares.filter((square) => square.y === this.selectedSquare.y && square.x > this.selectedSquare.x)[0].select();
            }
        } else if (this.selectionDirection === "down") {
            // Filters the squares array to the same x value as the selected square and a larger x value
            if (!(this.squares.filter((square) => square.x === this.selectedSquare.x && square.y > this.selectedSquare.y).length === 0 || this.squares.filter((square) => square.x === this.selectedSquare.x && square.y > this.selectedSquare.y)[0].style !== "cell")) {
                // Select next square if array is not empty and next square is not a block/invisible square
                this.squares.filter((square) => square.x === this.selectedSquare.x && square.y > this.selectedSquare.y)[0].select();
            }
        }
    }

    selectPreviousSquare() {
        // Selects the previous square in the puzzle
        if (this.selectionDirection === "across") {
            this.squares.filter((square) => square.y === this.selectedSquare.y && square.x < this.selectedSquare.x)[this.squares.filter((square) => square.y === this.selectedSquare.y && square.x < this.selectedSquare.x).length - 1].select();
        } else if (this.selectionDirection === "down") {
            this.squares.filter((square) => square.x === this.selectedSquare.x && square.y < this.selectedSquare.y)[this.squares.filter((square) => square.x === this.selectedSquare.x && square.y < this.selectedSquare.y).length - 1].select();
        }
    }

    selectNextBlankSquare() {
        // Selects the next cell without input, if the puzzle isn't full
        if (this.squares.find((square) => square.style === "cell" && square.textElement.value === "")) {
            this.selectNextSquare();
            while (this.selectedSquare.textElement.value !== "") {
                this.selectNextSquare();
            }
        } else {
            this.selectNextSquare();
        }
    }
}

export class GridSquare {
    constructor(parentGrid, x, y, style, clue, answer, circled, shadeLevel) {
        this.parentGrid = parentGrid;
        this.x = x; // x-coordinate
        this.y = y; // y-coordinate
        this.style = style; // Style of the square (e.g. "cell", "block", "invisible")
        this.clue = clue; // Clue of the square (Number)
        this.answer = answer // Answer of the square (Character)
        this.element = document.createElement("span");
        this.element.classList.add("oc-puzzle-square");
        parentGrid.element.appendChild(this.element);
        this.selected = false; // Whether the square is selected

        if (this.style === "block") {
            this.element.classList.add("oc-block");
        }
        if (circled) {
            this.element.classList.add("oc-cell");
            this.element.classList.add("oc-cell-circled");
        }
        if (shadeLevel || shadeLevel > 0) {
            this.element.classList.add(`oc-shaded-level-${shadeLevel}`);
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
            resizeClueFont.observe(this.clueElement.parentElement);
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
            this.textElement.ariaLabel = "Square answer".i18n();
            resizeInputFont.observe(this.textElement);
            this.element.appendChild(this.textElement);
            this.textElement.classList.add("oc-puzzle-square-text");
            this.answer = this.answer.toUpperCase();
            this.element.onclick = () => {
                if (this.selected) {
                    if (parentGrid.selectionDirection === "across") {
                        parentGrid.selectionDirection = "down";
                    } else if (parentGrid.selectionDirection === "down") {
                        parentGrid.selectionDirection = "across";
                    }
                }
                this.select();
            }
        }
        if (this.textElement) {
            this.textElement.onbeforeinput = (e) => {
                if (e.data === " ") e.preventDefault();
            }
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

    select() {
        // Makes this square the current selection
        for (const square of this.parentGrid.squares) {
            // Deselect all squares
            square.deselect();
            square.element.classList.remove("highlighted");
        }
        this.selected = true;
        this.element.classList.add("selected");
        this.parentGrid.selectedSquare = this;
        this.textElement.focus();
        this.textElement.select(); // Select the entered text so it can be overwritten

        if (this.clue) {
            for (const clue of parentGrid.clues) {
                if (clue.number === this.clue && this.style === "cell" && this.parentGrid.selectionDirection === clue.direction) {
                    clue.select();
                }
            }
        }
        let firstSquareNumber = this.parentGrid.backCheck();
        let firstSquare = this.parentGrid.squares.find(square => square.clue === firstSquareNumber);
        // Highlight all squares from `firstSquareNumber` to the next block
        if (this.parentGrid.selectionDirection === "across") {
            let rowSquares = this.parentGrid.squares.filter(square => square.y === firstSquare.y && square.x >= firstSquare.x);
            for (const square of rowSquares) {
                square.element.classList.add("highlighted");
                if (square.style === "block") {
                    break;
                }
            }
        } else if (this.parentGrid.selectionDirection === "down") {
            let columnSquares = this.parentGrid.squares.filter(square => square.x === firstSquare.x && square.y >= firstSquare.y);
            for (const square of columnSquares) {
                square.element.classList.add("highlighted");
                if (square.style === "block") {
                    break;
                }
            }
        }
    }

    deselect() {
        this.selected = false;
        this.element.classList.remove("selected");
        this.parentGrid.selectedSquare = undefined;
    }
}