import { Store } from "../../utils/store";


interface History {
    progress: number,
    updateAt: number
}

interface RecentEpisodRecord {
    key: string,
    progress: number,
    updateAt: number
}

const store = new Store("PLAY_HISTORY")

class PlayHistory {
    constructor() {
    }

    set(key: string, episodeIndex: string, progress: number) {
        let data = store.get(key) || {}
        data[episodeIndex] = {
            progress: progress,
            updateAt: +new Date()
        }
        store.set(key, data, true)
    }


    get(key: string, episodeIndex: string) {
        let data = store.get(key) || {}
        return data[episodeIndex] || null
    }


    getRecentEpisod(key: string): (RecentEpisodRecord | null) {
        let data: { [key: number]: History } = store.get(key) || null

        if (data) {
            let newRecord: RecentEpisodRecord = {
                key: "",
                progress: 0,
                updateAt: 0
            }
            for (const key in data) {
                if (Object.prototype.hasOwnProperty.call(data, key)) {
                    const item = data[key];
                    if (newRecord.updateAt < item.updateAt) {
                        newRecord.updateAt = item.updateAt
                        newRecord.key = key
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