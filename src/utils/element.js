function newElement(tag, options) {
    const element = Object.assign(document.createElement(tag), options)

    element.css = (classList, keep = false) => {
        if (keep === true) classList = [...classList, ...element.classList]
        element.className = classList ? classList.join(" ") : null
        return element
    }

    element.append = (...nodes) => {
        for (const node of nodes) {
            element.appendChild(node)
        }
        return element
    }

    element.styles = (styles) => {
        Object.assign(element.style, styles)
        return element
    }

    element.text = (string) => {
        element.textContent = string
        return element
    }

    return element
}

function createDiv(options) {
    return newElement("div", options)
}

export { createDiv, newElement }
