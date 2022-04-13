import * as queryString from 'query-string';
import {Event, EventData} from '../models/events.interface';
import {connectDB, hash} from './helper';
import {IDBPDatabase} from "idb";

const utmSuffix = '_last';

const utmSourceListener = () => {
    const key = 'utm_source';
    const utmParam = queryString.parse(location.search)[key];

    if (utmParam && typeof utmParam === 'string') {
        connectDB().then(async (db) => onUrlChange(key, utmParam, db))
    }
};

const utmMediumListener = () => {
    const key = 'utm_medium';
    const utmParam = queryString.parse(location.search)[key];
    if (utmParam && typeof utmParam === 'string') {
        connectDB().then(async (db) => onUrlChange(key, utmParam, db))
    }
};

const utmCampaignListener = () => {
    const key = 'utm_campaign';
    const utmParam = queryString.parse(location.search)[key];
    if (utmParam && typeof utmParam === 'string') {
        connectDB().then(async (db) => onUrlChange(key, utmParam, db))
    }
};

const utmTerm = () => {
    const key = 'utm_term';
    const utmParam = queryString.parse(location.search)[key];
    if (utmParam && typeof utmParam === 'string') {
        connectDB().then(async (db) => onUrlChange(key, utmParam, db))
    }
};

const utmContent = () => {
    const key = 'utm_content';
    const utmParam = queryString.parse(location.search)[key];
    if (utmParam && typeof utmParam === 'string') {
        connectDB().then(async (db) => onUrlChange(key, utmParam, db))
    }
};

async function onUrlChange(key: string, param: string, db: IDBPDatabase): Promise<unknown> {
    const latestHash = await db.get('guardian', 'latest_hash') || 'init-hash_123'
    const lastUtm = await db.get('guardian', key + utmSuffix)

    const eventData = {
        type: !lastUtm ? key + '_detected' : key + '_changed',
        action: {
            value: param
        },
    } as EventData;

    if (lastUtm && lastUtm[lastUtm.length - 1].data.action?.value &&
        window.btoa(JSON.stringify(lastUtm[lastUtm.length - 1].data.action)) === window.btoa(JSON.stringify(eventData.action))) {
        return Promise.resolve()
    }

    const hashedData = await hash(eventData, latestHash)

    const tx = db.transaction('guardian', 'readwrite');
    const store = tx.objectStore('guardian');

    const lastIndex = await store.get('guardian_index') || 0

    const currentLatestHash = await store.get('latest_hash') || 'init-hash_123';
    if (latestHash !== currentLatestHash) {
        await tx.done
        return onUrlChange(key, param, db)
    }

    const event = {
        hash: hashedData,
        created_at: new Date().getTime(),
        data: eventData,
        id: lastIndex + 1
    } as Event;
    store.put(hashedData, 'latest_hash')
    store.put(lastUtm ? [...lastUtm, event] : [event], key + utmSuffix)
    store.put(lastIndex + 1, 'guardian_index')
    await tx.done
    return Promise.resolve();
}

export {utmSourceListener, utmMediumListener, utmCampaignListener, utmTerm, utmContent};
