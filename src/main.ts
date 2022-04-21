import Guardian from './guardian/guardian';

declare global {
    interface Window {
        Guardian: unknown;
    }
}

window.Guardian = Guardian;

export default Guardian;
