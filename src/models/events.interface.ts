export interface Event {
    data: EventData;
    created_at: number;
    hash: string;
    id: number;
}

export interface EventData {
    type: string;
    action: Record<string, unknown>;
}
