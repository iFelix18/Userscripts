// ==UserScript==
// @author          Felix
// @namespace       https://github.com/iFelix18
// @exclude         *
// ==UserLibrary==
// @name            Trakt API
// @description     Trakt API for my userscripts
// @copyright       2020, Felix (https://github.com/iFelix18)
// @license         MIT
// @version         1.0.0
// @homepageURL     https://github.com/iFelix18/Userscripts
// @supportURL      https://github.com/iFelix18/Userscripts/issues
// ==/UserLibrary==
// @require         https://cdn.jsdelivr.net/gh/greasemonkey/gm4-polyfill@master/gm4-polyfill.js
// @include         *
// @connect         api.trakt.tv
// @grant           GM.xmlHttpRequest
// @grant           GM_xmlhttpRequest
// ==/UserScript==

(() => {
  'use strict'

  this.Trakt = class {
    constructor (config = {}) {
      if (!config.apikey) throw Error('Trakt API Key is required')

      this.config = {
        apikey: config.apikey,
        language: config.language || 'en', //* optional
        url: config.url || 'https://api.trakt.tv', //* optional
        debug: config.debug || false //* optional
      }

      this._headers = {
        'User-Agent': 'Mozilla/5.0',
        'Content-Type': 'application/json;charset=utf-8',
        'trakt-api-key': this.config.apikey,
        'trakt-api-version': 2
      }
    }

    //* https://trakt.docs.apiary.io/#reference/search/id-lookup/get-id-lookup-results
    searchID (idType, id, type) {
      return new Promise((resolve, reject) => {
        GM.xmlHttpRequest({
          method: 'GET',
          url: `${this.config.url}/search/${idType}/${id}?type=${type}`,
          headers: this._headers,
          onload: (response) => {
            if (response.readyState === response.DONE && response.responseText !== '[]') {
              if (this.config.debug === true) console.log(response)
              const data = JSON.parse(response.responseText)
              resolve(data[0])
            } else {
              reject(response)
            }
          }
        })
      })
    }
  }
})()
