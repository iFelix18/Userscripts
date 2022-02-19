# Userscripts

My scripts and libraries

[![Stars][stars-badge]][stars-link]
[![Watchers][watchers-badge]][watchers-link]
[![Scripts][scripts-badge]][scripts-link]
[![Libraries][libraries-badge]][libraries-link]
[![Open Issues][open-issues-badge]][open-issues-link]
[![Closed Issues][closed-issues-badge]][closed-issues-link]
[![Last Commit][last-commit-badge]][last-commit-link]
[![jsDelivr Hits][jsdelivr-hits-badge]][jsdelivr-hits-link]
[![JavaScript Style Guide][style-guide-badge]][style-guide-link]
[![License][license-badge]][license-link]

Readme languages:
•[_en_][readme-en]
•[_it_][readme-it]

---

## Scripts

|                     _Script_                      |                        _Version_                         |                         _Install_                          |
| :-----------------------------------------------: | :------------------------------------------------------: | :--------------------------------------------------------: |
|      [Ratings on TMDb][ratings-on-tmdb-link]      |   [![Version][ratings-on-tmdb-version]][scripts-link]    |   [![Install][install-badge]][ratings-on-tmdb-download]    |
|      [Ratings on IMDb][ratings-on-imdb-link]      |   [![Version][ratings-on-imdb-version]][scripts-link]    |   [![Install][install-badge]][ratings-on-imdb-download]    |
| [Ratings on JustWatch][ratings-on-justwatch-link] | [![Version][ratings-on-justwatch-version]][scripts-link] | [![Install][install-badge]][ratings-on-justwatch-download] |
|        [OpenUserJS+][openuserjs-plus-link]        |   [![Version][openuserjs-plus-version]][scripts-link]    |   [![Install][install-badge]][openuserjs-plus-download]    |
|       [Greasy Fork+][greasyfork-plus-link]        |   [![Version][greasyfork-plus-version]][scripts-link]    |   [![Install][install-badge]][greasyfork-plus-download]    |

---

## Libraries

|                 _Library_                  |                      _Version_                       |
| :----------------------------------------: | :--------------------------------------------------: |
|           [My Utils][utils-link]           |     [![Version][utils-version]][libraries-link]      |
|          [Ratings][ratings-link]           |    [![Version][ratings-version]][libraries-link]     |
|          [Trakt API][trakt-link]           |     [![Version][trakt-version]][libraries-link]      |
|           [TMDb API][tmdb-link]            |      [![Version][tmdb-version]][libraries-link]      |
|           [OMDb API][omdb-link]            |      [![Version][omdb-version]][libraries-link]      |
| [Rotten Tomatoes API][rottentomatoes-link] | [![Version][rottentomatoes-version]][libraries-link] |
|          [Jikan API][jikan-link]           |     [![Version][jikan-version]][libraries-link]      |

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

Put them in the _Metadata Block_ via `@require`, for example:

```JavaScript
// @require https://cdn.jsdelivr.net/gh/iFelix18/Userscripts@master/lib/utils/utils.min.js
```

Use a specific version using a specific GitHub tag, for example:

```JavaScript
// @require https://cdn.jsdelivr.net/gh/iFelix18/Userscripts@utils-2.3.0/lib/utils/utils.min.js
```

---

## Credits

This product uses the TMDb API but is not endorsed or certified by TMDb.  
This product uses the Trakt API but is not endorsed or certified by Trakt.  
This product uses the OMDb API but is not endorsed or certified by OMDb.  
This product uses the Rotten Tomatoes API but is not endorsed or certified by Rotten Tomatoes.  

[stars-badge]: https://flat.badgen.net/github/stars/iFelix18/Userscripts
[stars-link]: https://github.com/iFelix18/Userscripts/stargazers
[watchers-badge]: https://flat.badgen.net/github/watchers/iFelix18/Userscripts
[watchers-link]: https://github.com/iFelix18/Userscripts/watchers
[scripts-badge]: https://flat.badgen.net/badge/scripts/5/orange
[scripts-link]: https://github.com/iFelix18/Userscripts/tree/master/userscripts
[libraries-badge]: https://flat.badgen.net/badge/libraries/7/orange
[libraries-link]: https://github.com/iFelix18/Userscripts/tree/master/src/lib
[open-issues-badge]: https://flat.badgen.net/github/open-issues/iFelix18/Userscripts
[open-issues-link]: https://github.com/iFelix18/Userscripts/issues
[closed-issues-badge]: https://flat.badgen.net/github/closed-issues/iFelix18/Userscripts
[closed-issues-link]: https://github.com/iFelix18/Userscripts/issues?q=is%3Aissue+is%3Aclosed
[last-commit-badge]: https://flat.badgen.net/github/last-commit/iFelix18/Userscripts
[last-commit-link]: https://github.com/iFelix18/Userscripts/commits/master
[jsdelivr-hits-badge]: https://flat.badgen.net/jsdelivr/hits/gh/iFelix18/Userscripts?color=FF5627
[jsdelivr-hits-link]: https://www.jsdelivr.com/package/gh/iFelix18/Userscripts
[style-guide-badge]: https://flat.badgen.net/badge/code%20style/standard/44CC11
[style-guide-link]: https://standardjs.com
[license-badge]: https://flat.badgen.net/github/license/iFelix18/Userscripts
[license-link]: https://github.com/iFelix18/Userscripts/blob/master/LICENSE.md

