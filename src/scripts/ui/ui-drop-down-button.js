"use strict";

export default class OCDropDownButton {
  constructor({
    tooltip = "",
    icon = "",
    title = "",
    items = [],
    parent,
    classes = [],
    id = "",
  } = {}) {
    this.detailsElement = document.createElement("details");
    this.summaryElement = document.createElement("summary");
    this.navigationElement = document.createElement("nav");
    this.detailsElement.classList.add("oc-drop-down-button");
    this.detailsElement.appendChild(this.summaryElement);
    this.detailsElement.appendChild(this.navigationElement);
    this.summaryElement.title = tooltip;
    this.summaryElement.innerHTML = icon;
    this.summaryElement.innerHTML += title;
    for (const item of items) {
      this.navigationElement.appendChild(item.element);
      if (item.closesMenu) {
        item.element.addEventListener("click", () => {
          this.detailsElement.removeAttribute("open");
        });
      }
    }
    parent.appendChild(this.detailsElement);
    for (const className of classes) {
      this.detailsElement.classList.add(className);
    }
    this.detailsElement.id = id;
  }
}
