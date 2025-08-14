import OCButton from "./ui-button.js";
import OCIcons from "./ui-icons.js";

("use strict");

export default class OCDialog {
  constructor({
    title = "",
    content = "",
    parent = document.body,
    classes = [],
    id = "",
    open = true,
    modal = true,
  }) {
    this.element = document.createElement("dialog");
    this.titleBar = document.createElement("header");
    this.closeButton = new OCButton({
      icon: OCIcons.close,
      tooltip: "Close",
      parent: this.titleBar,
      action: () => {
        this.element.close();
      },
    });
    this.title = document.createElement("h2");
    this.title.textContent = title;
    this.separator = document.createElement("hr");
    this.content = document.createElement("div");

    this.element.appendChild(this.titleBar);
    this.titleBar.appendChild(this.title);
    this.element.appendChild(this.separator);
    this.content.appendChild(content);
    this.element.appendChild(this.content);
    parent.appendChild(this.element);
    for (const className of classes) {
      this.element.classList.add(className);
    }
    this.element.classList.add("oc-dialog");
    this.content.classList.add("oc-dialog-content");
    this.element.id = id;
    if (open && !modal) {
      this.element.show();
    } else if (open && modal) {
      this.element.showModal();
    }
  }
}
