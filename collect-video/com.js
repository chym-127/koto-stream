(function (xhr) {
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
                        saveCurrentVod(currentVod.innerText, myUrl, index)
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
        setTimeout(() => {
            document.body.appendChild(el)
        }, 1000);
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

function startNext(node) {
    node.click()
    let el = document.querySelector("dt[class='on']")
    if (el) {
        let arg1 = getChildIndex(el)
        let arg2 = getChildIndex(node)
        window.play(arg1, arg2)
    }
}


window.saveCurrentVod = (title, url, index) => {
    window.episodes[index] = {
        title: title,
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
                        obj[key] = content
                    }
                    if (key === 'release_date') {
                        obj['releaseDate'] = content
                    }
                }
            }

        }
    }
    let result = Object.keys(window.episodes).map((key) => window.episodes[key]);
    obj["episodes"] = result
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