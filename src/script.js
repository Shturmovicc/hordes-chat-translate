import newElement from "./element.js"
import messageComponents from "./message.js"
import Settings, { SettingsElement } from "./settings.js"
import translateAll from "./translate.js"
import UI from "./ui.js"

class Chat {
    constructor() {
        this.element = null
        this.observer = new MutationObserver(this.onChange.bind(this))
    }

    onChange(mutationList) {
        const nodes = []
        for (const mutation of mutationList) {
            for (const node of mutation.addedNodes) {
                if (node.tagName) { nodes.push(node) }
            }
        }
        this.onMessage(nodes)
    }

    async onMessage(nodes) {
        for (const node of nodes) {
            const data = messageComponents(node)
            if (!data.textNodes.length) return
            if (settings.ignoreNames.includes(data.senderName.toLowerCase())) return
            if (settings.ignoreChannels.includes(data.senderChatName)) return
            const words = data.content.textContent.toLowerCase().split(' ')
            if (settings.ignoreWords.some(sub => words.includes(sub.toLowerCase()))) return

            const translated = await translateAll(data, settings.language)

            for (const data of translated.data) {
                data.node.nodeValue = data.trans
            }
            if (translated.langs.length) {
                const prefixContent = `${translated.langs.join("/")}: `
                const prefix = newElement('span', { 'textContent': prefixContent }).styles({ 'cursor': 'pointer', 'pointer-events': 'all' })

                prefix.addEventListener('click', () => {
                    if (prefix.textContent === 'orig: ') {
                        prefix.textContent = prefixContent
                        translated.data.forEach(data => { data.node.nodeValue = data.trans })
                    } else {
                        prefix.textContent = 'orig: '
                        translated.data.forEach(data => { data.node.nodeValue = data.orig })
                    }
                })
                data.content.before(prefix)
            }

        }
    }

    init() {
        if (!settings.enabled) return
        this.element = document.getElementById("chat")
        this.observer.observe(this.element, { childList: true })
    }

    disable() {
        this.observer.disconnect()
    }
}

function ReloadObserver(mutationList) {
    for (const mutation of mutationList) {
        for (const node of mutation.addedNodes) {
            if (node.matches(".layout")) {
                chat.init()
                ui.init()
                return
            }
        }
    }
}

const init = () => {
    if (!settings.enabled) return

    if (!document.getElementById('chat')) {
        setTimeout(init, 100)
    } else {
        settings.init()
        settingsElement.init()
        ui.init()
        chat.init()
        const observer = new MutationObserver(ReloadObserver)
        observer.observe(document.body, { childList: true })
    }
}

const chat = new Chat()
const settings = new Settings()
const settingsElement = new SettingsElement(settings, chat)
const ui = new UI(settingsElement)

window.addEventListener('load', init)