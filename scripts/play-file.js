"use strict";

let uploadButton = document.getElementById("upload-button");
uploadButton.onclick = () => {
    openFile();
}

function openFile() {
    let JSONFileInput = document.createElement("input");
    JSONFileInput.type = "file";
    JSONFileInput.accept = ".json";
    JSONFileInput.multiple = false;
    JSONFileInput.click();
    JSONFileInput.onchange = () => {
        let JSONFiles = JSONFileInput.files;

        for (const file of JSONFiles) {
            file.text().then((fileContent) => {
                window.location = `solve.html?d=${encodeURIComponent(JSON.stringify(JSON.parse(fileContent)))}`;
            });
        }
    }
}
