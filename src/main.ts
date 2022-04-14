import { Guardian } from './guardian/guardian';
const endpoint = 'http://localhost:8001'
new Guardian(endpoint).process()


const btn = document.createElement('button')
btn.innerText = 'click me'
btn.onclick = () => {
    Guardian.showResult()
}
document.body.appendChild(btn)
