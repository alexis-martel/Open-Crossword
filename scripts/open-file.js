"use strict";

let uploadButton = document.getElementById("upload-button");
uploadButton.onclick = () => {
    openFile();
}

function openFile() {
    let JSONFileInput = document.createElement("input");
    JSONFileInput.type = "file";
    JSONFileInput.accept = ".json";
    JSONFileInput.multiple = true;
    JSONFileInput.click();
    JSONFileInput.onchange = () => {
        let JSONFiles = JSONFileInput.files;

        for (const file of JSONFiles) {
            file.text().then((text) => {
                window.open(`solve.html?d=${encodeURIComponent(JSON.stringify(JSON.parse(text)))}`, '_blank');
            });
        }
    }
}
