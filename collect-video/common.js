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
            console.log(line.trim(),baseUrl);
            let u = new URL(line.trim(),baseUrl)
            return u.href
        }
    }
}