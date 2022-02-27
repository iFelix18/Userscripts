# Userscripts

I miei script e le mie librerie

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

Lingue readme:
•[_en_][readme-en]
•[_it_][readme-it]

---

## Scripts

|                       _Script_                        |                     _Versione_                      |                         _Installa_                         |
| :---------------------------------------------------: | :-------------------------------------------------: | :--------------------------------------------------------: |
|      [Valutazioni su TMDb][ratings-on-tmdb-link]      |   [![Version][ratings-on-tmdb-version]][scripts]    |   [![Install][install-badge]][ratings-on-tmdb-download]    |
|      [Valutazioni su IMDb][ratings-on-imdb-link]      |   [![Version][ratings-on-imdb-version]][scripts]    |   [![Install][install-badge]][ratings-on-imdb-download]    |
| [Valutazioni su JustWatch][ratings-on-justwatch-link] | [![Version][ratings-on-justwatch-version]][scripts] | [![Install][install-badge]][ratings-on-justwatch-download] |
|          [OpenUserJS+][openuserjs-plus-link]          |   [![Version][openuserjs-plus-version]][scripts]    |   [![Install][install-badge]][openuserjs-plus-download]    |
|         [Greasy Fork+][greasyfork-plus-link]          |   [![Version][greasyfork-plus-version]][scripts]    |   [![Install][install-badge]][greasyfork-plus-download]    |

---

## Librerie

|                 _Libreria_                 |                   _Versione_                    |
| :----------------------------------------: | :---------------------------------------------: |
|           [My Utils][utils-link]           |     [![Version][utils-version]][libraries]      |
|          [Ratings][ratings-link]           |    [![Version][ratings-version]][libraries]     |
|          [Trakt API][trakt-link]           |     [![Version][trakt-version]][libraries]      |
|           [TMDb API][tmdb-link]            |      [![Version][tmdb-version]][libraries]      |
|           [OMDb API][omdb-link]            |      [![Version][omdb-version]][libraries]      |
| [Rotten Tomatoes API][rottentomatoes-link] | [![Version][rottentomatoes-version]][libraries] |
|          [Jikan API][jikan-link]           |     [![Version][jikan-version]][libraries]      |
|         [Wikidata][wikidata-link]          |    [![Version][wikidata-version]][libraries]    |

---

## Come installare gli script

1. Scarica uno di questi add-on per il browser:
    * [Violentmonkey][violentmonkey-link]
    * [Userscripts][userscripts-link]
    * [Tampermonkey][tampermonkey-link]
2. Installa l'userscript direttamente da GitHub facendo clic sul relativo badge di installazione.
3. Nel caso, configura lo script come riportato nella sua descrizione.
4. Fatto!

---

## Come usare le librerie

Inseriscila nel _Metadata Block_ tramite `@require`, ad esempio:

```JavaScript
// @require https://cdn.jsdelivr.net/gh/iFelix18/Userscripts@master/lib/utils/utils.min.js
```

Utilizzare una versione specifica utilizzando uno specifico tag GitHub, ad esempio:

