import {EventData} from "../models/events.interface";


const hash = async (eventData: EventData): Promise<string> => {
    const digest = await crypto.subtle.digest('SHA-512', new TextEncoder().encode(JSON.stringify(eventData)))

    return new TextDecoder().decode(digest)
}

export default hash
