import Cache from "./utils/cache"

async function translate(data, language = "en") {
    const hit = cache.get(language, data.text)
    if (hit) return { ...data, content: hit }

    const url = new URL("https://translate.google.com/translate_a/single")
    url.search = encodeURI(`client=gtx&dt=t&dt=rm&dj=1&sl=auto&tl=${language}&q=${data.text}`)
    const header = {
        "Content-Type": "application/x-www-form-urlencoded;charset=utf-8",
    }

    let respJson
    if (typeof GM !== "undefined") {
        respJson = await GM.xmlHttpRequest({
            method: "GET",
            url,
            headers: header,
            responseType: "json",
        }).then((res) => res.response)
    } else {
        respJson = await fetch(url, { headers: header }).then((res) => res.json())
    }

    cache.set(language, data.text, respJson)
    return { ...data, content: respJson }
}

export default async function translateAll(textNodes, language, excludeWords = []) {
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
        if (data.text.toLowerCase() !== data.content.sentences[0].trans.toLowerCase() && data.content.src !== language) {
            let trans = data.content.sentences[0].trans

            placeholders.forEach((word, index) => {
                const regex = RegExp(`\\{?\\{?\\{${index + 1}\\}\\}?\\}?`)
                trans = trans.replace(regex, word)
            })

            const orig = data.node.nodeValue
            if (orig.toLowerCase() !== trans.toLowerCase()) {
                out.push({ node: data.node, orig, trans })
                languages.add(data.content.src)
            }
        }
    }
    return { langs: [...languages], data: out }
}

const cache = new Cache()