```JavaScript
// @require https://cdn.jsdelivr.net/gh/iFelix18/Userscripts@utils-2.3.0/lib/utils/utils.min.js
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
[jsdelivr-hits-badge]: https://flat.badgen.net/jsdelivr/hits/gh/iFelix18/Userscripts?color=FF5627
[jsdelivr-hits-link]: https://www.jsdelivr.com/package/gh/iFelix18/Userscripts
[style-guide-badge]: https://flat.badgen.net/badge/code%20style/standard/44CC11
[style-guide-link]: https://standardjs.com
[license-badge]: https://flat.badgen.net/github/license/iFelix18/Userscripts
[license-link]: https://github.com/iFelix18/Userscripts/blob/master/LICENSE.md

[readme-en]: /README.md "English"
[readme-it]: /README.it.md "Italiano"

[install-badge]: https://flat.badgen.net/badge/install%20directly%20from/GitHub/blue "Clicca qui!"

[scripts]: #scripts

[ratings-on-tmdb-link]: /userscripts/docs/ratings-on-tmdb.it.md "Più info"
[ratings-on-tmdb-version]: https://flat.badgen.net/runkit/iFelix18/version/iFelix18/Userscripts/master/userscripts/meta/ratings-on-tmdb.meta.js
[ratings-on-tmdb-download]: https://cdn.jsdelivr.net/gh/iFelix18/Userscripts@master/userscripts/ratings-on-tmdb.user.js "Clicca qui!"

[ratings-on-imdb-link]: /userscripts/docs/ratings-on-imdb.it.md "Più info"
[ratings-on-imdb-version]: https://flat.badgen.net/runkit/iFelix18/version/iFelix18/Userscripts/master/userscripts/meta/ratings-on-imdb.meta.js
[ratings-on-imdb-download]: https://cdn.jsdelivr.net/gh/iFelix18/Userscripts@master/userscripts/ratings-on-imdb.user.js "Clicca qui!"

[ratings-on-justwatch-link]: /userscripts/docs/ratings-on-justwatch.it.md "Più info"
[ratings-on-justwatch-version]: https://flat.badgen.net/runkit/iFelix18/version/iFelix18/Userscripts/master/userscripts/meta/ratings-on-justwatch.meta.js
[ratings-on-justwatch-download]: https://cdn.jsdelivr.net/gh/iFelix18/Userscripts@master/userscripts/ratings-on-justwatch.user.js "Clicca qui!"

[openuserjs-plus-link]: /userscripts/docs/openuserjs-plus.it.md "Più info"
[openuserjs-plus-version]: https://flat.badgen.net/runkit/iFelix18/version/iFelix18/Userscripts/master/userscripts/meta/openuserjs-plus.meta.js
[openuserjs-plus-download]: https://cdn.jsdelivr.net/gh/iFelix18/Userscripts@master/userscripts/openuserjs-plus.user.js "Clicca qui!"

[greasyfork-plus-link]: /userscripts/docs/greasyfork-plus.it.md "Più info"
[greasyfork-plus-version]: https://flat.badgen.net/runkit/iFelix18/version/iFelix18/Userscripts/master/userscripts/meta/greasyfork-plus.meta.js
[greasyfork-plus-download]: https://cdn.jsdelivr.net/gh/iFelix18/Userscripts@master/userscripts/greasyfork-plus.user.js "Clicca qui!"

[libraries]: #librerie

[utils-link]: /packages/utils "Più info"
[utils-version]: https://flat.badgen.net/runkit/iFelix18/version/iFelix18/Userscripts/master/lib/utils/utils.min.js

[ratings-link]: /packages/ratings "Più info"
[ratings-version]: https://flat.badgen.net/runkit/iFelix18/version/iFelix18/Userscripts/master/lib/utils/ratings.min.js

[trakt-link]: /packages/trakt "Più info"
[trakt-version]: https://flat.badgen.net/runkit/iFelix18/version/iFelix18/Userscripts/master/lib/api/trakt.min.js

[tmdb-link]: /packages/tmdb "Più info"
[tmdb-version]: https://flat.badgen.net/runkit/iFelix18/version/iFelix18/Userscripts/master/lib/api/tmdb.min.js

[omdb-link]: /packages/omdb "Più info"
[omdb-version]: https://flat.badgen.net/runkit/iFelix18/version/iFelix18/Userscripts/master/lib/api/omdb.min.js

[rottentomatoes-link]: /packages/rottentomatoes "Più info"
[rottentomatoes-version]: https://flat.badgen.net/runkit/iFelix18/version/iFelix18/Userscripts/master/lib/api/rottentomatoes.min.js

[jikan-link]: /packages/jikan "Più info"
[jikan-version]: https://flat.badgen.net/runkit/iFelix18/version/iFelix18/Userscripts/master/lib/api/jikan.min.js

[wikidata-link]: /packages/wikidata "Più info"
[wikidata-version]: https://flat.badgen.net/runkit/iFelix18/version/iFelix18/Userscripts/master/lib/api/wikidata.min.js

[violentmonkey-link]: https://violentmonkey.github.io/
[userscripts-link]: https://github.com/quoid/userscripts/#userscripts-safari
[tampermonkey-link]: https://www.tampermonkey.net/
