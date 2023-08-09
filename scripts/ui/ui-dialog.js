import OCButton from "./ui-button";
import OCIcons from "./ui-icons";

"use strict";

export default class OCDialog {
  constructor({
    title = "",
    content = "",
    parent = document.body,
  }) {
    this.element = document.createElement("dialog");
    this.titleBar = document.createElement("div");
    this.closeButton = new OCButton({
      tooltip: "Close",

    })
    this.title = document.createElement("h2");
    this.separator = document.createElement("hr");
    this.content = document.createElement("div");
    parent.appendChild(this.element);
  }
}
