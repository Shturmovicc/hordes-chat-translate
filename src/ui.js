export default class UI {
    constructor() {
        this.element = null
        this.observer = new MutationObserver(this.onchange.bind(this))
    }

    init() {
        this.element = document.querySelector(".container > .container.uiscaled").parentNode
        this.observer.observe(this.element, { childList: true })
        this.element.querySelectorAll('.window-pos').forEach(node => this.onwindow(node))
    }

    onchange(mutationList) {
        mutationList.forEach(mutation => {
            mutation.addedNodes.forEach(node => {
                if (node.matches('.window-pos')) this.onwindow(node)
            })
        })
    }

    onwindow(node) {
        const settings = node.querySelector('.settings')
        if (settings) { this.onsettings(node, settings) }
    }

    onsettings(swindow, node) { }
}
