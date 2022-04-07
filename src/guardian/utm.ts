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
    new MutationObserver(() => {

        const lastUTM = getLocalStorage(key + utmSuffix)
        const utmParam = queryString.parse(location.search)[key]
        if (utmParam && typeof utmParam === 'string') {
            setLocalStorage(key + utmSuffix, utmParam, 10800000)
            onUrlChange(key, lastUTM, utmParam)
        }
    }).observe(document, {subtree: true, childList: true});
}

const onUrlChange = (key: string, lastUtm: string | null, utmParam: string) => {
    if (lastUtm && lastUtm === utmParam) {
        return
    }
    const eventData = {
        type: !lastUtm ? key + '_detected' : key + '_changed',
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
            let result = {} as any
            if (v) {
                const parsed = JSON.parse(v) as { expr: number; value: any }
                result = parsed.value
            }
            result[h] = event
            return result
        }, defaultClearPeriod)
    })
}

export default addUTMListeners
