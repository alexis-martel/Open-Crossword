"use strict";

const lightColourSchemes = {
    "black": {"background": "#FFFAF0", "foreground": "#000000FF", "selection": "#b9b9b9", "highlight": "#e8e8e8"},
    "blue": {"background": "#FFFAF0", "foreground": "#006def", "selection": "#b0c4ef", "highlight": "#dae4ec"},
    "red": {"background": "#FFFAF0", "foreground": "#ff0000", "selection": "#fd6e6e", "highlight": "#ffecec"},
    "green": {"background": "#FFFAF0", "foreground": "#399300", "selection": "#b5ff8e", "highlight": "#b5ffc7"}
};


// Choose a random colour scheme
const randomProperty = function (obj) {
    let keys = Object.keys(obj);
    return obj[keys[keys.length * Math.random() << 0]];
};

let colours;
colours = randomProperty(lightColourSchemes);

document.body.style.setProperty("--background-colour", `${colours["background"]}`);
document.body.style.setProperty("--foreground-colour", `${colours["foreground"]}`);
document.body.style.setProperty("--selection-colour", `${colours["selection"]}`);
document.body.style.setProperty("--highlight-colour", `${colours["highlight"]}`);
