import { Guardian } from './guardian/guardian';

const guardian = new Guardian()
guardian.setSessionID('CSD').then(() => {
    guardian.process()
})

