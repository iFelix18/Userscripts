// ==UserScript==
// @name            Greasy Fork+
// @name:it         Greasy Fork+
// @author          Davide <iFelix18@protonmail.com>
// @namespace       https://github.com/iFelix18
// @icon            https://www.google.com/s2/favicons?sz=64&domain=greasyfork.org
// @description     Adds various features, and improves the Greasy Fork experience
// @description:it  Aggiunge varie funzionalità, e migliora l'esperienza di Greasy Fork
// @copyright       2021, Davide (https://github.com/iFelix18)
// @license         MIT
// @version         1.0.2
//
// @homepageURL     https://github.com/iFelix18/Userscripts#readme
// @supportURL      https://github.com/iFelix18/Userscripts/issues
// @updateURL       https://raw.githubusercontent.com/iFelix18/Userscripts/master/userscripts/meta/greasyfork-plus.meta.js
// @downloadURL     https://raw.githubusercontent.com/iFelix18/Userscripts/master/userscripts/greasyfork-plus.user.js
//
// @require         https://cdn.jsdelivr.net/gh/iFelix18/Userscripts@abce8796cedbe28ac8e072d9824c4b9342985098/lib/utils/utils.min.js
// @require         https://cdn.jsdelivr.net/npm/gm4-polyfill@1.0.1/gm4-polyfill.min.js#sha256-qmLl2Ly0/+2K+HHP76Ul+Wpy1Z41iKtzptPD1Nt8gSk=
// @require         https://cdn.jsdelivr.net/npm/jquery@3.6.0/dist/jquery.min.js#sha256-/xUj+3OJU5yExlq6GSYGSHk7tPXikynS7ogEvDej/m4=
// @require         https://cdn.jsdelivr.net/npm/@violentmonkey/shortcut@1.2.4/dist/index.js#sha256-ac//SadDzOEkne8ECdtu6YwY5YJj0oJBazsbYk/mvzg=
//
// @match           *://greasyfork.org/*
// @match           *://sleazyfork.org/*
// @connect         greasyfork.org
//
// @grant           GM.deleteValue
// @grant           GM.getValue
// @grant           GM.info
// @grant           GM.listValues
// @grant           GM.setValue
// @grant           GM.xmlHttpRequest
//
// @grant           GM_deleteValue
// @grant           GM_getValue
// @grant           GM_info
// @grant           GM_listValues
// @grant           GM_setValue
// @grant           GM_xmlhttpRequest
//
// @run-at          document-idle
// @inject-into     page
// ==/UserScript==

/* global $, MonkeyUtils, VM */

