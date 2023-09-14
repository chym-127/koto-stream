
import { Command, Child } from '@tauri-apps/api/shell';
import { message } from 'ant-design-vue';
import { formatSeconds } from '.';

interface M3u8DownTask {
    uuid: string,//uuid
    pid?: number,
    name: string,
    url: string,//下载链接
    state?: M3u8DownloaderEventEnum,
    progress?: number,//进度
    leftTime?: string,//剩余时长
    totalSegment?: number,//总切片数
    totalDuration?: string//总时长
    errMsg?: string,//错误信息
    workPath: string,//工作目录
    outputFilePath: string,//输出文件路径
}


enum M3u8DownloaderEventEnum {
    QUEUE = "队列中",//队列中
    START = "开始下载",//开始执行
    PROGRESS = "下载中",//执行中
    END = "完成",//结束
    ERROR = "下载出错",//发生错误
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


    submitTask(task: M3u8DownTask): boolean {
        let found = this.all_queues.find(item => {
            return item.uuid === task.uuid
        })
        if (found) {
            message.warning("任务已存在~")
            return false
        }
        this._queue.push(task)
        this.all_queues.push(task)
        // message.success("已加入下载队列")

        task.state = M3u8DownloaderEventEnum.QUEUE
        if (this._runingTaskCount <= this._maxQueue) {
            this._runingTaskCount += 1
            let _task = this._queue.shift()
            if (_task) {
                this._download(_task)
            }
        }

        return true
    }

    async _download(_task: M3u8DownTask) {
        console.log(_task);
        
        let args = ["-i", _task!.url, "-o", _task!.outputFilePath, '-c']
        console.log('m3u8_downloader', args.join(' '));

        const command = new Command('m3u8_downloader', args, { cwd: _task.workPath });
        command.on('close', data => {
            if (data.code === 0) {
                _task!.state = M3u8DownloaderEventEnum.END
            }
            this._runingTaskCount -= 1
            let next_task = this._queue.shift()
            if (next_task) {
                this._runingTaskCount += 1
                this._download(next_task)
            }
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
                        _task!.totalDuration = formatSeconds(Number(value.split("-")[0]))
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
        command.stderr.on('data', line => console.log(`command out: "${line}"`));
        const child = await command.spawn();
        this._processMapper[_task.uuid] = child
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

    killAllTask() {
        for (const key in this._processMapper) {
            if (Object.prototype.hasOwnProperty.call(this._processMapper, key)) {
                const p = this._processMapper[key];
                p.kill()
                delete this._processMapper[key]
            }
        }
    }

    destroy() {
        for (const key in this._processMapper) {
            if (Object.prototype.hasOwnProperty.call(this._processMapper, key)) {
                const p = this._processMapper[key];
                p.kill()
            }
        }
    }
}

const m3u8Downloader = new _M3u8Downloader(4)

export default m3u8Downloader
export type { M3u8DownTask }