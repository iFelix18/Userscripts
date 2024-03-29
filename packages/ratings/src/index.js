// ==UserScript==
// @author       Davide <iFelix18@protonmail.com>
// @namespace    https://github.com/iFelix18
// @exclude      *
// ==UserLibrary==
// @name         @ifelix18/ratings
// @description  Ratings for my userscripts
// @copyright    2022, Davide (https://github.com/iFelix18)
// @license      MIT
// @version      5.0.1
// @homepage     https://github.com/iFelix18/Userscripts/tree/master/packages/ratings#readme
// @homepageURL  https://github.com/iFelix18/Userscripts/tree/master/packages/ratings#readme
// @supportURL   https://github.com/iFelix18/Userscripts/issues
// ==/UserLibrary==
// @connect      api.jikan.moe
// @connect      omdbapi.com
// @connect      rottentomatoes.com
// @grant        GM.getValue
// @grant        GM.setValue
// @grant        GM.xmlHttpRequest
// ==/UserScript==

/* global Jikan, OMDb, RottenTomatoes */

/**
 * Ratings for my userscripts
 *
 * @class
 */
export default class Ratings {
  /**
   * Ratings configuration
   *
   * @param {object} config Configuration
   * @param {string} config.omdb.api_key OMDb API Key
   * @param {string} [config.omdb.api_url='https://www.omdbapi.com'] OMDb API URL
   * @param {string} [config.tomato.api_url='https://www.rottentomatoes.com/api/private/v2.0'] Rotten Tomatoes API URL
   * @param {number} [config.tomato.limit=25] Rotten Tomatoes limit
   * @param {string} [config.jikan.api_url='https://api.jikan.moe/v4'] Jikan API URL
   * @param {number} [config.jikan.limit=25] Jikan limit
   * @param {boolean} [config.debug=false] Debug
   * @param {object} cache Cache
   * @param {boolean} [cache.active=false] Cache status
   * @param {number} [cache.time_to_live=3600] Time to Live cache, in seconds
   */
  constructor (config = {}, cache = config.cache || {}) {
    if (!config.omdb.api_key) throw new Error('OMDb API Key is required')

    this._config = {
      omdb: {
        api_key: config.omdb.api_key,
        api_url: config.omdb && config.omdb.api_url ? config.omdb.api_url : 'https://www.omdbapi.com'
      },
      tomato: {
        api_url: config.tomato && config.tomato.api_url ? config.tomato.api_url : 'https://www.rottentomatoes.com/api/private/v2.0',
        limit: config.tomato && config.tomato.limit ? config.tomato.limit : 25
      },
      jikan: {
        api_url: config.jikan && config.jikan.api_url ? config.jikan.api_url : 'https://api.jikan.moe/v4',
        limit: config.jikan && config.jikan.limit ? config.jikan.limit : 25
      },
      debug: config.debug || false
    }

    this._cache = {
      active: cache.active || false,
      TTL: (cache.time_to_live || 3600) * 1000
    }

    this._omdb = new OMDb({
      api_key: this._config.omdb.api_key,
      api_url: this._config.omdb.api_url,
      debug: this._config.debug,
      cache: {
        active: this._cache.active,
        TTL: this._cache.TTL
      }
    })

    this._tomato = new RottenTomatoes({
      api_url: this._config.tomato.api_url,
      limit: this._config.tomato.limit,
      debug: this._config.debug,
      cache: {
        active: this._cache.active,
        TTL: this._cache.TTL
      }
    })

    this._mal = new Jikan({
      api_url: this._config.jikan.api_url,
      limit: this._config.jikan.limit,
      debug: this._config.debug,
      cache: {
        active: this._cache.active,
        TTL: this._cache.TTL
      }
    })

    this._logos = {
      imdb: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTI4IiBoZWlnaHQ9IjEyOCIgdmVyc2lvbj0iMS4xIiB2aWV3Qm94PSIwIDAgMTI4IDEyOCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiByeD0iOCIgZmlsbD0iI2Y1YzUxOCIvPjxnIHRyYW5zZm9ybT0ibWF0cml4KDIsMCwwLDIsMTYsNDYpIj48cG9seWdvbiBwb2ludHM9IjAgMCAwIDE4IDUgMTggNSAwIi8+PHBhdGggZD0iTSAxNS42NzI1MTgsMCAxNC41NTM0ODMsOC40MDg0NjkzIDEzLjg1ODIwMSwzLjgzNTAyNDMgQyAxMy42NTY2MSwyLjM3MDA5MjYgMTMuNDYzMjQ3LDEuMDkxNzUxMiAxMy4yNzgxMTMsMCBIIDcgdiAxOCBoIDQuMjQxNjM1IEwgMTEuMjU4MDkxLDYuMTEzODA2OCAxMy4wNDM2MDksMTggaCAzLjAxOTc0OCBMIDE3Ljc1ODM2NSw1Ljg1MTc4NjUgMTcuNzcwNzA4LDE4IEggMjIgViAwIFoiLz48cGF0aCBkPSJtMjQgMTh2LTE4aDcuODA0NTU5YzEuNzY0NzkzIDAgMy4xOTU0NDEgMS40MTk5NDQxIDMuMTk1NDQxIDMuMTc2NjA0MnYxMS42NDY3OTE4YzAgMS43NTQzOS0xLjQyODMzOCAzLjE3NjYwNC0zLjE5NTQ0MSAzLjE3NjYwNHptNS44MzIyNDgtMTQuNzYwNDc2NGMtMC4xOTgzMjYtMC4xMDcxOTAxLTAuNTc3NzMyLTAuMTU4ODAwMi0xLjEyOTU5Ni0wLjE1ODgwMDJ2MTEuODEwNzYyNmMwLjcyODYzMyAwIDEuMTc3MDIyLTAuMTMxMDEgMS4zNDUxNjctMC40MDQ5NCAwLjE2ODE0Ni0wLjI2OTk2IDAuMjU0Mzc1LTEuMDAwNDQxIDAuMjU0Mzc1LTIuMTk5Mzgydi02Ljk3OTI2ODFjMC0wLjgxMzg1MDktMC4wMzAxOC0xLjMzMzkyMTUtMC4wODYyMy0xLjU2NDE4MTctMC4wNTYwNS0wLjIzMDI2MDMtMC4xODEwOC0wLjM5NzAwMDUtMC4zODM3MTctMC41MDQxOTA2eiIvPjxwYXRoIGQ9Im00NC40Mjk5MDggNC41MDY4NTgyaDAuMzE5NjFjMS43OTUxOTIgMCAzLjI1MDQ4MiAxLjQwNTgxNzcgMy4yNTA0ODIgMy4xMzgwMDk0djcuMjE3MTIzNGMwIDEuNzMzMDc0LTEuNDU0ODE4IDMuMTM4MDA5LTMuMjUwNDgyIDMuMTM4MDA5aC0wLjMxOTYxYy0xLjA5ODQ0NiAwLTIuMDY5NjMzLTAuNTI2MzM4LTIuNjU4MDM4LTEuMzMxNzI2bC0wLjI4Nzk3NCAxLjEwMDUwNGgtNC40ODM4OTZ2LTE3Ljc2ODc3OGg0Ljc4NDMyNnY1Ljc4MDUzNTZjMC42MTgxNzItMC43NzAzNzgyIDEuNTcwODI1LTEuMjczNjc3NCAyLjY0NTU4Mi0xLjI3MzY3NzR6bS0xLjAyNDM0IDguNzc3MzU3OHYtNC4yNjUxMzc5YzAtMC43MDQ3Mzg2LTAuMDQ1MjQtMS4xNjcyMjM0LTAuMTM5NDkzLTEuMzgwMTEzMy0wLjA5NDI1LTAuMjEyODg5OC0wLjQ3MDQ4Ny0wLjM0OTU3MzItMC43MzQzOTMtMC4zNDk1NzMycy0wLjY3MDg4OSAwLjExMTA4MjItMC43NTAwNiAwLjI5ODI3ODR2Ny4yMTk4MDljMC4wOTA0OCAwLjIwNTU0OSAwLjQ3ODYxNCAwLjMxOTkyNyAwLjc1MDA2IDAuMzE5OTI3czAuNjY2NTMxLTAuMTEwNzA4IDAuNzQ5NDczLTAuMzE5OTI3YzAuMDgyOTQtMC4yMDkyMiAwLjEyNDQxMy0wLjcxOTQyMSAwLjEyNDQxMy0xLjUyMzI2M3oiLz48L2c+PC9zdmc+',
      metacritic: 'data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0idXRmLTgiPz4KPCEtLSBHZW5lcmF0b3I6IEFkb2JlIElsbHVzdHJhdG9yIDIyLjAuMCwgU1ZHIEV4cG9ydCBQbHVnLUluIC4gU1ZHIFZlcnNpb246IDYuMDAgQnVpbGQgMCkgIC0tPgo8c3ZnIHZlcnNpb249IjEuMSIgaWQ9IkxheWVyXzEiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyIgeG1sbnM6eGxpbms9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkveGxpbmsiIHg9IjBweCIgeT0iMHB4IgoJIHZpZXdCb3g9IjAgMCAyOS40IDI5LjciIHN0eWxlPSJlbmFibGUtYmFja2dyb3VuZDpuZXcgMCAwIDI5LjQgMjkuNzsiIHhtbDpzcGFjZT0icHJlc2VydmUiPgo8c3R5bGUgdHlwZT0idGV4dC9jc3MiPgoJLnN0MHtmaWxsOiNGRkNDMzQ7fQoJLnN0MXtmaWxsOiMzMzMzMzM7fQoJLnN0MntmaWxsOiNGRUZFRkU7fQoJLnN0M3tmaWxsOiNGRkZGRkY7fQo8L3N0eWxlPgo8dGl0bGU+UGFnZSAxPC90aXRsZT4KPGRlc2M+Q3JlYXRlZCB3aXRoIFNrZXRjaC48L2Rlc2M+CjxnPgoJPHBhdGggaWQ9IkZpbGwtMSIgY2xhc3M9InN0MCIgZD0iTTI5LjQsMTQuOGMwLDguMi02LjcsMTQuOS0xNC45LDE0LjlTLTAuMywyMy0wLjMsMTQuOEMtMC4zLDYuNyw2LjMsMCwxNC41LDBTMjkuNCw2LjcsMjkuNCwxNC44IgoJCS8+Cgk8cGF0aCBpZD0iRmlsbC00IiBjbGFzcz0ic3QxIiBkPSJNMjYuNSwxNC44YzAsNi42LTUuMywxMS45LTExLjksMTEuOVMyLjcsMjEuNCwyLjcsMTQuOFM4LDIuOSwxNC42LDIuOQoJCUMyMS4xLDIuOSwyNi41LDguMiwyNi41LDE0LjgiLz4KCTxwYXRoIGlkPSJGaWxsLTYiIGNsYXNzPSJzdDIiIGQ9Ik02LjgsMTguOWMtMS0xLTEuOS0xLjktMi43LTIuNmwyLjItMi4ybDEuMiwxTDcuNiwxNWMtMC4yLTAuOC0wLjMtMi4zLDEuMS0zLjcKCQljMS4xLTEuMSwyLjUtMS40LDMuNy0wLjhsMCwwYy0wLjEtMC44LTAuMS0xLjUsMC4xLTIuMWMwLjItMC43LDAuNi0xLjQsMS4yLTJjMS42LTEuNiwzLjktMS43LDYuNCwwLjhsNC45LDQuOWwtMi41LDIuNUwxOCwxMC4xCgkJYy0xLjItMS4yLTIuMy0xLjUtMy4xLTAuN2MtMC42LDAuNi0wLjYsMS40LTAuMywyLjFjMC4xLDAuMiwwLjQsMC41LDAuNiwwLjdsNC45LDQuOWwtMi41LDIuNUwxMywxNWMtMS0xLTIuMS0xLjQtMy0wLjUKCQljLTAuNywwLjctMC41LDEuNi0wLjMsMi4xYzAuMSwwLjMsMC4zLDAuNSwwLjYsMC44bDQuOCw0LjhsLTIuNSwyLjVMNi44LDE4Ljl6Ii8+CjwvZz4KPGc+Cgk8cGF0aCBpZD0iRmlsbC04IiBjbGFzcz0ic3QzIiBkPSJNMzQuOCwxMy4yYzAtMS4zLDAtMi41LTAuMS0zLjRoMi44bDAuMSwxLjVoMC4xYzAuNS0wLjcsMS40LTEuNywzLjItMS43YzEuNCwwLDIuNSwwLjcsMi45LDEuOAoJCWwwLDBjMC40LTAuNiwwLjktMSwxLjQtMS4zYzAuNi0wLjMsMS4zLTAuNSwyLTAuNWMyLjEsMCwzLjYsMS40LDMuNiw0Ljd2Ni4zaC0zLjJ2LTUuOWMwLTEuNi0wLjUtMi41LTEuNi0yLjUKCQljLTAuOCwwLTEuMywwLjUtMS42LDEuMmMtMC4xLDAuMi0wLjEsMC42LTAuMSwwLjh2Ni4zaC0zLjJ2LTZjMC0xLjMtMC41LTIuMy0xLjYtMi4zYy0wLjksMC0xLjQsMC43LTEuNiwxLjIKCQljLTAuMSwwLjMtMC4xLDAuNi0wLjEsMC45djYuMmgtMy4ydi03LjNIMzQuOHoiLz4KCTxwYXRoIGlkPSJGaWxsLTEwIiBjbGFzcz0ic3QzIiBkPSJNNjAuMiwxMy45YzAtMC44LTAuNC0yLjItMS45LTIuMmMtMS40LDAtMiwxLjMtMi4xLDIuMkg2MC4yeiBNNTYuMywxNi4yYzAuMSwxLjQsMS41LDIuMSwzLDIuMQoJCWMxLjEsMCwyLjEtMC4yLDMtMC41bDAuNCwyLjNjLTEuMSwwLjUtMi40LDAuNy0zLjksMC43Yy0zLjYsMC01LjctMi4xLTUuNy01LjVjMC0yLjcsMS43LTUuNyw1LjQtNS43YzMuNSwwLDQuOCwyLjcsNC44LDUuNAoJCWMwLDAuNi0wLjEsMS4xLTAuMSwxLjNMNTYuMywxNi4yeiIvPgoJPHBhdGggaWQ9IkZpbGwtMTIiIGNsYXNzPSJzdDMiIGQ9Ik02OSw2Ljl2Mi45aDIuNHYyLjVINjl2My45YzAsMS4zLDAuMywxLjksMS4zLDEuOWMwLjUsMCwwLjcsMCwxLTAuMXYyLjUKCQljLTAuNCwwLjItMS4yLDAuMy0yLjIsMC4zYy0xLjEsMC0yLTAuNC0yLjUtMC45Yy0wLjYtMC43LTAuOS0xLjctMC45LTMuMnYtNC40aC0xLjRWOS44aDEuNHYtMkw2OSw2Ljl6Ii8+Cgk8cGF0aCBpZD0iRmlsbC0xNCIgY2xhc3M9InN0MyIgZD0iTTc5LDE1LjVjLTEuOCwwLTMuMSwwLjQtMy4xLDEuN2MwLDAuOSwwLjYsMS4zLDEuMywxLjNjMC44LDAsMS41LTAuNSwxLjctMS4yCgkJYzAtMC4yLDAuMS0wLjQsMC4xLTAuNlYxNS41eiBNODIuMywxOGMwLDEsMCwyLDAuMiwyLjZoLTNsLTAuMi0xLjFoLTAuMWMtMC43LDAuOS0xLjgsMS4zLTMuMSwxLjNjLTIuMiwwLTMuNS0xLjYtMy41LTMuMwoJCWMwLTIuOCwyLjUtNC4xLDYuMy00LjF2LTAuMWMwLTAuNi0wLjMtMS40LTItMS40Yy0xLjEsMC0yLjMsMC40LTMsMC44bC0wLjYtMi4xYzAuNy0wLjQsMi4yLTEsNC4yLTFjMy42LDAsNC43LDIuMSw0LjcsNC42CgkJTDgyLjMsMThMODIuMywxOHoiLz4KCTxwYXRoIGlkPSJGaWxsLTE2IiBjbGFzcz0ic3QzIiBkPSJNOTMsMjAuM2MtMC42LDAuMy0xLjcsMC41LTMsMC41Yy0zLjUsMC01LjctMi4xLTUuNy01LjVjMC0zLjEsMi4yLTUuNyw2LjEtNS43CgkJYzAuOSwwLDEuOCwwLjIsMi41LDAuNGwtMC41LDIuNWMtMC40LTAuMi0xLTAuMy0xLjktMC4zYy0xLjgsMC0yLjksMS4zLTIuOSwzYzAsMiwxLjMsMywyLjksM2MwLjgsMCwxLjQtMC4xLDEuOS0wLjRMOTMsMjAuM3oiLz4KCTxwYXRoIGlkPSJGaWxsLTE4IiBjbGFzcz0ic3QzIiBkPSJNOTQuOCwxMy4zYzAtMS42LDAtMi42LTAuMS0zLjVoMi45bDAuMSwyaDAuMWMwLjUtMS42LDEuOC0yLjIsMi45LTIuMmMwLjMsMCwwLjUsMCwwLjcsMC4xdjMuMQoJCWMtMC4zLDAtMC41LTAuMS0wLjktMC4xYy0xLjIsMC0yLjEsMC42LTIuMywxLjdjMCwwLjItMC4xLDAuNS0wLjEsMC43djUuNGgtMy4zQzk0LjgsMjAuNSw5NC44LDEzLjMsOTQuOCwxMy4zeiIvPgoJPHBhdGggaWQ9IkZpbGwtMjAiIGNsYXNzPSJzdDMiIGQ9Ik0xMDMuMSwyMC41aDMuM1Y5LjhoLTMuM1YyMC41eiBNMTA0LjgsOC40Yy0xLjEsMC0xLjgtMC44LTEuOC0xLjhzMC43LTEuOCwxLjktMS44CgkJYzEuMSwwLDEuOCwwLjgsMS45LDEuOEMxMDYuNyw3LjYsMTA1LjksOC40LDEwNC44LDguNEwxMDQuOCw4LjR6Ii8+Cgk8cGF0aCBpZD0iRmlsbC0yMiIgY2xhc3M9InN0MyIgZD0iTTExMi45LDYuOXYyLjloMi40djIuNWgtMi40djMuOWMwLDEuMywwLjMsMS45LDEuMywxLjljMC41LDAsMC43LDAsMS0wLjF2Mi41CgkJYy0wLjQsMC4yLTEuMiwwLjMtMi4yLDAuM2MtMS4xLDAtMi0wLjQtMi41LTAuOWMtMC42LTAuNi0wLjktMS43LTAuOS0zLjJ2LTQuNGgtMS40VjkuOGgxLjR2LTJMMTEyLjksNi45eiIvPgoJPHBhdGggaWQ9IkZpbGwtMjMiIGNsYXNzPSJzdDMiIGQ9Ik0xMTcuMiwyMC41aDMuM1Y5LjhoLTMuM1YyMC41eiBNMTE4LjgsOC40Yy0xLjEsMC0xLjgtMC44LTEuOC0xLjhzMC43LTEuOCwxLjktMS44CgkJYzEuMSwwLDEuOCwwLjgsMS45LDEuOEMxMjAuNyw3LjYsMTIwLDguNCwxMTguOCw4LjRMMTE4LjgsOC40eiIvPgoJPHBhdGggaWQ9IkZpbGwtMjQiIGNsYXNzPSJzdDMiIGQ9Ik0xMzEuMiwyMC4zYy0wLjYsMC4zLTEuNywwLjUtMywwLjVjLTMuNSwwLTUuNy0yLjEtNS43LTUuNWMwLTMuMSwyLjItNS43LDYuMS01LjcKCQljMC45LDAsMS44LDAuMiwyLjUsMC40bC0wLjUsMi41Yy0wLjQtMC4yLTEtMC4zLTEuOS0wLjNjLTEuOCwwLTIuOSwxLjMtMi45LDNjMCwyLDEuMywzLDIuOSwzYzAuOCwwLDEuNC0wLjEsMS45LTAuNEwxMzEuMiwyMC4zeiIKCQkvPgo8L2c+Cjwvc3ZnPgo=',
      rotten: 'data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iVVRGLTgiPz4KPHN2ZyB3aWR0aD0iODBweCIgaGVpZ2h0PSI4MHB4IiB2aWV3Qm94PSIwIDAgODAgODAiIHZlcnNpb249IjEuMSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIiB4bWxuczp4bGluaz0iaHR0cDovL3d3dy53My5vcmcvMTk5OS94bGluayI+CiAgICA8IS0tIEdlbmVyYXRvcjogU2tldGNoIDU5LjEgKDg2MTQ0KSAtIGh0dHBzOi8vc2tldGNoLmNvbSAtLT4KICAgIDx0aXRsZT5JY29ucy9Ub21hdG9tZXRlciAmYW1wOyBBUy9yb3R0ZW48L3RpdGxlPgogICAgPGRlc2M+Q3JlYXRlZCB3aXRoIFNrZXRjaC48L2Rlc2M+CiAgICA8ZGVmcz4KICAgICAgICA8cG9seWdvbiBpZD0icGF0aC0xIiBwb2ludHM9IjAgMC4xNjE5NTA0NjUgNzkuNzQxNzA3NSAwLjE2MTk1MDQ2NSA3OS43NDE3MDc1IDc3LjUyMjgwNyAwIDc3LjUyMjgwNyI+PC9wb2x5Z29uPgogICAgPC9kZWZzPgogICAgPGcgaWQ9Ikljb25zL1RvbWF0b21ldGVyLSZhbXA7LUFTL3JvdHRlbiIgc3Ryb2tlPSJub25lIiBzdHJva2Utd2lkdGg9IjEiIGZpbGw9Im5vbmUiIGZpbGwtcnVsZT0iZXZlbm9kZCI+CiAgICAgICAgPGcgaWQ9Ikdyb3VwLTUiPgogICAgICAgICAgICA8cmVjdCBpZD0iUmVjdGFuZ2xlLUNvcHkiIGZpbGw9IiMwMDAwMDAiIG9wYWNpdHk9IjAiIHg9IjAiIHk9IjAiIHdpZHRoPSI4MCIgaGVpZ2h0PSI4MCI+PC9yZWN0PgogICAgICAgICAgICA8ZyBpZD0iUlRfUm90dGVuX1NwbGF0X1JHQi0oMSkiIHRyYW5zZm9ybT0idHJhbnNsYXRlKDAuMDAwMDAwLCAxLjIyODA3MCkiPgogICAgICAgICAgICAgICAgPGcgaWQ9Ikdyb3VwLTMiPgogICAgICAgICAgICAgICAgICAgIDxtYXNrIGlkPSJtYXNrLTIiIGZpbGw9IndoaXRlIj4KICAgICAgICAgICAgICAgICAgICAgICAgPHVzZSB4bGluazpocmVmPSIjcGF0aC0xIj48L3VzZT4KICAgICAgICAgICAgICAgICAgICA8L21hc2s+CiAgICAgICAgICAgICAgICAgICAgPGcgaWQ9IkNsaXAtMiI+PC9nPgogICAgICAgICAgICAgICAgICAgIDxwYXRoIGQ9Ik03MS40NjM4NTk2LDcwLjIyNTYxNCBDNTYuMzQ1OTY0OSw3MS4wMTkyOTgyIDUzLjI1Njg0MjEsNTMuNzIwMzUwOSA0Ny4zMjU2MTQsNTMuODQzNTA4OCBDNDQuNzk4MjQ1Niw1My44OTY0OTEyIDQyLjgwNjMxNTgsNTYuNTM4OTQ3NCA0My42ODEwNTI2LDU5LjYxODU5NjUgQzQ0LjE2MjEwNTMsNjEuMzExNTc4OSA0NS40OTY0OTEyLDYzLjc5NDM4NiA0Ni4zMzcxOTMsNjUuMzM1MDg3NyBDNDkuMzAyODA3LDcwLjc3MTkyOTggNDQuOTE4NTk2NSw3Ni45MjQ1NjE0IDM5Ljc4ODA3MDIsNzcuNDQ0OTEyMyBDMzEuMjYyMTA1Myw3OC4zMDk4MjQ2IDI3LjcwNTYxNCw3My4zNjM4NTk2IDI3LjkyNTYxNCw2OC4zMDA3MDE4IEMyOC4xNzI5ODI1LDYyLjYxNjg0MjEgMzIuOTkyMjgwNyw1Ni44MDkxMjI4IDI4LjA0OTQ3MzcsNTQuMzM3ODk0NyBDMjIuODY5NDczNyw1MS43NDgwNzAyIDE4LjY1ODU5NjUsNjEuODc1NDM4NiAxMy43MDE3NTQ0LDY0LjEzNTc4OTUgQzkuMjE1NDM4Niw2Ni4xODE3NTQ0IDIuOTg3NzE5Myw2NC41OTU0Mzg2IDAuNzczNjg0MjExLDU5LjYxMzY4NDIgQy0wLjc4MTQwMzUwOSw1Ni4xMTI5ODI1IC0wLjQ5ODU5NjQ5MSw0OS4zNzIyODA3IDYuNDI1MjYzMTYsNDYuODAwMzUwOSBDMTAuNzUwMTc1NCw0NS4xOTQwMzUxIDIwLjM4ODA3MDIsNDguOTAxMDUyNiAyMC44ODI0NTYxLDQ0LjIwNTYxNCBDMjEuNDUyMjgwNywzOC43OTI5ODI1IDEwLjc1NzU0MzksMzguMzM2NDkxMiA3LjUzNzU0Mzg2LDM3LjAzODU5NjUgQzEuODQsMzQuNzQyNDU2MSAtMS41MjI4MDcwMiwyOS44MjkxMjI4IDEuMTExOTI5ODIsMjQuNTU4MjQ1NiBDMy4wODg3NzE5MywyMC42MDQ1NjE0IDguOTA1MjYzMTYsMTguOTk1Nzg5NSAxMy4zNDQ5MTIzLDIwLjcyNzcxOTMgQzE4LjY2MzUwODgsMjIuODAyNDU2MSAxOS41MTcxOTMsMjguMzE4OTQ3NCAyMi4yNDIxMDUzLDMwLjYxMjk4MjUgQzI0LjU4OTQ3MzcsMzIuNTkwMTc1NCAyNy44MDIxMDUzLDMyLjgzNzU0MzkgMjkuOTAzMTU3OSwzMS40NzgyNDU2IEMzMS40NTI2MzE2LDMwLjQ3NTQzODYgMzEuOTY4NDIxMSwyOC4yNzI5ODI1IDMxLjM4Mzg1OTYsMjYuMjYxMDUyNiBDMzAuNjA4NDIxMSwyMy41OTAxNzU0IDI4LjU1MDUyNjMsMjEuOTIzNTA4OCAyNi41NDI4MDcsMjAuMjkwNTI2MyBDMjIuOTY5ODI0NiwxNy4zODU5NjQ5IDE3LjkyNTYxNCwxNC44ODg0MjExIDIwLjk3Njg0MjEsNi45NjAzNTA4OCBDMjMuNDc3ODk0NywwLjQ2MzE1Nzg5NSAzMC44MTMzMzMzLDAuMjI5MTIyODA3IDMwLjgxMzMzMzMsMC4yMjkxMjI4MDcgQzMzLjcyNzcxOTMsLTAuMDk4NTk2NDkxMiAzNi4zMzc1NDM5LDAuNzgxNDAzNTA5IDM4LjQ2NDIxMDUsMi42ODE0MDM1MSBDNDEuMzA3MzY4NCw1LjIyMTQwMzUxIDQxLjg2MTA1MjYsOC42MTY0OTEyMyA0MS4zODUyNjMyLDEyLjIzODU5NjUgQzQwLjk1MDUyNjMsMTUuNTQ0OTEyMyAzOS43ODAzNTA5LDE4LjQ0MDcwMTggMzkuMTcwMTc1NCwyMS43MTY0OTEyIEMzOC40NjIxMDUzLDI1LjUxOTY0OTEgNDAuNDk0NzM2OCwyOS4zNTE5Mjk4IDQ0LjM2MDM1MDksMjkuNTAxMDUyNiBDNDkuNDQ0OTEyMywyOS42OTc1NDM5IDUwLjk2OTQ3MzcsMjUuNzg5NDczNyA1MS41OTE1Nzg5LDIzLjMxMjI4MDcgQzUyLjUwMjQ1NjEsMTkuNjg3NzE5MyA1My42OTc4OTQ3LDE2LjMyMjgwNyA1Ny4wNjE3NTQ0LDE0LjIwMzUwODggQzYxLjg4OTQ3MzcsMTEuMTYxNzU0NCA2OC41OTU0Mzg2LDExLjgyODQyMTEgNzEuNzA2NjY2NywxNy42NzQzODYgQzc0LjE2NzcxOTMsMjIuMyA3My4zNzc1NDM5LDI4LjY2NzcxOTMgNjkuNjAyNDU2MSwzMi4xNDQ5MTIzIEM2Ny45MDg3NzE5LDMzLjcwNDU2MTQgNjUuODcyMjgwNywzNC4yNTQzODYgNjMuNjY5NDczNywzNC4yNjk4MjQ2IEM2MC41MTA1MjYzLDM0LjI5MjI4MDcgNTcuMzUyOTgyNSwzNC4yMTQ3MzY4IDU0LjQyMDcwMTgsMzUuNjkyOTgyNSBDNTIuNDI0NTYxNCwzNi42OTg5NDc0IDUxLjU1NDczNjgsMzguMzM4MjQ1NiA1MS41NTUwODc3LDQwLjUzNTQzODYgQzUxLjU1NTA4NzcsNDIuNjc2ODQyMSA1Mi42Njk4MjQ2LDQ0LjA3NTQzODYgNTQuNDc2MTQwNCw0NC45ODU2MTQgQzU3Ljg3ODI0NTYsNDYuNzAwMzUwOSA2MS42MzM2ODQyLDQ3LjA1MDg3NzIgNjUuMzA4NzcxOSw0Ny42OTQzODYgQzcwLjYzODI0NTYsNDguNjI3NzE5MyA3NS4zMjQyMTA1LDUwLjUwNDkxMjMgNzguMzMyNjMxNiw1NS40NTA1MjYzIEM3OC4zNTk2NDkxLDU1LjQ5NDAzNTEgNzguMzg1OTY0OSw1NS41Mzc4OTQ3IDc4LjQxMTU3ODksNTUuNTgyMTA1MyBDODEuODY2NjY2Nyw2MS40Mzc1NDM5IDc4LjI1MzMzMzMsNjkuODY4NzcxOSA3MS40NjM4NTk2LDcwLjIyNTYxNCIgaWQ9IkZpbGwtMSIgZmlsbD0iIzBBQzg1NSIgbWFzaz0idXJsKCNtYXNrLTIpIj48L3BhdGg+CiAgICAgICAgICAgICAgICA8L2c+CiAgICAgICAgICAgIDwvZz4KICAgICAgICA8L2c+CiAgICA8L2c+Cjwvc3ZnPg==',
      fresh: 'data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iVVRGLTgiPz4KPHN2ZyB3aWR0aD0iODBweCIgaGVpZ2h0PSI4MHB4IiB2aWV3Qm94PSIwIDAgODAgODAiIHZlcnNpb249IjEuMSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIiB4bWxuczp4bGluaz0iaHR0cDovL3d3dy53My5vcmcvMTk5OS94bGluayI+CiAgICA8IS0tIEdlbmVyYXRvcjogU2tldGNoIDU5LjEgKDg2MTQ0KSAtIGh0dHBzOi8vc2tldGNoLmNvbSAtLT4KICAgIDx0aXRsZT5JY29ucy9Ub21hdG9tZXRlciAmYW1wOyBBUy9mcmVzaDwvdGl0bGU+CiAgICA8ZGVzYz5DcmVhdGVkIHdpdGggU2tldGNoLjwvZGVzYz4KICAgIDxkZWZzPgogICAgICAgIDxwb2x5Z29uIGlkPSJwYXRoLTEiIHBvaW50cz0iMC4wMDAxMDkxMDAxMDIgMC4yNDY5NzA5NTQgNzcuMDgyNzgzNyAwLjI0Njk3MDk1NCA3Ny4wODI3ODM3IDYzLjcxNDUyMjggMC4wMDAxMDkxMDAxMDIgNjMuNzE0NTIyOCI+PC9wb2x5Z29uPgogICAgPC9kZWZzPgogICAgPGcgaWQ9Ikljb25zL1RvbWF0b21ldGVyLSZhbXA7LUFTL2ZyZXNoIiBzdHJva2U9Im5vbmUiIHN0cm9rZS13aWR0aD0iMSIgZmlsbD0ibm9uZSIgZmlsbC1ydWxlPSJldmVub2RkIj4KICAgICAgICA8ZyBpZD0iR3JvdXAiPgogICAgICAgICAgICA8cmVjdCBpZD0iUmVjdGFuZ2xlLUNvcHktMiIgZmlsbD0iIzAwMDAwMCIgb3BhY2l0eT0iMCIgeD0iMCIgeT0iMCIgd2lkdGg9IjgwIiBoZWlnaHQ9IjgwIj48L3JlY3Q+CiAgICAgICAgICAgIDxnIGlkPSJSVF9GcmVzaF9Ub21hdG9fUkdCLSgxKSIgdHJhbnNmb3JtPSJ0cmFuc2xhdGUoMS4zMjc4MDEsIDAuMDAwMDAwKSI+CiAgICAgICAgICAgICAgICA8ZyBpZD0iR3JvdXAtMyIgdHJhbnNmb3JtPSJ0cmFuc2xhdGUoMC4wMDAwMDAsIDE2LjI2NTU2MCkiPgogICAgICAgICAgICAgICAgICAgIDxtYXNrIGlkPSJtYXNrLTIiIGZpbGw9IndoaXRlIj4KICAgICAgICAgICAgICAgICAgICAgICAgPHVzZSB4bGluazpocmVmPSIjcGF0aC0xIj48L3VzZT4KICAgICAgICAgICAgICAgICAgICA8L21hc2s+CiAgICAgICAgICAgICAgICAgICAgPGcgaWQ9IkNsaXAtMiI+PC9nPgogICAgICAgICAgICAgICAgICAgIDxwYXRoIGQ9Ik03Ny4wMTM3NzU5LDI3LjA0MjY1NTYgQzc2LjI0MjMyMzcsMTQuNjc0MTkwOSA2OS45NTIxOTkyLDUuNDIwNDE0OTQgNjAuNDg3NjM0OSwwLjI0Njk3MDk1NCBDNjAuNTQxNDEwOCwwLjU0ODM4MTc0MyA2MC4yNzMxOTUsMC45MjUxNDUyMjggNTkuOTY3ODAwOCwwLjc5MTcwMTI0NSBDNTMuNzc3MjYxNCwtMS45MTYzNDg1NSA0My4yNzUzNTI3LDYuODQ3ODAwODMgMzUuOTM2NTk3NSwyLjI1ODI1NzI2IEMzNS45OTE3MDEyLDMuOTA1Mzk0MTkgMzUuNjcwMDQxNSwxMS45NDAyNDkgMjQuMzUxNTM1MywxMi40MDYzMDcxIEMyNC4wODQzMTU0LDEyLjQxNzI2MTQgMjMuOTM3MjYxNCwxMi4xNDQzOTgzIDI0LjEwNjIyNDEsMTEuOTUxMjAzMyBDMjUuNjE5OTE3LDEwLjIyNDczMDMgMjcuMTQ4MjE1OCw1Ljg1MzYwOTk2IDI0Ljk1MDcwNTQsMy41MjMzMTk1IEMyMC4yNDQ2NDczLDcuNzQwNDE0OTQgMTcuNTExNzAxMiw5LjMyNzQ2ODg4IDguNDg4Mjk4NzYsNy4yMzMxOTUwMiBDMi43MTEwMzczNCwxMy4yNzQwMjQ5IC0wLjU2MjY1NTYwMiwyMS41NDE5MDg3IDAuMDgsMzEuODQxMzI3OCBDMS4zOTEyMDMzMiw1Mi44NjYzOSAyMS4wODQ4MTMzLDY0Ljg4NDY0NzMgNDAuOTE2NTE0NSw2My42NDcxMzY5IEM2MC43NDY4ODgsNjIuNDEwNjIyNCA3OC4zMjUzMTEyLDQ4LjA2NzcxNzggNzcuMDEzNzc1OSwyNy4wNDI2NTU2IiBpZD0iRmlsbC0xIiBmaWxsPSIjRkEzMjBBIiBtYXNrPSJ1cmwoI21hc2stMikiPjwvcGF0aD4KICAgICAgICAgICAgICAgIDwvZz4KICAgICAgICAgICAgICAgIDxwYXRoIGQ9Ik00MC44NzE3MDEyLDExLjQ2NDg5NjMgQzQ0Ljk0NjcyMiwxMC40OTM2MSA1Ni42Njc4ODM4LDExLjM3MDI5MDUgNjAuNDIzMjM2NSwxNi4zNTE4NjcyIEM2MC42NDg2MzA3LDE2LjY1MDYyMjQgNjAuMzMxMjg2MywxNy4yMTU5MzM2IDU5Ljk2NzgwMDgsMTcuMDU3MjYxNCBDNTMuNzc3MjYxNCwxNC4zNDkyMTE2IDQzLjI3NTM1MjcsMjMuMTEzMzYxIDM1LjkzNjU5NzUsMTguNTIzODE3NCBDMzUuOTkxNzAxMiwyMC4xNzA5NTQ0IDM1LjY3MDA0MTUsMjguMjA1ODA5MSAyNC4zNTE1MzUzLDI4LjY3MTg2NzIgQzI0LjA4NDMxNTQsMjguNjgyODIxNiAyMy45MzcyNjE0LDI4LjQwOTk1ODUgMjQuMTA2MjI0MSwyOC4yMTY3NjM1IEMyNS42MTk5MTcsMjYuNDkwMjkwNSAyNy4xNDc4ODM4LDIyLjExOTE3MDEgMjQuOTUwNzA1NCwxOS43ODg4Nzk3IEMxOS44MjQzOTgzLDI0LjM4MjczODYgMTcuMDQ1MzExMiwyNS44NTg5MjEyIDUuOTE5MDA0MTUsMjIuODUxNDUyMyBDNS41NTQ4NTQ3NywyMi43NTMxOTUgNS42NzkwMDQxNSwyMi4xNjc5NjY4IDYuMDY2MzkwMDQsMjIuMDIwMjQ5IEM4LjE2OTI5NDYxLDIxLjIxNjU5NzUgMTIuOTMzNDQ0LDE3LjY5NjU5NzUgMTcuNDQwNjYzOSwxNi4xNDUwNjIyIEMxOC4yOTg3NTUyLDE1Ljg0OTk1ODUgMTkuMTU0MTkwOSwxNS42MjA5MTI5IDE5Ljk4OTA0NTYsMTUuNDg3ODAwOCBDMTUuMDI2MzksMTUuMDQ0MzE1NCAxMi43ODkzNzc2LDE0LjM1NDE5MDkgOS42MzI4NjMwNywxNC44MzAyMDc1IEM5LjI4Njk3MDk1LDE0Ljg4MjMyMzcgOS4wNTE5NTAyMSwxNC40Nzk2NjggOS4yNjYzOTAwNCwxNC4yMDM0ODU1IEMxMy41MTkzMzYxLDguNzI1MzExMiAyMS4zNTQwMjQ5LDcuMDcwODcxMzcgMjYuMTg3ODgzOCw5Ljk4MTA3ODg0IEMyMy4yMDgyOTg4LDYuMjg5MTI4NjMgMjAuODc0MzU2OCwzLjM0NDczMDI5IDIwLjg3NDM1NjgsMy4zNDQ3MzAyOSBMMjYuNDA0NjQ3MywwLjIwMzQ4NTQ3NyBDMjYuNDA0NjQ3MywwLjIwMzQ4NTQ3NyAyOC42ODk0NjA2LDUuMzA4MjE1NzcgMzAuMzUxODY3Miw5LjAyMzQwMjQ5IEMzNC40NjU3MjYxLDIuOTQ1MDYyMjQgNDIuMTE5ODM0LDIuMzg0MDY2MzkgNDUuMzUzNjkyOSw2LjY5Njc2MzQ5IEM0NS41NDU1NjAyLDYuOTUzMDI5MDUgNDUuMzQ1MDYyMiw3LjMxNzUxMDM3IDQ1LjAyNDczMDMsNy4zMDk4NzU1MiBDNDIuMzkyNjk3MSw3LjI0NTgwOTEzIDQwLjk0MzQwMjUsOS42Mzk4MzQwMiA0MC44MzM1MjcsMTEuNDYwNTgwOSBMNDAuODcxNzAxMiwxMS40NjQ4OTYzIiBpZD0iRmlsbC00IiBmaWxsPSIjMDA5MTJEIj48L3BhdGg+CiAgICAgICAgICAgIDwvZz4KICAgICAgICA8L2c+CiAgICA8L2c+Cjwvc3ZnPg==',
      mal: 'data:image/png;base64,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'
    }
  }

