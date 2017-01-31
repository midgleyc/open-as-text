"use strict";

var isOn = 0;

function openAsText(data) {
  isOn++;
  var creating = browser.tabs.create({url: data.linkUrl});
  creating.then(() => {isOn--}, () => {isOn--})
}

function rewriteHeaders(e) {
  if (isOn) {
    var contentType = [];
    var contentDisposition = [];
    for (var header of e.responseHeaders) {
      if (header.name == 'Content-Type') {
	    contentType = header;
	  }
      if (header.name == 'Content-Disposition') {
	    contentDisposition = header;
	  }
    }
    contentType.value = 'text/plain;charset=UTF-8';
    contentDisposition.value = '';
  }
  return {responseHeaders: e.responseHeaders};
}

browser.contextMenus.create({id: "text-open", title: "Open as Text", contexts: ["link"]});
browser.contextMenus.onClicked.addListener(openAsText);

browser.webRequest.onHeadersReceived.addListener(rewriteHeaders,
                                          {urls: ['<all_urls>']},
                                          ['blocking', 'responseHeaders']);
