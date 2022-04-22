import { IDBPDatabase } from 'idb';
import { Event } from './events.interface';

export interface EventHandler extends EventProcessor, Observable {}

export interface EventProcessor {
    listen(): void;

    read(db: IDBPDatabase): Promise<Event[]>;
}

export interface Observable {
    observe(): void;

    disconnect(): void;
}
