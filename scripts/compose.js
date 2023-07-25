import compressAndEncode from "./compress.js";
import decompressAndDecode from "./decompress.js";
import GridSquare from "./grid-square.js";
import Grid from "./grid.js";

("use strict");

let puzzleContainer;

let gridContainer;

let myPuzzle;

let memento = []; // Stores previous puzzle states for undo/redo functionality
let mementoIndex = 0; // Stores the active memento's index
let shouldPushToMemento = true; // Whether or not to push a new memento to the memento array

class EditorGrid extends Grid {
  constructor(obj) {
    super(obj);

    this.acrossClues = [];
    this.downClues = [];

    this.rowColumnCheckboxes = [];

    if (this.width < 1 || this.height < 1) {
      gridContainer.textContent = "Invalid grid size";
    }
  }

  showEditorFunctions() {
    // Show a checkbox to the left of every row and at the top of every column that allows for easy multi-selection

    // Show the `select column` checkbox(es)
    this.element.style.gridTemplateColumns = `auto repeat(${this.obj["grid"][0].length}, 1fr)`;
    for (let i = this.obj["grid"][0].length; i > 0; i--) {
      this.element.prepend(new EditorCheckBox(i - 1, "x").container);
    }
    // Show the `select puzzle` checkbox
    this.element.prepend(new EditorCheckBox(null, "both").container);
    // Show the `select row` checkbox(es)
    for (const square of this.squares.filter((square) => square.x === 0)) {
      this.element.insertBefore(
        new EditorCheckBox(square.y, "y").container,
        square.element,
      );
    }
  }

