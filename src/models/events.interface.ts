export interface Event {
    data: EventData;
    hash: string;
    id: number;
}

export interface EventData {
    action: Record<string, unknown>;
    created_at: number;
    type: string;
}
