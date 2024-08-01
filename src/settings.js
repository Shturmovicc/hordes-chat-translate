import { ToggleButton } from "./utils/button"
import newElement from "./utils/element"

export default class Settings {
    #entries = {
        enabled: true,
        language: 'en',
        excludeNames: [],
        excludeChannels: [],
        excludeWords: []
    }

    constructor() {
        this.element = new SettingsElement(this)
    }

    init() {
        const storage = JSON.parse(localStorage.getItem('onex:translation-mode-settings'))
        for (const key in storage) {
            if (typeof storage[key] === typeof this.#entries[key]) {
                this.#entries[key] = storage[key]
            }
        }
        this.element.init()
    }

    onset(key, val) { }

    set(key, val) {
        this.#entries[key] = val;
        localStorage.setItem('onex:translation-mode-settings', JSON.stringify(this.#entries))
        this.onset(key, val)
    }

    get(key) {
        return this.#entries[key]
    }
}

class SettingsElement {
    constructor(settings) {
        this.settings = settings
    }

    init() {
        this.enabled = new ToggleButton('div', this.settings.get('enabled'))
        this.enabled.node.css(['btn', 'checkbox'], true)
        this.enabled.callback = (event, state) => {
            this.settings.set('enabled', state)
        }

        this.langinput = newElement('input', { type: 'text', value: this.settings.get('language'), placeholder: 'en' })
        this.langinput.addEventListener('focusout', () => {
            this.settings.set('language', this.langinput.value)
        })

        this.nicknameinput = newElement('input', { type: 'text', value: this.settings.get('excludeNames').join(','), placeholder: 'Shturmovic, HorrorsOfWar...' })
        this.nicknameinput.addEventListener('focusout', () => {
            const val = this.nicknameinput.value.split(',').map(name => name.trim().toLowerCase())
            this.settings.set('excludeNames', val)
        })

        this.channelinput = newElement('input', { type: 'text', value: this.settings.get('excludeChannels').join(','), placeholder: 'Party, clan...' })
        this.channelinput.addEventListener('focusout', () => {
            const val = this.channelinput.value.split(',').map(name => name.trim().toLowerCase())
            this.settings.set('excludeChannels', val)
        })

        this.wordinput = newElement('input', { type: 'text', value: this.settings.get('excludeWords').join(','), placeholder: '...' })
        this.wordinput.addEventListener('focusout', () => {
            const val = this.wordinput.value.split(',').map(name => name.trim().toLowerCase())
            this.settings.set('excludeWords', val)
        })

        this.node = [
            newElement('div').css(['textprimary']).text('Translation'),
            newElement('div'),
            newElement('div').text('Enabled'),
            this.enabled.node,
            newElement('div').text('Language Code').append(newElement('br'), newElement('small').css(['textgrey']).text('Must be valid language code')),
            this.langinput,
            newElement('div').text('Exclude Names').append(newElement('br'), newElement('small').css(['textgrey']).text('Nicknames to ignore')),
            this.nicknameinput,
            newElement('div').text('Exclude Channels').append(newElement('br'), newElement('small').css(['textgrey']).text('Chat channels to ignore')),
            this.channelinput,
            newElement('div').text('Exclude Words').append(newElement('br'), newElement('small').css(['textgrey']).text('Exclude words from translation')),
            this.wordinput
        ]
    }
}