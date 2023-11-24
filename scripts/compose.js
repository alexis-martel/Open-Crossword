import compressAndEncode from "./compression/compress.js";
import decompressAndDecode from "./compression/decompress.js";
import GridSquare from "./grid/grid-square.js";
import Grid from "./grid/grid.js";
import OCButton from "./ui/ui-button.js";
import OCIcons from "./ui/ui-icons.js";
import OCDialog from "./ui/ui-dialog.js";

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
      i < this.squares.filter((square) => square.x === 0).length;
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
    this.obj["info"]["title"] = this.titleInput.inputElement.value;

    // Set the "author" key-value pair
    this.obj["info"]["author"] = this.authorInput.inputElement.value;

    // Set the "contact" key-value pair
    this.obj["info"]["contact"] = this.contactInput.inputElement.value;

    // Set the "description" key-value pair
    this.obj["info"]["description"] = this.descriptionInput.value;

    // Set the "tags" key-value pair
    this.obj["info"]["tags"] = this.tagsInput.inputElement.value.split(", ");

    // Set the "date_published" key-value pair
    let today = new Date();
    let dd = String(today.getDate()).padStart(2, "0");
    let mm = String(today.getMonth() + 1).padStart(2, "0");
    let yyyy = today.getFullYear();
    today = yyyy + "-" + mm + "-" + dd;
    this.obj["info"]["date_published"] = today;

    // Set the "language" key-value pair
    this.obj["info"]["language"] = this.languageInput.value;

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

  transformSquares(destinationType) {
    if (
      this.squares.filter((square) => square.checkboxElement.checked).length > 0
    ) {
      // Transform all checked squares
      for (let square of this.squares.filter(
        (square) => square.checkboxElement.checked,
      )) {
        let newSquare = new EditorGridSquare(
          this,
          square.x,
          square.y,
          destinationType,
          null,
          null,
          null,
          null,
        );
        square.element.replaceWith(newSquare.element);
        this.squares[this.squares.indexOf(square)] = newSquare;
      }
      this.refreshCheckboxes();
    } else {
      // Transform selected square
      let x = this.selectedSquare.x;
      let y = this.selectedSquare.y;
      let newSquare = new EditorGridSquare(
        this,
        x,
        y,
        destinationType,
        null,
        null,
        null,
        null,
      );
      this.selectedSquare.element.replaceWith(newSquare.element);
      this.squares[this.squares.indexOf(this.selectedSquare)] = newSquare;
      newSquare.select();
    }
    this.pushToMemento();
  }

  displayInfo(obj) {
    // Populates the `Info` form section
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
    new OCButton({
      icon: OCIcons.add,
      tooltip: "Add a horizontal clue",
      parent: infoContainer,
      classes: ["oc-builder-clue-list-button"],
      action: () => {
        this.acrossClues.push(new PuzzleClue("across", acrossClues));
      },
    });
    new OCButton({
      icon: OCIcons.remove,
      tooltip: "Remove last horizontal clue",
      parent: infoContainer,
      classes: ["oc-builder-clue-list-button"],
      action: () => {
        acrossClues.removeChild(acrossClues.lastChild);
        this.acrossClues.pop();
      },
    });

    let downLabel = document.createElement("h2");
    downLabel.classList.add("info-header");
    infoContainer.appendChild(downLabel);
    downLabel.textContent = "Down";

    let downClues = document.createElement("form");
    downClues.classList.add("oc-builder-clue-list");
    infoContainer.appendChild(downClues);

    new OCButton({
      icon: OCIcons.add,
      tooltip: "Add a horizontal clue",
      parent: infoContainer,
      classes: ["oc-builder-clue-list-button"],
      action: () => {
        this.downClues.push(new PuzzleClue("down", downClues));
      },
    });
    new OCButton({
      icon: OCIcons.remove,
      tooltip: "Remove last horizontal clue",
      parent: infoContainer,
      classes: ["oc-builder-clue-list-button"],
      action: () => {
        downClues.removeChild(downClues.lastChild);
        this.downClues.pop();
      },
    });
    // Display a form for entering puzzle metadata
    let infoHeader = document.createElement("h2");
    infoHeader.classList.add("info-header");
    infoHeader.textContent = "Puzzle info";
    let infoForm = document.createElement("form");
    infoContainer.appendChild(infoHeader);
    infoContainer.appendChild(infoForm);

    this.titleInput = new PuzzleInfo(
      "Title",
      "text",
      "Enter the title to your puzzle",
      "Puzzle title",
      infoForm,
    );
    this.authorInput = new PuzzleInfo(
      "Author",
      "text",
      "Enter your or the puzzle author's name",
      "Your name",
      infoForm,
    );
    this.contactInput = new PuzzleInfo(
      "Contact",
      "email",
      "Enter an e-mail address you or the author have access to",
      "Your email address",
      infoForm,
    );

    let descriptionInputLabel = document.createElement("label");
    descriptionInputLabel.textContent = "Description";
    descriptionInputLabel.classList.add("oc-builder-info-input-label");
    this.descriptionInput = document.createElement("textarea");
    this.descriptionInput.classList.add("oc-builder-info-input");
    this.descriptionInput.placeholder = "Puzzle description";
    this.descriptionInput.title =
      "Enter a quick paragraph describing your puzzle's theme";
    this.descriptionInput.rows = 4;
    descriptionInputLabel.appendChild(this.descriptionInput);
    infoForm.appendChild(descriptionInputLabel);

    this.tagsInput = new PuzzleInfo(
      "Tags",
      "text",
      "Enter keywords associated with your puzzle, seperated by a comma (,) with trailing whitespace",
      "Puzzle tags (seperated by a comma-space)",
      infoForm,
    );
    this.languageInput = document.createElement("select");
    this.languageInput.options.add(new Option("English", "en"));
    this.languageInput.options.add(new Option("Français", "fr"));
    this.languageInput.options.add(new Option("Deutsch", "de"));
    this.languageInput.options.add(new Option("Italiano", "it"));
    this.languageInput.options.add(new Option("Español", "es"));
    this.languageInput.options.add(new Option("Other", null));
    infoForm.appendChild(document.createElement("label"));
    infoForm.lastChild.textContent = "Language";
    infoForm.lastChild.appendChild(this.languageInput);

    if (obj["info"] || obj["clues"]) {
      // Load the clues and info from `obj` if they exist
      try {
        this.titleInput.inputElement.value = obj["info"]["title"];
        this.authorInput.inputElement.value = obj["info"]["author"];
        this.contactInput.inputElement.value = obj["info"]["contact"];
        this.descriptionInput.value = obj["info"]["description"];
        for (let tag of obj["info"]["tags"]) {
          this.tagsInput.inputElement.value += tag + ", ";
        }
        this.tagsInput.inputElement.value =
          this.tagsInput.inputElement.value.slice(0, -2);
        this.languageInput.value = obj["info"]["language"];
      } catch {}
      for (const clue of Object.entries(obj["clues"]["across"])) {
        let NewClue = new PuzzleClue("across", acrossClues);
        NewClue.textElement.value = clue[1]["content"].toString();
        NewClue.numberElement.value = clue[0];
        this.acrossClues.push(NewClue);
      }
      for (const clue of Object.entries(obj["clues"]["down"])) {
        let NewClue = new PuzzleClue("down", downClues);
        NewClue.textElement.value = clue[1]["content"].toString();
        NewClue.numberElement.value = clue[0];
        this.downClues.push(NewClue);
      }
    }
  }
  pushToMemento() {
    this.generate();
    if (
      shouldPushToMemento &&
      !(
        JSON.stringify(memento[memento.length - 1]) === JSON.stringify(this.obj)
      )
    ) {
      // Remove all mementos after current one, then push
      this.generate();
      memento = memento.slice(0, mementoIndex + 1);
      memento.push(this.obj);
      mementoIndex = memento.length - 1;
      refreshDisabledButtons();
    }
  }

  undo() {
    if (mementoIndex - 1 >= 0) {
      shouldPushToMemento = false;
      mementoIndex--;
      populate(memento[mementoIndex]);
      shouldPushToMemento = true;
    }
  }

  redo() {
    if (mementoIndex + 1 < memento.length) {
      shouldPushToMemento = false;
      mementoIndex++;
      populate(memento[mementoIndex]);
      shouldPushToMemento = true;
    }
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
      } catch {}
      this.numberInput.onclick = (e) => {
        e.stopPropagation();
      };
      this.numberInput.onkeydown = (e) => {
        e.stopPropagation();
      };
    }
    try {
      this.textElement.value = answer;
    } catch {}
    try {
      this.textElement.addEventListener("input", () => {
        document.onchange();
      });
    } catch {}
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

