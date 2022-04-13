import {DATA_STORE, utmCampaignListener, utmContent, utmMediumListener, utmSourceListener, utmTerm} from './utm';
import {connectDB} from "./helper";

export const localStorageKey = 'fp-guardian-results';
export const defaultClearPeriod = 1_800_000;

class Guardian {
    private utmSourceObserver?: MutationObserver;
    private utmMediumObserver?: MutationObserver;
    private utmCampaignObserver?: MutationObserver;
    private utmTermObserver?: MutationObserver;
    private utmContentObserver?: MutationObserver;

    constructor() {
        this.initMutationObservers();
    }

    private initMutationObservers() {
        this.utmSourceObserver = new MutationObserver(utmSourceListener);
        this.utmMediumObserver = new MutationObserver(utmMediumListener);
        this.utmCampaignObserver = new MutationObserver(utmCampaignListener);
        this.utmTermObserver = new MutationObserver(utmTerm);
        this.utmContentObserver = new MutationObserver(utmContent);
    }

    process() {
        this.utmSourceObserver?.observe(document, {subtree: true, childList: true});
        this.utmMediumObserver?.observe(document, {subtree: true, childList: true});
        this.utmCampaignObserver?.observe(document, {subtree: true, childList: true});
        this.utmTermObserver?.observe(document, {subtree: true, childList: true});
        this.utmContentObserver?.observe(document, {subtree: true, childList: true});
    }

    async setSessionID(sessionID: string) {
        this.disconnect();
        await this.cleanIndexedDB().then(() => {
                connectDB().then((db) => {
                    return Promise.all(
                        [
                            // TODO export constants
                            db.add(DATA_STORE, sessionID, 'latest_hash'),
                            db.add(DATA_STORE, 0, 'guardian_index')
                        ]
                    )
                })
            }
        )
        this.initMutationObservers();
    }

    cleanIndexedDB(): Promise<void> {
        return connectDB().then((db) => {
            return db.clear(DATA_STORE)
        })
    }

    disconnect() {
        this.utmSourceObserver?.disconnect();
        this.utmMediumObserver?.disconnect();
        this.utmCampaignObserver?.disconnect();
        this.utmTermObserver?.disconnect();
        this.utmContentObserver?.disconnect();
    }
}

export {Guardian};
