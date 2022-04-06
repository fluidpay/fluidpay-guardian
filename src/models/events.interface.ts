export interface Event {
    data: EventData
    hash: string
}

export interface EventData {
    event_name: string
    created_at: number
    event_data: Record<string, any>
}
