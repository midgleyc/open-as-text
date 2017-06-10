"use strict";

function openAsText(data) {
  browser.webRequest.onHeadersReceived.addListener(rewriteHeaders,
                                          {urls: [data.linkUrl]},
                                          ['blocking', 'responseHeaders']);
  var removeHeader = () => {browser.webRequest.onHeadersReceived.removeListener(rewriteHeaders)};
  var creating = browser.tabs.create({url: data.linkUrl});
  creating.then(removeHeader, removeHeader)
}

function rewriteHeaders(e) {
  var contentType = [];
  var contentDisposition = [];
  for (var header of e.responseHeaders) {
    if (header.name.toLowerCase() == 'content-type') {
      contentType = header;
    }
    if (header.name.toLowerCase() == 'content-disposition') {
      contentDisposition = header;
    }
  }
  contentType.value = 'text/plain;charset=UTF-8';
  contentDisposition.value = '';
  return {responseHeaders: e.responseHeaders};
}

browser.contextMenus.create({id: "text-open", title: "Open as Text", contexts: ["link"]});
browser.contextMenus.onClicked.addListener(openAsText);
