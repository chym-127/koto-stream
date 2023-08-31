import cloneDeep from 'lodash.clonedeep';


class Store {
    _obj: any;
    _localObj: any;
    constructor() {
        let local = localStorage.getItem("STORE")
        if (local) {
            this._obj = JSON.parse(local)
            this._localObj = cloneDeep(this._obj)
        } else {
            this._obj = {}
            this._localObj = {}
        }
    }


    set(key: string, data: any, isLocal: boolean = false) {
        this._obj[key] = data
        if (isLocal) {
            this._localObj[key] = cloneDeep(this._obj[key])
            localStorage.setItem("STORE", JSON.stringify(this._localObj))
        }
    }


    get(key: string): any {
        return this._obj[key]
    }
}


const store = new Store()


export default store