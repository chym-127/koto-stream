import { Store } from "../../utils/store";


interface History {
    progress: number,
    updateAt: number
}

interface RecentEpisodRecord {
    index: number,
    progress: number,
    updateAt: number
}

const store = new Store("PLAY_HISTORY")

class PlayHistory {
    constructor() {
    }

    set(videoId: number, episodeIndex: number, progress: number) {
        let videoIdStr = String(videoId)
        let data = store.get(videoIdStr) || {}
        data[episodeIndex] = {
            progress: progress,
            updateAt: +new Date()
        }
        store.set(videoIdStr, data, true)
    }


    get(videoId: number, episodeIndex: number) {
        let videoIdStr = String(videoId)
        let data = store.get(videoIdStr) || {}
        return data[episodeIndex] || null
    }


    getRecentEpisod(videoId: number): (RecentEpisodRecord | null) {
        let videoIdStr = String(videoId)
        let data: { [key: number]: History } = store.get(videoIdStr) || null

        if (data) {
            let newRecord: RecentEpisodRecord = {
                index: 0,
                progress: 0,
                updateAt: 0
            }
            for (const key in data) {
                if (Object.prototype.hasOwnProperty.call(data, key)) {
                    const item = data[key];
                    if (newRecord.updateAt < item.updateAt) {
                        newRecord.updateAt = item.updateAt
                        newRecord.index = Number(key)
                        newRecord.progress = item.progress
                    }
                }
            }
            return newRecord
        } else {
            return null
        }
    }
}

const playHistory = new PlayHistory()

export default playHistory

export type { RecentEpisodRecord }