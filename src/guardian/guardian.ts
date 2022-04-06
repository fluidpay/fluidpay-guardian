import processUtm from "./utm";
import {Event} from "../models/events.interface";

const localStorageKey = 'fp-guardian-results';

export default class Guardian {
    process() {
        const results: Promise<Event>[] = []

        results.push(...processUtm())

        Promise.all(results).then((results: Event[]) => {
            const itemsPresent = localStorage.getItem(localStorageKey)
            if (itemsPresent) {
                results.push(...(JSON.parse(itemsPresent) as Event[]))
            }
            localStorage.setItem(localStorageKey, JSON.stringify(results))
        })
    }
}
