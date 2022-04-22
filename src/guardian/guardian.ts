import { DATA_STORE, UtmCampaign, UtmContent, UtmMedium, UtmSource, UtmTerm } from './utm';
import { connectDB } from './helper';
import { IDBPDatabase } from 'idb';
import { EventHandler } from '../models/guardian.interface';
import { Event } from '../models/events.interface';

export default class Guardian {
    private utmSource?: EventHandler;
    private utmMedium?: EventHandler;
    private utmCampaign?: EventHandler;
    private utmTerm?: EventHandler;
    private utmContent?: EventHandler;

    private readonly endpoint: string;
    private readonly restartIntervalMinutes = 30;
    private readonly apiKey: string;

    constructor(endpoint: string, apiKey: string) {
        this.endpoint = endpoint;
        this.apiKey = apiKey;
    }

    process() {
        this.setSessionID().then(() => {
            setInterval(async () => {
                await this.setSessionID();
            }, this.restartIntervalMinutes * 1000 * 60);
        });
    }

    private initMutationObservers() {
        this.utmSource = new UtmSource();
        this.utmMedium = new UtmMedium();
        this.utmCampaign = new UtmCampaign();
        this.utmTerm = new UtmTerm();
        this.utmContent = new UtmContent();

        this.observe();
    }

    observe() {
        this.utmSource?.observe();
        this.utmMedium?.observe();
        this.utmCampaign?.observe();
        this.utmTerm?.observe();
        this.utmContent?.observe();
    }

    private async setSessionID(): Promise<void> {
        await connectDB().then(async (db) => {
            const storedSessionID = await db.get(DATA_STORE, 'session_id');
            const ts = await db.get(DATA_STORE, 'session_id_ts');
            if (storedSessionID && ts > +new Date()) {
                // session id expired or we do not have session id
                this.disconnect();
                this.initMutationObservers();
                return Promise.resolve();
            }
            this.disconnect();
            return this.cleanIndexedDB()
                .then(async (db) => {
                    const sessionID = await fetch(`${this.endpoint}/api/guardian/session`, {
                        headers: {
                            Authorization: this.apiKey
                        }
                    })
                        .then((resp) => resp.json())
                        .then((respBody) => respBody?.data?.session_id);
                    if (!sessionID) {
                        // TODO retry or something, in this case the server is unreachable
                        return Promise.reject();
                    }

                    await db.put(DATA_STORE, sessionID, 'session_id');
                    const date = new Date();
                    await db.put(
                        DATA_STORE,
                        +date.setMinutes(date.getMinutes() + this.restartIntervalMinutes),
                        'session_id_ts'
                    );
                    return Promise.all([
                        // TODO export constants
                        db.put(DATA_STORE, sessionID, 'latest_hash'),
                        db.put(DATA_STORE, 0, 'guardian_index')
                    ]);
                })
                .then(() => {
                    this.initMutationObservers();
                });
        });
    }

    private cleanIndexedDB(): Promise<IDBPDatabase> {
        return connectDB().then((db) => {
            return db.clear(DATA_STORE).then(() => db);
        });
    }

    private disconnect() {
        this.utmSource?.disconnect();
        this.utmMedium?.disconnect();
        this.utmCampaign?.disconnect();
        this.utmTerm?.disconnect();
        this.utmContent?.disconnect();
    }

    public static async getData(): Promise<{
        events: Event[];
        session_id: string;
    }> {
        return connectDB().then(async (db) => {
            const joinedEvents: Event[] = [];
            joinedEvents.push(...(await new UtmSource().read(db)));
            joinedEvents.push(...(await new UtmMedium().read(db)));
            joinedEvents.push(...(await new UtmCampaign().read(db)));
            joinedEvents.push(...(await new UtmTerm().read(db)));
            joinedEvents.push(...(await new UtmContent().read(db)));

            const sessionID = (await db.get(DATA_STORE, 'session_id')) || '';
            return {
                events: joinedEvents.sort((a: { id: number }, b: { id: number }) =>
                    a.id > b.id ? 1 : -1
                ),
                session_id: sessionID
            };
        });
    }
}
