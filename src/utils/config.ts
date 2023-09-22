import { Store } from "./store";

const configStore = new Store("CONFIG")

class Config {
    autoPlay: boolean = true;//是否自动播放
    autoPlayTip: boolean = true;//自动播放前的提示
    autoPlayOffset: number = 10;//剩余多少提示自动播放 秒或者百分比 小数即为百分比
    playPageAutoMini: boolean = false;
    normalWindowSize: number[] = [1080, 640];
    miniWindowSize: number[] = [360, 214];

    constructor() {

    }
}

const appConfig = new Config()
let arr = Object.getOwnPropertyNames(appConfig);
const configLocal = configStore.getAll()


arr.forEach((key: any) => {
    if (configLocal[key] !== undefined) {
        (appConfig as any)[key] = configLocal[key]
    }
});



export default appConfig