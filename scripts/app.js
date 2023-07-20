"use strict";

if ("serviceWorker" in navigator) {
  navigator.serviceWorker.register(`${document.baseURI}sw.js`);
}
