import newElement from "./element.js"

export default class Settings {
    constructor() {
        this.enabled = true
        this.language = 'en'
        this.ignoreNames = []
        this.ignoreChannels = []
        this.ignoreWords = []
    }

    init() {
        const storage = JSON.parse(localStorage.getItem('onex:translation-mode-settings'))
        for (const key in storage) {
            if (typeof storage[key] === typeof this[key]) {
                this[key] = storage[key]
            }
        }
    }

    set(key, val) {
        this[key] = val;
        localStorage.setItem('onex:translation-mode-settings', JSON.stringify(this))
    }

    get(key) {
        return this[key]
    }
}

class SettingsElement {
    constructor(settings, chat) {
        this.settings = settings
        this.chat = chat
    }

    init() {
        this.enabled = newElement('div').css(['btn', 'checkbox'])
        if (this.settings.enabled) this.enabled.classList.add('active')
        this.enabled.addEventListener('click', () => {
            if (!this.enabled.classList.contains('active')) {
                this.enabled.classList.add('active')
                this.settings.set('enabled', true)
                this.chat.init()
            } else {
                this.enabled.classList.remove('active')
                this.settings.set('enabled', false)
                this.chat.disable()
            }
        })

        this.langinput = newElement('input', { type: 'text', value: this.settings.language, placeholder: 'en' })
        this.langinput.addEventListener('focusout', () => {
            this.settings.set('language', this.langinput.value)
        })

        this.nicknameinput = newElement('input', { type: 'text', value: this.settings.ignoreNames.join(','), placeholder: 'Shturmovic, HorrorsOfWar...' })
        this.nicknameinput.addEventListener('focusout', () => {
            const val = this.nicknameinput.value.split(',').map(name => name.trim().toLowerCase())
            this.settings.set('ignoreNames', val)
        })

        this.channelinput = newElement('input', { type: 'text', value: this.settings.ignoreChannels.join(','), placeholder: 'Party, clan...' })
        this.channelinput.addEventListener('focusout', () => {
            const val = this.channelinput.value.split(',').map(name => name.trim().toLowerCase())
            this.settings.set('ignoreChannels', val)
        })

        this.wordinput = newElement('input', { type: 'text', value: this.settings.ignoreWords.join(','), placeholder: '...' })
        this.wordinput.addEventListener('focusout', () => {
            const val = this.wordinput.value.split(',').map(name => name.trim().toLowerCase())
            this.settings.set('ignoreWords', val)
        })

        this.node = [
            newElement('div').css(['textprimary']).text('Translation'),
            newElement('div'),
            newElement('div').text('Enabled'),
            this.enabled,
            newElement('div').text('Language Code').append(newElement('br'), newElement('small').css(['textgrey']).text('Must be valid language code')),
            this.langinput,
            newElement('div').text('Ignore Names').append(newElement('br'), newElement('small').css(['textgrey']).text('Nicknames to ignore')),
            this.nicknameinput,
            newElement('div').text('Ignore Channels').append(newElement('br'), newElement('small').css(['textgrey']).text('Chat channels to ignore')),
            this.channelinput,
            newElement('div').text('Ignore Words').append(newElement('br'), newElement('small').css(['textgrey']).text('Ignore messages with words')),
            this.wordinput
        ]
    }
}

export { Settings, SettingsElement }

