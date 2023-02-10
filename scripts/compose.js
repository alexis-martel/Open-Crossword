"use strict";

const UIContainer = document.createElement("div");
UIContainer.classList.add("oc-builder-ui-container");
document.getElementById("oc-build-view").appendChild(UIContainer);

const puzzleContainer = document.createElement("div")
puzzleContainer.classList.add("oc-builder-puzzle-container")
document.getElementById("oc-build-view").appendChild(puzzleContainer);

const gridContainer = document.createElement("form");
gridContainer.classList.add("oc-builder-grid-container");
puzzleContainer.appendChild(gridContainer);

let myPuzzle;
let selectedSquare;

class Grid {
    constructor(width, height, obj) {
        this.squares = [];
        if (obj) {
            // Create a grid filled in with `obj` data (ignores `width` and `height`)
            this.width = obj["grid"][0].length;
            this.height = obj["grid"].length;
            for (let i = 0; i < this.height; i++) {
                for (let j = 0; j < this.width; j++) {
                    let square = new PuzzleSquare(i, j);
                    // Check the obj for the corresponding square's data
                    if (obj["grid"][i][j]["type"] === "cell") {
                        square.makeCell();
                        square.answerInput.value = obj["grid"][i][j]["answer"];
                        square.clueNumberInput.value = obj["grid"][i][j]["clueNumber"];
                    }
                    if (obj["grid"][i][j]["type"] === "circled-cell") {
                        square.makeCell();
                        square.answerInput.value = obj["grid"][i][j]["answer"];
                        square.clueNumberInput.value = obj["grid"][i][j]["clueNumber"];
                        square.circledInput.checked = true;
                    }
                    if (obj["grid"][i][j]["type"] === "block") {
                        square.makeBlock();
                    }
                    if (obj["grid"][i][j]["type"] === "invisible") {
                        square.makeInvisible();
                    }
                    this.squares.push(square);
                }
            }
        } else {
            // Create a new empty grid
            this.width = width;
            this.height = height;
            for (let i = 0; i < this.width; i++) {
                for (let j = 0; j < this.height; j++) {
                    let square = new PuzzleSquare(j, i);
                    this.squares.push(square);
                    square.makeCell();
                }
            }
        }


        this.acrossClues = [];
        this.downClues = [];
        gridContainer.style.gridTemplateColumns = `repeat(${this.width}, 75px)`;
        if (this.width < 1 || this.height < 1) {
            gridContainer.textContent = "Invalid grid size";
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
            this.obj["clues"]["across"][`${clue.numberElement.value}`] = `${clue.textElement.value}`;
        }

        // Loop through every "Down" clue and set a key-value pair in the "clues" "down" object
        for (const clue of this.downClues) {
            this.obj["clues"]["down"][`${clue.numberElement.value}`] = `${clue.textElement.value}`;
        }

        // Create the "grid" array
        this.obj["grid"] = [];

        // Loop through every row of squares
        for (let i = 0; i < this.height; i++) {
            // Create a new array for the current row
            this.obj["grid"].push([]);

            // Loop through every square in the current row
            for (let j = 0; j < this.width; j++) {
                if (this.squares[i * this.width + j].type === "cell") {
                    // Add the current square's letter to the current row
                    if (this.squares[i * this.width + j].circledInput.checked) {
                        this.obj["grid"][i].push({
                            "clueNumber": parseInt(this.squares[i * this.width + j].clueNumberInput.value, 10),
                            "answer": this.squares[i * this.width + j].answerInput.value.toLowerCase(),
                            "type": "cell",
                            "circled": true
                        });
                    } else {
                        this.obj["grid"][i].push({
                            "clueNumber": parseInt(this.squares[i * this.width + j].clueNumberInput.value, 10),
                            "answer": this.squares[i * this.width + j].answerInput.value.toLowerCase(),
                            "type": "cell"
                        });
                    }
                } else if (this.squares[i * this.width + j].type === "block") {
                    this.obj["grid"][i].push({"type": "block"});
                } else if (this.squares[i * this.width + j].type === "invisible") {
                    this.obj["grid"][i].push({"type": "invisible"});
                }
            }

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
        this.obj["info"]["tags"] = myPuzzle.tagsInput.inputElement.value.split(", ");

        // Set the "date_published" key-value pair
        let today = new Date();
        let dd = String(today.getDate()).padStart(2, '0');
        let mm = String(today.getMonth() + 1).padStart(2, '0');
        let yyyy = today.getFullYear();
        today = yyyy + '-' + mm + '-' + dd;
        this.obj["info"]["date_published"] = today;

        // Set the "language" key-value pair
        this.obj["info"]["language"] = myPuzzle.languageInput.value;


        // Output the object to the console
        this.data = JSON.stringify(this.obj);
    }

    createDataLink() {
        // Creates a link string containing the puzzle data in the "d" parameter
        this.generate();
        return `solve.html?d=${encodeURIComponent(this.data)}`;
    }

    downloadJSON() {
        // Creates a JSON file containing the puzzle data
        this.generate();
        const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(this.data);
        const downloadAnchorNode = document.createElement('a');
        downloadAnchorNode.setAttribute("href", dataStr);
        downloadAnchorNode.setAttribute("download", "puzzle.json");
        document.body.appendChild(downloadAnchorNode);
        downloadAnchorNode.click();
        downloadAnchorNode.remove();
    }
}

class PuzzleSquare {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.type = null;
        this.selected = false;
        this.element = document.createElement("span");
        this.element.classList.add("oc-builder-puzzle-square");
        this.element.onclick = () => {
            this.select();
        }
        gridContainer.appendChild(this.element)
    }

