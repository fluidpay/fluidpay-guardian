import {Event} from "../models/events.interface";
import {getLocalStorage} from "./helper";
import addUTMListeners from "./utm";

export const localStorageKey = 'fp-guardian-results';
export const defaultClearPeriod = 108000

export default class Guardian {
    process() {
        console.log('entrypoint')

        addUTMListeners()
    }

    getData(): Event[] {
        const values = getLocalStorage(localStorageKey)
        if (!values) {
            return [] as Event[]
        }
        const parsed = JSON.parse(values) as { [key: string]: Event }
        return Object.values(parsed)
    }
}
