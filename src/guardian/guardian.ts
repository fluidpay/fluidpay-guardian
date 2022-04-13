import {DATA_STORE, utmCampaignListener, utmContent, utmMediumListener, utmSourceListener, utmTerm} from './utm';
import {connectDB} from "./helper";

class Guardian {
    private utmSourceObserver?: MutationObserver;
    private utmMediumObserver?: MutationObserver;
    private utmCampaignObserver?: MutationObserver;
    private utmTermObserver?: MutationObserver;
    private utmContentObserver?: MutationObserver;

    private initMutationObservers() {
        this.utmSourceObserver = new MutationObserver(Guardian.teeFunc(utmSourceListener));
        this.utmMediumObserver = new MutationObserver(Guardian.teeFunc(utmMediumListener));
        this.utmCampaignObserver = new MutationObserver(Guardian.teeFunc(utmCampaignListener));
        this.utmTermObserver = new MutationObserver(Guardian.teeFunc(utmTerm));
        this.utmContentObserver = new MutationObserver(Guardian.teeFunc(utmContent));
    }

    private static teeFunc(func: () => void): () => void {
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

    async setSessionID(sessionID: string): Promise<any> {
        await connectDB().then(async (db) => {
            const storedSessionID = await db.get(DATA_STORE, 'session_id')
            if (storedSessionID && storedSessionID === sessionID) {
                this.initMutationObservers();
                return Promise.resolve()
            }
            this.disconnect();
            return this.cleanIndexedDB().then(async () => {
                    await db.put(DATA_STORE, sessionID, 'session_id')
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
        })
    }

    private cleanIndexedDB(): Promise<void> {
        return connectDB().then((db) => {
            return db.clear(DATA_STORE)
        })
    }

    private disconnect() {
        this.utmSourceObserver?.disconnect();
        this.utmMediumObserver?.disconnect();
        this.utmCampaignObserver?.disconnect();
        this.utmTermObserver?.disconnect();
        this.utmContentObserver?.disconnect();
    }

    // FIXME this is here for testing
    public static showResult() {
        connectDB().then(async (db) => {
            const keys = (await db.getAllKeys(DATA_STORE)).filter((k) => !['guardian_index', 'latest_hash', 'session_id'].includes(k as string))
            const joinedEvents = await Promise.all(keys.flatMap(async (key) => {
                return await db.get(DATA_STORE, key)
            }))
            console.log(joinedEvents.flatMap(e => e).sort((a, b) => a.id > b.id ? 1 : -1))
        })
    }
}

export {Guardian};
