import * as queryString from 'query-string'
import {Event, EventData} from "../models/events.interface";
import {getLocalStorage, hash, setLocalStorage, updateLocalStorage} from "./helper";
import {defaultClearPeriod, localStorageKey} from "./guardian";

const supportedUtmKeys = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content']
const utmSuffix = "_last"

const addUTMListeners = () => {
    supportedUtmKeys.forEach((v) => {
        addUTMListener(v)
    })
}

const addUTMListener = (key: string) => {
    const callback = () => {
        console.log('evemt listener')

        const lastUTM = getLocalStorage(key + utmSuffix)
        const utmParam = queryString.parse(location.search)[key]
        if (utmParam && typeof utmParam === 'string') {
            setLocalStorage(key + utmSuffix, utmParam, 10800000)
            onUrlChange(key, lastUTM, utmParam)
        }
    }
    callback()
    new MutationObserver(callback).observe(document, {subtree: true, childList: true});
}

const onUrlChange = (key: string, lastUtm: string | null, utmParam: string) => {
    const eventData = {
        type: !lastUtm ? key + '_detected' : key + 'changed',
        action: {
            value: utmParam
        }
    } as EventData

    hash(eventData).then((h: string) => {
        const event = {
            hash: h,
            created_at: new Date().getTime(),
            data: eventData
        } as Event
        updateLocalStorage(localStorageKey, (v: string | null) => {
            if (v) {
                const parsed = JSON.parse(v) as { expr: number; value: string }
                const value = JSON.parse(parsed.value)
                value[h] = event
                return value
            }
            return event
        }, defaultClearPeriod)
    })
}

export default addUTMListeners