function populateToolBar() {
  const UIContainer = document.createElement("div");
  UIContainer.classList.add("oc-builder-ui-container");
  document.getElementById("oc-build-view").appendChild(UIContainer);

  let toolBarElement = document.createElement("nav");
  UIContainer.appendChild(toolBarElement);
  UIContainer.appendChild(document.createElement("hr"));
  new OCButton({
    icon: OCIcons.undo,
    tooltip: "Undo",
    parent: toolBarElement,
    id: "oc-undo-button",
    action: myPuzzle.undo,
  });
  new OCButton({
    icon: OCIcons.redo,
    tooltip: "Redo",
    parent: toolBarElement,
    id: "oc-redo-button",
    action: myPuzzle.redo,
  });
  new OCButton({
    icon: OCIcons.squareCell,
    tooltip: "Make cell",
    parent: toolBarElement,
    action: () => {
      myPuzzle.transformSquares("cell");
    },
  });
  new OCButton({
    icon: OCIcons.squareBlock,
    tooltip: "Make block",
    parent: toolBarElement,
    action: () => {
      myPuzzle.transformSquares("block");
    },
  });
  new OCButton({
    icon: OCIcons.squareInvisible,
    tooltip: "Make invisible",
    parent: toolBarElement,
    action: () => {
      myPuzzle.transformSquares("invisible");
    },
  });
  new OCButton({
    icon: OCIcons.insert,
    tooltip: "Insert" + "…",
    parent: toolBarElement,
    action: () => {
      displayInsertDialog();
    },
  });
  new OCButton({
    icon: OCIcons.share,
    tooltip: "Share" + "…",
    parent: toolBarElement,
    action: () => {
      displayShareDialog();
    },
  });
  new OCButton({
    icon: OCIcons.download,
    tooltip: "Download puzzle JSON file",
    parent: toolBarElement,
    action: () => {
      myPuzzle.downloadJSON();
    },
  });
  new OCButton({
    icon: OCIcons.play,
    tooltip: "Play puzzle in new tab" + "…",
    parent: toolBarElement,
    action: async () => {
      window.open(await myPuzzle.createDataLink(), "_blank");
    },
  });
  new OCButton({
    icon: OCIcons.search,
    tooltip: "Word helper" + "…",
    parent: toolBarElement,
    action: () => {
      displayWordHelperDialog();
    },
  });
}

