import eventBus, { EventMsg } from "./event_bus";
import { settingStore } from "./store";
const baseURL = settingStore.get('api_base_url') || ''
const streamUrl = baseURL + "stream"

function initSSEServer() {
    const stream = new EventSource(streamUrl);
    stream.addEventListener("message", function (e) {
        let msg: EventMsg = {
            id: 'SSE-MSG',
            name: 'SSE消息',
            data: JSON.parse(e.data),
        };
        eventBus.publicize(msg);
    });
}

initSSEServer()