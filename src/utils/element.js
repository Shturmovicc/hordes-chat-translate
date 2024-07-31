export default function newElement(tag, options) {
    const element = Object.assign(document.createElement(tag), options)

    element.css = (classList, keep = false) => {
        if (keep === true) classList = [...classList, ...element.classList]
        classList ? element.className = classList.join(" ") : element.className = null
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