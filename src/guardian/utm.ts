import * as queryString from 'query-string';
import { Event, EventData } from '../models/events.interface';
import { connectDB, hash } from './helper';
import { IDBPDatabase } from 'idb';

const DATA_STORE = 'guardian';
const GUARDIAN_INDEX_KEY = 'guardian_index';
const GUARDIAN_LATEST_HASH_KEY = 'latest_hash';

const utmSourceListener = () => {
    const key = 'utm_source';
    const utmParam = queryString.parse(location.search)[key];

    if (utmParam && typeof utmParam === 'string') {
        connectDB().then(async (db) => onUrlChange(key, utmParam, db));
    }
};

const utmMediumListener = () => {
    const key = 'utm_medium';
    const utmParam = queryString.parse(location.search)[key];
    if (utmParam && typeof utmParam === 'string') {
        connectDB().then(async (db) => onUrlChange(key, utmParam, db));
    }
};

const utmCampaignListener = () => {
    const key = 'utm_campaign';
    const utmParam = queryString.parse(location.search)[key];
    if (utmParam && typeof utmParam === 'string') {
        connectDB().then(async (db) => onUrlChange(key, utmParam, db));
    }
};

const utmTerm = () => {
    const key = 'utm_term';
    const utmParam = queryString.parse(location.search)[key];
    if (utmParam && typeof utmParam === 'string') {
        connectDB().then(async (db) => onUrlChange(key, utmParam, db));
    }
};

const utmContent = () => {
    const key = 'utm_content';
    const utmParam = queryString.parse(location.search)[key];
    if (utmParam && typeof utmParam === 'string') {
        connectDB().then(async (db) => onUrlChange(key, utmParam, db));
    }
};

async function onUrlChange(key: string, param: string, db: IDBPDatabase): Promise<unknown> {
    const latestHash = await db.get(DATA_STORE, GUARDIAN_LATEST_HASH_KEY);
    const lastUtm = await db.get(DATA_STORE, key);

    const eventData = {
        type: !lastUtm ? key + '_detected' : key + '_changed',
        action: {
            value: param
        }
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
        created_at: new Date().getTime(),
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
    utmSourceListener,
    utmMediumListener,
    utmCampaignListener,
    utmTerm,
    utmContent
};
