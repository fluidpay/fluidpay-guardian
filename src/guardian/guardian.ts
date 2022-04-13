import {utmCampaignListener, utmContent, utmMediumListener, utmSourceListener, utmTerm} from './utm';

export const localStorageKey = 'fp-guardian-results';
export const defaultClearPeriod = 1_800_000;

class Guardian {
    private utmSourceObserver?: MutationObserver;
    private utmMediumObserver?: MutationObserver;
    private utmCampaignObserver?: MutationObserver;
    private utmTermObserver?: MutationObserver;
    private utmContentObserver?: MutationObserver;
    private sessionProxy: ProxyHandler<{ sessionID: string }>;
    private session?: {
        sessionID: string
    };

    constructor() {
        this.initMutationObservers();
        this.sessionProxy = new Proxy<any>(this.session, {
            set: (target, key, value): boolean => {
                target[key] = value
                this.disconnect();
                this.initMutationObservers();
                return true
            }
        })

    }

    private initMutationObservers() {
        this.utmSourceObserver = new MutationObserver(utmSourceListener);
        this.utmMediumObserver = new MutationObserver(utmMediumListener);
        this.utmCampaignObserver = new MutationObserver(utmCampaignListener);
        this.utmTermObserver = new MutationObserver(utmTerm);
        this.utmContentObserver = new MutationObserver(utmContent);
    }

    process() {
        this.utmSourceObserver?.observe(document, {subtree: true, childList: true});
        this.utmMediumObserver?.observe(document, {subtree: true, childList: true});
        this.utmCampaignObserver?.observe(document, {subtree: true, childList: true});
        this.utmTermObserver?.observe(document, {subtree: true, childList: true});
        this.utmContentObserver?.observe(document, {subtree: true, childList: true});
    }

    setSessionID(sessionID: string) {
        this.sessionProxy.apply({sessionID: sessionID})

    }

    disconnect() {
        this.utmSourceObserver?.disconnect();
        this.utmMediumObserver?.disconnect();
        this.utmCampaignObserver?.disconnect();
        this.utmTermObserver?.disconnect();
        this.utmContentObserver?.disconnect();
    }
}

export {Guardian};
