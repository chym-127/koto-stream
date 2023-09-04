window.saveVod = function () {
    let MOVS = {}
    try {
        MOVS = JSON.parse(localStorage.getItem("MOVS")) || {}
    } catch (error) {
        MOVS = {}
    }
    MOVS = getVideoInfoFromClub(MOVS)
    localStorage.setItem("MOVS", JSON.stringify(MOVS))
}



function getVideoInfoFromClub(MOVS) {
    try {
        let metaDom = document.getElementsByClassName('product-header')[0]
        let obj = {}

        let imgEl = metaDom.querySelector('div.image-x > img')
        if (imgEl) {
            obj.image = imgEl.getAttribute('src')
        }

        let titleDom = document.getElementsByClassName("product-title")[0]
        obj.title = titleDom.firstChild.textContent
        obj.release_date = titleDom.querySelector('span:nth-child(1)').textContent.slice(1, -1)
        obj.score = titleDom.getElementsByClassName('rate')[0].innerText

        let arrDom = document.getElementsByClassName('product-excerpt')
        let arrKeys = ['director', 'actor', 'area', 'alias', 'description']
        for (let index = 0; index < arrDom.length - 1; index++) {
            const element = arrDom[index];
            let value = element.getElementsByTagName("span")[0].innerText
            obj[arrKeys[index]] = value
        }
        window.episodes = localStorage.getItem('EPISODES') ? JSON.parse(localStorage.getItem('EPISODES')) : {}
        let result = Object.keys(window.episodes).map((key) => window.episodes[key]);
        obj["episodes"] = result
        MOVS[obj.title] = obj
    } catch (error) {
        console.log(error);
    }


    return MOVS
}


(async function () {
    window.autoCollect = localStorage.getItem('AUTO_COLLECT') || false
    let reg = /https:.*.m3u8/g
    window.episodes = localStorage.getItem('EPISODES') ? JSON.parse(localStorage.getItem('EPISODES')) : {}
    let el = document.querySelector('#playleft > iframe')
    if (el) {
        let src = el.getAttribute('src')
        let found = src.match(reg)
        let currentVod = document.querySelector("li[class='on']")
        if (currentVod) {
            let index = getChildIndex(currentVod)
            let CURRENT_INDEX = localStorage.getItem("CURRENT_INDEX") || -1
            if (found) {
                localStorage.setItem("CURRENT_INDEX", index)
                window.episodes[index] = {
                    title: currentVod.innerText,
                    url: await getM3u8UrlByUrl(found[0]),
                    index: index + 1
                }
                localStorage.setItem("EPISODES", JSON.stringify(window.episodes))
                if (window.autoCollect) {
                    let nextNode = getChildByIndex(currentVod.parentNode, index + 1)
                    if (nextNode) {
                        playNextVideo(nextNode)
                    } else {
                        localStorage.setItem('AUTO_COLLECT', '')
                        window.saveVod()
                    }
                }
            }
        }
    }
}
)();

function playNextVideo(nextNode) {
    let aEl = nextNode.getElementsByTagName('a')[0]
    let url = aEl.getAttribute('href')
    location.href = url
}


(function () {
    window.autoCollect = localStorage.getItem('AUTO_COLLECT') || false

    let el = document.createElement("button")
    el.innerText = "自动采集"
    el.style.position = "fixed"
    el.style.bottom = "20px"
    el.style.right = "20px"
    el.style.zIndex = 999999
    el.addEventListener("click", e => {
        let currentVod = document.querySelector("li[class='on']")
        if (currentVod) {
            localStorage.setItem('AUTO_COLLECT', "true")
            let index = getChildIndex(currentVod)
            let nextNode = getChildByIndex(currentVod.parentNode, index + 1)
            if (nextNode) {
                playNextVideo(nextNode)
            } else {
                window.saveVod()
            }
        } else {
            alert("请先选择一个资源")
        }

    })
    if (document.body) {
        setTimeout(() => {
            document.body.appendChild(el)
        }, 3000);
    }
})();



