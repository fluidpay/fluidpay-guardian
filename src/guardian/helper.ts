import { IDBPDatabase, openDB } from 'idb';
import { EventData } from '../models/events.interface';
import { DATA_STORE } from './events';

const dbName = 'guardian-results';

const hash = async (eventData: EventData, previousHash: string): Promise<string> => {
    const digest = await crypto.subtle.digest(
        'SHA-512',
        new TextEncoder().encode(jsonStringifyOrder(eventData) + previousHash)
    );

    return hex(digest);
};

function jsonStringifyOrder(obj: unknown) {
    const allKeys: string[] = [];
    const seen: Record<string, null> = {};
    JSON.stringify(obj, function (key: string, value: unknown): unknown {
        if (!(key in seen)) {
            allKeys.push(key);
            seen[key] = null;
        }
        return value;
    });
    return JSON.stringify(obj, allKeys.sort());
}

function hex(buffer: ArrayBuffer): string {
    const hexCodes = [];
    const view = new DataView(buffer);
    for (let i = 0; i < view.byteLength; i += 4) {
        // Using getUint32 reduces the number of iterations needed (we process 4 bytes each time)
        const value = view.getUint32(i);
        // toString(16) will give the hex representation of the number without padding
        const stringValue = value.toString(16);
        // We use concatenation and slice for padding
        const padding = '00000000';
        const paddedValue = (padding + stringValue).slice(-padding.length);
        hexCodes.push(paddedValue);
    }
    // Join all the hex strings into one

    return hexCodes.join('');
}

const connectDB = (): Promise<IDBPDatabase> => {
    return openDB(dbName, 1, {
        upgrade(db: IDBPDatabase<unknown>) {
            db.createObjectStore('guardian');
        }
    });
};

// teeFunc is waiting a callback function as a parameter and doing the following things with it
// first: executing the callback function
// then returning a wrapper callback function, which checking the url change
// if the url has been changed, executing the parameter callback function and updating the stored url in the indexedDB
const teeFunc = (func: () => void): (() => void) => {
    func();
    return () => {
        connectDB().then(async (db) => {
            const previous = await db.get(DATA_STORE, 'url');
            if (previous == undefined || previous !== location.href) {
                func();
                await db.put(DATA_STORE, location.href, 'url');
            }
        });
    };
};

export { hash, connectDB, teeFunc };
