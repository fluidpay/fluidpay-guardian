import {DATA_STORE, utmCampaignListener, utmContent, utmMediumListener, utmSourceListener, utmTerm} from './utm';
import {connectDB} from './helper';
import {IDBPDatabase} from 'idb';

export default class Guardian {
    private readonly endpoint: string
    private utmSourceObserver?: MutationObserver;
    private utmMediumObserver?: MutationObserver;
    private utmCampaignObserver?: MutationObserver;
    private utmTermObserver?: MutationObserver;
    private utmContentObserver?: MutationObserver;
    private readonly restartIntervalMinutes = 30;

    constructor(endpoint: string) {
        this.endpoint = endpoint
    }

    process() {
        this.setSessionID().then(() => {
            setInterval(async () => {
                await this.setSessionID()
            }, this.restartIntervalMinutes * 1000 * 60)
        })
    }

    private initMutationObservers() {
        this.utmSourceObserver = new MutationObserver(Guardian.teeFunc(utmSourceListener));
        this.utmMediumObserver = new MutationObserver(Guardian.teeFunc(utmMediumListener));
        this.utmCampaignObserver = new MutationObserver(Guardian.teeFunc(utmCampaignListener));
        this.utmTermObserver = new MutationObserver(Guardian.teeFunc(utmTerm));
        this.utmContentObserver = new MutationObserver(Guardian.teeFunc(utmContent));

        this.observe()
    }

    private static teeFunc(func: () => void): () => void {
        func()
        return func
    }

    observe() {
        this.utmSourceObserver?.observe(document, {subtree: true, childList: true});
        this.utmMediumObserver?.observe(document, {subtree: true, childList: true});
        this.utmCampaignObserver?.observe(document, {subtree: true, childList: true});
        this.utmTermObserver?.observe(document, {subtree: true, childList: true});
        this.utmContentObserver?.observe(document, {subtree: true, childList: true});
    }

    private async setSessionID(): Promise<void> {
        await connectDB().then(async (db) => {
            const storedSessionID = await db.get(DATA_STORE, 'session_id')
            const ts = await db.get(DATA_STORE, 'session_id_ts')
            if (storedSessionID && ts > +new Date()) { // session id expired or we do not have session id
                this.disconnect();
                this.initMutationObservers();
                return Promise.resolve()
            }
            this.disconnect();
            return this.cleanIndexedDB().then(async (db) => {
                    const sessionID = await fetch(`${this.endpoint}/api/tokenizer/guardian/session`).then((resp) => resp.json()
                    ).then((respBody) => respBody?.data?.session_id)
                    if (!sessionID) {
                        // TODO retry or something, in this case the server is unreachable
                        return Promise.reject()
                    }

                    await db.put(DATA_STORE, sessionID, 'session_id')
                    const date = new Date()
                    await db.put(DATA_STORE, +date.setMinutes(date.getMinutes() + this.restartIntervalMinutes), 'session_id_ts')
                    return Promise.all(
                        [
                            // TODO export constants
                            db.put(DATA_STORE, sessionID, 'latest_hash'),
                            db.put(DATA_STORE, 0, 'guardian_index')
                        ]
                    )
                }
            ).then(() => {
                this.initMutationObservers();
            })
        })
    }

    private cleanIndexedDB(): Promise<IDBPDatabase> {
        return connectDB().then((db) => {
            return db.clear(DATA_STORE).then(() => db)
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
