let colourSchemes = {
    "white": {"background": "#FFFAF0FF", "foreground": "#000000FF", "selection": "#B4D7FF", "highlight": "#DCDCDD"},
    "blue": {"background": "#0077ff", "foreground": "#000000FF", "selection": "#3724ff", "highlight": "rgb(1,102,225)"},
    "red": {"background": "#ff4f4f", "foreground": "#000000FF", "selection": "#ff6f6f", "highlight": "#c93f3f"},
    "green": {"background": "#00ec2c", "foreground": "#000000FF", "selection": "#72e589", "highlight": "#00cc27"},
    "yellow": {"background": "#ffdb00", "foreground": "#000000FF", "selection": "#ffeb80", "highlight": "#e8c400"},
    "purple": {"background": "#7b49ff", "foreground": "#000000FF", "selection": "#926aff", "highlight": "#613ace"}
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