  refreshCheckboxes() {
    // Sets the check state of each row/column and of the puzzle checkbox to the correct state
    for (const checkbox of this.rowColumnCheckboxes) {
      if (checkbox.axis === "both") {
        if (
          this.squares.filter(
            (square) => square.checkboxElement.checked === true,
          ).length === 0
        ) {
          // None are checked
          checkbox.element.indeterminate = false;
          checkbox.element.checked = false;
        } else if (
          this.squares.filter(
            (square) => square.checkboxElement.checked === false,
          ).length === 0
        ) {
          // All are checked
          checkbox.element.indeterminate = false;
          checkbox.element.checked = true;
        } else {
          // Some are checked
          checkbox.element.indeterminate = true;
          checkbox.element.checked = false;
        }
      } else if (checkbox.axis === "x") {
        if (
          this.squares.filter(
            (square) =>
              square.x === checkbox.position &&
              square.checkboxElement.checked === false,
          ).length === 0
        ) {
          // Entire column is checked
          checkbox.element.indeterminate = false;
          checkbox.element.checked = true;
        } else if (
          this.squares.filter(
            (square) =>
              square.x === checkbox.position &&
              square.checkboxElement.checked === true,
          ).length === 0
        ) {
          // Entire column is unchecked
          checkbox.element.indeterminate = false;
          checkbox.element.checked = false;
        } else {
          // Some squares in column are checked
          checkbox.element.indeterminate = true;
          checkbox.element.checked = false;
        }
      } else if (checkbox.axis === "y") {
        if (
          this.squares.filter(
            (square) =>
              square.y === checkbox.position &&
              square.checkboxElement.checked === false,
          ).length === 0
        ) {
          // Entire row is checked
          checkbox.element.indeterminate = false;
          checkbox.element.checked = true;
        } else if (
          this.squares.filter(
            (square) =>
              square.y === checkbox.position &&
              square.checkboxElement.checked === true,
          ).length === 0
        ) {
          // Entire row is unchecked
          checkbox.element.indeterminate = false;
          checkbox.element.checked = false;
        } else {
          // Some squares in row are checked
          checkbox.element.indeterminate = true;
          checkbox.element.checked = false;
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

  generate() {
    // Generates a puzzle from the current grid
    this.obj = {};

    // Create the "clues" object
    this.obj["clues"] = {};
    this.obj["clues"]["across"] = {};
    this.obj["clues"]["down"] = {};

    // Loop through every "Across" clue and set a key-value pair in the "clues" "across" object
    for (const clue of this.acrossClues) {
      this.obj["clues"]["across"][clue.numberElement.value] = {
        content: clue.textElement.value,
      };
    }

    // Loop through every "Down" clue and set a key-value pair in the "clues" "down" object
    for (const clue of this.downClues) {
      this.obj["clues"]["down"][clue.numberElement.value] = {
        content: clue.textElement.value,
      };
    }

    // Create the "grid" array
    this.obj["grid"] = [];

    // Create rows
    for (
      let i = 0;
      i < this.squares.filter((square) => square.y === 0).length;
      i++
    ) {
      this.obj["grid"].push([]);
    }

    // Loop through every square
    for (const square of this.squares) {
      let puzzleSquare = {};
      if (square.textElement) puzzleSquare["answer"] = square.textElement.value;
      if (square.numberInput && square.numberInput.value)
        puzzleSquare["clueNumber"] = parseInt(square.numberInput.value, 10);
      puzzleSquare["type"] = square.style;

      this.obj["grid"][square.y][square.x] = puzzleSquare;
    }

    // Create the "info" object
    this.obj["info"] = {};

    // Set the "title" key-value pair
    this.obj["info"]["title"] = myPuzzle.titleInput.inputElement.value;

    // Set the "author" key-value pair
    this.obj["info"]["author"] = myPuzzle.authorInput.inputElement.value;

    // Set the "contact" key-value pair
    this.obj["info"]["contact"] = myPuzzle.contactInput.inputElement.value;

    // Set the "description" key-value pair
    this.obj["info"]["description"] = myPuzzle.descriptionInput.value;

    // Set the "tags" key-value pair
    this.obj["info"]["tags"] =
      myPuzzle.tagsInput.inputElement.value.split(", ");

    // Set the "date_published" key-value pair
    let today = new Date();
    let dd = String(today.getDate()).padStart(2, "0");
    let mm = String(today.getMonth() + 1).padStart(2, "0");
    let yyyy = today.getFullYear();
    today = yyyy + "-" + mm + "-" + dd;
    this.obj["info"]["date_published"] = today;

    // Set the "language" key-value pair
    this.obj["info"]["language"] = myPuzzle.languageInput.value;

    this.data = JSON.stringify(this.obj);
  }

  async createDataLink() {
    // Creates a link string containing the puzzle data in the "d" or "dc" parameter
    // Compress the data if the browser supports the Compression Streams API
    if ("CompressionStream" in window) {
      this.generate();
      let dcParam = await compressAndEncode(this.data);
      return `solve.html?dc=${dcParam}`;
    } else {
      this.generate();
      return `solve.html?d=${encodeURIComponent(this.data)}`;
    }
  }

  downloadJSON() {
    // Creates a JSON file containing the puzzle data
    this.generate();
    const dataStr =
      "data:text/json;charset=utf-8," + encodeURIComponent(this.data);
    const downloadAnchorNode = document.createElement("a");
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("download", "puzzle.json");
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
  }
}

class EditorCheckBox {
  constructor(position, axis) {
    this.element = document.createElement("input");
    this.element.type = "checkbox";
    this.element.classList.add("oc-builder-row-column-checkbox");
    this.container = document.createElement("label");
    this.container.classList.add("oc-builder-row-column-checkbox-container");
    this.container.appendChild(this.element);

    this.axis = axis;
    this.position = position;

    myPuzzle.rowColumnCheckboxes.push(this);

    this.element.onchange = () => {
      if (axis === "both") {
        if (this.element.checked) {
          for (const square of myPuzzle.squares) {
            square.checkboxElement.checked = true;
          }
        } else {
          for (const square of myPuzzle.squares) {
            square.checkboxElement.checked = false;
          }
        }
      } else if (axis === "x") {
        let squares = myPuzzle.squares.filter(
          (square) => square.x === position,
        );
        if (this.element.checked) {
          for (const square of squares) {
            square.checkboxElement.checked = true;
          }
        } else {
          for (const square of squares) {
            square.checkboxElement.checked = false;
          }
        }
      } else if (axis === "y") {
        let squares = myPuzzle.squares.filter(
          (square) => square.y === position,
        );
        if (this.element.checked) {
          for (const square of squares) {
            square.checkboxElement.checked = true;
          }
        } else {
          for (const square of squares) {
            square.checkboxElement.checked = false;
          }
        }
      }
      myPuzzle.refreshCheckboxes();
    };
  }
}

class EditorGridSquare extends GridSquare {
  constructor(parentGrid, x, y, type, clueNumber, answer, circled, shadeLevel) {
    super(parentGrid, x, y, type, clueNumber, answer, circled, shadeLevel);

    this.checkboxElement = document.createElement("input");
    this.checkboxElement.type = "checkbox";
    this.checkboxElement.classList.add("oc-builder-square-checkbox");
    this.element.appendChild(this.checkboxElement);
    this.checkboxElement.onclick = (e) => {
      e.stopPropagation(); // Prevents selection of the associated square
    };
    this.checkboxElement.onchange = () => {
      this.parentGrid.refreshCheckboxes();
    };
    if (this.style === "cell") {
      this.numberInput = document.createElement("input");
      this.numberInput.type = "number";
      this.numberInput.placeholder = "#";
      this.numberInput.classList.add("oc-builder-square-clue-number-input");
      this.numberInput.value = clueNumber;
      this.element.appendChild(this.numberInput);
      try {
        this.clueElement.remove();
      } catch { }
      this.numberInput.onclick = (e) => {
        e.stopPropagation();
      };
      this.numberInput.onkeydown = (e) => {
        e.stopPropagation();
      };
    }
    try {
      this.textElement.value = answer;
    } catch { }
    try {
      this.textElement.addEventListener("input", () => {
        document.onchange();
      })
    } catch { }
    if (this.style !== "cell") {
      this.element.onclick = () => {
        this.checkboxElement.checked = !this.checkboxElement.checked;
        this.checkboxElement.onchange();
      };
    }
  }
}

class PuzzleClue {
  constructor(direction, parentElement) {
    this.direction = direction;
    this.element = document.createElement("div");
    this.element.classList.add("oc-builder-clue");
    this.textElement = document.createElement("input");
    this.textElement.type = "text";
    this.textElement.required = true;
    this.textElement.placeholder = "Clue description";
    this.textElement.classList.add("oc-builder-clue-text-input");
    this.numberElement = document.createElement("input");
    this.numberElement.type = "number";
    this.numberElement.required = true;
    this.numberElement.placeholder = "#";
    this.numberElement.classList.add("oc-builder-clue-number-input");
    this.element.appendChild(this.numberElement);
    this.element.appendChild(this.textElement);
    parentElement.appendChild(this.element);
  }
}

class PuzzleInfo {
  constructor(label, type, title, placeholder, parentElement) {
    this.labelElement = document.createElement("label");
    this.labelElement.textContent = label;
    this.labelElement.classList.add("oc-builder-info-input-label");
    this.inputElement = document.createElement("input");
    this.inputElement.classList.add("oc-builder-info-input");
    this.inputElement.type = type;
    this.inputElement.placeholder = placeholder;
    this.inputElement.title = title;
    this.inputElement.required = true;
    this.labelElement.appendChild(this.inputElement);
    parentElement.appendChild(this.labelElement);
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
  squareBlockSVG: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48"><path d="M9 6C8.2 6 7.50625 6.30625 6.90625 6.90625C6.30625 7.50625 6 8.2 6 9L6 39C6 39.8 6.30625 40.4938 6.90625 41.0938C7.50625 41.6938 8.2 42 9 42L39 42C39.8 42 40.4937 41.6938 41.0938 41.0938C41.6938 40.4938 42 39.8 42 39L42 9C42 8.2 41.6938 7.50625 41.0938 6.90625C40.4938 6.30625 39.8 6 39 6L9 6Z"/></svg>`,
  squareCellSVG: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48"><path d="M9 42q-1.2 0-2.1-.9Q6 40.2 6 39V9q0-1.2.9-2.1Q7.8 6 9 6h30q1.2 0 2.1.9.9.9.9 2.1v30q0 1.2-.9 2.1-.9.9-2.1.9Zm0-3h30V9H9v30Z"/></svg>`,
  squareInvisibleSVG: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48"><path d="m16.8 33.3 7.2-7.2 7.2 7.2 2.1-2.1-7.2-7.2 7.2-7.2-2.1-2.1-7.2 7.2-7.2-7.2-2.1 2.1 7.2 7.2-7.2 7.2ZM9 42q-1.2 0-2.1-.9Q6 40.2 6 39V9q0-1.2.9-2.1Q7.8 6 9 6h30q1.2 0 2.1.9.9.9.9 2.1v30q0 1.2-.9 2.1-.9.9-2.1.9Zm0-3h30V9H9v30ZM9 9v30V9Z"/></svg>`,
  squareEditSVG: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48"><path d="M9 47.4q-1.2 0-2.1-.9-.9-.9-.9-2.1v-30q0-1.2.9-2.1.9-.9 2.1-.9h20.25l-3 3H9v30h30V27l3-3v20.4q0 1.2-.9 2.1-.9.9-2.1.9Zm15-18Zm9.1-17.6 2.15 2.1L21 28.1v4.3h4.25l14.3-14.3 2.1 2.1L26.5 35.4H18v-8.5Zm8.55 8.4-8.55-8.4 5-5q.85-.85 2.125-.85t2.125.9l4.2 4.25q.85.9.85 2.125t-.9 2.075Z"/></svg>`,
  downloadPuzzleSVG: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48"><path d="M11 40q-1.2 0-2.1-.9Q8 38.2 8 37v-7.15h3V37h26v-7.15h3V37q0 1.2-.9 2.1-.9.9-2.1.9Zm13-7.65-9.65-9.65 2.15-2.15 6 6V8h3v18.55l6-6 2.15 2.15Z"/></svg>`,
  sharePuzzleSVG: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48"><path d="M11 46q-1.2 0-2.1-.9Q8 44.2 8 43V17.55q0-1.2.9-2.1.9-.9 2.1-.9h8.45v3H11V43h26V17.55h-8.55v-3H37q1.2 0 2.1.9.9.9.9 2.1V43q0 1.2-.9 2.1-.9.9-2.1.9Zm11.45-15.35V7.8l-4.4 4.4-2.15-2.15L23.95 2 32 10.05l-2.15 2.15-4.4-4.4v22.85Z"/></svg>`,
  addSVG: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48"><path d="M22.5 38V25.5H10v-3h12.5V10h3v12.5H38v3H25.5V38Z"/></svg>`,
  removeSVG: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48"><path d="M10 25.5v-3h28v3Z"/></svg>`,
  playSVG: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48"><path d="M16 37.85v-28l22 14Zm3-14Zm0 8.55 13.45-8.55L19 15.3Z"/></svg>`,
  searchSVG: `<svg xmlns="http://www.w3.org/2000/svg" height="48" viewBox="0 96 960 960" width="48"><path d="M796 935 533 672q-30 26-69.959 40.5T378 727q-108.162 0-183.081-75Q120 577 120 471t75-181q75-75 181.5-75t181 75Q632 365 632 471.15 632 514 618 554q-14 40-42 75l264 262-44 44ZM377 667q81.25 0 138.125-57.5T572 471q0-81-56.875-138.5T377 275q-82.083 0-139.542 57.5Q180 390 180 471t57.458 138.5Q294.917 667 377 667Z"/></svg>`,
  closeSVG: `<svg xmlns="http://www.w3.org/2000/svg" height="48" viewBox="0 96 960 960" width="48"><path d="m249 849-42-42 231-231-231-231 42-42 231 231 231-231 42 42-231 231 231 231-42 42-231-231-231 231Z"/></svg>`,
  insertSVG: `<svg xmlns="http://www.w3.org/2000/svg" height="48" viewBox="0 -960 960 960" width="48"><path d="M439-120v-60h83v60h-83Zm0-660v-60h83v60h-83Zm170 660v-60h83v60h-83Zm0-660v-60h83v60h-83Zm171 660v-60h60v60h-60Zm0-660v-60h60v60h-60ZM120-120v-60h86v-600h-86v-60h231v60h-85v600h85v60H120Zm574-214-42-42 73-74H414v-60h311l-73-74 42-42 146 146-146 146Z"/></svg>`,
  undoSVG: `<svg xmlns="http://www.w3.org/2000/svg" height="48" viewBox="0 -960 960 960" width="48"><path d="M259-200v-60h310q70 0 120.5-46.5T740-422q0-69-50.5-115.5T569-584H274l114 114-42 42-186-186 186-186 42 42-114 114h294q95 0 163.5 64T800-422q0 94-68.5 158T568-200H259Z"/></svg>`,
  redoSVG: `<svg xmlns="http://www.w3.org/2000/svg" height="48" viewBox="0 -960 960 960" width="48"><path d="M392-200q-95 0-163.5-64T160-422q0-94 68.5-158T392-644h294L572-758l42-42 186 186-186 186-42-42 114-114H391q-70 0-120.5 46.5T220-422q0 69 50.5 115.5T391-260h310v60H392Z"/></svg>`,
};

function populateToolBar() {
  const UIContainer = document.createElement("div");
  UIContainer.classList.add("oc-builder-ui-container");
  document.getElementById("oc-build-view").appendChild(UIContainer);

  let toolBarElement = document.createElement("nav");
  UIContainer.appendChild(toolBarElement);
  UIContainer.appendChild(document.createElement("hr"));
  let undoButton = new ControlButton("Undo", icon["undoSVG"], toolBarElement);
  undoButton.element.onclick = () => {
    undo();
  };
  let redoButton = new ControlButton("Redo", icon["redoSVG"], toolBarElement);
  redoButton.element.onclick = () => {
    redo();
  };
  let makeCellButton = new ControlButton(
    "Make cell",
    icon["squareCellSVG"],
    toolBarElement,
  );
  makeCellButton.element.onclick = () => {
    transformSquares("cell");
  };
  let makeBlockButton = new ControlButton(
    "Make block",
    icon["squareBlockSVG"],
    toolBarElement,
  );
  makeBlockButton.element.onclick = () => {
    transformSquares("block");
  };
  let makeInvisibleButton = new ControlButton(
    "Make invisible",
    icon["squareInvisibleSVG"],
    toolBarElement,
  );
  makeInvisibleButton.element.onclick = () => {
    transformSquares("invisible");
  };
  let insertButton = new ControlButton(
    "Insert" + "…",
    icon["insertSVG"],
    toolBarElement,
  );
  insertButton.element.onclick = () => {
    displayInsertDialog();
  };
  let sharePuzzleButton = new ControlButton(
    "Share" + "…",
    icon["sharePuzzleSVG"],
    toolBarElement,
  );
  sharePuzzleButton.element.onclick = () => {
    displayShareDialog();
  };
  let downloadPuzzleButton = new ControlButton(
    "Download puzzle JSON file",
    icon["downloadPuzzleSVG"],
    toolBarElement,
  );
  downloadPuzzleButton.element.onclick = () => {
    myPuzzle.downloadJSON();
  };
  let playPuzzleButton = new ControlButton(
    "Play puzzle in new tab" + "…",
    icon["playSVG"],
    toolBarElement,
  );
  playPuzzleButton.element.onclick = async () => {
    window.open(await myPuzzle.createDataLink(), "_blank");
  };
  let wordHelperButton = new ControlButton(
    "Word helper" + "…",
    icon["searchSVG"],
    toolBarElement,
  );
  wordHelperButton.element.onclick = () => {
    displayWordHelperDialog();
  };
}

function transformSquares(destinationType) {
  if (
    myPuzzle.squares.filter((square) => square.checkboxElement.checked).length >
    0
  ) {
    // Transform all checked squares
    for (let square of myPuzzle.squares.filter(
      (square) => square.checkboxElement.checked,
    )) {
      let newSquare = new EditorGridSquare(
        myPuzzle,
        square.x,
        square.y,
        destinationType,
        null,
        null,
        null,
        null,
      );
      square.element.replaceWith(newSquare.element);
      myPuzzle.squares[myPuzzle.squares.indexOf(square)] = newSquare;
    }
    myPuzzle.refreshCheckboxes();
  } else {
    // Transform selected square
    let x = myPuzzle.selectedSquare.x;
    let y = myPuzzle.selectedSquare.y;
    let newSquare = new EditorGridSquare(
      myPuzzle,
      x,
      y,
      destinationType,
      null,
      null,
      null,
      null,
    );
    myPuzzle.selectedSquare.element.replaceWith(newSquare.element);
    myPuzzle.squares[myPuzzle.squares.indexOf(myPuzzle.selectedSquare)] =
      newSquare;
    newSquare.select();
  }
}

async function displayShareDialog() {
  myPuzzle.generate();
  if (navigator.share) {
    navigator
      .share({
        title: `${myPuzzle.obj["info"]["title"]}, by ${myPuzzle.obj["info"]["author"]} - OpenCrossword`,
        url: await myPuzzle.createDataLink(),
      })
      .catch(console.error);
  } else {
    navigator.clipboard.writeText(await myPuzzle.createDataLink()).then(
      () => {
        /* clipboard successfully set */
        window.alert("Link copied to clipboard");
      },
      () => {
        /* clipboard write failed */
        window.alert("Failed to copy link to clipboard");
      },
    );
  }
}

function displayInfo(obj) {
  // Display a PuzzleClue for each direction (i.e. "Across", "Down"), with a button to add a clue
  let infoContainer = document.createElement("div");
  infoContainer.classList.add("oc-builder-info-container");
  puzzleContainer.appendChild(infoContainer);
  let acrossLabel = document.createElement("h2");
  acrossLabel.classList.add("info-header");
  infoContainer.appendChild(acrossLabel);
  acrossLabel.textContent = "Across";

  let acrossClues = document.createElement("form");
  acrossClues.classList.add("oc-builder-clue-list");
  infoContainer.appendChild(acrossClues);

  let addAcrossClueButton = new ControlButton(
    "Add a horizontal clue",
    icon["addSVG"],
    infoContainer,
  );
  addAcrossClueButton.element.classList.add("oc-builder-clue-list-button");
  addAcrossClueButton.element.onclick = () => {
    myPuzzle.acrossClues.push(new PuzzleClue("across", acrossClues));
  };
  let removeAcrossClueButton = new ControlButton(
    "Remove last horizontal clue",
    icon["removeSVG"],
    infoContainer,
  );
  removeAcrossClueButton.element.onclick = () => {
    acrossClues.removeChild(acrossClues.lastChild);
    myPuzzle.acrossClues.pop();
  };

  let downLabel = document.createElement("h2");
  downLabel.classList.add("info-header");
  infoContainer.appendChild(downLabel);
  downLabel.textContent = "Down";

  let downClues = document.createElement("form");
  downClues.classList.add("oc-builder-clue-list");
  infoContainer.appendChild(downClues);

  let addDownClueButton = new ControlButton(
    "Add a vertical clue",
    icon["addSVG"],
    infoContainer,
  );
  addDownClueButton.element.classList.add("oc-builder-clue-list-button");
  addDownClueButton.element.onclick = () => {
    myPuzzle.downClues.push(new PuzzleClue("down", downClues));
  };
  let removeDownClueButton = new ControlButton(
    "Remove last vertical clue",
    icon["removeSVG"],
    infoContainer,
  );
  removeDownClueButton.element.onclick = () => {
    downClues.removeChild(downClues.lastChild);
    myPuzzle.downClues.pop();
  };
  // Display a form for entering puzzle metadata
  let infoHeader = document.createElement("h2");
  infoHeader.classList.add("info-header");
  infoHeader.textContent = "Puzzle info";
  let infoForm = document.createElement("form");
  infoContainer.appendChild(infoHeader);
  infoContainer.appendChild(infoForm);

  myPuzzle.titleInput = new PuzzleInfo(
    "Title",
    "text",
    "Enter the title to your puzzle",
    "Puzzle title",
    infoForm,
  );
  myPuzzle.authorInput = new PuzzleInfo(
    "Author",
    "text",
    "Enter your or the puzzle author's name",
    "Your name",
    infoForm,
  );
  myPuzzle.contactInput = new PuzzleInfo(
    "Contact",
    "email",
    "Enter an e-mail address you or the author have access to",
    "Your email address",
    infoForm,
  );

  let descriptionInputLabel = document.createElement("label");
  descriptionInputLabel.textContent = "Description";
  descriptionInputLabel.classList.add("oc-builder-info-input-label");
  myPuzzle.descriptionInput = document.createElement("textarea");
  myPuzzle.descriptionInput.classList.add("oc-builder-info-input");
  myPuzzle.descriptionInput.placeholder = "Puzzle description";
  myPuzzle.descriptionInput.title =
    "Enter a quick paragraph describing your puzzle's theme";
  myPuzzle.descriptionInput.rows = 4;
  descriptionInputLabel.appendChild(myPuzzle.descriptionInput);
  infoForm.appendChild(descriptionInputLabel);

  myPuzzle.tagsInput = new PuzzleInfo(
    "Tags",
    "text",
    "Enter keywords associated with your puzzle, seperated by a comma (,) with trailing whitespace",
    "Puzzle tags (seperated by a comma-space)",
    infoForm,
  );
  myPuzzle.languageInput = document.createElement("select");
  myPuzzle.languageInput.options.add(new Option("English", "en"));
  myPuzzle.languageInput.options.add(new Option("Français", "fr"));
  myPuzzle.languageInput.options.add(
    new Option("Deutsch (UI support coming soon)", "de"),
  );
  myPuzzle.languageInput.options.add(
    new Option("Italian (UI support coming soon)", "it"),
  );
  myPuzzle.languageInput.options.add(
    new Option("Spanish (UI support coming soon)", "es"),
  );
  myPuzzle.languageInput.options.add(new Option("Other", null));
  infoForm.appendChild(document.createElement("label"));
  infoForm.lastChild.textContent = "Language";
  infoForm.lastChild.appendChild(myPuzzle.languageInput);

  if (obj["info"] || obj["clues"]) {
    // Load the clues and info from `obj` if they exist
    try {
      myPuzzle.titleInput.inputElement.value = obj["info"]["title"];
      myPuzzle.authorInput.inputElement.value = obj["info"]["author"];
      myPuzzle.contactInput.inputElement.value = obj["info"]["contact"];
      myPuzzle.descriptionInput.value = obj["info"]["description"];
      for (let tag of obj["info"]["tags"]) {
        myPuzzle.tagsInput.inputElement.value += tag + ", ";
      }
      myPuzzle.tagsInput.inputElement.value =
        myPuzzle.tagsInput.inputElement.value.slice(0, -2);
      myPuzzle.languageInput.value = obj["info"]["language"];
    } catch { }
    for (const clue of Object.entries(obj["clues"]["across"])) {
      let NewClue = new PuzzleClue("across", acrossClues);
      NewClue.textElement.value = clue[1]["content"].toString();
      NewClue.numberElement.value = clue[0];
      myPuzzle.acrossClues.push(NewClue);
    }
    for (const clue of Object.entries(obj["clues"]["down"])) {
      let NewClue = new PuzzleClue("down", downClues);
      NewClue.textElement.value = clue[1]["content"].toString();
      NewClue.numberElement.value = clue[0];
      myPuzzle.downClues.push(NewClue);
    }
  }
}

function displayWordHelperDialog() {
  let dialog = document.createElement("dialog");
  dialog.classList.add("oc-dialog");
  let dialogTitleBar = document.createElement("div");
  let dialogTitle = document.createElement("h2");
  dialogTitle.textContent = "Word Helper";
  let titleBarSeparator = document.createElement("hr");
  let frame = document.createElement("iframe");
  frame.src = `${document.baseURI}frames/word-helper.html`;
  let dialogCloseButton = new ControlButton(
    "Close",
    icon["closeSVG"],
    dialogTitleBar,
  );
  dialogCloseButton.element.onclick = () => {
    dialog.close();
    dialog.remove();
  };
  dialogTitleBar.appendChild(dialogTitle);
  dialog.appendChild(dialogTitleBar);
  dialog.appendChild(titleBarSeparator);
  dialog.appendChild(frame);
  document.body.appendChild(dialog);
  dialog.showModal();
}

function displayInsertDialog() {
  let dialog = document.createElement("dialog");
  dialog.classList.add("oc-dialog");
  let dialogTitleBar = document.createElement("div");
  let dialogTitle = document.createElement("h2");
  dialogTitle.textContent = "Insert";
  let titleBarSeparator = document.createElement("hr");
  let frame = document.createElement("iframe");
  frame.src = `${document.baseURI}frames/insert.html`;
  frame.name = "oc-insert-frame";
  let dialogCloseButton = new ControlButton(
    "Close",
    icon["closeSVG"],
    dialogTitleBar,
  );
  dialogCloseButton.element.onclick = () => {
    dialog.close();
    dialog.remove();
  };
  dialogTitleBar.appendChild(dialogTitle);
  dialog.appendChild(dialogTitleBar);
  dialog.appendChild(titleBarSeparator);
  dialog.appendChild(frame);
  document.body.appendChild(dialog);
  dialog.showModal();

  // Implement inserting functionality
  frame.onload = () => {
    frame.contentWindow.document.getElementById("oc-insert-form").onsubmit = (
      e,
    ) => {
      e.preventDefault();
      dialog.close();
      myPuzzle.insertText(
        frame.contentWindow.document.getElementById("oc-insert-field").value,
      );
    };
  };
}

function populateGrid(obj) {
  // Fill in a grid with object data
  document.getElementById("oc-build-view").innerHTML = "";
  populateToolBar();
  puzzleContainer = document.createElement("div");
  puzzleContainer.classList.add("oc-builder-puzzle-container");
  document.getElementById("oc-build-view").appendChild(puzzleContainer);
  gridContainer = document.createElement("form");
  gridContainer.classList.add("oc-grid-container");
  puzzleContainer.appendChild(gridContainer);
  myPuzzle = new EditorGrid(obj);
  myPuzzle.populate(gridContainer, EditorGridSquare);
  myPuzzle.showEditorFunctions();
  displayInfo(obj);
  pushToMemento();
}

function showSplashScreen() {
  let splashScreen = document.createElement("dialog");
  splashScreen.id = "oc-splash-screen";
  splashScreen.classList.add("oc-splash-screen");
  splashScreen.innerHTML = `<div>
        <div class="oc-splash-screen-title">
            <button onclick="history.back()">‹Back</button>
            <h1>OpenCrossword<br>Editor</h1>
        </div>
        <p><b>Create a New Puzzle</b></p>
        <img alt="OpenCrossword banner" src="${document.baseURI}images/splash-screen.jpg">
    </div>
    <form method="dialog">
        <label class="oc-splash-screen-info-input-label">Grid Width
            <input autofocus class="oc-splash-screen-info-input" id="oc-splash-screen-info-input-grid-width" placeholder="Width" required="" title="Enter the width of your puzzle" type="number">
        </label>
        <label class="oc-splash-screen-info-input-label">Grid Height
            <input class="oc-splash-screen-info-input" id="oc-splash-screen-info-input-grid-height" placeholder="Height" required="" title="Enter the height of your puzzle" type="number">
        </label>
        <label class="oc-splash-screen-info-input-label">
            <input class="oc-splash-screen-info-input" required="" title="Create a new puzzle" type="submit" value="Create">
        </label>
        <hr>
        <label class="oc-splash-screen-info-input-label">
            <input class="oc-splash-screen-info-input" id="oc-splash-screen-open-button" required="" title="Open an existing puzzle" type="button" value="Open…">
        </label>
        </form>`;

  document.body.appendChild(splashScreen);
  splashScreen.showModal();

  document.getElementById("oc-splash-screen").onsubmit = () => {
    let gridWidth = parseInt(
      document.getElementById("oc-splash-screen-info-input-grid-width").value,
      10,
    );
    let gridHeight = parseInt(
      document.getElementById("oc-splash-screen-info-input-grid-height").value,
      10,
    );
    populateGrid(createEmptyPuzzleObj(gridWidth, gridHeight));
    document.getElementById("oc-splash-screen").remove();
  };
  document.getElementById("oc-splash-screen-open-button").onclick = () => {
    showOpenForm();
  };
}

function createEmptyPuzzleObj(width, height) {
  let obj = {};
  obj["grid"] = [];

  for (let i = 0; i < height; i++) {
    obj["grid"][i] = [];
    for (let j = 0; j < width; j++) {
      obj["grid"][i][j] = {
        type: "cell",
        answer: null,
      };
    }
  }
  obj["clues"] = {
    across: { null: { content: "" } },
    down: { null: { content: "" } },
  };
  return obj;
}

function showOpenForm() {
  let openGridForm = document.createElement("form");
  openGridForm.method = "dialog";
  let sourceSelector = document.createElement("select");
  sourceSelector.options.add(new Option("Load From File", "file"));
  sourceSelector.options.add(new Option("Load From Link", "url"));
  openGridForm.appendChild(sourceSelector);
  let loadInputArea = document.createElement("div");
  openGridForm.appendChild(loadInputArea);
  sourceSelector.onchange = (event) => {
    event.preventDefault();
    loadInputArea.innerHTML = "";

    if (sourceSelector.value === "file") {
      let fileInput = new PuzzleInfo(
        "File",
        "file",
        "Select a file to load",
        "",
        loadInputArea,
      );
      fileInput.inputElement.accept = ".json";
      fileInput.inputElement.multiple = false;
      fileInput.inputElement.id = "file-input";
    }
    if (sourceSelector.value === "url") {
      let urlInput = new PuzzleInfo(
        "URL",
        "url",
        "Enter a puzzle URL to load",
        "",
        loadInputArea,
      );
      urlInput.inputElement.id = "url-input";
    }
  };
  let gridCreateButton = new PuzzleInfo(
    null,
    "submit",
    "Open Puzzle",
    null,
    openGridForm,
  );
  gridCreateButton.inputElement.value = "Open";
  sourceSelector.onchange(new Event("change"));

  openGridForm.onsubmit = (event) => {
    event.preventDefault();
    if (sourceSelector.value === "file") {
      // Get the object data from the JSON file
      document
        .getElementById("file-input")
        .files[0].text()
        .then((fileContent) => {
          populateGrid(JSON.parse(fileContent));
        });
    }
    if (sourceSelector.value === "url") {
      let params = new URLSearchParams(
        document.getElementById("url-input").value.toQueryString(),
      );
      if (params.has("p")) {
        // Fetch the object data from the puzzle URL
        let fileURL = `${document.baseURI}data/puzzles/${params
          .get("p")
          .toString()}.json`;
        fetch(fileURL)
          .then((response) => response.json())
          .then((object) => populateGrid(object));
      }
      if (params.has("d")) {
        // Fetch the object data from the data URL
        populateGrid(JSON.parse(params.get("d").toString()));
      }
    }
  };
  document
    .getElementById("oc-splash-screen")
    .removeChild(document.getElementById("oc-splash-screen").lastChild);
  document
    .getElementById("oc-splash-screen")
    .getElementsByTagName("b")[0].textContent = "Open a Puzzle";
  document.getElementById("oc-splash-screen").appendChild(openGridForm);
  document.getElementById("oc-splash-screen").onsubmit = () => {
    document.getElementById("oc-splash-screen").remove();
  };
}

function pushToMemento() {
  if (shouldPushToMemento) {
    myPuzzle.generate();
    if (
      !(
        JSON.stringify(memento[memento.length - 1]) ===
        JSON.stringify(myPuzzle.obj)
      )
    ) {
      // If current memento is last one in array, push
      // Else, remove all mementos after current one, then push
      if (mementoIndex === memento.length - 1) {
        memento.push(myPuzzle.obj);
        mementoIndex++;
      } else {
        memento = memento.slice(0, mementoIndex + 1);
        memento.push(myPuzzle.obj);
        mementoIndex++;
      }
    }

  }
}

function undo() {
  if (mementoIndex - 1 >= 0) {
    shouldPushToMemento = false;
    mementoIndex--;
    populateGrid(memento[mementoIndex]);
    console.log(memento);
    shouldPushToMemento = true;
  } else {
    console.log("Cannot undo: no previous state");
  }
}

function redo() {
  if (mementoIndex + 1 < memento.length) {
    shouldPushToMemento = false;
    mementoIndex++;
    populateGrid(memento[mementoIndex]);
    console.log(memento);
    shouldPushToMemento = true;
  } else {
    console.log("Cannot redo: no next state");
  }
}

String.prototype.toQueryString = function() {
  // Remove all characters that precede "?"
  return this.substring(this.indexOf("?"));
};
let params = new URLSearchParams(document.location.search);
if (params.has("l")) {
  let targetURL = params.get("l").toString().toQueryString();
  let targetParams = new URLSearchParams(targetURL);
  if (targetParams.has("p")) {
    // Fetch the object data from the puzzle URL
    let fileURL = `${document.baseURI}data/puzzles/${targetParams
      .get("p")
      .toString()}.json`;
    fetch(fileURL)
      .then((response) => response.json())
      .then((object) => populateGrid(object));
  }
  if (targetParams.has("d")) {
    // Fetch the object data from the data URL
    populateGrid(JSON.parse(targetParams.get("d").toString()));
  }
  if (targetParams.has("dc")) {
    // Fetch the object data from the data URL
    populateGrid(
      JSON.parse(await decompressAndDecode(targetParams.get("dc").toString())),
    );
  }
} else {
  showSplashScreen();
}

document.addEventListener("keydown", (e) => {
  if (
    (!e.shiftKey && e.metaKey && e.key === "z") ||
    (!e.shiftKey && e.ctrlKey && e.key === "z")
  ) {
    e.preventDefault();
    undo();
  } else if (
    (e.shiftKey && e.metaKey && e.key === "z") ||
    (e.shiftKey && e.ctrlKey && e.key === "z") ||
    (e.metaKey && e.key === "y") ||
    (e.ctrlKey && e.key === "y")
  ) {
    e.preventDefault();
    redo();
  }
});

document.onchange = () => {
  pushToMemento();
};

console.info(
  "%cStarted OpenCrossword Editor…",
  'font-family: "Times New Roman", Times, serif; font-weight: bold; font-size: 20px;',
);
