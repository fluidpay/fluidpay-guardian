import * as queryString from 'query-string';
import { Event, EventData } from '../models/events.interface';
import { connectDB, hash, teeFunc } from './helper';
import { IDBPDatabase } from 'idb';
import { Observable, EventProcessor } from '../models/guardian.interface';
import FingerprintJS, { Agent } from '@fingerprintjs/fingerprintjs';

const DATA_STORE = 'guardian';
const GUARDIAN_INDEX_KEY = 'guardian_index';
const GUARDIAN_LATEST_HASH_KEY = 'latest_hash';

class BaseObservable implements Observable {
    private observer?: MutationObserver;
    private readonly target: Node;

    constructor(target: Node) {
        this.target = target;
    }

    init(listener: () => void) {
        this.observer = new MutationObserver(teeFunc(listener));
    }

    observe(): void {
        this.observer?.observe(this.target, { subtree: true, childList: true });
    }

    disconnect(): void {
        this.observer?.disconnect();
    }
}

class Location extends BaseObservable implements EventProcessor {
    constructor() {
        super(document);
        super.init(this.listen);
    }

    listen(): void {
        const key = 'location';
        const loc = window.location.href;

        if (loc && typeof loc === 'string') {
            connectDB().then(async (db) => onUrlChange(key, loc, db));
        }
    }

    read(db: IDBPDatabase): Promise<Event[]> {
        return wrapPromise(db.get(DATA_STORE, 'location'));
    }
}

class Referrer extends BaseObservable implements EventProcessor {
    constructor() {
        super(document);
        super.init(this.listen);
    }

    listen(): void {
        const key = 'referrer';
        const referrer = document.referrer;

        if (referrer && typeof referrer === 'string') {
            connectDB().then(async (db) => onUrlChange(key, referrer, db));
        }
    }

    read(db: IDBPDatabase): Promise<Event[]> {
        return wrapPromise(db.get(DATA_STORE, 'referrer'));
    }
}

class ScreenSize extends BaseObservable implements EventProcessor {
    constructor() {
        super(document);
        super.init(this.listen);
    }

    listen(): void {
        const key = 'screen_size';
        const screenSize = screen.height + 'x' + screen.width;

        if (screenSize && typeof screenSize === 'string') {
            connectDB().then(async (db) => onUrlChange(key, screenSize, db));
        }
    }

    read(db: IDBPDatabase): Promise<Event[]> {
        return wrapPromise(db.get(DATA_STORE, 'screen_size'));
    }
}

class WindowSize extends BaseObservable implements EventProcessor {
    constructor() {
        super(document);
        super.init(this.listen);
    }

    listen(): void {
        const key = 'window_size';
        const windowSize = window.innerHeight + 'x' + window.innerWidth;

        if (windowSize && typeof windowSize === 'string') {
            connectDB().then(async (db) => onUrlChange(key, windowSize, db));
        }
    }

    read(db: IDBPDatabase): Promise<Event[]> {
        return wrapPromise(db.get(DATA_STORE, 'window_size'));
    }
}

class UtmSource extends BaseObservable implements EventProcessor {
    constructor() {
        super(document);
        super.init(this.listen);
    }

    listen(): void {
        const key = 'utm_source';
        const utmParam = queryString.parse(location.search)[key];

        if (utmParam && typeof utmParam === 'string') {
            connectDB().then(async (db) => onUrlChange(key, utmParam, db));
        }
    }

    read(db: IDBPDatabase): Promise<Event[]> {
        return wrapPromise(db.get(DATA_STORE, 'utm_source'));
    }
}

class UtmMedium extends BaseObservable implements EventProcessor {
    constructor() {
        super(document);
        super.init(this.listen);
    }

    listen(): void {
        const key = 'utm_medium';
        const utmParam = queryString.parse(location.search)[key];
        if (utmParam && typeof utmParam === 'string') {
            connectDB().then(async (db) => onUrlChange(key, utmParam, db));
        }
    }

    read(db: IDBPDatabase): Promise<Event[]> {
        return wrapPromise(db.get(DATA_STORE, 'utm_medium'));
    }
}

class UtmCampaign extends BaseObservable implements EventProcessor {
    constructor() {
        super(document);
        super.init(this.listen);
    }

