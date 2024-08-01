import translateAll from "./translate"
import { ToggleTextButton } from "./utils/button"

function getTextNodes(element) {
    const textNodes = []
    for (const node of element.childNodes) {
        if (node.nodeType === Node.TEXT_NODE) {
            textNodes.push({ node, text: node.nodeValue.trim() })
        }
    }
    return textNodes
}

class Message {
    constructor(nickname, channel, textNodes, elements) {
        this.nickname = nickname
        this.channel = channel
        this.textNodes = textNodes
        this.elements = elements
    }

    async translate(language, excludeWords = []) {
        const translated = await translateAll(this.textNodes, language, excludeWords)
        if (translated.langs.length) {
            translated.data.forEach(data => {
                data.node.nodeValue = data.trans
            })

            const prefix = new ToggleTextButton('span', ['orig: ', `${translated.langs.join("/")}: `], true)
            prefix.node.styles({ 'cursor': 'pointer', 'pointer-events': 'all' })
            prefix.callback = (event, state) => {
                translated.data.forEach(data => { data.node.nodeValue = state ? data.trans : data.orig })
            }
            this.elements.content.before(prefix.node)
        }
    }

    oncontext() { }

    static from_article(article) {
        const line = article.lastChild
        const [time, sender, content] = line.children
        const channel = sender.firstChild
        const channelName = channel.textContent
        const senderData = sender.lastChild

        const textNodes = []
        let senderName = ""
        switch (channelName) {
            case 'faction':
            case 'party':
            case 'clan':
            case 'from':
                textNodes.push(...getTextNodes(content))
                senderName = senderData.lastChild.textContent
        }

        return new Message(senderName, channelName, textNodes, {
            article,
            line,
            time,
            sender,
            senderData,
            content,
            channel,
            textNodes
        })
    }
}


export default class Chat {
    constructor() {
        this.element = null
        this.observer = new MutationObserver(this.onchange.bind(this))
    }

    init() {
        this.element = document.getElementById('chat')
        this.observer.observe(this.element, { childList: true })
        Array.from(this.element.children).forEach(node => this.onmessage(Message.from_article(node)))
    }

    disconnect() {
        this.observer.disconnect()
    }

    onchange(mutationList) {
        mutationList.forEach(mutation => {
            mutation.addedNodes.forEach(node => {
                if (node.tagName) this.onmessage(Message.from_article(node))
            })
        })
    }

    onmessage(message) { }
}