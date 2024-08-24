"use strict";

let globalNavView = document.createElement("div");
globalNavView.classList.add("oc-global-navigation");
globalNavView.innerHTML = `<header>
  <a href="index.html">
    <svg viewBox="0 0 326.1 306.39" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M44.52,88.59c-1,.07-2.01,.43-2.92,1.11L2.22,119.24c-3.11,2.33-2.91,7.05,.38,9.11l39.38,24.61c3.69,2.31,8.48-.34,8.48-4.69v-54.14c0-3.42-2.94-5.75-5.94-5.54Zm-5.13,16.61v33.07l-24.05-15.04,24.05-18.03Z"
      />
      <path
        d="M281.58,88.59c-3-.21-5.94,2.12-5.94,5.54v54.14c0,4.35,4.79,7,8.48,4.69l39.38-24.61c3.3-2.06,3.5-6.78,.38-9.11-.31-.23-39.07-29.3-39.38-29.53-.91-.68-1.92-1.05-2.92-1.11Zm5.13,16.61c8.38,6.29,17.42,13.06,24.05,18.03l-24.05,15.04v-33.07Z"
      />
      <path
        d="M163.05,0c-1.17,0-2.34,.38-3.33,1.11l-39.38,29.53c-4.26,3.19-2,9.96,3.33,9.96h78.75c5.32,0,7.58-6.77,3.33-9.96-.31-.23-39.07-29.3-39.38-29.53-.98-.74-2.16-1.11-3.33-1.11Zm0,12.46c3.62,2.71,12.65,9.49,22.76,17.07h-45.53l22.76-17.07Z"
      />
      <path d="M52.81,153.19l81.62,51.01,28.63-21.48v-29.53H52.81Z" />
      <path
        d="M5.61,118.12c-2.9-.02-5.59,2.28-5.59,5.54v177.19c0,4.56,5.21,7.16,8.86,4.42l128.87-96.65c3.11-2.33,2.91-7.05-.38-9.11,0,0-128.56-80.35-128.87-80.54-.92-.58-1.92-.84-2.88-.85Zm5.48,15.53c14.17,8.85,102.16,63.85,113.55,70.96L11.09,289.78V133.66Z"
      />
      <path
        d="M320.49,118.12c-.97,0-1.96,.27-2.88,.85l-128.87,80.54c-3.3,2.06-3.5,6.78-.38,9.11l128.87,96.65c3.65,2.74,8.86,.14,8.86-4.42V123.66c0-3.26-2.69-5.56-5.59-5.54Zm-5.48,15.53v156.12l-113.55-85.15,113.55-70.96Z"
      />
      <path
        d="M163.05,177.19c-1.17,0-2.34,.38-3.33,1.11L2.22,296.43c-4.26,3.19-2,9.96,3.33,9.96H320.55c5.32,0,7.58-6.77,3.33-9.96l-157.5-118.12c-.98-.74-2.16-1.11-3.33-1.11Zm0,12.46c6.01,4.51,119.16,89.37,140.89,105.67H22.16l140.89-105.67Z"
      />
      <path
        d="M44.93,29.53c-3.06,0-5.54,2.48-5.54,5.54v113.2c0,1.91,.98,3.68,2.6,4.69l7.88,4.92c.88,.55,1.9,.85,2.94,.85h220.49c1.04,0,2.06-.3,2.94-.85l7.88-4.92c1.62-1.01,2.6-2.78,2.6-4.69V35.07c0-3.06-2.48-5.54-5.54-5.54H44.93Zm5.54,11.07h107.05v107.05H54.4l-3.94-2.46V40.61Z"
      />
    </svg>

  </a>
  <a href="index.html">
   <h1>The OpenCrossword Project</h1>
  </a>
  <button autofocus id="oc-close-global-navigation-button" title="Close navigation menu">
      <svg xmlns="http://www.w3.org/2000/svg" height="48" viewBox="0 -960 960 960" width="48"><path d="m249-207-42-42 231-231-231-231 42-42 231 231 231-231 42 42-231 231 231 231-42 42-231-231-231 231Z"/></svg>
  </button>
</header>
<hr />
<nav>
  <ul>
    <li>
      <a href="index.html">Home</a>
    </li>
    <li>
      <a href="compose.html">Editor</a>
    </li>
    <hr>
    <li>
      <a href="https://graphe.me/" rel="noopener noreferrer nofollow" target="_blank">Grapheme</a>
    </li>
    <li>
      <a href="https://github.com/alexis-martel/Open-Crossword" rel="noopener noreferrer nofollow" target="_blank">GitHub Repository</a>
    </li>
  </ul>
</nav>`;
globalNavView.style.display = "none";
globalNavView.role = "dialog";
document.body.appendChild(globalNavView);
document.getElementById("oc-open-global-navigation-button").onclick = () => {
  globalNavView.style.display = "block";
  document.getElementById("oc-close-global-navigation-button").onclick = () => {
    globalNavView.style.display = "none";
  };
};
