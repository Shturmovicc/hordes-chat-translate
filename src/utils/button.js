import newElement from "./element"

function toggleBoolean(boolean) {
    return !(boolean ?? false)
}

class Button {
    constructor(style, disabled = false, callback) {
        this.node = newElement(style)
        this.disabled = disabled
        if (callback) this._callback = callback

        this.node.addEventListener('click', event => {
            event.stopPropagation()
            if (!this.disabled && this._callback) this._callback.call(this, event)
        })
    }

    set callback(func) {
        this._callback = func
    }

    get callback() {
        return this._callback
    }

    set disabled(bool) {
        this._disabled = bool
        this.node.classList[bool ? 'add' : 'remove']('disabled')
    }

    get disabled() {
        return this._disabled
    }
}

class ToggleButton extends Button {
    constructor(style, state = false, disabled = false, callback) {
        super(style, disabled, event => {
            this.state = toggleBoolean(this.state)
            if (this.__callback) this.__callback.call(this, event, this.state)
        })

        this.state = state
        this.__callback = callback
    }

    set callback(func) {
        this.__callback = func
    }

    get callback() {
        return this.__callback
    }

    set state(bool) {
        this._state = bool
        this.node.classList[this.state ? 'add' : 'remove']('active')
    }

    get state() {
        return this._state
    }
}

class TextButton extends Button {
    constructor(style, text, disabled = false, callback) {
        super(style, disabled, callback)
        this.text = newElement('span').text(text)
        this.node.append(this.text)
    }
}

class ToggleTextButton extends ToggleButton {
    constructor(style, texts, state = false, disabled = false, callback) {
        super(style, state, disabled, callback)
        this.text = newElement('span')
        this.node.append(this.text)

        this.texts = texts
        this.state = state
        this.callback = callback
    }

    set state(bool) {
        super.state = bool
        this.text?.text(this.texts[Number(this.state)])
    }

    get state() {
        return super.state
    }
}

export { Button, TextButton, ToggleButton, ToggleTextButton }

