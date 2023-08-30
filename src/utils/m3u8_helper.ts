
import { Command, Child } from '@tauri-apps/api/shell';

interface M3u8DownTask {
    uuid: string,//uuid
    pid?: number,
    name: string,
    url: string,//下载链接
    state?: M3u8DownloaderEventEnum,
    progress?: number,//进度
    leftTime?: string,//剩余时长
    totalSegment?: number,//总切片数
    totalDuration?: number//总时长
    errMsg?: string,//错误信息
    workPath: string,//工作目录
    outputFilePath: string,//输出文件路径
}


enum M3u8DownloaderEventEnum {
    QUEUE = 0,//队列中
    START = 1,//开始执行
    PROGRESS = 2,//执行中
    END = 3,//结束
    ERROR = 4,//发生错误
}




const timeRgx = /\[.*\]/g

class _M3u8Downloader {
    all_queues: M3u8DownTask[];
    _queue: M3u8DownTask[];//等待队列
    _maxQueue: number;
    _runingTaskCount: number;
    _processMapper: { [key: string]: Child };
    constructor(maxQueue: number = 3) {
        this._queue = []
        this._maxQueue = maxQueue
        this._runingTaskCount = 0
        this.all_queues = []
        this._processMapper = {}
    }


    submitTask(task: M3u8DownTask) {
        this._queue.push(task)
        this.all_queues.push(task)

        task.state = M3u8DownloaderEventEnum.QUEUE
        if (this._runingTaskCount <= this._maxQueue) {
            this._download()
            this._runingTaskCount += 1
        }
    }

    async _download() {
        let _task = this._queue.shift()
        if (_task) {
            let args = ["-i", _task!.url, "-o", _task!.outputFilePath, "-c"]
            const command = new Command('m3u8_downloader', args, { cwd: _task.workPath });
            command.on('close', data => {
                if (data.code === 0) {
                    _task!.state = M3u8DownloaderEventEnum.END
                }
                this._runingTaskCount -= 1
                this._download()
            });
            command.on('error', error => console.error(`command error: "${error}"`));
            command.stdout.on('data', line => {
                try {
                    let str = line.trim()
                    if (str && str.indexOf("EVENT:") != -1) {
                        let t = str.split("=");
                        let eventName = t[0].split(":")[1];
                        let value = t[1]
                        if (eventName === "START") {
                            _task!.state = M3u8DownloaderEventEnum.START
                            _task!.totalSegment = value.split("-")[1]
                            _task!.totalDuration = value.split("-")[0]
                        }

                        if (eventName === "PROGRESS") {
                            value = value.replace(
                                /[\u001b\u009b][[()#;?]*(?:[0-9]{1,4}(?:;[0-9]{0,4})*)?[0-9A-ORZcf-nqry=><]/g, '');
                            let arr = value.split(" ")
                            _task!.state = M3u8DownloaderEventEnum.PROGRESS
                            _task!.progress = arr[arr.length - 4].slice(0, -1)
                            _task!.leftTime = arr[arr.length - 1].split(":")[1].slice(0, -1)
                        }

                        if (eventName === "ERROR") {
                            _task!.state = M3u8DownloaderEventEnum.ERROR
                            _task!.errMsg = value
                        }
                    }
                } catch (error) {
                }
            });
            command.stderr.on('data', line => console.log(`command stderr: "${line}"`));
            const child = await command.spawn();
            this._processMapper[_task.uuid] = child
        }
    }


    getAllTask() {
        return this.all_queues
    }


    async killTask(uuid: string) {
        if (this._processMapper[uuid]) {
            await this._processMapper[uuid].kill()
            delete this._processMapper[uuid]
        }
    }
}

const m3u8Downloader = new _M3u8Downloader()


export default m3u8Downloader


export type { M3u8DownTask }