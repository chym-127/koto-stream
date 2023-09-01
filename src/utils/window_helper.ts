import { LogicalSize, appWindow } from '@tauri-apps/api/window';
import appConfig from './config';



enum WindowSize {
    NORMAL = 0,
    MINI = 1
}


class WindowHelper {
    currentWindowSize: WindowSize = WindowSize.NORMAL
    lock: boolean = false
    constructor() { }

    // 设置为标准大小屏幕
    async normalScreen() {
        if (this.lock && this.currentWindowSize === WindowSize.NORMAL) {
            return
        }
        this.lock = true
        try {
            await appWindow.setSize(new LogicalSize(appConfig.normalWindowSize[0], appConfig.normalWindowSize[1]));
            this.currentWindowSize = WindowSize.NORMAL
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
        } finally {
            this.lock = false
        }
    }

    // Pin
    async alwaysOnTop(flag: boolean = false) {
        await appWindow.setAlwaysOnTop(flag);
    }
}


const windowHelper = new WindowHelper();

export default windowHelper
export { WindowSize }