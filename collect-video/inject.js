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

function getChildIndex(node) {
    return Array.prototype.indexOf.call(node.parentNode.childNodes, node);
}



// (function () {
//     window.episodes = {}
//     let el = document.createElement("button")
//     el.innerText = "采集视频"
//     el.style.position = "fixed"
//     el.style.top = "20px"
//     el.style.right = "20px"
//     el.style.zIndex = 999999
//     el.addEventListener("click", e => {
//         window.saveVod()
//     })
//     if (document.body) {
//         setTimeout(() => {
//             document.body.appendChild(el)
//         }, 3000);
//     }
// })();


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
        }, 3000);
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

    if (location.href.indexOf('.com') !== -1) {
        MOVS = getVideoInfoFromCom(MOVS)
    }

    if (location.href.indexOf('.club') !== -1) {
        MOVS = getVideoInfoFromClub(MOVS)
    }

    localStorage.setItem("MOVS", JSON.stringify(MOVS))
}


function getVideoInfoFromClub(MOVS) {
    console.log('getVideoInfoFromClub');
    try {
        let metaDom = document.getElementsByClassName('product-header')[0]
        let obj = {}

        let titleDom = document.getElementsByClassName("product-title")[0]
        obj.title = titleDom.textContent
        obj.score = titleDom.getElementsByClassName('rate')[0].innerText

        let arrDom = document.getElementsByClassName('product-excerpt')
        let arrKeys = ['director', 'actor', 'area', 'alias', 'description']
        for (let index = 0; index < arrDom.length - 1; index++) {
            const element = arrDom[index];
            let value = element.getElementsByTagName("span")[0].innerText
            obj[arrKeys[index]] = valu
        }

        let result = Object.keys(window.episodes).map((key) => window.episodes[key]);
        obj["episodes"] = result
        MOVS[obj.title] = obj
    } catch (error) {
        console.log(error);
    }


    return MOVS
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
                    obj[key] = content
                }
            }

        }
    }
    let result = Object.keys(window.episodes).map((key) => window.episodes[key]);
    obj["episodes"] = result
    MOVS[window.infoid] = obj
    return MOVS
}

