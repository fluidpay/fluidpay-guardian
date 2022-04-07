import {EventData} from "../models/events.interface";


const hash = async (eventData: EventData): Promise<string> => {
    const digest = await crypto.subtle.digest('SHA-512', new TextEncoder().encode(JSON.stringify(eventData)))

    return new TextDecoder().decode(digest)
}

const localStorageLockTimeout = 10

const setLocalStorage = (key: string, value: Record<string, any> | string, ttl = -1) => {
    if (!localStorage.getItem(key+'-mutex')) {
        localStorage.setItem(key+'-mutex', 'true')
    } else {
        setTimeout(() => ({}), localStorageLockTimeout)
        setLocalStorage(key, value, ttl)
    }
    let val: string
    if (typeof value === 'string') {
        val = value
    } else {
        val = JSON.stringify(value)
    }
    localStorage.setItem(key, JSON.stringify({expr: ttl + +(new Date()), value: val}))
    localStorage.removeItem(key+'-mutex')
}

const updateLocalStorage = (key: string, update: (v: string|null) => any, ttl = -1) => {
    if (!localStorage.getItem(key+'-mutex')) {
        localStorage.setItem(key+'-mutex', 'true')
    } else {
        setTimeout(() => ({}), localStorageLockTimeout)
        updateLocalStorage(key, update, ttl)
    }
    let val: string
    const updated = update(localStorage.getItem(key))
    if (typeof updated === 'string') {
        val = updated
    } else {
        val = JSON.stringify(updated)
    }
    localStorage.setItem(key, JSON.stringify({expr: ttl + +(new Date()), value: val}))
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
    if (parsed.expr >= 0 && parsed.expr > +(new Date())) {
        localStorage.removeItem(key)
        localStorage.removeItem(key+'-mutex')
        return null
    }
    localStorage.removeItem(key+'-mutex')
    return parsed.value
}

export {hash, setLocalStorage, getLocalStorage}
