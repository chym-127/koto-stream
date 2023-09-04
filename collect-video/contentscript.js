var s = document.createElement('script');
// must be listed in web_accessible_resources in manifest.json
s.src = chrome.runtime.getURL('common.js');
s.onload = function () {
    this.remove();
};
(document.head || document.documentElement).appendChild(s);


if (location.href.indexOf('.com') !== -1) {
    let s = document.createElement('script');
    // must be listed in web_accessible_resources in manifest.json
    s.src = chrome.runtime.getURL('com.js');
    s.onload = function () {
        this.remove();
    };
    (document.head || document.documentElement).appendChild(s);
}


if (location.href.indexOf('.club') !== -1) {
    let s = document.createElement('script');
    // must be listed in web_accessible_resources in manifest.json
    s.src = chrome.runtime.getURL('club.js');
    s.onload = function () {
        this.remove();
    };
    (document.head || document.documentElement).appendChild(s);
}