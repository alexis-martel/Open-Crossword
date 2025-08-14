"use strict";

let insertForm = document.createElement("form");
insertForm.id = "oc-insert-form";
insertForm.method = "dialog";

let inputField = document.createElement("input");
inputField.type = "text";
inputField.id = "oc-insert-field";
insertForm.appendChild(inputField);
inputField.required = true;

inputField.oninput = () => {
  updatePreview();
};

let insertButton = document.createElement("input");
insertButton.type = "submit";
insertButton.value = "Insert";
insertForm.appendChild(insertButton);

let description = document.createElement("p");
description.textContent = "These characters will be inserted:";
insertForm.appendChild(description);

document.getElementById("oc-insert-view").appendChild(insertForm);

let characterPreview = document.createElement("div");
characterPreview.classList.add("oc-insert-preview");
document.getElementById("oc-insert-view").appendChild(characterPreview);

insertForm.onsubmit = (e) => {
  e.preventDefault();
};

function updatePreview() {
  characterPreview.innerHTML = "";
  for (const character of inputField.value) {
    let square = document.createElement("span");
    square.classList.add("oc-text-square");
    square.textContent = character.toUpperCase();
    characterPreview.appendChild(square);
  }
}
