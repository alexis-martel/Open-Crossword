"use strict";

let colourSchemes = {
    "white": {"background": "#FFFAF0", "foreground": "#000000FF", "selection": "#B4D7FF", "highlight": "#DCDCDD"},
    "blue": {"background": "#0077ff", "foreground": "#000000FF", "selection": "#62acff", "highlight": "#0166E1FF"},
    "red": {"background": "#ff4f4f", "foreground": "#000000FF", "selection": "#ff6f6f", "highlight": "#c93f3f"},
    "yellow": {"background": "#ffdb00", "foreground": "#000000FF", "selection": "#ffeb80", "highlight": "#e8c400"},
    "purple": {"background": "#7b49ff", "foreground": "#000000FF", "selection": "#926aff", "highlight": "#613ace"},
    "solarized-light": {
        "background": "#fdf6e3",
        "foreground": "#000000FF",
        "selection": "#93a1a1",
        "highlight": "#eee8d5"
    }
};

// Choose a random colour scheme
const randomProperty = function (obj) {
    let keys = Object.keys(obj);
    return obj[keys[keys.length * Math.random() << 0]];
};

let colours = randomProperty(colourSchemes);

document.body.style.setProperty("--background-colour", `${colours["background"]}`);
document.body.style.setProperty("--foreground-colour", `${colours["foreground"]}`);
document.body.style.setProperty("--selection-colour", `${colours["selection"]}`);
document.body.style.setProperty("--highlight-colour", `${colours["highlight"]}`);
