"use strict";

export default class OCDropDownButtonItem {
  constructor({
    tooltip = "",
    icon = "",
    title = "",
    action = () => {},
    classes = [],
    id = "",
    closesMenu = true,
  } = {}) {
    this.element = document.createElement("button");
    this.element.title = tooltip;
    this.element.innerHTML = icon;
    this.element.innerHTML += title;
    this.element.onclick = action;
    for (const className of classes) {
      this.element.classList.add(className);
    }
    this.element.id = id;
    this.closesMenu = closesMenu;
  }
}
