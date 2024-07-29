export default class Cache {
    set(lang, key, val) {
        if (!this[lang]) this[lang] = {}
        this[lang][key] = val
    }
    get(lang, val) {
        return this[lang]?.[val]
    }
}