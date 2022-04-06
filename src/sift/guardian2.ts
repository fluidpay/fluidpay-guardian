interface Constructor {
    api_key: string
    user_id?: string
    session_id?: string
}

export default class Guardian {
    private api_key: string = ''
    public session_id: string = '' // If not set will generate for you
    public user_id: string = '' // optional - id, username, email address or '' if not yet known
    private beacon_key: string = '' // This gets set from the fetch request using public api key

    private localDevUrl: string = 'http://localhost:8001'
    private pathUrl: string = '/api/sift/beaconkey'
    private url: string = ''

    constructor(info: Constructor) {
        this.api_key = (info.api_key ? info.api_key : '')
        this.session_id = (info.session_id ? info.session_id : this.generateUUID())
        console.log(this.session_id)
        this.user_id = (info.user_id ? info.user_id : '')

        // Set url
        if (window.location.href.indexOf('localhost') !== -1) {
            this.url = this.localDevUrl.replace(/\/$/, '') + this.pathUrl
        } else {
            this.url = this.url.replace(/\/$/, '') + this.pathUrl
        }

        this.validate()

        this.loadBeaconKey()
            .then((beaconkey) => {
                this.beacon_key = beaconkey
                this.runScript()
            })
            .catch((err) => {
                throw new Error(err)
            })
    }

    // Validate api_key is set
    validate() {
        if (this.api_key === '') {
            throw new Error('public api key is required')
        }
    }

    loadBeaconKey() {
        return fetch(this.url, {
            method: 'GET',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                'Authorization': this.api_key
            }
        })
            .then((res) => { return res.json() })
            .then((res) => { return res.data })
    }

    runScript() {
        var _sift = (window as any)._sift = (window as any)._sift || [];
        _sift.push(['_setAccount', this.beacon_key]);
        _sift.push(['_setUserId', this.user_id]);
        _sift.push(['_setSessionId', this.session_id]);
        _sift.push(['_trackPageview']);

        function ls() {
            var e = document.createElement('script');
            e.src = 'https://cdn.sift.com/s.js';
            document.body.appendChild(e);
        }
        if ((window as any).attachEvent) {
            (window as any).attachEvent('onload', ls);
        } else {
            window.addEventListener('load', ls, false);
        }
    }

    ////////////////////////
    //// Misc functions ////
    ////////////////////////
    generateUUID(): string {
        var d = new Date().getTime()
        var uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
            var r = (d + Math.random()*16)%16 | 0
            d = Math.floor(d/16)
            return (c=='x' ? r : (r&0x3|0x8)).toString(16)
        })
        return uuid
    }
}

/*
curl -XGET 'https://api.sift.com/v3/accounts/611556bd8aa59d58d51f0aeb/sessions/9fcab96c-d586-4a09-805e-70e6c027c7e5' \
  -H 'Content-Type: application/json' \
  -u 852c7aac1aa50cb5: | jq
  */
