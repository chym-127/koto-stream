import { LogicalSize, appWindow } from '@tauri-apps/api/window';
import appConfig from './config';
import { settingStore } from './store';



enum WindowSize {
    NORMAL = 0,
    MINI = 1
}


class WindowHelper {
    currentWindowSize: WindowSize;
    lock: boolean = false
    constructor() {
        this.currentWindowSize = settingStore.get("currentWindowSize") || WindowSize.NORMAL
    }

    // 设置为标准大小屏幕
    async normalScreen() {
        if (this.lock && this.currentWindowSize === WindowSize.NORMAL) {
            return
        }
        this.lock = true
        try {
            await appWindow.setSize(new LogicalSize(appConfig.normalWindowSize[0], appConfig.normalWindowSize[1]));
            this.currentWindowSize = WindowSize.NORMAL
            settingStore.set("currentWindowSize", this.currentWindowSize, true)
        } finally {
            this.lock = false
        }
    }

    // 设置为迷你屏幕
    async miniScreen() {
        if (this.lock && this.currentWindowSize === WindowSize.MINI) {
            return
        }
        this.lock = true
        try {
            await appWindow.setSize(new LogicalSize(appConfig.miniWindowSize[0], appConfig.miniWindowSize[1]));
            this.currentWindowSize = WindowSize.MINI
            settingStore.set("currentWindowSize", this.currentWindowSize, true)
        } finally {
            this.lock = false
        }
    }


    async maxScreen() {
        await appWindow.maximize()
    }

    // Pin
    async alwaysOnTop(flag: boolean = false) {
        await appWindow.setAlwaysOnTop(flag);
    }
}


const windowHelper = new WindowHelper();

export default windowHelper
export { WindowSize }