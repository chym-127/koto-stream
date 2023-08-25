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
            var myUrl = this._url ? this._url.toLowerCase() : this._url;
            if (myUrl) {
                if (myUrl.indexOf('.m3u8') !== -1 && myUrl.indexOf('hls') !== -1) {
                    let currentVod = document.querySelector("li[class='on']")
                    let index = 0
                    let title = ""
                    if (currentVod) {
                        index = getChildIndex(currentVod)
                        title = currentVod.innerText
                        window.episodes[index] = {
                            title: title,
                            url: myUrl,
                            index: index + 1
                        }
                    }
                    // localStorage.setItem("AAAAA", myUrl)
                }
            }
        });

        return send.apply(this, arguments);
    };

})(XMLHttpRequest);
function getChildIndex(node) {
    return Array.prototype.indexOf.call(node.parentNode.childNodes, node);
}
(function () {
    window.episodes = {}
    let el = document.createElement("button")
    el.innerText = "采集视频"
    el.style.position = "fixed"
    el.style.top = "20px"
    el.style.right = "20px"
    el.style.zIndex = 999999
    el.addEventListener("click", e => {
        window.saveVod()
    })
    if (document.body) {
        document.body.appendChild(el)
    }
})();

window.saveVod = function () {
    let MOVS = {}
    try {
        MOVS = JSON.parse(localStorage.getItem("MOVS")) || {}
    } catch (error) {
        MOVS = {}
    }
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
    localStorage.setItem("MOVS", JSON.stringify(MOVS))
}

