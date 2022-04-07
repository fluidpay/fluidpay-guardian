import * as queryString from 'query-string'
import {Event, EventData} from "../models/events.interface";
import {getLocalStorage, hash, setLocalStorage, updateLocalStorage} from "./helper";
import {defaultClearPeriod, localStorageKey} from "./guardian";

const utmSuffix = "_last"
const previousElementTTL = 10800000

const utmSourceListener = () => {
    const key = 'utm_source'
    const lastUTM = getLocalStorage(key + utmSuffix)
    const utmParam = queryString.parse(location.search)[key]
    if (utmParam && typeof utmParam === 'string') {
        setLocalStorage(key + utmSuffix, utmParam, previousElementTTL)
        onUrlChange(key, lastUTM, utmParam)
    }
}

const utmMediumListener = () => {
    const key = 'utm_medium'
    const lastUTM = getLocalStorage(key + utmSuffix)
    const utmParam = queryString.parse(location.search)[key]
    if (utmParam && typeof utmParam === 'string') {
        setLocalStorage(key + utmSuffix, utmParam, previousElementTTL)
        onUrlChange(key, lastUTM, utmParam)
    }
}

const utmCampaignListener = () => {
    const key = 'utm_campaign'
    const lastUTM = getLocalStorage(key + utmSuffix)
    const utmParam = queryString.parse(location.search)[key]
    if (utmParam && typeof utmParam === 'string') {
        setLocalStorage(key + utmSuffix, utmParam, previousElementTTL)
        onUrlChange(key, lastUTM, utmParam)
    }
}

const utmTerm = () => {
    const key = 'utm_term'
    const lastUTM = getLocalStorage(key + utmSuffix)
    const utmParam = queryString.parse(location.search)[key]
    if (utmParam && typeof utmParam === 'string') {
        setLocalStorage(key + utmSuffix, utmParam, previousElementTTL)
        onUrlChange(key, lastUTM, utmParam)
    }
}

const utmContent = () => {
    const key = 'utm_content'
    const lastUTM = getLocalStorage(key + utmSuffix)
    const utmParam = queryString.parse(location.search)[key]
    if (utmParam && typeof utmParam === 'string') {
        setLocalStorage(key + utmSuffix, utmParam, previousElementTTL)
        onUrlChange(key, lastUTM, utmParam)
    }
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

export {utmSourceListener,utmMediumListener,utmCampaignListener,utmTerm,utmContent}
