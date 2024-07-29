import newElement from "./element.js"

export default class Settings {
    constructor() {
        this.enabled = true
        this.language = 'en'
    }

    init() {
        const storage = JSON.parse(localStorage.getItem('onex:translation-mode-settings'))
        for (const key in storage) {
            if (typeof storage[key] === this[key]) {
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
        this.enabled = newElement('div').css(['btn', 'checkbox'])
        if (settings.enabled) this.enabled.classList.add('active')
        this.enabled.addEventListener('click', () => {
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

export { Settings, SettingsElement }

