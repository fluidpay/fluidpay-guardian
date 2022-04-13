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

    // constructor() {
    //     this.initMutationObservers();
    // }

    private initMutationObservers() {
        this.utmSourceObserver = new MutationObserver(this.teeFunc(utmSourceListener));
        this.utmMediumObserver = new MutationObserver(this.teeFunc(utmMediumListener));
        this.utmCampaignObserver = new MutationObserver(this.teeFunc(utmCampaignListener));
        this.utmTermObserver = new MutationObserver(this.teeFunc(utmTerm));
        this.utmContentObserver = new MutationObserver(this.teeFunc(utmContent));
    }

    teeFunc(func: () => void): () => void {
        func()
        return func
    }

    process() {
        this.utmSourceObserver?.observe(document, {subtree: true, childList: true});
        this.utmMediumObserver?.observe(document, {subtree: true, childList: true});
        this.utmCampaignObserver?.observe(document, {subtree: true, childList: true});
        this.utmTermObserver?.observe(document, {subtree: true, childList: true});
        this.utmContentObserver?.observe(document, {subtree: true, childList: true});
    }

    setSessionID(sessionID: string): Promise<any> {
        this.disconnect();
        return this.cleanIndexedDB().then(() => {
                return connectDB().then((db) => {
                    return Promise.all(
                        [
                            // TODO export constants
                            db.put(DATA_STORE, sessionID, 'latest_hash'),
                            db.put(DATA_STORE, 0, 'guardian_index')
                        ]
                    )
                })
            }
        ).then(() => {
            this.initMutationObservers();
        })
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
