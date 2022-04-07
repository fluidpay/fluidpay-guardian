export interface Event {
    data: EventData;
    created_at: number;
    hash: string;
}

export interface EventData {
    type: string;
    action: Record<string, any>;
}
