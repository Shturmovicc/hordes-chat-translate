import Cache from "./utils/cache"

const apiUrl = "https://translate.google.com/translate_a/single"
const headers = {
    "Content-Type": "application/x-www-form-urlencoded;charset=utf-8",
}

async function makeRequest(url) {
    if (typeof GM !== "undefined") {
        return await GM.xmlHttpRequest({
            method: "GET",
            url,
            headers: headers,
            responseType: "json",
        }).then((res) => res.response)
    } else {
        return await fetch(url, { headers }).then((res) => res.json())
    }
}

async function translate(data, language = "en") {
    const hit = cache.get(language, data.text)
    if (hit) return { ...data, content: hit }

    const url = new URL(apiUrl)
    url.search = encodeURI(`client=gtx&dt=t&dt=rm&dj=1&sl=auto&tl=${language}&q=${data.text}`)

    const resp = await makeRequest(url)

    cache.set(language, data.text, resp)
    return { ...data, content: resp }
}

export default async function translateAll(textNodes, language, excludeWords = [], excludeLanguages = []) {
    const tasks = []
    const placeholders = []
    for (const text of textNodes) {
        if (text.text.length) {
            text.text = text.text
                .split(" ")
                .map((word) => {
                    for (const exclude of excludeWords) {
                        if (word.toLowerCase() === exclude) {
                            return `{{${placeholders.push(word)}}}`
                        }
                    }
                    return word
                })
                .join(" ")
            tasks.push(translate(text, language))
        }
    }
    const translated = await Promise.all(tasks)

    const languages = new Set()
    const out = []
    for (const data of translated) {
        const sourceLanguage = data.content.src
        const sourceText = data.text
        const translatedText = data.content.sentences[0].trans
        if (
            sourceText.toLowerCase() !== translatedText.toLowerCase() &&
            sourceLanguage !== language &&
            !excludeLanguages.includes(sourceLanguage)
        ) {
            let trans = translatedText

            placeholders.forEach((word, index) => {
                const regex = RegExp(`\\{?\\{?\\{${index + 1}\\}\\}?\\}?`)
                trans = trans.replace(regex, word)
            })

            const orig = data.node.nodeValue
            if (orig.toLowerCase() !== trans.toLowerCase()) {
                out.push({ node: data.node, orig, trans })
                languages.add(sourceLanguage)
            }
        }
    }
    return { langs: [...languages], data: out }
}

const cache = new Cache()