  /**
   * Normalize a string
   *
   * @param {string} string String
   * @returns {string} Normalized string
   */
  _n = (string) => {
    return string.replace(/\p{P}\s/gu, ' ').toLowerCase()
  }

  /**
   * Return formatted votes
   *
   * @param {number} votes Votes
   * @returns {string|number} Formatted votes
   */
  _votes = (votes) => {
    return votes >= 1000 ? `${Math.round(votes / 1000, 1)}k` : votes
  }

  /**
   * Return Tomatometer logo
   *
   * @private
   * @param {number} score Rotten Tomatoes score
   * @returns {string} Rotten Tomatoes logo
   */
  _tomatoLogo = (score) => {
    return score < 60 ? this._logos.rotten : this._logos.fresh
  }

  /**
   * Return Tomatometer score
   *
   * @private
   * @param {number} score Rotten Tomatoes score
   * @returns {string} Rotten Tomatoes score
   */
  _tomatoScore = (score) => {
    return score < 60 ? 'Rotten' : 'Fresh'
  }

  /**
   * Return Metascore color
   *
   * @private
   * @param {number} metascore Metascore
   * @returns {string} Metascore color
   */
  _color = (metascore) => {
    return metascore < 40 ? '#ff0000' : (metascore >= 40 && metascore <= 60 ? '#ffcc33' : '#66cc33')
  }

