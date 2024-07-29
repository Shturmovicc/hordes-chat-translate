function getTextNodes(element) {
    const textNodes = []
    for (const node of element.childNodes) {
        if (node.nodeType === Node.TEXT_NODE) {
            textNodes.push({ node, text: node.nodeValue.trim() })
        }
    }
    return textNodes
}

export default function messageComponents(article) {
    const line = article.lastChild
    const [time, sender, content] = line.children
    const senderChat = sender.firstChild
    const senderChatName = senderChat.textContent
    const senderData = sender.lastChild

    const textNodes = []
    let senderName = ""
    switch (senderChatName) {
        case 'faction':
        case 'party':
        case 'clan':
        case 'from':
            textNodes.push(...getTextNodes(content))
            senderName = senderData.lastChild.textContent
    }

    return { article, line, time, sender, content, senderChat, senderChatName, senderName, senderData, textNodes }
}