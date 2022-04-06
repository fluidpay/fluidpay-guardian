export interface Event {
    data: EventData
    created_at: number
    hash: string
}

export interface EventData {
    event_name: string
    event_data: Record<string, any>
}