    listen(): void {
        const key = 'utm_campaign';
        const utmParam = queryString.parse(location.search)[key];
        if (utmParam && typeof utmParam === 'string') {
            connectDB().then(async (db) => onUrlChange(key, utmParam, db));
        }
    }

    read(db: IDBPDatabase): Promise<Event[]> {
        return wrapPromise(db.get(DATA_STORE, 'utm_campaign'));
    }
}

class UtmTerm extends BaseObservable implements EventProcessor {
    constructor() {
        super(document);
        super.init(this.listen);
    }

    listen(): void {
        const key = 'utm_term';
        const utmParam = queryString.parse(location.search)[key];
        if (utmParam && typeof utmParam === 'string') {
            connectDB().then(async (db) => onUrlChange(key, utmParam, db));
        }
    }

    read(db: IDBPDatabase): Promise<Event[]> {
        return wrapPromise(db.get(DATA_STORE, 'utm_term'));
    }
}

class UtmContent extends BaseObservable implements EventProcessor {
    constructor() {
        super(document);
        super.init(this.listen);
    }

    listen(): void {
        const key = 'utm_content';
        const utmParam = queryString.parse(location.search)[key];
        if (utmParam && typeof utmParam === 'string') {
            connectDB().then(async (db) => onUrlChange(key, utmParam, db));
        }
    }

    read(db: IDBPDatabase): Promise<Event[]> {
        return wrapPromise(db.get(DATA_STORE, 'utm_content'));
    }
}

class Fingerprint extends BaseObservable implements EventProcessor {
    constructor() {
        super(document);
        super.init(this.listen);
    }

    listen(): void {
        const key = 'fingerprint';
        FingerprintJS.load().then(async (fingerprint: Agent) => {
            const fingerprintResult = await fingerprint.get();
            if (fingerprintResult.visitorId) {
                connectDB().then(async (db) => onUrlChange(key, fingerprintResult.visitorId, db));
            }
        });
    }

    read(db: IDBPDatabase): Promise<Event[]> {
        return wrapPromise(db.get(DATA_STORE, 'fingerprint'));
    }
}

const wrapPromise = (p: Promise<Event[]>): Promise<Event[]> => {
    return p.then((data) => data || []).catch(() => []);
};

// onUrlChange name is deprecated should be renamed to onValueChange in the nearest future
async function onUrlChange(key: string, param: string, db: IDBPDatabase): Promise<unknown> {
    const latestHash = await db.get(DATA_STORE, GUARDIAN_LATEST_HASH_KEY);
    const lastUtm = await db.get(DATA_STORE, key);

    const eventData = {
        action: {
            value: param
        },
        created_at: new Date().getTime(),
        type: !lastUtm ? key + '_detected' : key + '_changed'
    } as EventData;
    if (
        lastUtm &&
        lastUtm[lastUtm.length - 1].data.action?.value &&
        window.btoa(JSON.stringify(lastUtm[lastUtm.length - 1].data.action)) ===
            window.btoa(JSON.stringify(eventData.action))
    ) {
        return Promise.resolve();
    }

    const hashedData = await hash(eventData, latestHash);

    const tx = db.transaction(DATA_STORE, 'readwrite');
    const store = tx.objectStore(DATA_STORE);

    const lastIndex = await store.get(GUARDIAN_INDEX_KEY);
    if (Number.isNaN(lastIndex)) {
        throw new Error('invalid last index');
    }

    const currentLatestHash = await store.get(GUARDIAN_LATEST_HASH_KEY);
    if (latestHash !== currentLatestHash) {
        await tx.done;
        return onUrlChange(key, param, db);
    }

    const event = {
        hash: hashedData,
        data: eventData,
        id: lastIndex + 1
    } as Event;
    store.put(hashedData, GUARDIAN_LATEST_HASH_KEY);
    store.put(lastUtm ? [...lastUtm, event] : [event], key);
    store.put(lastIndex + 1, GUARDIAN_INDEX_KEY);
    await tx.done;
    return Promise.resolve();
}

export {
    DATA_STORE,
    BaseObservable,
    Location,
    Referrer,
    ScreenSize,
    WindowSize,
    UtmSource,
    UtmMedium,
    UtmCampaign,
    UtmTerm,
    UtmContent,
    Fingerprint
};
