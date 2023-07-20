export default class GridSquare {
  constructor(parentGrid, x, y, type, clueNumber, answer, circled, shadeLevel) {
    this.parentGrid = parentGrid;
    this.x = x; // x-coordinate
    this.y = y; // y-coordinate
    this.style = type; // Style of the square (e.g. "cell", "block", "invisible")
    this.clue = clueNumber; // Clue of the square (Number)
    this.answer = answer; // Answer of the square (Character)
    this.element = document.createElement("span");
    this.element.classList.add("oc-puzzle-square");
    parentGrid.element.appendChild(this.element);
    this.selected = false; // Whether the square is selected

    if (circled) {
      this.element.classList.add("oc-cell");
      this.element.classList.add("oc-cell-circled");
    }
    if (shadeLevel || shadeLevel > 0) {
      this.element.classList.add(`oc-shaded-level-${shadeLevel}`);
    }

    if (this.style === "block") {
      this.element.classList.add("oc-block");
    } else if (this.style === "cell") {
      if (this.clue) {
        this.clueElement = document.createElement("span");
        this.element.appendChild(this.clueElement);
        this.clueElement.classList.add("oc-puzzle-square-clue");
        this.clueElement.textContent = this.clue;
        this.parentGrid.resizeClueFont.observe(this.clueElement.parentElement);
      }
      this.element.classList.add("oc-cell");
      this.textElement = document.createElement("input");
      this.textElement.type = "text";
      this.textElement.maxLength = 1;
      this.textElement.spellcheck = false;
      this.textElement.enterKeyHint = "next";
      this.textElement.setAttribute("autocorrect", "off");
      this.textElement.setAttribute("autocomplete", "off");
      this.textElement.setAttribute("autocapitalize", "characters");
      try {
        this.textElement.ariaLabel = "Square answer".i18n();
      } catch {
        this.textElement.ariaLabel = "Square answer";
      }
      this.parentGrid.resizeInputFont.observe(this.textElement);
      this.element.appendChild(this.textElement);
      this.textElement.classList.add("oc-puzzle-square-text");
      if (this.answer) this.answer = this.answer.toUpperCase();
      this.textElement.oninput = (e) => {
        if (e.data) {
          parentGrid.selectNextSquare();
        }
      };
      this.element.onclick = () => {
        if (this.selected) {
          if (parentGrid.selectionDirection === "across") {
            parentGrid.selectionDirection = "down";
          } else if (parentGrid.selectionDirection === "down") {
            parentGrid.selectionDirection = "across";
          }
        }
        this.select();
      };
      this.textElement.onbeforeinput = (e) => {
        if (e.data === " ") e.preventDefault();
      };
    } else if (this.style === "invisible") {
      this.element.classList.add("oc-invisible", "oc-block");
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
    try {
      this.textElement.focus();
      this.textElement.select(); // Select the entered text so it can be overwritten
    } catch {}
    try {
      let firstSquareNumber = this.parentGrid.backCheck();
      let firstSquare = this.parentGrid.squares.find(
        (square) => square.clue === firstSquareNumber,
      );
      // Highlight all squares from `firstSquareNumber` to the next block
      if (this.parentGrid.selectionDirection === "across") {
        let rowSquares = this.parentGrid.squares.filter(
          (square) => square.y === firstSquare.y && square.x >= firstSquare.x,
        );
        for (const square of rowSquares) {
          square.element.classList.add("highlighted");
          if (square.style === "block") {
            break;
          }
        }
      } else if (this.parentGrid.selectionDirection === "down") {
        let columnSquares = this.parentGrid.squares.filter(
          (square) => square.x === firstSquare.x && square.y >= firstSquare.y,
        );
        for (const square of columnSquares) {
          square.element.classList.add("highlighted");
          if (square.style === "block") {
            break;
          }
        }
      }
    } catch {
      if (this.parentGrid.selectionDirection === "across") {
        for (const square of this.parentGrid.squares.filter(
          (square) => square.y === this.y,
        )) {
          square.element.classList.add("highlighted");
        }
      } else if (this.parentGrid.selectionDirection === "down") {
        for (const square of this.parentGrid.squares.filter(
          (square) => square.x === this.x,
        )) {
          square.element.classList.add("highlighted");
        }
      }
    }
    // Set the cursor to reflect `parentGrid.selectionDirection`
    if (this.parentGrid.selectionDirection === "across") {
      for (const square of this.parentGrid.squares.filter(
        (square) => square.style === "cell",
      )) {
        square.textElement.style.cursor = "text";
        try {
          square.clueElement.style.cursor = "text";
        } catch {}
      }
    } else if (this.parentGrid.selectionDirection === "down") {
      for (const square of this.parentGrid.squares.filter(
        (square) => square.style === "cell",
      )) {
        square.textElement.style.cursor = "vertical-text";
        try {
          square.clueElement.style.cursor = "vertical-text";
        } catch {}
      }
    }
  }

  deselect() {
    this.selected = false;
    this.element.classList.remove("selected");
    this.parentGrid.selectedSquare = undefined;
  }
}
