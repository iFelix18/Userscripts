# `@ifelix18/omdb`

> [OMDb][omdb-link] API for userscripts

[![Version][version-badge]][jsdelivr-link]
[![Size][size-badge]][jsdelivr-link]
[![Minified Size][minified-size-badge]][jsdelivr-link]
[![Downloads][downloads-badge]][jsdelivr-link]
[![JavaScript Style Guide][style-guide-badge]][style-guide-link]
[![License][license-badge]][license-link]

## Usage

### Setup and initialization

Include it in your script in the _Metadata Block_ via `@require` specifying the version, also specifying the required API to be granted (`GM.getValue`, `GM.setValue`, `GM.xmlHttpRequest`) via `@grant`, and the domain which can be allowed to be retrieved by `GM.xmlHttpRequest` via `@connect`, like this:

```JavaScript
// ...
// @require https://cdn.jsdelivr.net/npm/@ifelix18/omdb@4.0.0/lib/index.min.js
// @grant   GM.getValue
// @grant   GM.setValue
// @grant   GM.xmlHttpRequest
// @connect omdbapi.com
// ...
```

Next, initialize the library:

```JavaScript
const omdb = new OMDb({
  api_key: '<your_api_key>', // <string> - OMDb API Key [required]
  api_url: 'https://www.omdbapi.com', // <string> - OMDb API URL
  debug: false, // <boolean> - Debug
  cache: { // Cache options
    active: false, // <boolean> - Cache status
    time_to_live: 3600 // <number> - Time to Live cache, in seconds
  }
})
```

### API requests

#### Search by ID

> Returns infos related to a specific IMDb ID.

| Parameter | Required | Type    | Description                                |
| --------- | -------- | ------- | ------------------------------------------ |
| id        | Yes      | string  | IMDb ID                                    |
| type      | No       | string  | Type of result (movie, series, or episode) |
| year      | No       | number  | Year of release                            |
| plot      | No       | string  | Type of plot (short or full)               |
| tomatoes  | No       | boolean | Include Rotten Tomatoes data               |

```JavaScript
omdb.id({
  id: 'tt0088763'
}).then((data) => {
  console.log(data) // <object> - Response from API request
}).catch((error) => console.error(error))
```

#### Search by Title

> Returns infos related to the first result with a specific title.

| Parameter | Required | Type    | Description                                |
| --------- | -------- | ------- | ------------------------------------------ |
| title     | Yes      | string  | Item title                                 |
| type      | No       | string  | Type of result (movie, series, or episode) |
| year      | No       | number  | Year of release                            |
| plot      | No       | string  | Type of plot (short or full)               |
| tomatoes  | No       | boolean | Include Rotten Tomatoes data               |

```JavaScript
omdb.title({
  title: 'Back to the Future'
}).then((data) => {
  console.log(data) // <object> - Response from API request
}).catch((error) => console.error(error))
```

#### Search by Search

> Returns all results of a specific search.

| Parameter | Required | Type   | Description                                |
| --------- | -------- | ------ | ------------------------------------------ |
| title     | Yes      | string | Item title                                 |
| type      | No       | string | Type of result (movie, series, or episode) |
| year      | No       | number | Year of release                            |
| page      | No       | number | Results page (1-100)                       |

```JavaScript
omdb.search({
  search: 'Back to the Future'
}).then((data) => {
  console.log(data) // <object> - Response from API request
}).catch((error) => console.error(error))
```

## Credits

This product uses the OMDb API but is not endorsed or certified by OMDb.  

[omdb-link]: https://omdbapi.com/
[jsdelivr-link]: https://www.jsdelivr.com/package/npm/@ifelix18/omdb

[version-badge]: https://flat.badgen.net/jsdelivr/v/npm/@ifelix18/omdb

[size-badge]: https://flat.badgen.net/badgesize/normal/iFelix18/Userscripts/master/packages/omdb/lib/index.js

[minified-size-badge]: https://flat.badgen.net/badgesize/normal/iFelix18/Userscripts/master/packages/omdb/lib/index.min.js?label=minified%20size

[downloads-badge]: https://flat.badgen.net/jsdelivr/hits/npm/@ifelix18/omdb

[style-guide-badge]: https://flat.badgen.net/badge/code%20style/standard/44CC11
[style-guide-link]: https://standardjs.com

[license-badge]: https://flat.badgen.net/github/license/iFelix18/Userscripts
[license-link]: https://github.com/iFelix18/Userscripts/blob/master/LICENSE.md
