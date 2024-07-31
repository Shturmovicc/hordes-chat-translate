export default class Cache {
    #entries = {}
    set(lang, key, val) {
        if (!this.#entries[lang]) this.#entries[lang] = {}
        this.#entries[lang][key] = val
    }
    get(lang, val) {
        return this.#entries[lang]?.[val]
    }
}