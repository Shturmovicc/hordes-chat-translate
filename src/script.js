import Chat from "./chat"
import Settings from "./settings"
import UI from "./ui"

const ui = new UI()
const chat = new Chat()
const settings = new Settings()

chat.onmessage = (message) => {
    if (!message.textNodes.length) return
    if (settings.get('excludeNames').includes(message.nickname.toLowerCase())) return
    if (settings.get('excludeChannels').includes(message.channel)) return

    message.translate(settings.get('language'), settings.get('excludeWords'))
}

settings.onset = (key, val) => {
    if (key === 'enabled') val ? chat.init() : chat.disconnect()
}

ui.onsettings = (swindow, node) => {
    const choiceList = swindow.querySelector('.choice').parentNode
    Array.from(choiceList.children).forEach((child, index) => {
        child.addEventListener('click', () => {
            settings.element.node.forEach(element => {
                index === 3 ? node.appendChild(element) : element.remove()
            })
        })
        if (index === 3 && child.classList.contains('active')) {
            child.click()
        }
    })
}

const observer = new MutationObserver((mutationList) => {
    mutationList.forEach(mutation => {
        mutation.addedNodes.forEach(node => {
            if (node.matches('.layout')) {
                ui.init()
                if (settings.get('enabled')) chat.init()
                return
            }
        })
    })
})

const init = () => {
    if (document.getElementById('chat')) {
        settings.init()
        ui.init()
        if (settings.get('enabled')) chat.init()
        observer.observe(document.body, { childList: true })
    } else {
        setTimeout(init, 100)
    }
}

window.addEventListener('load', init)