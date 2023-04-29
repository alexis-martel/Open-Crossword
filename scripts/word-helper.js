const wordHelperForm = document.createElement("form");
const dictionarySelectorLabel = document.createElement("label");
dictionarySelectorLabel.textContent = "Dictionary";
const dictionarySelector = document.createElement("select");
// dictionarySelector.multiple = true;
const searchField = document.createElement("input");
searchField.type = "search";
searchField.enterKeyHint = "search";
searchField.placeholder = "Search";
const searchButton = document.createElement("input");
searchButton.type = "submit";
searchButton.value = "Search";
dictionarySelectorLabel.appendChild(dictionarySelector);
const descriptionText = document.createElement("p");
descriptionText.innerHTML = "Replace unknown letters with '*' or '?'. Dictionary data from GNU Aspell. Check out the <a href='https://github.com/alexis-martel/Open-Crossword-Dictionaries'>dictionary repository</a>.";

const searchResults = document.createElement("div");
const searchStats = document.createElement("p");
const resultsList = document.createElement("ul");
searchResults.appendChild(searchStats);
searchResults.appendChild(resultsList);

wordHelperForm.appendChild(dictionarySelectorLabel);
wordHelperForm.appendChild(searchField);
wordHelperForm.appendChild(searchButton);
wordHelperForm.appendChild(descriptionText);
document.getElementById("oc-word-helper-view").appendChild(wordHelperForm);
document.getElementById("oc-word-helper-view").appendChild(searchResults);

const availableDictionaries = {
    "English": "https://raw.githubusercontent.com/alexis-martel/Open-Crossword-Dictionaries/main/dictionaries/en.json",
    "French": "https://raw.githubusercontent.com/alexis-martel/Open-Crossword-Dictionaries/main/dictionaries/fr.json"
}

// Adds the supported dictionaries to the dictionary selector
dictionarySelector.options.add(new Option("Choose a dictionary", "", true));
dictionarySelector.options.item(0).disabled = true;

for (const [language, url] of Object.entries(availableDictionaries)) {
    dictionarySelector.options.add(new Option(language, url));
}

function findWords(dict, search) {
    resultsList.innerHTML = "";
    searchStats.innerHTML = "";
    const regExp = new RegExp(`^${search.replaceAll("*", ".").replaceAll("?", ".")}$`);
    let resultsCount = 0;
    for (const word of dict["words"]) {
        if (regExp.test(word) && word.length === search.length) {
            addWordToResults(word);
            resultsCount++;
        }
    }
    searchStats.textContent = `Found ${resultsCount} results`;
}

function addWordToResults(word) {
    const li = document.createElement("li");
    li.textContent = word;
    resultsList.appendChild(li);
}

wordHelperForm.onsubmit = (event) => {
    event.preventDefault();
    // Fetch the selected dictionary
    let dictFileURL = dictionarySelector.value;
    fetch(dictFileURL)
        .then((response) => response.json())
        .then((dict) => findWords(dict, searchField.value.toLowerCase()));
}