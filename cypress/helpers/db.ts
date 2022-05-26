import {IDBPDatabase, openDB} from "idb";

const dbName = 'guardian-results';
const DATA_STORE = 'guardian';

const connectDB = (): Promise<IDBPDatabase> => {
    return openDB(dbName, 1, {
        upgrade(db: IDBPDatabase<unknown>) {
            db.createObjectStore('guardian');
        }
    });
};

export {
    DATA_STORE,
    connectDB
}
