interface Constructor {
    api_key: string
    user_id?: string
    session_id?: string
}

export default class Guardian {
    private api_key = ''

    constructor(info: Constructor) {
        this.api_key = info.api_key
    }
}