async function displayShareDialog() {
  myPuzzle.generate();
  if (navigator.share) {
    navigator
      .share({
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

function displayWordHelperDialog() {
  let frame = document.createElement("iframe");
  frame.src = `${document.baseURI}frames/word-helper.html`;
  new OCDialog({
    title: "Word Helper",
    content: frame,
  });
}

function displayInsertDialog() {
  let frame = document.createElement("iframe");
  frame.src = `${document.baseURI}frames/insert.html`;
  let insertDialog = new OCDialog({
    title: "Insert",
    content: frame,
  });
  // Inserting functionality
  frame.onload = () => {
    frame.contentWindow.document.getElementById("oc-insert-form").onsubmit = (
      e,
    ) => {
      e.preventDefault();
      insertDialog.element.close();
      myPuzzle.insertText(
        frame.contentWindow.document.getElementById("oc-insert-field").value,
      );
    };
  };
}

function populate(obj, original) {
  // Fill in a grid with object data
  myPuzzle = new EditorGrid(obj);
  document.getElementById("oc-build-view").innerHTML = "";
  populateToolBar();
  puzzleContainer = document.createElement("div");
  puzzleContainer.classList.add("oc-builder-puzzle-container");
  document.getElementById("oc-build-view").appendChild(puzzleContainer);
  gridContainer = document.createElement("form");
  gridContainer.classList.add("oc-grid-container");
  puzzleContainer.appendChild(gridContainer);
  myPuzzle.populate(gridContainer, EditorGridSquare);
  myPuzzle.showEditorFunctions();
  myPuzzle.displayInfo(obj);
  refreshDisabledButtons();
  if (original) myPuzzle.pushToMemento(); // Push the initial state to the memento stack;
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
    populate(createEmptyPuzzleObj(gridWidth, gridHeight), true);
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
          populate(JSON.parse(fileContent));
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
          .then((object) => populate(object));
      }
      if (params.has("d")) {
        // Fetch the object data from the data URL
        populate(JSON.parse(params.get("d").toString()));
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

function refreshDisabledButtons() {
  // Add the `oc-disabled` class to the undo or redo button when appropriate
  // Undo button
  if (mementoIndex - 1 < 0) {
    document.getElementById("oc-undo-button").classList.add("oc-disabled");
  } else {
    document.getElementById("oc-undo-button").classList.remove("oc-disabled");
  }
  // Redo button
  if (mementoIndex + 1 >= memento.length) {
    document.getElementById("oc-redo-button").classList.add("oc-disabled");
  } else {
    document.getElementById("oc-redo-button").classList.remove("oc-disabled");
  }
}

async function startOCEditor() {
  String.prototype.toQueryString = function () {
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
        .then((object) => populate(object, true));
    }
    if (targetParams.has("d")) {
      // Fetch the object data from the data URL
      populate(JSON.parse(targetParams.get("d").toString()), true);
    }
    if (targetParams.has("dc")) {
      // Fetch the object data from the data URL
      populate(
        JSON.parse(
          await decompressAndDecode(targetParams.get("dc").toString()),
        ),
        true,
      );
    }
  } else {
    // If no parameters are present, present the splash screen
    showSplashScreen();
  }
  console.info(
    "%cStarted OpenCrossword Editor…",
    'font-family: "Times New Roman", Times, serif; font-weight: bold; font-size: 20px;',
  );
}

document.addEventListener("keydown", (e) => {
  if (
    (!e.shiftKey && e.metaKey && e.key === "z") ||
    (!e.shiftKey && e.ctrlKey && e.key === "z")
  ) {
    e.preventDefault();
    myPuzzle.undo();
  } else if (
    (e.shiftKey && e.metaKey && e.key === "z") ||
    (e.shiftKey && e.ctrlKey && e.key === "z") ||
    (e.metaKey && e.key === "y") ||
    (e.ctrlKey && e.key === "y")
  ) {
    e.preventDefault();
    myPuzzle.redo();
  }
});

document.onchange = () => {
  if (myPuzzle) {
    myPuzzle.pushToMemento();
  }
};

startOCEditor();