    makeCell() {
        this.deselect();
        // Remove all child nodes
        this.element.replaceChildren();

        this.element.classList.add("oc-builder-cell");
        this.element.classList.remove("oc-builder-invisible");
        this.element.classList.remove("oc-builder-block");

        // Append two <input type="text"> elements to the cell and a checkbox
        this.clueNumberInput = document.createElement("input");
        this.clueNumberInput.type = "number";
        this.clueNumberInput.placeholder = "#";
        this.clueNumberInput.classList.add("oc-builder-clue-input");

        this.answerInput = document.createElement("input");
        this.answerInput.type = "text";
        this.answerInput.placeholder = "A";
        this.answerInput.maxLength = 1;
        this.answerInput.classList.add("oc-builder-answer-input");

        this.circledInputLabel = document.createElement("label");
        this.circledInputLabel.textContent = "Circled";
        this.circledInput = document.createElement("input");
        this.circledInput.type = "checkbox";

        this.element.appendChild(this.clueNumberInput);
        this.element.appendChild(this.answerInput);
        this.element.appendChild(this.circledInputLabel);
        this.circledInputLabel.appendChild(this.circledInput);
        this.type = "cell";
    }

    makeBlock() {
        this.deselect();
        // Remove all child nodes
        this.element.replaceChildren();

        this.element.classList.add("oc-builder-block");
        this.element.classList.remove("oc-builder-cell");
        this.element.classList.remove("oc-builder-invisible");
        this.type = "block";
    }

    makeInvisible() {
        this.deselect();
        // Remove all child nodes
        this.element.replaceChildren();

        this.element.classList.add("oc-builder-invisible");
        this.element.classList.remove("oc-builder-cell");
        this.element.classList.remove("oc-builder-block");
        this.type = "invisible";
    }

    select() {
        for (const square of myPuzzle.squares) {
            square.deselect();
            square.element.classList.remove("highlighted");
        }
        this.selected = true;
        this.element.classList.add("selected");
        selectedSquare = this;
    }