(() => {
  'use strict'

  //* MonkeyUtils
  const MU = new MonkeyUtils({
    name: GM.info.script.name,
    version: GM.info.script.version,
    author: GM.info.script.author,
    color: '#ff0000',
    logging: false
  })
  MU.init()

  //* Constants
  const cachePeriod = 1800000 // 0.5 hours
  const nonLatins = /[^\p{Script=Latin}\p{Script=Common}\p{Script=Inherited}]/gu
  const blacklist = new RegExp([ /* cspell: disable-next-line */
    '\\bagar((.)?io)?\\b', '\\bagma((.)?io)?\\b', '\\baimbot\\b', '\\barras((.)?io)?\\b', '\\bbot(s)?\\b', '\\bbubble((.)?am)?\\b', '\\bcheat(s)?\\b', '\\bdiep((.)?io)?\\b', '\\bfreebitco((.)?in)?\\b', '\\bgota((.)?io)?\\b', '\\bhack(s)?\\b', '\\bkrunker((.)?io)?\\b', '\\blostworld((.)?io)?\\b', '\\bmoomoo((.)?io)?\\b', '\\broblox(.com)?\\b', '\\bshell\\sshockers\\b', '\\bshellshock((.)?io)?\\b', '\\bshellshockers\\b', '\\bskribbl((.)?io)?\\b', '\\bslither((.)?io)?\\b', '\\bsurviv((.)?io)?\\b', '\\btaming((.)?io)?\\b', '\\bvenge((.)?io)?\\b', '\\bvertix((.)?io)?\\b', '\\bzombs((.)?io)?\\b', '\\p{Extended_Pictographic}'
  ].join('|'), 'giu')
  const lang = $('html').attr('lang')
  const locales = {
    en: {
      downgrade: 'Downgrade to',
      install: 'Install',
      reinstall: 'Reinstall',
      update: 'Update to'
    },
    it: {
      downgrade: 'Riporta a',
      install: 'Installa',
      reinstall: 'Reinstalla',
      update: 'Aggiorna a'
    }
  }

  MU.log(nonLatins)
  MU.log(blacklist)

  //* Shortcuts
  VM.shortcut.register('ctrl-alt-l', () => {
    $('.script-list li.non-latin').toggle()
  })
  VM.shortcut.register('ctrl-alt-b', () => {
    $('.script-list li.blacklisted').toggle()
  })

  //* Functions
  /**
   * Hide all scripts with non-Latin characters in the name or description
   * @param {Object} element
   */
  const hideNonLatinScripts = (element) => {
    const name = $(element).find('.script-link').text()
    const description = $(element).find('.script-description').text()

    if (!name) return

    if (name.match(nonLatins) || description.match(nonLatins)) {
      $(element).addClass('non-latin').css('background-color', 'rgba(255, 0, 0, 0.10)').hide()
    }
  }

  /**
   * Hide all scripts with blacklisted words in the name or description
   * @param {Object} element
   */
  const hideBlacklistedScripts = (element) => {
    const name = $(element).find('.script-link').text()
    const description = $(element).find('.script-description').text()

    if (!name) return

    if (name.match(blacklist) || description.match(blacklist)) {
      $(element).addClass('blacklisted').css('background-color', 'rgba(255, 0, 0, 0.10)').hide()
    }
  }

  /**
   * Get data from Greasy Fork API
   * @param {number} id
   * @returns
   */
  const getData = async (id) => {
    const cache = await GM.getValue(id) // get cache

    return new Promise((resolve, reject) => {
      if (cache !== undefined && ((Date.now() - cache.time) < cachePeriod)) { // cache valid
        MU.log(`${id} data from cache`)
        resolve(cache.data)
      } else { // cache not valid
        GM.xmlHttpRequest({
          method: 'GET',
          url: `https://greasyfork.org/scripts/${id}.json`,
          onload: (response) => {
            const data = JSON.parse(response.responseText)
            GM.setValue(id, { data, time: Date.now() }) // set cache
            MU.log(`${id} data from api`)
            resolve(data)
          }
        })
      }
    })
  }

  /**
   * Returns installed version
   * @param {string} name
   * @param {string} namespace
   * @returns
   */
  const isInstalled = (name, namespace) => {
    return new Promise((resolve, reject) => {
      if (window.external.Violentmonkey) {
        window.external.Violentmonkey.isInstalled(name, namespace).then((data) => resolve(data))
        return
      }

      if (window.external.Tampermonkey) {
        window.external.Tampermonkey.isInstalled(name, namespace, (data) => {
          (data.installed) ? resolve(data.version) : resolve(null)
        })
        return
      }

      resolve(null)
    })
  }

  /**
   * Compare two version
   * @param {string} v1
   * @param {string} v2
   * @returns {number}
   */
  const compareVersions = (v1, v2) => {
    if (v1 === null || v2 === null) return null
    if (v1 === v2) return 0

    const sv1 = v1.split('.').map((i) => +i)
    const sv2 = v2.split('.').map((i) => +i)

    for (let i = 0; i < Math.max(sv1.length, sv2.length); i++) {
      if (sv1[i] > sv2[i]) return 1
      if (sv1[i] < sv2[i]) return -1
    }

    return 0
  }

  /**
   * Return label for the install button
   * @param {number} update
   * @returns {string}
   */
  const getLabel = (update) => {
    if (update === null) {
      return locales[lang] ? locales[lang].install : locales.en.install
    } else if (update === 1) {
      return locales[lang] ? locales[lang].update : locales.en.update
    } else if (update === -1) {
      return locales[lang] ? locales[lang].downgrade : locales.en.downgrade
    } else {
      return locales[lang] ? locales[lang].reinstall : locales.en.reinstall
    }
  }

  /**
   * Shows a button to install the script
   * @param {Object} element
   * @param {string} url
   * @param {string} label
   * @param {string} version
   */
  const addInstallButton = (element, url, label, version) => {
    $(element)
      .find('.badge-js, .badge-css')
      .after(`<a class="install-link" href="${url}" style="float: right; zoom: 0.7; text-decoration: none;">${label} ${version}</a>`)
  }

  /**
   * Clear old data from the cache
   */
  const clearOldCache = async () => {
    const values = await GM.listValues()

    values.forEach(async (value) => {
      const cache = await GM.getValue(value) // get cache
      if ((Date.now() - cache.time) > cachePeriod) { GM.deleteValue(value) } // delete old cache
    })
  }

  //* Script
  clearOldCache()

  $('.script-list li').each((index, element) => {
    const id = $(element).data('script-id')

    hideNonLatinScripts(element)
    hideBlacklistedScripts(element)

    getData(id).then((data) => {
      const version = data.version
      const url = data.code_url

      isInstalled(data.name, data.namespace).then((data) => {
        const update = compareVersions(version, data)
        const label = getLabel(update)

        addInstallButton(element, url, label, version)
      }).catch((error) => MU.error(error))
    }).catch((error) => MU.error(error))
  })
})()
