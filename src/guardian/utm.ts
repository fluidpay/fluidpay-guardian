import * as queryString from 'query-string'
import {Event, EventData} from "../models/events.interface";
import hash from "./helper";

const supportedUtmKeys = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content']

const processUtm = (): Promise<Event>[] => {
    return Object.entries(queryString.parse(location.search))
        .filter(([k]) => supportedUtmKeys.includes(k))
        .map(([k, v]) => ({
            type: k + '_detected',
            action: {
                value: v
            }
        } as EventData))
        .map(async (ed) => {
            return {
                hash: await hash(ed),
                created_at: new Date().getTime(),
                data: ed
            } as Event
        })
}

export default processUtm
