import Cache from "./cache"

async function translate(data, language = 'en') {
    const hit = cache.get(language, data.text)
    if (hit) return { ...data, content: hit }

    const url = new URL("https://translate.google.com/translate_a/single")
    url.search = `client=gtx&dt=t&dt=rm&dj=1&sl=auto&tl=${language}&q=${data.text}`
    const header = { 'Content-Type': 'application/x-www-form-urlencoded;charset=utf-8' }

    const resp = await GM.xmlHttpRequest({ method: "GET", url, headers: header, responseType: 'json' })
    const respJson = resp.response

    cache.set(language, data.text, respJson)
    return { ...data, content: respJson }
}

export default async function translateAll(data, language) {
    const tasks = []
    for (const text of data.textNodes) {
        tasks.push(translate(text, language))
    }
    const translated = await Promise.all(tasks)

    const languages = new Set()
    const out = []
    for (const data of translated) {
        if (data.text !== data.content.sentences[0].trans && data.content.src !== language) {
            out.push({ node: data.node, orig: data.node.nodeValue, trans: data.content.sentences[0].trans })
            languages.add(data.content.src)
        }
    }
    return { langs: [...languages], data: out }
}

const cache = new Cache()