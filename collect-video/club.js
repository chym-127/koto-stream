window.saveVod = function () {
    let MOVS = {}
    try {
        MOVS = JSON.parse(localStorage.getItem("MOVS")) || {}
    } catch (error) {
        MOVS = {}
    }
    MOVS = getVideoInfoFromClub(MOVS)

    // sendData(MOVS)
    localStorage.setItem("MOVS", JSON.stringify(MOVS))

    localStorage.setItem("EPISODES", "")
    localStorage.setItem("CURRENT_INDEX", "")
}

function sendData(MOVS) {
    for (const key in MOVS) {
        if (Object.hasOwnProperty.call(MOVS, key)) {
            const item = MOVS[key];
            var xmlhttp = new XMLHttpRequest();
            var url = 'http://localhost:8080/import/media';
            xmlhttp.open("POST", url);
            xmlhttp.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
            xmlhttp.send(JSON.stringify({ medias: [item] }));
        }
    }
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
        obj.title = titleDom.firstChild.textContent.replaceAll(seasonReg, "")
        obj.release_date = Number(titleDom.querySelector('span:nth-child(1)').textContent.slice(1, -1))
        // obj.score = titleDom.getElementsByClassName('rate')[0].innerText

        // let arrDom = document.getElementsByClassName('product-excerpt')
        // let arrKeys = ['director', 'actor', 'area', 'alias', 'description']
        // for (let index = 0; index < arrDom.length - 1; index++) {
        //     const element = arrDom[index];
        //     let value = element.getElementsByTagName("span")[0].innerText
        //     obj[arrKeys[index]] = value
        // }
        window.episodes = localStorage.getItem('EPISODES') ? JSON.parse(localStorage.getItem('EPISODES')) : {}
        let result = Object.keys(window.episodes).map((key) => window.episodes[key]);
        obj["episodes"] = result
        MOVS[obj.title] = obj
    } catch (error) {
        console.log(error);
    }


    return MOVS
}
const seasonMapper = {
    一: 1,
    二: 2,
    三: 3,
    四: 4,
    五: 5,
    六: 6,
};
const seasonReg = /第.?季/g;
(async function () {
    window.autoCollect = localStorage.getItem('AUTO_COLLECT') || false
    let reg = /https:.*.m3u8/g
    window.episodes = localStorage.getItem('EPISODES') ? JSON.parse(localStorage.getItem('EPISODES')) : {}
    let el = document.querySelector('#playleft > iframe')
    if (el) {
        
        let src = el.getAttribute('src')
        let found = src.match(reg)
        let currentVod = document.querySelector("li[class='on']")
        let titleDom = document.getElementsByClassName("product-title")[0]
        let title = titleDom.firstChild.textContent
        let season = 1
        if (currentVod) {
            let index = getChildIndex(currentVod)
            let CURRENT_INDEX = localStorage.getItem("CURRENT_INDEX") || -1
            if (found) {
                localStorage.setItem("CURRENT_INDEX", index)
                try {
                    let s = title.match(seasonReg)[0][1];
                    season = seasonMapper[s] || 1;
                } catch (error) {
                    season = 1
                }
                window.episodes[index] = {
                    season: Number(season),
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
    let el = document.createElement("button")
    el.innerText = "发送数据"
    el.style.position = "fixed"
    el.style.bottom = "50px"
    el.style.right = "20px"
    el.style.zIndex = 999999
    el.addEventListener("click", e => {
        let MOVS = JSON.parse(localStorage.getItem("MOVS")) || {}
        sendData(MOVS)
    })
    if (document.body) {
        document.body.appendChild(el)
    }
})();

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




