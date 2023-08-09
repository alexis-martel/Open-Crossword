import decompressAndDecode from "./compression/decompress.js";
import Grid from "./grid/grid.js";
import GridSquare from "./grid/grid-square.js";
import OCButton from "./ui/ui-button.js";
import OCDialog from "./ui/ui-dialog.js";
import OCIcons from "./ui/ui-icons.js";

("use strict");

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
    titleElement.id = "oc-puzzle-title";
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
        number: clue[0],
        direction: "across",
        html_content: clue[1]["content"],
        hints: clue[1]["hints"],
        links: clue[1]["links"],
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
        number: clue[0],
        direction: "down",
        html_content: clue[1]["content"],
        hints: clue[1]["hints"],
        links: clue[1]["links"],
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

    window.onbeforeprint = () => {
      infoWrapper.setAttribute("open", "");
    };

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
    new InfoItem(
      "Description".i18n(),
      this.obj["info"]["description"],
      infoList,
    ); // Description
    let tags = new InfoItem("Tags".i18n(), "", infoList); // Tags
    let tagsList = document.createElement("ul");
    tagsList.classList.add("oc-info-puzzle-tags-list");
    tags.descriptionDetailElement.appendChild(tagsList);
    for (const tag of this.obj["info"]["tags"]) {
      new InfoTag(tag, tagsList);
    }
    new InfoItem("Size".i18n(), sizeName, infoList); // Size
    new InfoItem(
      "Date Published".i18n(),
      this.obj["info"]["date_published"],
      infoList,
    ); // Date Published
    new InfoItem("Language".i18n(), this.obj["info"]["language"], infoList); // Language
    new InfoItem(
      "Puzzle Copyright".i18n(),
      `© ${this.obj["info"]["date_published"].split("-")[0]} ${
        this.obj["info"]["author"]
      }`,
      infoList,
    );

    // Set the page's title to the puzzle's title
    document.title = `${this.obj["info"]["title"]}, by ${this.obj["info"]["author"]} - OpenCrossword`;
  }

  selectNextSquare() {
    // Selects the next square in the puzzle
    if (this.selectionDirection === "across") {
      // Filters the squares array to the same y value as the selected square and a larger x value
      if (
        this.squares.filter(
          (square) =>
            square.y === this.selectedSquare.y &&
            square.x > this.selectedSquare.x,
        ).length === 0 ||
        this.squares.filter(
          (square) =>
            square.y === this.selectedSquare.y &&
            square.x > this.selectedSquare.x,
        )[0].style !== "cell"
      ) {
        // Select next clue if array is empty or next square is a block/invisible square
        clueBar.nextButton.element.click();
      } else {
        // Select next square if array is not empty and next square is not a block/invisible square
        this.squares
          .filter(
            (square) =>
              square.y === this.selectedSquare.y &&
              square.x > this.selectedSquare.x,
          )[0]
          .select();
      }
    } else if (this.selectionDirection === "down") {
      // Filters the squares array to the same x value as the selected square and a larger x value
      if (
        this.squares.filter(
          (square) =>
            square.x === this.selectedSquare.x &&
            square.y > this.selectedSquare.y,
        ).length === 0 ||
        this.squares.filter(
          (square) =>
            square.x === this.selectedSquare.x &&
            square.y > this.selectedSquare.y,
        )[0].style !== "cell"
      ) {
        // Select next clue if array is empty or next square is a block/invisible square
        clueBar.nextButton.element.click();
      } else {
        // Select next square if array is not empty and next square is not a block/invisible square
        this.squares
          .filter(
            (square) =>
              square.x === this.selectedSquare.x &&
              square.y > this.selectedSquare.y,
          )[0]
          .select();
      }
    }
  }

  selectPreviousSquare() {
    // Selects the previous square in the puzzle
    if (this.selectionDirection === "across") {
      // Filters the squares array to the same y value as the selected square and a smaller x value
      if (
        this.squares.filter(
          (square) =>
            square.y === this.selectedSquare.y &&
            square.x < this.selectedSquare.x,
        ).length === 0 ||
        this.squares.filter(
          (square) =>
            square.y === this.selectedSquare.y &&
            square.x < this.selectedSquare.x,
        )[
          this.squares.filter(
            (square) =>
              square.y === this.selectedSquare.y &&
              square.x < this.selectedSquare.x,
          ).length - 1
        ].style !== "cell"
      ) {
        // Select previous clue if array is empty or previous square is a block/invisible square
        clueBar.previousButton.element.click();
      } else {
        // Select previous square if array is not empty and previous square is not a block/invisible square
        this.squares
          .filter(
            (square) =>
              square.y === this.selectedSquare.y &&
              square.x < this.selectedSquare.x,
          )
          [
            this.squares.filter(
              (square) =>
                square.y === this.selectedSquare.y &&
                square.x < this.selectedSquare.x,
            ).length - 1
          ].select();
      }
    } else if (this.selectionDirection === "down") {
      // Filters the squares array to the same x value as the selected square and a smaller x value
      if (
        this.squares.filter(
          (square) =>
            square.x === this.selectedSquare.x &&
            square.y < this.selectedSquare.y,
        ).length === 0 ||
        this.squares.filter(
          (square) =>
            square.x === this.selectedSquare.x &&
            square.y < this.selectedSquare.y,
        )[
          this.squares.filter(
            (square) =>
              square.x === this.selectedSquare.x &&
              square.y < this.selectedSquare.y,
          ).length - 1
        ].style !== "cell"
      ) {
        // Select previous clue if array is empty or previous square is a block/invisible square
        clueBar.previousButton.element.click();
      } else {
        // Select previous square if array is not empty and previous square is not a block/invisible square
        this.squares
          .filter(
            (square) =>
              square.x === this.selectedSquare.x &&
              square.y < this.selectedSquare.y,
          )
          [
            this.squares.filter(
              (square) =>
                square.x === this.selectedSquare.x &&
                square.y < this.selectedSquare.y,
            ).length - 1
          ].select();
      }
    }
  }

  backCheck() {
    // Checks if the selected square does not have a number
    for (const clue of puzzle.clues) {
      if (
        !(
          clue.number === this.selectedSquare.clue &&
          puzzle.selectionDirection === clue.direction
        )
      ) {
        // Check if any previous squares has a clue
        if (this.selectionDirection === "across") {
          let rowSquares = this.squares.filter(
            (square) => square.y === this.selectedSquare.y,
          );
          for (let i = rowSquares.indexOf(this.selectedSquare); i >= 0; i--) {
            if (rowSquares[i].clue) {
              for (const clue of puzzle.clues) {
                if (
                  clue.number === rowSquares[i].clue &&
                  puzzle.selectionDirection === clue.direction
                ) {
                  clue.select();
                  return clue.number;
                }
              }
            }
          }
        } else if (this.selectionDirection === "down") {
          let rowSquares = this.squares.filter(
            (square) => square.x === this.selectedSquare.x,
          );
          for (let i = rowSquares.indexOf(this.selectedSquare); i >= 0; i--) {
            if (rowSquares[i].clue) {
              for (const clue of puzzle.clues) {
                if (
                  clue.number === rowSquares[i].clue &&
                  puzzle.selectionDirection === clue.direction
                ) {
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
          if (document.getElementById("oc-verify-automatically").checked)
            verifyPuzzle();
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
    };
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
        if (
          clue.number === parseInt(number, 10) &&
          clue.direction === direction.toLowerCase()
        ) {
          clue.highlight();
        }
      }
    }
  }
}

class InfoItem {
  constructor(title, text, parentElement) {
    this.descriptionTermElement = document.createElement("dt");
    this.descriptionTermElement.classList.add("oc-info-label");
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
    this.element.id = id;
    this.labelElement.title = title;
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

    new OCButton({
      icon: OCIcons.chevronLeft,
      tooltip: "Previous Clue".i18n(),
      parent: this.controlWrapper,
      action: () => {
        // Select the previous clue in the list
        if (puzzle.clues.indexOf(puzzle.selectedClue) - 1 >= 0) {
          puzzle.clues[
            puzzle.clues.indexOf(puzzle.selectedClue) - 1
          ].element.click();
        } else {
          puzzle.clues[puzzle.clues.length - 1].element.click();
        }
        this.selectFirstBlankSquareInWord();
      },
    });
    new OCButton({
      icon: OCIcons.chevronRight,
      tooltip: "Next Clue".i18n(),
      parent: this.controlWrapper,
      action: () => {
        // Select the next clue in the list
        if (
          puzzle.clues.indexOf(puzzle.selectedClue) + 1 <
          puzzle.clues.length
        ) {
          puzzle.clues[
            puzzle.clues.indexOf(puzzle.selectedClue) + 1
          ].element.click();
        } else {
          puzzle.clues[0].element.click();
        }
        // Selects the next blank in word
        if (puzzle.selectedSquare.textElement.value !== null) {
          this.selectFirstBlankSquareInWord();
        }
      },
    });
    this.clueContentWrapper.onclick = () => {
      if (puzzle.selectionDirection === "across") {
        puzzle.selectionDirection = "down";
      } else if (puzzle.selectionDirection === "down") {
        puzzle.selectionDirection = "across";
      }
      puzzle.selectedSquare.select(); // Refresh grid
    };
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
      try {
        document.getElementById("oc-puzzle-title").style.display = "none"; // Hides the title once solving begins
      } catch {}
      this.element.style.display = "flex";
      this.clueContentWrapper.innerHTML = `<span class="oc-clue-bar-number-direction">${
        puzzle.selectedClue.number
      }-${puzzle.selectedClue.direction.toCapitalized().i18n()}</span> ${
        puzzle.selectedClue.HTMLContent
      }`;
    }
  }

  selectFirstBlankSquareInWord() {
    if (puzzle.selectionDirection === "across") {
      let nextNonCellSquare = puzzle.squares
        .filter(
          (square) =>
            square.y === puzzle.selectedSquare.y &&
            square.x > puzzle.selectedSquare.x,
        )
        .find((square) => square.style !== "cell");
      try {
        puzzle.squares
          .filter(
            (square) =>
              square.y === puzzle.selectedSquare.y &&
              square.x >= puzzle.selectedSquare.x &&
              square.x < nextNonCellSquare.x,
          )
          .find((square) => square.textElement.value === "")
          .select();
      } catch (TypeError) {
        puzzle.squares
          .filter(
            (square) =>
              square.y === puzzle.selectedSquare.y &&
              square.x >= puzzle.selectedSquare.x,
          )
          .find((square) => square.textElement.value === "")
          .select();
      }
    } else if (puzzle.selectionDirection === "down") {
      let nextNonCellSquare = puzzle.squares
        .filter(
          (square) =>
            square.x === puzzle.selectedSquare.x &&
            square.y > puzzle.selectedSquare.y,
        )
        .find((square) => square.style !== "cell");
      try {
        puzzle.squares
          .filter(
            (square) =>
              square.x === puzzle.selectedSquare.x &&
              square.y >= puzzle.selectedSquare.y &&
              square.y < nextNonCellSquare.y,
          )
          .find((square) => square.textElement.value === "")
          .select();
      } catch (TypeError) {
        puzzle.squares
          .filter(
            (square) =>
              square.x === puzzle.selectedSquare.x &&
              square.y >= puzzle.selectedSquare.y,
          )
          .find((square) => square.textElement.value === "")
          .select();
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

function displayControlButtons() {
  // Display the control buttons beneath the puzzle grid (e.g. "Check", "Reveal", "Pause", "Reset", "Share", "Settings")
  let controlButtons = document.createElement("nav");
  controlButtons.classList.add("oc-control-button-container");
  puzzleContainer.appendChild(controlButtons);

  new OCButton({
    icon: OCIcons.check,
    parent: controlButtons,
    action: verifyPuzzle,
  });
  let revealButton = document.createElement("details");
  revealButton.classList.add("oc-drop-down-button");
  let revealButtonSummary = document.createElement("summary");
  revealButtonSummary.title = "Reveal".i18n();
  revealButtonSummary.innerHTML = OCIcons.reveal;
  let revealOptions = document.createElement("nav");
  revealOptions.classList.add("oc-drop-down-button-options");
  let revealPuzzleButton = new ControlButton(
    "Reveal Puzzle".i18n() + "…",
    OCIcons.crossword,
    revealOptions,
  );
  revealPuzzleButton.element.innerHTML += "Puzzle".i18n() + "…";
  revealPuzzleButton.element.onclick = () => {
    revealPuzzle();
    revealButton.removeAttribute("open");
  };
  let revealWordButton = new ControlButton(
    "Reveal Word".i18n(),
    OCIcons.abc,
    revealOptions,
  );
  revealWordButton.element.innerHTML += "Word".i18n();
  revealWordButton.element.onclick = () => {
    revealWord();
    revealButton.removeAttribute("open");
  };
  let revealSquareButton = new ControlButton(
    "Reveal Square".i18n(),
    OCIcons.squareCell,
    revealOptions,
  );
  revealSquareButton.element.innerHTML += "Square".i18n();
  revealSquareButton.element.onclick = () => {
    revealSquare();
    revealButton.removeAttribute("open");
  };
  revealButton.appendChild(revealButtonSummary);
  revealButton.appendChild(revealOptions);
  controlButtons.appendChild(revealButton);
  new OCButton({
    icon: OCIcons.replay,
    tooltip: "Reset".i18n(),
    parent: controlButtons,
    action: resetPuzzle,
  });
  new OCButton({
    icon: OCIcons.insert,
    tooltip: "Insert".i18n(),
    parent: controlButtons,
    action: displayInsertDialog,
  });
  new OCButton({
    icon: OCIcons.share,
    tooltip: "Share".i18n(),
    parent: controlButtons,
    action: () => {
      navigator.share({ url: window.location.href });
    },
  });
  new OCButton({
    icon: OCIcons.edit,
    tooltip: "Remix".i18n(),
    parent: controlButtons,
    action: () => {
      let encodedPuzzleLink = encodeURIComponent(window.location.href);
      window.open(`${document.baseURI}compose.html?l=${encodedPuzzleLink}`);
    },
  });

  let moreButton = document.createElement("details");
  moreButton.classList.add("oc-drop-down-button");
  let moreButtonSummary = document.createElement("summary");
  moreButtonSummary.title = "More".i18n();
  moreButtonSummary.innerHTML = OCIcons.more;
  let moreOptions = document.createElement("nav");
  moreOptions.classList.add("oc-drop-down-button-options");
  let printButton = new ControlButton(
    "Print".i18n() + "…",
    OCIcons.print,
    moreOptions,
  );
  printButton.element.innerHTML += "Print".i18n() + "…";
  printButton.element.onclick = () => {
    window.print();
    moreButton.removeAttribute("open");
  };
  let copyLinkButton = new ControlButton(
    "Copy Link".i18n(),
    OCIcons.copy,
    moreOptions,
  );
  copyLinkButton.element.innerHTML += "Copy Link".i18n();
  copyLinkButton.element.onclick = () => {
    navigator.clipboard.writeText(window.location.href).then(
      () => {
        /* clipboard successfully set */
        window.alert("Link copied to clipboard".i18n());
      },
      () => {
        /* clipboard write failed */
        window.alert("Failed to copy link to clipboard".i18n());
      },
    );
    moreButton.removeAttribute("open");
  };
  let copyEmbedCodeButton = new ControlButton(
    "Copy Embed Code".i18n(),
    OCIcons.code,
    moreOptions,
  );
  copyEmbedCodeButton.element.innerHTML += "Embed".i18n();
  copyEmbedCodeButton.element.onclick = () => {
    let transformedLink = window.location.href.replace(
      "/solve",
      "/frames/player-embed",
    );
    navigator.clipboard
      .writeText(
        `<iframe width="100%" height="300px" src="${transformedLink}"/>`,
      )
      .then(
        () => {
          /* clipboard successfully set */
          window.alert("Code copied to clipboard".i18n());
        },
        () => {
          /* clipboard write failed */
          window.alert("Failed to copy code to clipboard".i18n());
        },
      );
    moreButton.removeAttribute("open");
  };
  moreButton.appendChild(moreButtonSummary);
  moreButton.appendChild(moreOptions);
  controlButtons.appendChild(moreButton);
  new OCButton({
    icon: OCIcons.help,
    tooltip: "Shortcuts Help".i18n(),
    parent: controlButtons,
    action: () => {
      window.alert(
        `Keyboard Shortcuts:
\t▲, ▼, ◀, ▶: Moves the cursor
\tEnter: Selects next word
\tDelete: Deletes the previous character
\t⌦: Deletes the next character
\tSpacebar: Selects next empty cell
\tTab: Toggles the selection direction`.i18n(),
      );
    },
  });
  let pauseButton = new OCButton({
    icon: OCIcons.pause,
    tooltip: "Pause".i18n(),
    parent: controlButtons,
    action: pauseGame,
  });
  let stopwatch = document.createElement("span");
  stopwatch.classList.add("oc-stopwatch");
  stopwatch.id = "oc-stopwatch";
  stopwatch.textContent = "00:00";
  pauseButton.element.appendChild(stopwatch);
  let verifyAutomaticallyCheckbox = new ControlInput(
    "checkbox",
    "Verify the puzzle automatically on each keystroke".i18n(),
    "Verify automatically".i18n(),
    controlButtons,
    "oc-verify-automatically",
  );
  verifyAutomaticallyCheckbox.labelElement.style.display = "block";
  document.getElementById("oc-verify-automatically").onclick = () => {
    verifyPuzzle();
  };
}

function verifyPuzzle() {
  // Marks all incorrect squares
  for (const square of puzzle.squares) {
    if (square.style === "cell") {
      if (
        square.textElement.value.toUpperCase() !==
          square.answer.toUpperCase() &&
        square.textElement.value !== ""
      ) {
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
      } catch {}
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
    if (
      square.style === "cell" &&
      square.textElement.value.toUpperCase() !== square.answer.toUpperCase()
    ) {
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
  let solveMessageContainer = document.createElement("div");
  let solveParagraph = document.createElement("p");
  solveParagraph.textContent = "You solved the puzzle in:";
  let solveTimeContainer = document.createElement("div");
  for (const character of puzzle.puzzleSeconds.toFormattedTime()) {
    let square = document.createElement("span");
    square.classList.add("oc-text-square");
    square.textContent = character;
    solveTimeContainer.appendChild(square);
  }
  solveMessageContainer.append(solveParagraph);
  solveMessageContainer.appendChild(solveTimeContainer);
  new OCButton({
    tooltip: "Share Time".i18n() + "…",
    title: "Share Time".i18n() + "…",
    parent: solveMessageContainer,
    action: () => {
      navigator.share({
        text: "I solved %a, by %b, in %c!"
          .i18n()
          .replace("%a", puzzle.obj["info"]["title"])
          .replace("%b", puzzle.obj["info"]["author"])
          .replace("%c", puzzle.puzzleSeconds.toFormattedTime()),
      });
    },
  });
  new OCDialog({
    title: "Congratulations".i18n(),
    content: solveMessageContainer,
  });
}

function showNotSolvedScreen() {
  window.alert("Puzzle not solved".i18n());
}

const infoContainer = document.createElement("div");
infoContainer.classList.add("oc-info-container");
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
  };
}

function displayInsertDialog() {
  let frame = document.createElement("iframe");
  frame.src = `${document.baseURI}frames/insert.html`;
  let insertDialog = new OCDialog({
    title: "Insert".i18n(),
    content: frame,
  });
  // Inserting functionality
  frame.onload = () => {
    frame.contentWindow.document.getElementById("oc-insert-form").onsubmit = (
      e,
    ) => {
      e.preventDefault();
      insertDialog.element.close();
      puzzle.insertText(
        frame.contentWindow.document.getElementById("oc-insert-field").value,
      );
    };
  };
}

Number.prototype.toFormattedTime = function () {
  let hours = Math.floor(this / 3600);
  let minutes = Math.floor((this - hours * 3600) / 60);
  let seconds = this - hours * 3600 - minutes * 60;

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
    return hours + ":" + minutes + ":" + seconds;
  } else {
    return minutes + ":" + seconds;
  }
};

String.prototype.toCapitalized = function () {
  return this.charAt(0).toUpperCase() + this.slice(1);
};

String.prototype.i18n = function () {
  // Translates the string to the current language, if available
  if (l[`${this}`]) {
    return l[`${this}`];
  } else {
    return this;
  }
};

function incrementStopwatchTime() {
  puzzle.puzzleSeconds += 1;
  document.getElementById("oc-stopwatch").textContent =
    puzzle.puzzleSeconds.toFormattedTime();
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
        <div class="oc-splash-screen-title">
            <button onclick="history.back()">${"‹" + "Back".i18n()}</button>
            <h1>OpenCrossword<br>Player</h1>
        </div>
        <p><b>${obj["info"]["title"]} - ${obj["info"]["author"]}</b><br>${
          obj["info"]["description"]
        }</p>
        <img alt="OpenCrossword banner" src="${
          document.baseURI
        }images/splash-screen.jpg">
    </div>
    <form method="dialog">
        <input autofocus class="oc-splash-screen-info-input" type="submit" value="${"Play".i18n()}">
    </form>`;
  document.body.appendChild(splashScreen);
  splashScreen.showModal();
}

async function getPuzzleObject(URLParams) {
  // Returns a puzzle object based on the URL parameters
  let obj = {};
  if (URLParams.has("p")) {
    let fileURL = `${document.baseURI}data/puzzles/${URLParams.get(
      "p",
    ).toString()}.json`;
    let response = await fetch(fileURL);
    obj = await response.json();
  } else if (URLParams.has("d")) {
    obj = JSON.parse(await URLParams.get("d").toString());
  } else if (URLParams.has("dc")) {
    if (!"CompressionStream" in window)
      throw new Error("CompressionStream not supported");
    obj = JSON.parse(await decompressAndDecode(URLParams.get("dc").toString()));
  } else {
    throw new Error("Invalid parameters");
  }
  return obj;
}

async function getLanguageObject(language) {
  // Returns a language object of the specified locale
  try {
    let response = await fetch(`${document.baseURI}languages/${language}.json`);
    return await response.json();
  } catch (e) {
    let response = await fetch(`${document.baseURI}languages/en.json`);
    return await response.json();
  }
}

async function startOCPlayer() {
  let params = new URLSearchParams(document.location.search);
  let data = await getPuzzleObject(params);
  let language = await getLanguageObject(data["info"]["language"]);
  setLanguage(language);
  populate(data);
  console.info(
    "%cStarted OpenCrossword Player…",
    'font-family: "Times New Roman", Times, serif; font-weight: bold; font-size: 20px;',
  );
}

let puzzle;
let clueBar;

startOCPlayer();
