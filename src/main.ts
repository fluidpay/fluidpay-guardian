import { Guardian } from './guardian/guardian';

const guardian = new Guardian()
guardian.setSessionID('CSD').then(() => {
    guardian.process()
})

const btn = document.createElement('button')
btn.innerText = 'click me'
btn.onclick = () => {
    Guardian.showResult()
}
document.body.appendChild(btn)
