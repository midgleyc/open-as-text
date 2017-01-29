"use strict";

var converted_MIME_types = ["application/msword", "text/troff", "text/x-chdr", "unknown/unknown"];
var isOn = true;

function contains(a, obj) {
    var i = a.length;
    while (i--) {
       if (a[i] === obj) {
           return true;
       }
    }
    return false;
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
    if (contains(converted_MIME_types, contentType.value)) {
      contentType.value = 'text/plain';
      contentDisposition.value = '';
    }
  }
  return {responseHeaders: e.responseHeaders};
}

function toggleButton() {
  isOn = !isOn;
  if (isOn) {
    browser.browserAction.setIcon({path: 'icons/on.svg'});
  browser.browserAction.setTitle({title: 'On'});
  } else {
    browser.browserAction.setIcon({path: 'icons/off.svg'});
	browser.browserAction.setTitle({title: 'Off'});
  }
}

browser.webRequest.onHeadersReceived.addListener(rewriteHeaders,
                                          {urls: ['<all_urls>']},
                                          ['blocking', 'responseHeaders']);
browser.browserAction.onClicked.addListener(toggleButton);
