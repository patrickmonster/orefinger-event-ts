class EditLable extends HTMLElement {
    input = null;
    text = null;

    onTextChange = null;

    connectedCallback() {
        this.input = document.createElement('input');
        this.text = document.createElement('span');

        this.input.type = this.getAttribute('type');

        this.input.onkeydown = e => {
            const code = e.key;
            if (code === 'Enter') {
                this.text.style.display = 'block';
                this.input.style.display = 'none';
                this.setAttribute('text', this.input.value);
            } else if (code === 'Escape') {
                this.text.style.display = 'block';
                this.input.style.display = 'none';
                this.input.value = this.text.innerHTML;
            }
        };

        this.input.onfocusout = () => {
            this.text.style.display = 'block';
            this.input.style.display = 'none';
            this.input.value = this.text.innerHTML;
        };

        this.text.ondblclick = () => {
            this.text.style.display = 'none';
            this.input.style.display = 'block';
        };

        const txt = this.getAttribute('text') || '';

        this.input.value = txt;
        this.text.innerHTML = txt;

        this.text.style.display = 'block';
        this.input.style.display = 'none';

        this.appendChild(this.text);
        this.appendChild(this.input);
    }
    attributeChangedCallback() {
        const txt = this.getAttribute('text') || '';
        if (this.text && this.input) {
            this.text.innerHTML = txt;
            this.input.value = txt;

            this.onTextChange.detail.text = txt;
        }
    }

    static get observedAttributes() {
        return ['text'];
    }
}

customElements.define('edit-lable', EditLable);
