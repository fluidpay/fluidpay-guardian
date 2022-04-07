import {EventData} from "../models/events.interface";


const hash = async (eventData: EventData): Promise<string> => {
    const digest = await crypto.subtle.digest('SHA-512', new TextEncoder().encode(JSON.stringify(eventData)))

    return new TextDecoder().decode(digest)
}

const localStorageLockTimeout = 10

const setLocalStorage = (key: string, value: Record<string, any>, ttl = -1) => {
    if (!localStorage.getItem(key+'-mutex')) {
        localStorage.setItem(key+'-mutex', 'true')
    } else {
        setTimeout(() => ({}), localStorageLockTimeout)
        setLocalStorage(key, value, ttl)
    }
    localStorage.setItem(key, JSON.stringify({expr: ttl + +(new Date()), value: JSON.stringify(value)}))
    localStorage.removeItem(key+'-mutex')
}

const updateLocalStorage = (key: string, update: (v: string) => any, ttl = -1) => {
    if (!localStorage.getItem(key+'-mutex')) {
        localStorage.setItem(key+'-mutex', 'true')
    } else {
        setTimeout(() => ({}), localStorageLockTimeout)
        updateLocalStorage(key, update, ttl)
    }
    const item = localStorage.getItem(key);
    if (!item) {
        localStorage.removeItem(key+'-mutex')
        return
    }
    localStorage.setItem(key, JSON.stringify({expr: ttl + +(new Date()), value: JSON.stringify(update(item))}))
    localStorage.removeItem(key+'-mutex')
}

const getLocalStorage = (key: string): string | null => {
    if (!localStorage.getItem(key+'-mutex')) {
        localStorage.setItem(key+'-mutex', 'true')
    } else {
        setTimeout(() => ({}), localStorageLockTimeout)
        return getLocalStorage(key)
    }
    const item = localStorage.getItem(key);
    if (!item) {
        localStorage.removeItem(key+'-mutex')
        return null
    }
    const parsed = JSON.parse(item) as { expr: number; value: string };
    if (parsed.expr > +(new Date())) {
        localStorage.removeItem(key)
        localStorage.removeItem(key+'-mutex')
        return null
    }
    localStorage.removeItem(key+'-mutex')
    return parsed.value
}

export {hash, setLocalStorage, getLocalStorage}
