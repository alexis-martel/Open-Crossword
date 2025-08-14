"use strict";

export default class OCButton {
  constructor({
    tooltip = "",
    icon = "",
    title = "",
    action = () => {},
    parent,
    classes = [],
    id = "",
  } = {}) {
    this.element = document.createElement("button");
    this.element.title = tooltip;
    this.element.innerHTML = icon;
    this.element.innerHTML += title;
    this.element.onclick = action;
    parent.appendChild(this.element);
    for (const className of classes) {
      this.element.classList.add(className);
    }
    this.element.id = id;
  }
}
