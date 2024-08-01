import { Button } from "./utils/button";

function getContextMenu() {
    return new ContextMenu(document.querySelector('.context'))
}

class ContextMenu {
    constructor(element) {
        this.element = element
    }

    get choices() {
        return element.children
    }

    addChoice(text, disabled, callback) {
        const button = new Button('div', disabled, () => {
            this.element.remove()
            if (callback) callback()
        })
        button.node.text(text)
        button.node.css(['choice'], true)
        this.element.appendChild(button.node)
    }
}

export { getContextMenu };

