import { ToggleButton } from "./utils/button"
import newElement from "./utils/element"

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

class SettingsElement {
    constructor(settings) {
        this.settings = settings
    }

    init() {
        this.enabled = new ToggleButton("div", this.settings.get("enabled"))
        this.enabled.node.css(["btn", "checkbox"], true)
        this.enabled.callback = (_, state) => {
            this.settings.set("enabled", state)
        }

        this.langinput = newElement("input", {
            type: "text",
            value: this.settings.get("language"),
            placeholder: "en",
        })
        this.langinput.addEventListener("focusout", () => {
            this.settings.set("language", this.langinput.value)
        })

        this.nicknameinput = newElement("input", {
            type: "text",
            value: this.settings.get("excludeNames").join(","),
            placeholder: "Shturmovic, HorrorsOfWar...",
        })
        this.nicknameinput.addEventListener("focusout", () => {
            const val = this.nicknameinput.value.split(",").map((name) => name.trim().toLowerCase())
            this.settings.set("excludeNames", val)
        })

        this.channelinput = newElement("input", {
            type: "text",
            value: this.settings.get("excludeChannels").join(","),
            placeholder: "Party, clan...",
        })
        this.channelinput.addEventListener("focusout", () => {
            const val = this.channelinput.value.split(",").map((name) => name.trim().toLowerCase())
            this.settings.set("excludeChannels", val)
        })

        this.wordinput = newElement("input", {
            type: "text",
            value: this.settings.get("excludeWords").join(","),
            placeholder: "...",
        })
        this.wordinput.addEventListener("focusout", () => {
            const val = this.wordinput.value.split(",").map((name) => name.trim().toLowerCase())
            this.settings.set("excludeWords", val)
        })

        this.node = [
            newElement("div").css(["textprimary"]).text("Translation"),
            newElement("div"),
            newElement("div").text("Enabled"),
            this.enabled.node,
            newElement("div")
                .text("Language Code")
                .append(newElement("br"), newElement("small").css(["textgrey"]).text("Must be valid language code")),
            this.langinput,
            newElement("div")
                .text("Exclude Names")
                .append(newElement("br"), newElement("small").css(["textgrey"]).text("Nicknames to ignore")),
            this.nicknameinput,
            newElement("div")
                .text("Exclude Channels")
                .append(newElement("br"), newElement("small").css(["textgrey"]).text("Chat channels to ignore")),
            this.channelinput,
            newElement("div")
                .text("Exclude Words")
                .append(newElement("br"), newElement("small").css(["textgrey"]).text("Exclude words from translation")),
            this.wordinput,
        ]
    }
}