[readme-en]: /README.md "English"
[readme-it]: /README.it.md "Italiano"

[install-badge]: https://flat.badgen.net/badge/install%20directly%20from/GitHub/blue "Click here!"

[scripts-link]: #scripts

[ratings-on-tmdb-link]: /docs/scripts/ratings-on-tmdb.md "More info"
[ratings-on-imdb-link]: /docs/scripts/ratings-on-imdb.md "More info"
[ratings-on-justwatch-link]: /docs/scripts/ratings-on-justwatch.md "More info"
[openuserjs-plus-link]: /docs/scripts/openuserjs-plus.md "More info"
[greasyfork-plus-link]: /docs/scripts/greasyfork-plus.md "More info"

[ratings-on-tmdb-version]: https://flat.badgen.net/runkit/iFelix18/version/iFelix18/Userscripts/master/userscripts/meta/ratings-on-tmdb.meta.js
[ratings-on-imdb-version]: https://flat.badgen.net/runkit/iFelix18/version/iFelix18/Userscripts/master/userscripts/meta/ratings-on-imdb.meta.js
[ratings-on-justwatch-version]: https://flat.badgen.net/runkit/iFelix18/version/iFelix18/Userscripts/master/userscripts/meta/ratings-on-justwatch.meta.js
[openuserjs-plus-version]: https://flat.badgen.net/runkit/iFelix18/version/iFelix18/Userscripts/master/userscripts/meta/openuserjs-plus.meta.js
[greasyfork-plus-version]: https://flat.badgen.net/runkit/iFelix18/version/iFelix18/Userscripts/master/userscripts/meta/greasyfork-plus.meta.js

[ratings-on-tmdb-download]: https://cdn.jsdelivr.net/gh/iFelix18/Userscripts@master/userscripts/ratings-on-tmdb.user.js "Click here!"
[ratings-on-imdb-download]: https://cdn.jsdelivr.net/gh/iFelix18/Userscripts@master/userscripts/ratings-on-imdb.user.js "Click here!"
[ratings-on-justwatch-download]: https://cdn.jsdelivr.net/gh/iFelix18/Userscripts@master/userscripts/ratings-on-justwatch.user.js "Click here!"
[openuserjs-plus-download]: https://cdn.jsdelivr.net/gh/iFelix18/Userscripts@master/userscripts/openuserjs-plus.user.js "Click here!"
[greasyfork-plus-download]: https://cdn.jsdelivr.net/gh/iFelix18/Userscripts@master/userscripts/greasyfork-plus.user.js "Click here!"

[libraries-link]: #libraries

[utils-link]: /docs/libraries/utils.md "More info"
[ratings-link]: /docs/libraries/ratings.md "More info"
[trakt-link]: /docs/libraries/trakt.md "More info"
[tmdb-link]: /docs/libraries/tmdb.md "More info"
[omdb-link]: /docs/libraries/omdb.md "More info"
[rottentomatoes-link]: /docs/libraries/rottentomatoes.md "More info"
[jikan-link]: /docs/libraries/jikan.md "More info"

[utils-version]: https://flat.badgen.net/runkit/iFelix18/version/iFelix18/Userscripts/master/lib/utils/utils.min.js
[ratings-version]: https://flat.badgen.net/runkit/iFelix18/version/iFelix18/Userscripts/master/lib/utils/ratings.min.js
[trakt-version]: https://flat.badgen.net/runkit/iFelix18/version/iFelix18/Userscripts/master/lib/api/trakt.min.js
[tmdb-version]: https://flat.badgen.net/runkit/iFelix18/version/iFelix18/Userscripts/master/lib/api/tmdb.min.js
[omdb-version]: https://flat.badgen.net/runkit/iFelix18/version/iFelix18/Userscripts/master/lib/api/omdb.min.js
[rottentomatoes-version]: https://flat.badgen.net/runkit/iFelix18/version/iFelix18/Userscripts/master/lib/api/rottentomatoes.min.js
[jikan-version]: https://flat.badgen.net/runkit/iFelix18/version/iFelix18/Userscripts/master/lib/api/jikan.min.js

[violentmonkey-link]: https://violentmonkey.github.io/
[userscripts-link]: https://github.com/quoid/userscripts
[tampermonkey-link]: https://www.tampermonkey.net/
