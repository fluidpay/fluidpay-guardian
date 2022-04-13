import { Guardian } from './guardian/guardian';

const guardian = new Guardian()
guardian.setSessionID('ABC').then(() => {
    guardian.process()
})

