/*
  * Author: Sergey Ushakov <sergushakov.public@gmail.com> *
  * Source: https://github.com/i-breaker/nodebb-plugin-gif-controls.git *
  * License: MIT *
*/

/**
 * processing existed gifs with Giffer function
 * @param {Node} x - DOM node for processing
 */

function processGif(x) {
    'use strict';
    var DEBUG = false;
    if (!x.processed && x.nodeType === 1) {
        if (x.nodeName === "IMG" && x.src.match(/\.gif/)) {
            if (DEBUG) {
                x.style.border = "3px solid red";
            } else {
                x.style.display = "none";
                x.dataset.gifffer = x.src;
                Giffer([x]);
            }
        }
        x.processed = true;
    }
}

/**
 * processes gifs for the container if the container matches queries
 * @param {Node} x - DOM node for processing
 */

function processContainer(x) {
    'use strict';
    if (x.nodeType !== 1) return;
    var selectors = [
            ".post-preview-content .content",
            ".category-body .row .col-md-12",
            ".topic-text .post-content",
            ".posts-list-item .content"
        ],
        DEBUG = false
    ;
    selectors.forEach(function(y) {
        var els = x.querySelectorAll(y);
        if (els && els.length > 0) {
            Array.prototype.forEach.call(els, function(el) {
                if (DEBUG) console.log("container found", el.classList, " children: ", el.querySelectorAll("img").length);
                Array.prototype.forEach.call(el.querySelectorAll("img"),processGif);
            })
        }
    });
}

new MutationObserver(function (mutations) {
    'use strict';
    mutations.forEach(function (mutation) {
        switch (mutation.type) {
            case "childList":
                processContainer(mutation.target);
                Array.prototype.forEach.call(mutation.addedNodes, function (x) {
                    processContainer(x);
                });
                break;
        }
    });
}).observe(document, { childList: true, subtree: true });

/*
 * Author: krasimir
 * Source: https://github.com/krasimir/gifffer
 * License: MIT
 */

function Giffer(params){
  var images, d = document, ga = 'getAttribute', sa = 'setAttribute';
  images = (params && params.images) ? params.images : d.querySelectorAll('[data-gifffer]');
  var createContainer = function(w, h, el) {
      var con = d.createElement('DIV'), cls = el[ga]('class'), id = el[ga]('id');
      cls ? con[sa]('class', el[ga]('class')) : null;
      id ? con[sa]('id', el[ga]('id')) : null;
      con[sa]('style', 'position:relative;cursor:pointer;width:' + w + 'px;height:' + h + 'px;');
      // creating play button
      var play = d.createElement('DIV');
      play[sa]('class','gifffer-play-button');
      play[sa]('style', 'width:60px;height:60px;border-radius:30px;background:rgba(0, 0, 0, 0.3);position:absolute;left:' + ((w/2)-30) + 'px;top:' + ((h/2)-30) + 'px;');
      var trngl = d.createElement('DIV');
      trngl[sa]('style', 'width:0;height: 0;border-top:14px solid transparent;border-bottom:14px solid transparent;border-left:14px solid rgba(0, 0, 0, 0.5);position:absolute;left:26px;top:16px;')
      play.appendChild(trngl);
      // dom placement
      con.appendChild(play);
      el.parentNode.replaceChild(con, el);
      return {c: con, p: play };
  },
      i = 0,
      imglen = images.length,
      process = function(el) {
          var url, con, c, w, h, duration,play, gif, playing = false, cc, isC, durationTimeout;
          url = el[ga]('data-gifffer');
          w = el[ga]('data-gifffer-width');
          h = el[ga]('data-gifffer-height');
          duration = el[ga]('data-gifffer-duration');
          el.style.display = 'block';
          c = document.createElement('canvas');
          isC = !!(c.getContext && c.getContext('2d'));
          if(w && h && isC) cc = createContainer(w, h, el);
          el.onload = function() {
              if(isC) {
                  w = w || el.width;
                  h = h || el.height;
                  // creating the container
                  if(!cc) cc = createContainer(w, h, el);
                  con = cc.c;
                  play = cc.p;
                  con.addEventListener('click', function(ev) {
                      ev.preventDefault();
                      clearTimeout(durationTimeout);
                      if(!playing) {
                          playing = true;
                          gif = d.createElement('IMG');
                          gif[sa]('style', 'width:' + w + 'px;height:' + h + 'px;');
                          gif[sa]('data-uri', Math.floor(Math.random()*100000) + 1);
                          setTimeout(function() {
                              gif.src = url;
                          }, 0);                        
                          con.removeChild(play);
                          con.removeChild(c);
                          con.appendChild(gif);
                          if(parseInt(duration) > 0) {
                              durationTimeout = setTimeout(function() {
                                  playing = false;
                                  con.appendChild(play);
                                  con.removeChild(gif);
                                  con.appendChild(c);
                                  gif = null;
                              }, duration);
                          }
                      } else {
                          playing = false;
                          con.appendChild(play);
                          con.removeChild(gif);
                          con.appendChild(c);
                          gif = null;
                      }
                  });
                  // canvas
                  c.width = w;
                  c.height = h;
                  c.getContext('2d').drawImage(el, 0, 0, w, h);
                  con.appendChild(c);
              }
          }
          el.src = url;
      }
  for(i; i<imglen; ++i) process(images[i]);
};