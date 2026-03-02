import { ToggleButton } from "./utils/button"
import { createDiv, newElement } from "./utils/element"

const legacyStorageKeys = []
const storageKey = "onex:translation-mode-settings"

const migrations = {}

export default class Settings {
    #version = 0

    #defaults = {
        enabled: true,
        language: "en",
        excludeNames: [],
        excludeChannels: [],
        excludeWords: [],
    }

    constructor() {
        this.element = new SettingsElement(this)
        this.data = { ...this.#defaults }
    }

    _initData() {
        this._migrateKeys()

        let storedSettings = this._load()

        if (!storedSettings) {
            this._save(this.#defaults)
            return
        }

        try {
            const currentStoredVersion = storedSettings.version || 0

            if (currentStoredVersion < this.#version) {
                storedSettings = this._runMigrations(storedSettings, currentStoredVersion)
            }

            for (const key in storedSettings) {
                if (typeof storedSettings[key] === typeof this.#defaults[key]) {
                    this.data[key] = storedSettings[key]
                }
            }
            this._save(this.data)
        } catch (e) {
            console.error("Settings recovery failed:", e)
            this._save(this.#defaults)
        }
    }

    _save(data) {
        data.version = this.#version
        localStorage.setItem(storageKey, JSON.stringify(data))
    }

    _load() {
        return JSON.parse(localStorage.getItem(storageKey))
    }

    _migrateKeys() {
        const data = localStorage.getItem(storageKey)
        if (data) return

        legacyStorageKeys.forEach((legacyKey) => {
            const legacyData = localStorage.getItem(legacyKey)
            if (legacyData) {
                localStorage.setItem(storageKey, legacyData)
                localStorage.removeItem(legacyKey)
            }
        })
    }

    _runMigrations(data, fromVersion) {
        let upgradedData = { ...data }

        for (let v = fromVersion + 1; v <= this.#version; v++) {
            if (typeof migrations[v] === "function") {
                upgradedData = migrations[v](upgradedData)
            }
            upgradedData.version = v
        }

        return upgradedData
    }

    init() {
        this._initData()
        this.element.init()
    }

    set(key, val) {
        this.data[key] = val
        this._save(this.data)
        this.onset(key, val)
    }

    get(key) {
        return this.data[key]
    }

    onset(_key, _val) {}
}

function parseInputValue(value) {
    if (!value) return []
    return value.split(",").map((name) => name.trim().toLowerCase())
}

class SettingsElement {
    constructor(settings) {
        this.settings = settings
    }

    _createRowText(text, hint) {
        const row = createDiv().text(text)
        if (hint) {
            row.append(newElement("br"), newElement("small").css(["textgrey"]).text(hint))
        }
        return row
    }

    _createCheckbox(state, callback) {
        const checkbox = new ToggleButton("div", state)
        checkbox.node.css(["btn", "checkbox"], true)
        checkbox.callback = callback
        return checkbox
    }

    _createInput({ value, placeholder }, callback) {
        const input = newElement("input", {
            type: "text",
            value: value,
            placeholder: placeholder,
        })
        input.addEventListener("focusout", callback)
        return input
    }

    _createValueInput({ key, placeholder }) {
        return this._createInput({ value: this.settings.get(key), placeholder: placeholder }, (e) => {
            this.settings.set(key, e.target.value)
        })
    }

    _createArrayInput({ key, placeholder }) {
        return this._createInput({ value: this.settings.get(key).join(", "), placeholder: placeholder }, (e) => {
            this.settings.set(key, parseInputValue(e.target.value))
        })
    }

    init() {
        this.enabled = this._createCheckbox(this.settings.get("enabled"), (_, state) => {
            this.settings.set("enabled", state)
        })

        this.langInput = this._createValueInput({ key: "language", placeholder: "en" })
        this.nicknameInput = this._createArrayInput({ key: "excludeNames", placeholder: "Shturmovic, HorrorsOfWar, ..." })
        this.channelInput = this._createArrayInput({ key: "excludeChannels", placeholder: "party, clan, ..." })
        this.wordInput = this._createArrayInput({ key: "excludeWords", placeholder: "..." })

        this.node = [
            createDiv().css(["textprimary"]).text("Translation"),
            createDiv(),
            this._createRowText("Enabled"),
            this.enabled.node,
            this._createRowText("Language", "Must be valid language code"),
            this.langInput,
            this._createRowText("Exclude Names", "Blacklist nicknames"),
            this.nicknameInput,
            this._createRowText("Exclude Channels", "Ignore chat channels"),
            this.channelInput,
            this._createRowText("Exclude Words", "Ignore words"),
            this.wordInput,
        ]
    }
}
