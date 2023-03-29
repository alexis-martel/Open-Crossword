const wordHelperForm = document.createElement("form");
const dictionarySelectorLabel = document.createElement("label");
dictionarySelectorLabel.textContent = "Dictionary";
const dictionarySelector = document.createElement("select");
const searchField = document.createElement("input");
searchField.type = "search";
const searchButton = document.createElement("input");
searchButton.type = "submit";
dictionarySelectorLabel.appendChild(dictionarySelector);
const searchResults = document.createElement("div");
const searchStats = document.createElement("p");
const resultsList = document.createElement("ul");
searchResults.appendChild(searchStats);
searchResults.appendChild(resultsList);

wordHelperForm.appendChild(dictionarySelectorLabel);
wordHelperForm.appendChild(searchField);
wordHelperForm.appendChild(searchButton);
document.getElementById("oc-word-helper-view").appendChild(wordHelperForm);
document.getElementById("oc-word-helper-view").appendChild(searchResults);

const availableDictionaries = {
    "English": "https://raw.githubusercontent.com/alexis-martel/Open-Crossword-Dictionaries/main/dictionaries/en.json"
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
    const regExp = new RegExp(`^${search.replaceAll("*", ".")}$`);
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