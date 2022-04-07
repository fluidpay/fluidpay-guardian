import { EventData } from '../models/events.interface';

const hash = async (eventData: EventData): Promise<string> => {
    const digest = await crypto.subtle.digest(
        'SHA-512',
        new TextEncoder().encode(JSON.stringify(eventData))
    );

    return window.btoa(unescape(encodeURIComponent(new TextDecoder().decode(digest))));
};

const localStorageLockTimeout = 10;

const setLocalStorage = (key: string, value: Record<string, any> | string, ttl = -1) => {
    waitUtilUnlocked(key);
    localStorage.setItem(
        key,
        JSON.stringify({ expr: ttl > 0 ? +new Date(ttl + +new Date()) : ttl, value: value })
    );
    invalidateMutex(key);
};

const updateLocalStorage = (key: string, update: (v: string | null) => any, ttl = -1) => {
    waitUtilUnlocked(key);
    localStorage.setItem(
        key,
        JSON.stringify({
            expr: ttl > 0 ? +new Date(ttl + +new Date()) : ttl,
            value: update(localStorage.getItem(key))
        })
    );
    invalidateMutex(key);
};

const getLocalStorage = (key: string): any => {
    waitUtilUnlocked(key);
    const item = localStorage.getItem(key);
    if (!item) {
        invalidateMutex(key);
        return null;
    }
    const parsed = JSON.parse(item) as { expr: number; value: any };
    if (parsed.expr >= 0 && parsed.expr < +new Date()) {
        localStorage.removeItem(key);
        invalidateMutex(key);
        return null;
    }
    invalidateMutex(key);
    return parsed.value;
};

function invalidateMutex(key: string) {
    localStorage.removeItem(key + '-mutex');
}

const waitUtilUnlocked = (key: string) => {
    let i = 0;
    // eslint-disable-next-line no-constant-condition
    while (true) {
        if (!localStorage.getItem(key + '-mutex')) {
            localStorage.setItem(key + '-mutex', 'true');
            break;
        }
        setTimeout(() => ({}), localStorageLockTimeout);
        if (i > 1000) {
            invalidateMutex(key);
            throw new Error('local storage timeout exceeded');
        }
        i++;
    }
};

export { hash, setLocalStorage, updateLocalStorage, getLocalStorage };