    deselect() {
        this.selected = false;
        this.element.classList.remove("selected");
        selectedSquare = undefined;
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
    "squareBlockSVG": `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48"><path d="M9 6C8.2 6 7.50625 6.30625 6.90625 6.90625C6.30625 7.50625 6 8.2 6 9L6 39C6 39.8 6.30625 40.4938 6.90625 41.0938C7.50625 41.6938 8.2 42 9 42L39 42C39.8 42 40.4937 41.6938 41.0938 41.0938C41.6938 40.4938 42 39.8 42 39L42 9C42 8.2 41.6938 7.50625 41.0938 6.90625C40.4938 6.30625 39.8 6 39 6L9 6Z"/></svg>`,
    "squareCellSVG": `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48"><path d="M9 42q-1.2 0-2.1-.9Q6 40.2 6 39V9q0-1.2.9-2.1Q7.8 6 9 6h30q1.2 0 2.1.9.9.9.9 2.1v30q0 1.2-.9 2.1-.9.9-2.1.9Zm0-3h30V9H9v30Z"/></svg>`,
    "squareInvisibleSVG": `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48"><path d="m16.8 33.3 7.2-7.2 7.2 7.2 2.1-2.1-7.2-7.2 7.2-7.2-2.1-2.1-7.2 7.2-7.2-7.2-2.1 2.1 7.2 7.2-7.2 7.2ZM9 42q-1.2 0-2.1-.9Q6 40.2 6 39V9q0-1.2.9-2.1Q7.8 6 9 6h30q1.2 0 2.1.9.9.9.9 2.1v30q0 1.2-.9 2.1-.9.9-2.1.9Zm0-3h30V9H9v30ZM9 9v30V9Z"/></svg>`,
    "squareEditSVG": `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48"><path d="M9 47.4q-1.2 0-2.1-.9-.9-.9-.9-2.1v-30q0-1.2.9-2.1.9-.9 2.1-.9h20.25l-3 3H9v30h30V27l3-3v20.4q0 1.2-.9 2.1-.9.9-2.1.9Zm15-18Zm9.1-17.6 2.15 2.1L21 28.1v4.3h4.25l14.3-14.3 2.1 2.1L26.5 35.4H18v-8.5Zm8.55 8.4-8.55-8.4 5-5q.85-.85 2.125-.85t2.125.9l4.2 4.25q.85.9.85 2.125t-.9 2.075Z"/></svg>`,
    "downloadPuzzleSVG": `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48"><path d="M11 40q-1.2 0-2.1-.9Q8 38.2 8 37v-7.15h3V37h26v-7.15h3V37q0 1.2-.9 2.1-.9.9-2.1.9Zm13-7.65-9.65-9.65 2.15-2.15 6 6V8h3v18.55l6-6 2.15 2.15Z"/></svg>`,
    "sharePuzzleSVG": `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48"><path d="M11 46q-1.2 0-2.1-.9Q8 44.2 8 43V17.55q0-1.2.9-2.1.9-.9 2.1-.9h8.45v3H11V43h26V17.55h-8.55v-3H37q1.2 0 2.1.9.9.9.9 2.1V43q0 1.2-.9 2.1-.9.9-2.1.9Zm11.45-15.35V7.8l-4.4 4.4-2.15-2.15L23.95 2 32 10.05l-2.15 2.15-4.4-4.4v22.85Z"/></svg>`,
    "addSVG": `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48"><path d="M22.5 38V25.5H10v-3h12.5V10h3v12.5H38v3H25.5V38Z"/></svg>`,
    "removeSVG": `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48"><path d="M10 25.5v-3h28v3Z"/></svg>`,
    "playSVG": `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48"><path d="M16 37.85v-28l22 14Zm3-14Zm0 8.55 13.45-8.55L19 15.3Z"/></svg>`
}

function populateToolBar() {
    let toolBarElement = document.createElement("nav");
    UIContainer.appendChild(toolBarElement);
    UIContainer.appendChild(document.createElement("hr"));
    let makeCellButton = new ControlButton("Make cell", icon["squareCellSVG"], toolBarElement);
    makeCellButton.element.onclick = () => {
        selectedSquare.makeCell();
    }
    let makeBlockButton = new ControlButton("Make block", icon["squareBlockSVG"], toolBarElement);
    makeBlockButton.element.onclick = () => {
        selectedSquare.makeBlock();
    }
    let makeInvisibleButton = new ControlButton("Make invisible", icon["squareInvisibleSVG"], toolBarElement);
    makeInvisibleButton.element.onclick = () => {
        selectedSquare.makeInvisible();
    }
    let sharePuzzleButton = new ControlButton("Share puzzle", icon["sharePuzzleSVG"], toolBarElement);
    sharePuzzleButton.element.onclick = () => {
        displayShareDialog();
    }
    let downloadPuzzleButton = new ControlButton("Download puzzle JSON file", icon["downloadPuzzleSVG"], toolBarElement);
    downloadPuzzleButton.element.onclick = () => {
        myPuzzle.downloadJSON();
    }
    let playPuzzleButton = new ControlButton("Play puzzle in new tab", icon["playSVG"], toolBarElement);
    playPuzzleButton.element.onclick = () => {
        window.open(myPuzzle.createDataLink(), '_blank');
    }
}

function displayShareDialog() {
    myPuzzle.generate();
    if (navigator.share) {
        navigator.share({
            title: `${myPuzzle.obj["info"]["title"]}, by ${myPuzzle.obj["info"]["author"]} - OpenCrossword`,
            url: myPuzzle.createDataLink()
        }).catch(console.error);
    } else {
        navigator.clipboard.writeText(myPuzzle.createDataLink()).then(() => {
            /* clipboard successfully set */
            window.alert("Link copied to clipboard");
        }, () => {
            /* clipboard write failed */
            window.alert("Failed to copy link to clipboard");
        });
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

    let addAcrossClueButton = new ControlButton("Add a horizontal clue", icon["addSVG"], infoContainer);
    addAcrossClueButton.element.onclick = () => {
        myPuzzle.acrossClues.push(new PuzzleClue("across", acrossClues));
    }
    let removeAcrossClueButton = new ControlButton("Remove last horizontal clue", icon["removeSVG"], infoContainer);
    removeAcrossClueButton.element.onclick = () => {
        acrossClues.removeChild(acrossClues.lastChild);
        myPuzzle.acrossClues.pop();
    }

    let downLabel = document.createElement("h2");
    downLabel.classList.add("info-header");
    infoContainer.appendChild(downLabel);
    downLabel.textContent = "Down";

    let downClues = document.createElement("form");
    downClues.classList.add("oc-builder-clue-list");
    infoContainer.appendChild(downClues);

    let addDownClueButton = new ControlButton("Add a vertical clue", icon["addSVG"], infoContainer);
    addDownClueButton.element.onclick = () => {
        myPuzzle.downClues.push(new PuzzleClue("down", downClues));
    }
    let removeDownClueButton = new ControlButton("Remove last vertical clue", icon["removeSVG"], infoContainer);
    removeDownClueButton.element.onclick = () => {
        downClues.removeChild(downClues.lastChild);
        myPuzzle.downClues.pop();
    }
    // Display a form for entering puzzle metadata
    let infoHeader = document.createElement("h2");
    infoHeader.classList.add("info-header");
    infoHeader.textContent = "Puzzle info";
    let infoForm = document.createElement("form");
    infoContainer.appendChild(infoHeader);
    infoContainer.appendChild(infoForm);

    myPuzzle.titleInput = new PuzzleInfo("Title", "text", "Enter the title to your puzzle", "Puzzle title", infoForm);
    myPuzzle.authorInput = new PuzzleInfo("Author", "text", "Enter your or the puzzle author's name", "Your name", infoForm);
    myPuzzle.contactInput = new PuzzleInfo("Contact", "email", "Enter an e-mail address you or the author have access to", "Your email address", infoForm);

    let descriptionInputLabel = document.createElement("label");
    descriptionInputLabel.textContent = "Description";
    descriptionInputLabel.classList.add("oc-builder-info-input-label");
    myPuzzle.descriptionInput = document.createElement("textarea");
    myPuzzle.descriptionInput.classList.add("oc-builder-info-input");
    myPuzzle.descriptionInput.placeholder = "Puzzle description";
    myPuzzle.descriptionInput.title = "Enter a quick paragraph describing your puzzle's theme";
    myPuzzle.descriptionInput.rows = 4;
    descriptionInputLabel.appendChild(myPuzzle.descriptionInput);
    infoForm.appendChild(descriptionInputLabel);

    myPuzzle.tagsInput = new PuzzleInfo("Tags", "text", "Enter keywords associated with your puzzle, seperated by a comma (,) with trailing whitespace", "Puzzle tags (seperated by a comma-space)", infoForm);
    myPuzzle.languageInput = document.createElement("select");
    myPuzzle.languageInput.options.add(new Option("English", "en"));
    myPuzzle.languageInput.options.add(new Option("French (UI support coming soon)", "fr"));
    myPuzzle.languageInput.options.add(new Option("German (UI support coming soon)", "de"));
    myPuzzle.languageInput.options.add(new Option("Italian (UI support coming soon)", "it"));
    myPuzzle.languageInput.options.add(new Option("Spanish (UI support coming soon)", "es"));
    myPuzzle.languageInput.options.add(new Option("Other", null));
    infoForm.appendChild(document.createElement("label"));
    infoForm.lastChild.textContent = "Language";
    infoForm.lastChild.appendChild(myPuzzle.languageInput);

    if (obj) {
        // Load the clues and info from `obj`
        myPuzzle.titleInput.inputElement.value = obj["info"]["title"];
        myPuzzle.authorInput.inputElement.value = obj["info"]["author"];
        myPuzzle.contactInput.inputElement.value = obj["info"]["contact"];
        myPuzzle.descriptionInput.value = obj["info"]["description"];
        for (let tag of obj["info"]["tags"]) {
            myPuzzle.tagsInput.inputElement.value += tag + ", ";
        }
        myPuzzle.tagsInput.inputElement.value = myPuzzle.tagsInput.inputElement.value.slice(0, -2);
        myPuzzle.languageInput.value = obj["info"]["language"];
        for (const [clueTag, clueText] of Object.entries(obj["clues"]["across"])) {
            let clue = new PuzzleClue("across", acrossClues);
            clue.textElement.value = clueText.toString();
            clue.numberElement.value = clueTag;
            myPuzzle.acrossClues.push(clue);

        }
        for (const [clueTag, clueText] of Object.entries(obj["clues"]["down"])) {
            let clue = new PuzzleClue("across", downClues);
            clue.textElement.value = clueText.toString();
            clue.numberElement.value = clueTag;
            myPuzzle.downClues.push(clue);

        }
    }
}

function populateNewGrid(gridWidth, gridHeight) {
    // Populate the toolbar, then initialize the grid and clues
    populateToolBar();
    myPuzzle = new Grid(gridWidth, gridHeight);
    displayInfo();
}

function populateGrid(obj) {
    // Fill in a grid with object data
    populateToolBar();
    let gridWidth = null;
    let gridWeight = null;
    myPuzzle = new Grid(gridWidth, gridWeight, obj);
    displayInfo(obj);
}

function showSplashScreen() {
    let splashScreen = document.createElement("dialog");
    splashScreen.classList.add("oc-builder-splash-screen");
    document.getElementById("oc-build-view").appendChild(splashScreen);
    let splashScreenTitle = document.createElement("h1");
    splashScreenTitle.textContent = "New Puzzle";
    splashScreen.appendChild(splashScreenTitle);

    let gridDimensionsForm = document.createElement("form");
    gridDimensionsForm.method = "dialog";
    let gridWidthInput = new PuzzleInfo("Grid Width", "number", "Enter the width of your puzzle", "", gridDimensionsForm);
    let gridHeightInput = new PuzzleInfo("Grid Height", "number", "Enter the height of your puzzle", "", gridDimensionsForm);
    let gridCreateButton = new PuzzleInfo(null, "submit", "Create a new puzzle", null, gridDimensionsForm);
    gridCreateButton.inputElement.value = "Create";
    let openGridButton = new PuzzleInfo(null, "button", "Open an existing puzzle", null, gridDimensionsForm);
    openGridButton.inputElement.value = "Open…";
    gridDimensionsForm.appendChild(document.createElement("hr"));
    let cancelButton = new PuzzleInfo(null, "button", "Return to homepage", null, gridDimensionsForm);
    cancelButton.inputElement.value = "Cancel";

    openGridButton.inputElement.onclick = () => {
        splashScreen.close();
        showOpenDialog()
    }

    cancelButton.inputElement.onclick = () => {
        splashScreen.close();
        window.location.href = document.baseURI;
    }


    gridDimensionsForm.onsubmit = (event) => {
        event.preventDefault();
        splashScreen.close();
        populateNewGrid(parseInt(gridWidthInput.inputElement.value, 10), parseInt(gridHeightInput.inputElement.value, 10));
    }

    splashScreen.appendChild(gridDimensionsForm);
    splashScreen.showModal();
}

function showOpenDialog() {
    let openGridDialog = document.createElement("dialog");
    openGridDialog.classList.add("oc-builder-splash-screen");
    document.getElementById("oc-build-view").appendChild(openGridDialog);
    let openDialogTitle = document.createElement("h1");
    openDialogTitle.textContent = "Open Puzzle";
    openGridDialog.appendChild(openDialogTitle);

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
            let fileInput = new PuzzleInfo("File", "file", "Select a file to load", "", loadInputArea);
            fileInput.inputElement.accept = ".json";
            fileInput.inputElement.multiple = false;
            fileInput.inputElement.id = "file-input";
        }
        if (sourceSelector.value === "url") {
            let urlInput = new PuzzleInfo("URL", "url", "Enter a puzzle URL to load", "", loadInputArea);
            urlInput.inputElement.id = "url-input";
        }
    }
    let gridCreateButton = new PuzzleInfo(null, "submit", "Open Puzzle", null, openGridForm);
    gridCreateButton.inputElement.value = "Open";
    sourceSelector.onchange(new Event("change"));

