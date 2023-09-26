const seasonMapper = {
    一: 1,
    二: 2,
    三: 3,
    四: 4,
    五: 5,
    六: 6,
    七: 7,
    八: 8,
    九: 9,
    十: 10,
};
const seasonReg = /第.?季/g;
(function (xhr) {
    let season = 1
    try {
        let title = document.querySelector('meta[property="og:title"]').getAttribute("content")
        let s = title.match(seasonReg)[0][1];
        season = seasonMapper[s] || 1;
    } catch (error) {
        season = 1
    }
    var XHR = XMLHttpRequest.prototype;

    var open = XHR.open;
    var send = XHR.send;
    var setRequestHeader = XHR.setRequestHeader;

    XHR.open = function (method, url) {
        this._method = method;
        this._url = url;
        this._requestHeaders = {};
        this._startTime = (new Date()).toISOString();

        return open.apply(this, arguments);
    };

    XHR.setRequestHeader = function (header, value) {
        this._requestHeaders[header] = value;
        return setRequestHeader.apply(this, arguments);
    };

    XHR.send = function (postData) {
        // console.warn(this._url, postData);
        this.addEventListener('load', function () {
            var myUrl = this._url;
            if (myUrl) {
                if (myUrl.indexOf('.m3u8') !== -1 && myUrl.indexOf('hls') !== -1) {
                    let currentVod = document.querySelector("li[class='on']")
                    if (currentVod) {

                        window.currentVodUrl = myUrl
                        let index = getChildIndex(currentVod)
                        saveCurrentVod(currentVod.innerText, myUrl, index, season)
                        if (window.autoCollect) {
                            let nextNode = getChildByIndex(currentVod.parentNode, index + 1)
                            if (nextNode) {
                                startNext(nextNode)
                            } else {
                                window.autoCollect = false
                                window.saveVod()
                            }
                        }
                    }

                }
            }
        });

        return send.apply(this, arguments);
    };

})(XMLHttpRequest);


(function () {
    window.episodes = {}
    let el = document.createElement("button")
    el.innerText = "自动采集"
    el.style.position = "fixed"
    el.style.bottom = "20px"
    el.style.right = "20px"
    el.style.zIndex = 999999
    el.addEventListener("click", e => {
        let currentVod = document.querySelector("li[class='on']")
        if (currentVod) {
            window.autoCollect = true
            let index = getChildIndex(currentVod)
            let nextNode = getChildByIndex(currentVod.parentNode, index + 1)
            if (nextNode) {
                startNext(nextNode)
            } else {
                window.saveVod()
            }
        } else {
            alert("请先选择一个资源")
        }

    })
    if (document.body) {
        document.body.appendChild(el)
    }
})();


(function () {
    window.episodes = {}
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


function sendData(MOVS) {
    let items = []
    for (const key in MOVS) {
        if (Object.hasOwnProperty.call(MOVS, key)) {
            const item = MOVS[key];
            items.push(item)
        }
    }
    var xmlhttp = new XMLHttpRequest();
    var url = 'http://localhost:8080/import/media';
    xmlhttp.open("POST", url);
    xmlhttp.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
    xmlhttp.send(JSON.stringify({ medias: items }));
}

function startNext(node) {
    node.click()
    let el = document.querySelector("dt[class='on']")
    if (el) {
        let arg1 = getChildIndex(el)
        let arg2 = getChildIndex(node)
        window.play(arg1, arg2)
    }
}


window.saveCurrentVod = (title, url, index, season) => {
    window.episodes[index] = {
        title: title,
        season: season,
        url: url,
        index: index + 1
    }
}

window.saveVod = function () {
    let MOVS = {}
    try {
        MOVS = JSON.parse(localStorage.getItem("MOVS")) || {}
    } catch (error) {
        MOVS = {}
    }

    MOVS = getVideoInfoFromCom(MOVS)


    localStorage.setItem("MOVS", JSON.stringify(MOVS))
}




function getVideoInfoFromCom(MOVS) {
    let doms = document.getElementsByTagName('meta')
    let obj = {}
    if (doms && doms.length) {
        for (let i = 0; i < doms.length; i++) {
            let el = doms[i]
            let property = el.getAttribute("property")
            if (property) {
                let content = el.getAttribute("content")
                if (property.indexOf("og:") !== -1) {
                    let arr = property.split(":")
                    let key = arr[arr.length - 1]
                    if (key === 'title') {
                        if (seasonReg.test(content)) {
                            obj['more_season'] = true
                        } else {
                            obj['more_season'] = false
                        }
                        obj[key] = content.replaceAll(seasonReg, "")
                    }
                    if (key === 'release_date') {
                        obj['release_date'] = Number(content)
                    }
                }
            }

        }
    }
    if (MOVS[obj.title]) {
        obj = Object.assign(obj,MOVS[obj.title])
    }
    if (!obj["episodes"] || !obj["episodes"].length) {
        obj["episodes"] = []
    }
    let result = Object.keys(window.episodes).map((key) => window.episodes[key]);
    obj["episodes"] = obj["episodes"].concat(result)
    MOVS[obj.title] = obj
    return MOVS
}



function getChildIndex(node) {
    return Array.prototype.indexOf.call(node.parentNode.childNodes, node);
}


function getChildByIndex(node, index) {
    const list = node.children;

    let children = null
    for (let i = 0; i < list.length; i++) {
        if (i === index) {
            children = list[i]
            break;
        }
    }
    return children
}

let reg = /\/[^\/]*.m3u8/g
async function getM3u8UrlByUrl(url) {
    const response = await fetch(url);
    let arr = (await response.text()).split('\n');
    let baseUrl = url.replace(reg, '/')
    for (let index = 0; index < arr.length; index++) {
        const line = arr[index];
        if (line.indexOf('#EXT-X-PLAYLIST-TYPE:VOD') !== -1) {
            return url
        }
        if (line.indexOf('.m3u8') !== -1) {
            console.log(line.trim(), baseUrl);
            let u = new URL(line.trim(), baseUrl)
            return u.href
        }
    }
}