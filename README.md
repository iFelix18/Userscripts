# Userscripts

My scripts and libraries

[![Stars][stars-badge]][stars-link]
[![Watchers][watchers-badge]][watchers-link]
[![Scripts][scripts-badge]][scripts-link]
[![Libraries][libraries-badge]][libraries-link]
[![Open Issues][open-issues-badge]][open-issues-link]
[![Closed Issues][closed-issues-badge]][closed-issues-link]
[![Last Commit][last-commit-badge]][last-commit-link]
[![JavaScript Style Guide][style-guide-badge]][style-guide-link]
[![Lerna][lerna-badge]][lerna-link]
[![License][license-badge]][license-link]

Readme languages:
•[_en_][readme-en]
•[_it_][readme-it]

---

## Scripts

|                     _Script_                      |                      _Version_                      |                         _Install_                          |
| :-----------------------------------------------: | :-------------------------------------------------: | :--------------------------------------------------------: |
|        [OpenUserJS+][openuserjs-plus-link]        |   [![Version][openuserjs-plus-version]][scripts]    |   [![Install][install-badge]][openuserjs-plus-download]    |
|       [Greasy Fork+][greasyfork-plus-link]        |   [![Version][greasyfork-plus-version]][scripts]    |   [![Install][install-badge]][greasyfork-plus-download]    |
|      [Ratings on IMDb][ratings-on-imdb-link]      |   [![Version][ratings-on-imdb-version]][scripts]    |   [![Install][install-badge]][ratings-on-imdb-download]    |
|      [Ratings on TMDb][ratings-on-tmdb-link]      |   [![Version][ratings-on-tmdb-version]][scripts]    |   [![Install][install-badge]][ratings-on-tmdb-download]    |
| [Ratings on JustWatch][ratings-on-justwatch-link] | [![Version][ratings-on-justwatch-version]][scripts] | [![Install][install-badge]][ratings-on-justwatch-download] |

---

## Libraries

|                 _Library_                  |                    _Version_                    |
| :----------------------------------------: | :---------------------------------------------: |
|            [Utils][utils-link]             |     [![Version][utils-version]][libraries]      |
|           [OMDb API][omdb-link]            |      [![Version][omdb-version]][libraries]      |
|           [TMDb API][tmdb-link]            |      [![Version][tmdb-version]][libraries]      |
|          [Jikan API][jikan-link]           |     [![Version][jikan-version]][libraries]      |
|          [Ratings][ratings-link]           |    [![Version][ratings-version]][libraries]     |
|          [Trakt API][trakt-link]           |     [![Version][trakt-version]][libraries]      |
|         [Wikidata][wikidata-link]          |    [![Version][wikidata-version]][libraries]    |
| [Rotten Tomatoes API][rottentomatoes-link] | [![Version][rottentomatoes-version]][libraries] |

---

## How to install scripts

1. Download one of these add-ons for your browser:
    * [Violentmonkey][violentmonkey-link]
    * [Userscripts][userscripts-link]
    * [Tampermonkey][tampermonkey-link]
2. Install the userscript directly from GitHub by clicking on the related installation badge.
3. In case, configure the script as as reported in its description.
4. Done!

---

## How to use libraries

The libraries are published on npm, put it in the _Metadata Block_ via `@require` specifying the version, for example:

```JavaScript
// @require https://cdn.jsdelivr.net/npm/@ifelix18/utils@5.1.1/lib/index.min.js
```

---

## Credits

This product uses the OMDb API but is not endorsed or certified by OMDb.  
This product uses the Rotten Tomatoes API but is not endorsed or certified by Rotten Tomatoes.  
This product uses the TMDb API but is not endorsed or certified by TMDb.  
This product uses the Trakt API but is not endorsed or certified by Trakt.  
This product uses Wikidata data but is not endorsed or certified by Wikidata.  

