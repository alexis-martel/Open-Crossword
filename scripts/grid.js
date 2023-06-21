export default class Grid {
    constructor(obj) {
        this.obj = obj;
        this.squares = []; // Stores all squares in the puzzle
        this.selectedSquare = null; // Stores the selected square
        this.selectionDirection = "across"; // Stores the direction of the selection ("across" or "down")
    }

    populate(parentElement, Square) {
        this.element = parentElement;

        this.resizeInputFont = new ResizeObserver((entries) => {
            for (const entry of entries) {
                entry.target.style.fontSize = (entry.contentRect.height * 0.70) + "px";
            }
        });

        this.resizeClueFont = new ResizeObserver((entries) => {
            for (const entry of entries) {
                entry.target.firstChild.style.fontSize = (entry.target.clientHeight * 0.3) + "px";
                entry.target.firstChild.style.top = (entry.target.clientHeight * 0.05) + "px";
                entry.target.firstChild.style.left = (entry.target.clientHeight * 0.05) + "px";
            }
        });

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
            this.squares.filter((square) => square.y === this.selectedSquare.y && square.x < this.selectedSquare.x && square.style === "cell")[this.squares.filter((square) => square.y === this.selectedSquare.y && square.x < this.selectedSquare.x && square.style === "cell").length - 1].select();
        } else if (this.selectionDirection === "down") {
            this.squares.filter((square) => square.x === this.selectedSquare.x && square.y < this.selectedSquare.y && square.style === "cell")[this.squares.filter((square) => square.x === this.selectedSquare.x && square.y < this.selectedSquare.y && square.style === "cell").length - 1].select();
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