  /**
   * Returns ratings from APIs
   *
   * @param {string} id IMDb ID
   * @returns {object} Ratings
   */
  async get ({ id }) {
    const omdb = await this._omdb.id({
      id,
      tomatoes: true
    }).then((data) => data).catch(error => console.error(error))

    const tomato = await this._tomato.search({
      query: omdb.Title
    }).then((data) => {
      switch (omdb.Type) {
        case 'movie':
          return data.movies
            .map((item) => item)
            .find((item) => this._n(item.name) === this._n(omdb.Title) && item.year === Number.parseInt(omdb.Year))
        case 'series':
          return data.tvSeries
            .map((item) => item)
            .find((item) => this._n(item.title) === this._n(omdb.Title) && item.startYear === Number.parseInt(/\d{4}/.exec(omdb.Year)[0]))
        default:
          break
      }
    }).catch(error => console.error(error))

    const mal = await this._mal.anime.search({
      query: omdb.Title
    }).then((data) => {
      return data.data
        .map((item) => item)
        .find((item) => item.title_english && this._n(item.title_english) === this._n(omdb.Title) && item.year === Number.parseInt(/\d{4}/.exec(omdb.Year)[0]))
    }).catch(error => console.error(error))

    return { omdb, tomato, mal }
  }

  /**
   * Returns elaborated data
   *
   * @param {object} data Data ratings from APIs
   * @param {object} data.omdb OMDb data
   * @param {object} data.tomato Rotten Tomatoes data
   * @param {object} data.mal MyAnimeList data
   * @returns {object} Elaborated ratings
   */
  async elaborate ({ omdb, tomato, mal }) {
    const imdb = {
      logo: this._logos.imdb,
      rating: omdb && omdb.imdbRating && omdb.imdbRating !== 'N/A' ? Number(omdb.imdbRating) : 'N/A',
      source: 'imdb',
      symbol: '/10',
      url: omdb && omdb.imdbID ? `https://www.imdb.com/title/${omdb.imdbID}/` : 'N/A',
      votes: omdb && omdb.imdbVotes && omdb.imdbVotes !== 'N/A' ? this._votes(Number(omdb.imdbVotes.replace(/,/g, ''))) : 'N/A'
    }
    const tomatometer = {
      logo: tomato && tomato.meterScore ? this._tomatoLogo(Number(tomato.meterScore)) : this._logos.rotten,
      rating: tomato && tomato.meterScore ? Number(tomato.meterScore) : 'N/A',
      source: 'tomatometer',
      symbol: '%',
      url: tomato && tomato.url ? `https://www.rottentomatoes.com${tomato.url}/` : 'N/A',
      votes: tomato && tomato.meterScore ? this._tomatoScore(Number(tomato.meterScore)) : 'N/A'
    }
    const metascore = {
      logo: this._logos.metacritic,
      rating: omdb && omdb.Metascore && omdb.Metascore !== 'N/A' ? Number(omdb.Metascore) : 'N/A',
      source: 'metascore',
      symbol: '',
      url: omdb && omdb.Title ? `https://www.metacritic.com/search/${omdb.Type === 'series' ? 'tv' : omdb.Type}/${encodeURIComponent(omdb.Title)}/results` : 'N/A',
      votes: omdb && omdb.Metascore && omdb.Metascore !== 'N/A' ? this._color(Number(omdb.Metascore)) : 'N/A'
    }
    const myanimelist = {
      logo: this._logos.mal,
      rating: mal && mal.score ? Number(mal.score) : 'N/A',
      source: 'myanimelist',
      symbol: '',
      url: mal && mal.url ? mal.url : 'N/A',
      votes: mal && mal.scored_by ? this._votes(Number(mal.scored_by)) : 'N/A'
    }

    return { imdb, tomatometer, metascore, myanimelist }
  }
}