[stars-badge]: https://flat.badgen.net/github/stars/iFelix18/Userscripts
[stars-link]: https://github.com/iFelix18/Userscripts/stargazers
[watchers-badge]: https://flat.badgen.net/github/watchers/iFelix18/Userscripts
[watchers-link]: https://github.com/iFelix18/Userscripts/watchers
[scripts-badge]: https://flat.badgen.net/badge/scripts/5/orange
[scripts-link]: https://github.com/iFelix18/Userscripts/tree/master/userscripts
[libraries-badge]: https://flat.badgen.net/badge/libraries/8/orange
[libraries-link]: https://github.com/iFelix18/Userscripts/tree/master/packages
[open-issues-badge]: https://flat.badgen.net/github/open-issues/iFelix18/Userscripts
[open-issues-link]: https://github.com/iFelix18/Userscripts/issues
[closed-issues-badge]: https://flat.badgen.net/github/closed-issues/iFelix18/Userscripts
[closed-issues-link]: https://github.com/iFelix18/Userscripts/issues?q=is%3Aissue+is%3Aclosed
[last-commit-badge]: https://flat.badgen.net/github/last-commit/iFelix18/Userscripts
[last-commit-link]: https://github.com/iFelix18/Userscripts/commits/master
[style-guide-badge]: https://flat.badgen.net/badge/code%20style/standard/44CC11
[style-guide-link]: https://standardjs.com
[lerna-badge]: https://flat.badgen.net/badge/maintained%20with/lerna/CC00FF
[lerna-link]: https://lerna.js.org/
[license-badge]: https://flat.badgen.net/github/license/iFelix18/Userscripts
[license-link]: https://github.com/iFelix18/Userscripts/blob/master/LICENSE.md

[readme-en]: /README.md "English"
[readme-it]: /README.it.md "Italiano"

[install-badge]: https://flat.badgen.net/badge/install%20directly%20from/jsDelivr/blue "Click here!"

[scripts]: #scripts

[ratings-on-tmdb-link]: /userscripts/docs/ratings-on-tmdb.md "More info"
[ratings-on-tmdb-version]: https://flat.badgen.net/runkit/iFelix18/version/Userscripts/ratings-on-tmdb
[ratings-on-tmdb-download]: https://cdn.jsdelivr.net/gh/iFelix18/Userscripts@master/userscripts/ratings-on-tmdb.user.js "Click here!"

[ratings-on-imdb-link]: /userscripts/docs/ratings-on-imdb.md "More info"
[ratings-on-imdb-version]: https://flat.badgen.net/runkit/iFelix18/version/Userscripts/ratings-on-imdb
[ratings-on-imdb-download]: https://cdn.jsdelivr.net/gh/iFelix18/Userscripts@master/userscripts/ratings-on-imdb.user.js "Click here!"

[ratings-on-justwatch-link]: /userscripts/docs/ratings-on-justwatch.md "More info"
[ratings-on-justwatch-version]: https://flat.badgen.net/runkit/iFelix18/version/Userscripts/ratings-on-justwatch
[ratings-on-justwatch-download]: https://cdn.jsdelivr.net/gh/iFelix18/Userscripts@master/userscripts/ratings-on-justwatch.user.js "Click here!"

[openuserjs-plus-link]: /userscripts/docs/openuserjs-plus.md "More info"
[openuserjs-plus-version]: https://flat.badgen.net/runkit/iFelix18/version/Userscripts/openuserjs-plus
[openuserjs-plus-download]: https://cdn.jsdelivr.net/gh/iFelix18/Userscripts@master/userscripts/openuserjs-plus.user.js "Click here!"

[greasyfork-plus-link]: /userscripts/docs/greasyfork-plus.md "More info"
[greasyfork-plus-version]: https://flat.badgen.net/runkit/iFelix18/version/Userscripts/greasyfork-plus
[greasyfork-plus-download]: https://cdn.jsdelivr.net/gh/iFelix18/Userscripts@master/userscripts/greasyfork-plus.user.js "Click here!"

[libraries]: #libraries

[utils-link]: /packages/utils "More info"
[utils-version]: https://flat.badgen.net/npm/v/@ifelix18/utils

[ratings-link]: /packages/ratings "More info"
[ratings-version]: https://flat.badgen.net/npm/v/@ifelix18/ratings

[trakt-link]: /packages/trakt "More info"
[trakt-version]: https://flat.badgen.net/npm/v/@ifelix18/trakt

[tmdb-link]: /packages/tmdb "More info"
[tmdb-version]: https://flat.badgen.net/npm/v/@ifelix18/tmdb

[omdb-link]: /packages/omdb "More info"
[omdb-version]: https://flat.badgen.net/npm/v/@ifelix18/omdb

[rottentomatoes-link]: /packages/rottentomatoes "More info"
[rottentomatoes-version]: https://flat.badgen.net/npm/v/@ifelix18/rottentomatoes

[jikan-link]: /packages/jikan "More info"
[jikan-version]: https://flat.badgen.net/npm/v/@ifelix18/jikan

[wikidata-link]: /packages/wikidata "More info"
[wikidata-version]: https://flat.badgen.net/npm/v/@ifelix18/wikidata

[violentmonkey-link]: https://violentmonkey.github.io/
[userscripts-link]: https://github.com/quoid/userscripts/#userscripts-safari
[tampermonkey-link]: https://www.tampermonkey.net/
