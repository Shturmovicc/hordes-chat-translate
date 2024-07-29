// ==UserScript==
// @name        AutoChatTranslation
// @match       *://hordes.io/play
// @grant       GM.xmlHttpRequest
// @connect     translate.google.com
// @version     0.1
// @author      Shturmovic
// @description Automatically translates chat.
// @run-at      document-start
// ==/UserScript==


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

            const translated = await translateAll(data)

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

class UI {
    constructor() {
        this.element = null
        this.observer = new MutationObserver(this.onWindow.bind(this))
    }

    onSettings(sWindow, node) {
        const choiceList = sWindow.querySelector('.choice').parentNode
        const settingsElement = new SettingsElement()
        Array.from(choiceList.children).forEach((child, index) => {
            child.addEventListener('click', () => {
                settingsElement.node.forEach(element => {
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

class SettingsElement {
    constructor() {
        this.enabled = newElement('div').css(['btn', 'checkbox'])
        if (settings.enabled) this.enabled.classList.add('active')
        this.enabled.addEventListener('click', event => {
            if (!this.enabled.classList.contains('active')) {
                this.enabled.classList.add('active')
                settings.set('enabled', true)
                chat.init()
            } else {
                this.enabled.classList.remove('active')
                settings.set('enabled', false)
                chat.disable()
            }
        })

        this.langinput = newElement('input', { type: 'text', value: settings.language, placeholder: 'en' })
        this.langinput.addEventListener('focusout', () => {
            settings.set('language', this.langinput.value)
        })

        this.node = [
            newElement('div').css(['textprimary']).text('Translation'),
            newElement('div'),
            newElement('div').text('Enabled'),
            this.enabled,
            newElement('div').text('Language Code').append(newElement('br'), newElement('small').css(['textgrey']).text('Must be valid language code')),
            this.langinput
        ]
    }
}

function newElement(tag, options) {
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

async function translate(data, language = 'en') {
    const hit = cache.get(language, data.text)
    if (hit) return { ...data, content: hit }

    url = new URL("https://translate.google.com/translate_a/single")
    url.search = `client=gtx&dt=t&dt=rm&dj=1&sl=auto&tl=${language}&q=${data.text}`
    header = { 'Content-Type': 'application/x-www-form-urlencoded;charset=utf-8' }

    const resp = await GM.xmlHttpRequest({ method: "GET", url: String(url), headers: header, responseType: 'json' })
    const respJson = resp.response

    cache.set(language, data.text, respJson)
    return { ...data, content: respJson }
}

async function translateAll(data) {
    const tasks = []
    for (const text of data.textNodes) {
        tasks.push(translate(text, settings.language))
    }
    const translated = await Promise.all(tasks)

    const languages = new Set()
    const out = []
    for (const data of translated) {
        if (data.text !== data.content.sentences[0].trans && data.content.src !== settings.language) {
            out.push({ node: data.node, orig: data.node.nodeValue, trans: data.content.sentences[0].trans })
            languages.add(data.content.src)
        }
    }
    return { langs: [...languages], data: out }
}

function getTextNodes(element) {
    const textNodes = []
    for (const node of element.childNodes) {
        if (node.nodeType === Node.TEXT_NODE) {
            textNodes.push({ node, text: node.nodeValue.trim() })
        }
    }
    return textNodes
}

function messageComponents(article) {
    const line = article.lastChild
    const [time, sender, content] = line.children
    const senderChat = sender.firstChild
    const senderChatName = senderChat.textContent
    const senderData = sender.lastChild

    const textNodes = []
    let senderName = ""
    switch (senderChatName) {
        case 'faction':
        case 'party':
        case 'clan':
        case 'from':
            textNodes.push(...getTextNodes(content))
            senderName = senderData.lastChild.textContent
    }

    return { article, line, time, sender, content, senderChat, senderChatName, senderName, senderData, textNodes }
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
        ui.init()
        chat.init()
        const observer = new MutationObserver(ReloadObserver)
        observer.observe(document.body, { childList: true })
    }
}

const chat = new Chat()
const ui = new UI()
const settings = {
    enabled: true,
    language: 'en',
    init() { Object.assign(this, JSON.parse(localStorage.getItem('onex:translation-mode-settings'))); },
    set(key, val) { this[key] = val; localStorage.setItem('onex:translation-mode-settings', JSON.stringify(this)) },
    get(key) { return this[key] },
}
const cache = {
    set(lang, key, val) { if (!this[lang]) this[lang] = {}; this[lang][key] = val },
    get(lang, val) { return this[lang]?.[val] }
}

window.addEventListener('load', init)