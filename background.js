/* jshint moz: true, esversion: 6 */

"use strict";

var isDebug = false;
var browser = browser || chrome;  // Chrome compatibility

if (isDebug) var debug = console.log.bind(window.console);
else var debug = function(){};

function openAsText(data) {
  const url = data.linkUrl;
  debug("openAsText", url);

  const onTabCreated = (tab) => {
      const removeListeners = () => {
        debug("onHeadersReceived.removeListener");
        browser.webRequest.onHeadersReceived.removeListener(rewriteHeaders);
      };

      const rewriteHeaders = (e) => {
        debug("rewriteHeaders", e);
        removeListeners();
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
      };

      const urlsToListen = ["<all_urls>"];
      debug("onHeadersReceived.addListener for URL", url);
      browser.webRequest.onHeadersReceived.addListener(
          rewriteHeaders,
          {urls: urlsToListen, tabId: tab.id},
          ['blocking', 'responseHeaders']
      );

      const updating = browser.tabs.update(tab.id, {url: url});
      if (updating) {  // Chrome compatibility
          updating.then(/* onFulfilled: */ () => {}, /* onRejected: */ removeListeners);
      }
  };

  // Create new blank tab. After it's created, attach listeners and navigate to url.

  // Reason why we don't create new tab with set URL:
  // When tab with url is created and listeners attached in promise onFulfilled,
  // there's a race condition where page may be already loaded before listeners
  // can be attached.

  // Reason why we don't attach listeners before creating tab:
  // Firefox has a bug where URL is not mached when URL contains a port.
  // For that reason "<all_urls>" is used for urls pattern
  // and id of created tab is used to match request.

  const creating = browser.tabs.create({url: "about:blank"}, onTabCreated);
  if (creating) {  // Chrome compatibility
    creating.then(onTabCreated);
  }
}

browser.contextMenus.create({id: "text-open", title: "Open as Text", contexts: ["link"]});
browser.contextMenus.onClicked.addListener(openAsText);
