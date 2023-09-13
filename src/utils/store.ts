import cloneDeep from 'lodash.clonedeep';

const keySet = new Set()

class Store {
    _obj: any;
    _storeName: string;
    _localObj: any;
    constructor(storeName: string) {
        this._storeName = storeName.toUpperCase()
        if (keySet.has(this._storeName)) {
            throw new Error("不能声明重复的key：" + this._storeName);
        } else {
            keySet.add(this._storeName)
        }
        let local = localStorage.getItem(this._storeName)
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
            localStorage.setItem(this._storeName, JSON.stringify(this._localObj))
        }
    }


    get(key: string): any {
        return this._obj[key]
    }


    getAll(): any {
        return this._obj
    }
}


const store = new Store("STORE")
const settingStore = new Store('SETTING');

export { Store, settingStore }
export default store