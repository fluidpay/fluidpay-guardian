import {
    DATA_STORE,
    Referrer,
    ScreenSize,
    WindowSize,
    Location,
    UtmCampaign,
    UtmContent,
    UtmMedium,
    UtmSource,
    UtmTerm,
    Fingerprint
} from './events';
import { connectDB } from './helper';
import { IDBPDatabase } from 'idb';
import { EventHandler } from '../models/guardian.interface';
import { Event } from '../models/events.interface';

export default class Guardian {
    private referrer?: EventHandler;
    private screenSize?: EventHandler;
    private windowSize?: EventHandler;
    private loc?: EventHandler;
    private utmSource?: EventHandler;
    private utmMedium?: EventHandler;
    private utmCampaign?: EventHandler;
    private utmTerm?: EventHandler;
    private utmContent?: EventHandler;
    private fingerprint?: EventHandler;

    private readonly endpoint: string;
    private readonly restartIntervalMinutes = 30;
    private readonly apiKey: string;

    constructor(endpoint: string, apiKey: string) {
        // Set url endpoint
        this.endpoint = endpoint;
        // trim backslash from endpoint as it is not needed
        if (this.endpoint.endsWith('/')) {
            this.endpoint = this.endpoint.slice(0, -1);
        }

        // Set api key
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
        this.referrer = new Referrer();
        this.screenSize = new ScreenSize();
        this.windowSize = new WindowSize();
        this.loc = new Location();
        this.utmSource = new UtmSource();
        this.utmMedium = new UtmMedium();
        this.utmCampaign = new UtmCampaign();
        this.utmTerm = new UtmTerm();
        this.utmContent = new UtmContent();
        this.fingerprint = new Fingerprint();

        this.observe();
    }

    observe() {
        this.referrer?.observe();
        this.screenSize?.observe();
        this.windowSize?.observe();
        this.loc?.observe();
        this.utmSource?.observe();
        this.utmMedium?.observe();
        this.utmCampaign?.observe();
        this.utmTerm?.observe();
        this.utmContent?.observe();
        this.fingerprint?.observe();
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

    disconnect() {
        this.referrer?.disconnect();
        this.screenSize?.disconnect();
        this.windowSize?.disconnect();
        this.loc?.disconnect();
        this.utmSource?.disconnect();
        this.utmMedium?.disconnect();
        this.utmCampaign?.disconnect();
        this.utmTerm?.disconnect();
        this.utmContent?.disconnect();
        this.fingerprint?.disconnect();
    }

    public static version(): string {
        return '0.0.1';
    }

    public static async getData(): Promise<{
        events: Event[];
        session_id: string;
    }> {
        return connectDB().then(async (db) => {
            const joinedEvents: Event[] = [];
            joinedEvents.push(...(await new Referrer().read(db)));
            joinedEvents.push(...(await new ScreenSize().read(db)));
            joinedEvents.push(...(await new WindowSize().read(db)));
            joinedEvents.push(...(await new Location().read(db)));
            joinedEvents.push(...(await new UtmSource().read(db)));
            joinedEvents.push(...(await new UtmMedium().read(db)));
            joinedEvents.push(...(await new UtmCampaign().read(db)));
            joinedEvents.push(...(await new UtmTerm().read(db)));
            joinedEvents.push(...(await new UtmContent().read(db)));
            joinedEvents.push(...(await new Fingerprint().read(db)));

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
