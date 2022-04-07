import {Event} from "../models/events.interface";
import {getLocalStorage} from "./helper";
import {utmCampaignListener, utmContent, utmMediumListener, utmSourceListener, utmTerm} from "./utm";

export const localStorageKey = 'fp-guardian-results';
export const defaultClearPeriod = 108000

export default class Guardian {
    private readonly utmSourceObserver: MutationObserver;
    private readonly utmMediumObserver: MutationObserver;
    private readonly utmCampaignObserver: MutationObserver;
    private readonly utmTermObserver: MutationObserver;
    private readonly utmContentObserver: MutationObserver;

    constructor() {
        this.utmSourceObserver = new MutationObserver(utmSourceListener)
        this.utmMediumObserver = new MutationObserver(utmMediumListener)
        this.utmCampaignObserver = new MutationObserver(utmCampaignListener)
        this.utmTermObserver = new MutationObserver(utmTerm)
        this.utmContentObserver = new MutationObserver(utmContent)
    }

    process() {
        this.utmSourceObserver.observe(document, {subtree: true, childList: true});
        this.utmMediumObserver.observe(document, {subtree: true, childList: true});
        this.utmCampaignObserver.observe(document, {subtree: true, childList: true});
        this.utmTermObserver.observe(document, {subtree: true, childList: true});
        this.utmContentObserver.observe(document, {subtree: true, childList: true});
    }

    disconnect() {
        this.utmSourceObserver.disconnect()
        this.utmMediumObserver.disconnect()
        this.utmCampaignObserver.disconnect()
        this.utmTermObserver.disconnect()
        this.utmContentObserver .disconnect()
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
