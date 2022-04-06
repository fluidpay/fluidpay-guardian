import processUtm from "./utm";
import {Event} from "../models/events.interface";
import {GuardianBuilder} from "../models/guardian.interface";

const localStorageKey = 'fp-guardian-results';

const pathUrl = '/api/fraud/guardian'

export default class Guardian {
    private readonly apiKey: string
    private readonly url: string
    private readonly clearPeriod: number
    private readonly type: string;
    private interval?: ReturnType<typeof setTimeout>

    constructor(builder: GuardianBuilder) {
        this.apiKey = builder.apiKey
        this.url = builder.url
        this.type = builder.type
        this.clearPeriod = builder.clearPeriod || 36000
        this.interval = undefined
        // TODO validate fields
    }

    process() {
        this.restartInterval()
        const results: Promise<Event>[] = []

        results.push(...processUtm())

        Promise.all(results).then((results: Event[]) => {
            const itemsPresent = localStorage.getItem(localStorageKey)
            if (itemsPresent) {
                results.push(...(JSON.parse(itemsPresent) as Event[]))
            }
            if (results.length) {
                localStorage.setItem(localStorageKey, JSON.stringify(results))
            }
        })
    }

    private restartInterval() {
        this.interval = setInterval(() => {
            localStorage.removeItem(localStorageKey)
        }, this.clearPeriod)
    }

    sendData(id: string): Promise<Response> {
        if (this.interval) {
            clearInterval(this.interval)
        }
        return new Promise<string>((resolve, reject) => {
            const storedRawItem = localStorage.getItem(localStorageKey)
            if (!storedRawItem) {
                reject('missing collected data')
                return
            }
            resolve(storedRawItem)
        }).then((body) => {
            return fetch(`${this.url}${pathUrl}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': this.apiKey
                },
                body: JSON.stringify({
                    belongs_to_type: this.type,
                    belongs_to_id: id,
                    events: JSON.parse(body)
                })
            })
        }).finally(() => {
            this.restartInterval()
        })
    }
}
