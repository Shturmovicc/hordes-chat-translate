import Cache from "./utils/cache"

const cache = new Cache()

const API_URL = "https://translate.google.com/translate_a/single"

async function makeRequest(url) {
    const options = { headers: { "Content-Type": "application/x-www-form-urlencoded" } }

    // Use GM_xmlHttpRequest if available (for Userscripts), otherwise native fetch
    if (typeof GM !== "undefined") {
        const res = await GM.xmlHttpRequest({ method: "GET", url, ...options, responseType: "json" })
        return res.response
    }
    return fetch(url, options).then((res) => res.json())
}
async function translate(text, targetLang) {
    const cached = cache.get(targetLang, text)
    if (cached) return cached

    const url = `${API_URL}?client=gtx&dt=t&dt=rm&dj=1&sl=auto&tl=${targetLang}&q=${encodeURIComponent(text)}`
    const content = await makeRequest(url)

    cache.set(targetLang, text, content)
    return content
}

async function translateAll(textNodes, targetLang, excludeWords = [], excludeLangs = []) {
    const output = { langs: new Set(), data: [] }
    const excludeSet = new Set(excludeWords.map((w) => w.toLowerCase()))

    const tasks = textNodes.map(async (node) => {
        const rawText = node.nodeValue.trim()
        if (!rawText) return

        // Replace excluded words with {{index}}
        const placeholders = []
        const processedText = rawText
            .split(/\s+/)
            .map((word) => {
                if (excludeSet.has(word.toLowerCase())) {
                    placeholders.push(word)
                    return `{{${placeholders.length}}}`
                }
                return word
            })
            .join(" ")

        const result = await translate(processedText, targetLang)
        const { src: sourceLang, sentences } = result
        let translatedText = sentences[0].trans

        if (sourceLang === targetLang || excludeLangs.includes(sourceLang)) return

        // Restore placeholders using a global regex to catch multiple occurrences
        placeholders.forEach((word, i) => {
            const regex = new RegExp(`\\{\\{\\s*${i + 1}\\s*\\}\\}`, "g")
            translatedText = translatedText.replace(regex, word)
        })

        if (rawText.toLowerCase() !== translatedText.toLowerCase()) {
            output.data.push({ node: node, source: node.nodeValue, trans: translatedText })
            output.langs.add(sourceLang)
        }
    })

    await Promise.all(tasks)
    return { langs: [...output.langs], data: output.data }
}

export { translateAll }
