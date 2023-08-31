interface EventMsg {
    id: string,
    name: string,
    data: any
}

interface Callback {
    id: string,
    func: (data: any) => void
}

class EventBus {
    _callbacks: Callback[];
    constructor() {
        this._callbacks = []
    }

    on(id: string, callback: (data: any) => void) {
        this._callbacks.push(
            {
                id: id,
                func: callback
            }
        )
    }


    off(id: string, callback: (data: any) => void) {
        for (let index = 0; index < this._callbacks.length; index++) {
            const item = this._callbacks[index];
            if (item && item.id === id && item.func instanceof Function && callback === item.func) {
                this._callbacks.splice(index, 1)
            }
        }
    }


    publicize(msg: EventMsg) {
        for (let index = 0; index < this._callbacks.length; index++) {
            const item = this._callbacks[index];
            if (item && item.id === msg.id && item.func instanceof Function) {
                item.func(msg.data)
            }
        }
    }
}


const eventBus = new EventBus()

export default eventBus


export type { EventMsg }