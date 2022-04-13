import {IDBPDatabase, openDB} from 'idb';
import {EventData} from '../models/events.interface';

const dbName = 'fp-guardian-results';

const hash = async (eventData: EventData, previousHash: string): Promise<string> => {
    const digest = await crypto.subtle.digest(
        'SHA-512',
        new TextEncoder().encode(JSON.stringify(eventData) + previousHash)
    );

    return window.btoa(unescape(encodeURIComponent(new TextDecoder().decode(digest))));
};

const connectDB = (): Promise<IDBPDatabase> => {
    return openDB(dbName, 1, {
        upgrade(db: IDBPDatabase<unknown>) {
           db.createObjectStore('guardian')
        }
    }).then((db) => {
        console.log(db.objectStoreNames)
        return db
    })
};

export {hash, connectDB};
