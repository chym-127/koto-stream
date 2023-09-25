
interface AdsRange {
    startSec: number,
    endSec: number,
    sec: number
}


// m3u8 file lines array
function extractAds(url: string) {
    return new Promise((resolve, reject) => {
        fetch(url).then(response => {
            response.text().then(function (text) {
                let liens = text.split("\n")
                let totalSec = 0
                let count = Number.MIN_VALUE
                let sec = 0
                let resp: AdsRange[] = []
                let flag = false
                let temp: AdsRange = {
                    sec: 0,
                    startSec: 0,
                    endSec: 0
                }
                for (let index = 0; index < liens.length; index++) {
                    const line = liens[index].trim().replaceAll(" ", "");
                    if (line) {
                        if (line.indexOf("#EXTINF") !== -1) {
                            sec = Number(line.replaceAll('#EXTINF:', "").replaceAll(":", "").replaceAll(",", ""))
                            totalSec += sec
                            continue
                        }
                        if (line.indexOf(".ts") !== -1) {
                            let current = Number(line.replaceAll(".ts", "").slice(-4))
                            if (count === Number.MIN_VALUE) {
                                count = current
                                continue
                            }
                            if (count !== (current - 1)) {
                                if (!flag) {
                                    flag = true
                                    temp.startSec = totalSec - sec
                                }
                            } else {
                                if (flag) {
                                    temp.endSec = totalSec - sec
                                    temp.sec = Number((temp.endSec - temp.startSec).toFixed(4))
                                    resp.push(temp)
                                }
                                flag = false
                                count = current
                            }

                        }
                    }
                }

                resolve(resp)
            });
        })
    })
}


export default extractAds

export type { AdsRange }