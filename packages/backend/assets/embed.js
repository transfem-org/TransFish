// @ts-check

/**
 * This embed script is from Mastodon. Thank you, website boy! :)
 *
 * License: AGPLv3, Mastodon gGmbH
 * Original source: https://github.com/mastodon/mastodon/blob/main/public/embed.js
 * Current source: https://codeberg.org/calckey/calckey/src/branch/develop/packages/backend/assets/embed.js
 * From: Eugen Rochko <eugen@zeonfederated.com>
 * Co-authored-by: Rohan Sharma <i.am.lone.survivor@protonmail.com>
 * Co-authored-by: rinsuki <428rinsuki+git@gmail.com>
 * Co-authored-by: Matt Hodges <hodgesmr1@gmail.com>
 * Co-authored-by: Claire <claire.github-309c@sitedethib.com>
 * Co-authored-by: Kainoa Kanter <kainoa@t1c.dev>
*/

(function () {
  'use strict';

  /**
   * @param {() => void} loaded
   */
  const ready = function (loaded) {
    if (document.readyState === 'complete') {
      loaded();
    } else {
      document.addEventListener('readystatechange', function () {
        if (document.readyState === 'complete') {
          loaded();
        }
      });
    }
  };

  ready(function () {
    /** @type {Map<number, HTMLIFrameElement>} */
    const iframes = new Map();

    window.addEventListener('message', function (e) {
      const data = e.data || {};

      if (typeof data !== 'object' || data.type !== 'setHeight' || !iframes.has(data.id)) {
        return;
      }

      const iframe = iframes.get(data.id);

			if (iframe != null) {
				if ('source' in e && iframe.contentWindow !== e.source) {
					return;
				}

				iframe.height = data.height;
			}

    });

    [].forEach.call(document.querySelectorAll('iframe.embed'), function (iframe) {
      // select unique id for each iframe
      let id = 0;
      let failCount = 0;
      const idBuffer = new Uint32Array(1);
      while (id === 0 || iframes.has(id)) {
        id = crypto.getRandomValues(idBuffer)[0];
        failCount++;
        if (failCount > 100) {
          // give up and assign (easily guessable) unique number if getRandomValues is broken or no luck
          id = -(iframes.size + 1);
          break;
        }
      }

      iframes.set(id, iframe);

      iframe.scrolling = 'no';
      iframe.style.overflow = 'hidden';

      iframe.onload = function () {
        iframe.contentWindow.postMessage({
          type: 'setHeight',
          id: id,
        }, '*');
      };

      iframe.onload();
    });
  });
})();
