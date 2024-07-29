
export default class UI {
    constructor(settingsElement) {
        this.element = null
        this.observer = new MutationObserver(this.onWindow.bind(this))
        this.settingsElement = settingsElement
    }

    onSettings(sWindow, node) {
        const choiceList = sWindow.querySelector('.choice').parentNode
        Array.from(choiceList.children).forEach((child, index) => {
            child.addEventListener('click', () => {
                this.settingsElement.node.forEach(element => {
                    if (index === 3) { node.appendChild(element) }
                    else { element.remove() }
                })
            })
            if (index === 3 && child.classList.contains('active')) {
                child.click()
            }
        })
    }

    onWindow(mutationList) {
        for (const mutation of mutationList) {
            for (const node of mutation.addedNodes) {
                if (node.matches(".window-pos")) {
                    const settingsEl = node.querySelector('.settings')
                    if (settingsEl) {
                        this.onSettings(node, settingsEl)
                    }
                }
            }
        }
    }

    init() {
        this.element = document.querySelector(".container > .container.uiscaled").parentNode
        this.observer.observe(this.element, { childList: true })

        const settingsEl = document.querySelector('.settings')
        if (settingsEl) this.onSettings(settingsEl.parentNode.parentNode.parentNode.parentNode, settingsEl)
    }
}
