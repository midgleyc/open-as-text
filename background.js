/* jshint moz: true, esversion: 6 */

"use strict";

var isDebug = false;

if (isDebug) var debug = console.log.bind(window.console);
else var debug = function(){};

function removeHeaderListener() {
  debug("onHeadersReceived.removeListener");
  browser.webRequest.onHeadersReceived.removeListener(rewriteHeaders);
}

function openAsText(data) {
  debug("openAsText", data);
  const url = data.linkUrl;

  debug("onHeadersReceived.addListener for URL", url);
  browser.webRequest.onHeadersReceived.addListener(
      rewriteHeaders,
      {urls: [url]},
      ['blocking', 'responseHeaders']
  );

  const removeHeaderListenerOnResponse = () => {
    const listener = () => {
      removeHeaderListener();
      // remove self listener
      debug("onResponseStarted.removeListener");
      browser.webRequest.onResponseStarted.removeListener(listener);
    };

    debug("onResponseStarted.addListener for URL", url);
    browser.webRequest.onResponseStarted.addListener(
        listener,
        {urls: [url]}
    );
  };

  const creating = browser.tabs.create({url: url});
  creating.then(
      removeHeaderListenerOnResponse /* onCreated */,
      removeHeaderListener /* onError */
  );
}

function rewriteHeaders(e) {
  debug("rewriteHeaders", e);
  let contentType = [];
  let contentDisposition = [];
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