    openGridForm.onsubmit = (event) => {
        event.preventDefault();
        if (sourceSelector.value === "file") {
            // Get the object data from the JSON file
            document.getElementById("file-input").files[0].text().then((fileContent) => {
                populateGrid(JSON.parse(fileContent));
            });
        }
        if (sourceSelector.value === "url") {
            let params = new URLSearchParams(document.getElementById("url-input").value.toQueryString());
            if (params.has("p")) {
                // Fetch the object data from the puzzle URL
                let fileURL = `${document.baseURI}data/puzzles/${params.get("p").toString()}.json`;
                fetch(fileURL)
                    .then((response) => response.json())
                    .then((object) => populateGrid(object));
            }
            if (params.has("d")) {
                // Fetch the object data from the data URL
                populateGrid(JSON.parse(params.get("d").toString()));
            }
        }
        openGridDialog.close();
    }

    openGridDialog.appendChild(openGridForm);
    openGridDialog.showModal();
}

String.prototype.toQueryString = function () {
    // Remove all characters that precede "?"
    return this.substring(this.indexOf("?"));
}
let params = new URLSearchParams(document.location.search);
if (params.has("l")) {
    let targetURL = params.get("l").toString().toQueryString();
    let targetParams = new URLSearchParams(targetURL);
    if (targetParams.has("p")) {
        // Fetch the object data from the puzzle URL
        let fileURL = `${document.baseURI}data/puzzles/${targetParams.get("p").toString()}.json`;
        fetch(fileURL)
            .then((response) => response.json())
            .then((object) => populateGrid(object));
    }
    if (targetParams.has("d")) {
        // Fetch the object data from the data URL
        populateGrid(JSON.parse(targetParams.get("d").toString()));
    }

} else {
    showSplashScreen();
}
console.info("%cStarted OpenCrossword Editor…", "font-family: \"Times New Roman\", Times, serif; font-weight: bold; font-size: 20px;");