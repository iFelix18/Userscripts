// ==UserScript==
// @name              Greasy Fork+
// @name:de           Greasy Fork+
// @name:es           Greasy Fork+
// @name:fr           Greasy Fork+
// @name:it           Greasy Fork+
// @name:ru           Greasy Fork+
// @name:zh-CN        Greasy Fork+
// @author            Davide <iFelix18@protonmail.com>
// @namespace         https://github.com/iFelix18
// @icon              https://www.google.com/s2/favicons?sz=64&domain=greasyfork.org
// /* cSpell: disable */
// @description       Adds various features and improves the Greasy Fork experience
// @description:de    Fügt verschiedene Funktionen hinzu und verbessert das Greasy Fork-Erlebnis
// @description:es    Agrega varias funciones y mejora la experiencia de Greasy Fork
// @description:fr    Ajoute diverses fonctionnalités et améliore l'expérience Greasy Fork
// @description:it    Aggiunge varie funzionalità e migliora l'esperienza di Greasy Fork
// @description:ru    Добавляет различные функции и улучшает работу с Greasy Fork
// @description:zh-CN 添加各种功能并改善 Greasy Fork 体验
// /* cSpell: enable */
// @copyright         2021, Davide (https://github.com/iFelix18)
// @license           MIT
// @version           1.3.1
//
// @homepageURL       https://github.com/iFelix18/Userscripts#readme
// @supportURL        https://github.com/iFelix18/Userscripts/issues
// @updateURL         https://raw.githubusercontent.com/iFelix18/Userscripts/master/userscripts/meta/greasyfork-plus.meta.js
// @downloadURL       https://raw.githubusercontent.com/iFelix18/Userscripts/master/userscripts/greasyfork-plus.user.js
//
// @require           https://cdn.jsdelivr.net/gh/sizzlemctwizzle/GM_config@43fd0fe4de1166f343883511e53546e87840aeaf/gm_config.min.js
// @require           https://cdn.jsdelivr.net/gh/iFelix18/Userscripts@abce8796cedbe28ac8e072d9824c4b9342985098/lib/utils/utils.min.js
// @require           https://cdn.jsdelivr.net/npm/gm4-polyfill@1.0.1/gm4-polyfill.min.js#sha256-qmLl2Ly0/+2K+HHP76Ul+Wpy1Z41iKtzptPD1Nt8gSk=
// @require           https://cdn.jsdelivr.net/npm/jquery@3.6.0/dist/jquery.min.js#sha256-/xUj+3OJU5yExlq6GSYGSHk7tPXikynS7ogEvDej/m4=
// @require           https://cdn.jsdelivr.net/npm/@violentmonkey/shortcut@1.2.4/dist/index.js#sha256-ac//SadDzOEkne8ECdtu6YwY5YJj0oJBazsbYk/mvzg=
//
// @match             *://greasyfork.org/*
// @match             *://sleazyfork.org/*
// @connect           greasyfork.org
//
// @grant             GM.deleteValue
// @grant             GM.getValue
// @grant             GM.info
// @grant             GM.listValues
// @grant             GM.registerMenuCommand
// @grant             GM.setValue
// @grant             GM.xmlHttpRequest
//
// @grant             GM_deleteValue
// @grant             GM_getValue
// @grant             GM_info
// @grant             GM_listValues
// @grant             GM_registerMenuCommand
// @grant             GM_setValue
// @grant             GM_xmlhttpRequest
//
// @run-at            document-idle
// @inject-into       page
// ==/UserScript==

/* global $, GM_config, MonkeyUtils, VM */

(() => {
  'use strict'

  //* GM_config
  GM_config.init({
    id: 'config',
    title: `${GM.info.script.name} v${GM.info.script.version} Settings`,
    fields: {
      hideNonLatinScripts: {
        label: 'Hide non-Latin scripts, press "Ctrl + Alt + L" to show non-Latin scripts',
        section: ['Features'],
        labelPos: 'right',
        type: 'checkbox',
        default: true
      },
      hideBlacklistedScripts: {
        label: 'Hide blacklisted scripts, press "Ctrl + Alt + B" to show Blacklisted scripts',
        labelPos: 'right',
        type: 'checkbox',
        default: true
      },
      hideScript: {
        label: 'Add a button to hide the script, press "Ctrl + Alt + H" to show Hidden scripts',
        labelPos: 'right',
        type: 'checkbox',
        default: true
      },
      installButton: {
        label: 'Add a button to install the script directly',
        labelPos: 'right',
        type: 'checkbox',
        default: true
      },
      showTotalInstalls: {
        label: 'Shows the number of daily and total installations on the user profile',
        labelPos: 'right',
        type: 'checkbox',
        default: true
      },
      logging: {
        label: 'Logging',
        section: ['Develop'],
        labelPos: 'right',
        type: 'checkbox',
        default: false
      }
    },
    events: {
      save: () => {
        GM_config.close()
        window.location.reload(false)
      }
    }
  })
  GM.registerMenuCommand('Configure', () => GM_config.open())

  //* MonkeyUtils
  const MU = new MonkeyUtils({
    name: GM.info.script.name,
    version: GM.info.script.version,
    author: GM.info.script.author,
    color: '#ff0000',
    logging: GM_config.get('logging')
  })
  MU.init()

  //* Constants
  const cachePeriod = 1800000 // 0.5 hours
  const nonLatins = /[^\p{Script=Latin}\p{Script=Common}\p{Script=Inherited}]/gu
  const blacklist = new RegExp([ /* cSpell: disable-next-line */
    '\\bagar((.)?io)?\\b', '\\bagma((.)?io)?\\b', '\\baimbot\\b', '\\barras((.)?io)?\\b', '\\bbot(s)?\\b', '\\bbubble((.)?am)?\\b', '\\bcheat(s)?\\b', '\\bdiep((.)?io)?\\b', '\\bfreebitco((.)?in)?\\b', '\\bgota((.)?io)?\\b', '\\bhack(s)?\\b', '\\bkrunker((.)?io)?\\b', '\\blostworld((.)?io)?\\b', '\\bmoomoo((.)?io)?\\b', '\\broblox(.com)?\\b', '\\bshell\\sshockers\\b', '\\bshellshock((.)?io)?\\b', '\\bshellshockers\\b', '\\bskribbl((.)?io)?\\b', '\\bslither((.)?io)?\\b', '\\bsurviv((.)?io)?\\b', '\\btaming((.)?io)?\\b', '\\bvenge((.)?io)?\\b', '\\bvertix((.)?io)?\\b', '\\bzombs((.)?io)?\\b', '\\p{Extended_Pictographic}'
  ].join('|'), 'giu')
  const lang = $('html').attr('lang')
  const locales = { /* cSpell: disable */
    de: {
      downgrade: 'Auf zurückstufen',
      install: 'Installieren',
      reinstall: 'Erneut installieren',
      update: 'Auf aktualisieren'
    },
    en: {
      downgrade: 'Downgrade to',
      install: 'Install',
      reinstall: 'Reinstall',
      update: 'Update to'
    },
    es: {
      downgrade: 'Degradar a',
      install: 'Instalar',
      reinstall: 'Reinstalar',
      update: 'Actualizar a'
    },
    fr: {
      downgrade: 'Revenir à',
      install: 'Installer',
      reinstall: 'Réinstaller',
      update: 'Mettre à'
    },
    it: {
      downgrade: 'Riporta a',
      install: 'Installa',
      reinstall: 'Reinstalla',
      update: 'Aggiorna a'
    },
    ru: {
      downgrade: 'Откатить до',
      install: 'Установить',
      reinstall: 'Переустановить',
      update: 'Обновить до'
    },
    'zh-CN': {
      downgrade: '降级到',
      install: '安装',
      reinstall: '重新安装',
      update: '更新到'
    }
  } /* cSpell: enable */
  const scriptList = $('.script-list')
  const userScriptList = $('#user-script-list')
  const listSort = $('#script-list-sort')

  MU.log(nonLatins)
  MU.log(blacklist)

  //* Shortcuts
  VM.shortcut.register('ctrl-alt-l', () => {
    $('.script-list li.non-latin').toggle()
  })
  VM.shortcut.register('ctrl-alt-b', () => {
    $('.script-list li.blacklisted').toggle()
  })
  VM.shortcut.register('ctrl-alt-h', () => {
    $('.script-list li.hidden').toggle()
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
      .after(`<a class="install-link" href="${url}" style="float: right; zoom: 0.7; -moz-transform: scale(0.7); text-decoration: none;">${label} ${version}</a>`)
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

  /**
   * Hide scripts
   * @param {Object} element
   * @param {number} id
   */
  const hideScript = async (element, id) => {
    // add button to hide the script
    $(element)
      .find('.badge-js, .badge-css')
      .before('<span class="block-button" role="button" style="cursor: pointer; text-decoration: underline; font-size: 70%">Hide this script</span>')

    // if is in list hide it
    if (id in JSON.parse(await GM.getValue('hiddenList', '{}'))) {
      $(element).addClass('hidden').css('background-color', 'rgba(255, 0, 0, 0.10)').hide()
    }

    // on click...
    $(element).find('.block-button').click(async () => {
      const hiddenList = JSON.parse(await GM.getValue('hiddenList', '{}'))

      // ...if it is not in the list add it and hide it...
      if (!(id in hiddenList)) {
        hiddenList[id] = id

        GM.setValue('hiddenList', JSON.stringify(hiddenList))
        $(element).hide(750).addClass('hidden').css('background-color', 'rgba(255, 0, 0, 0.10)')
      } else { // ...else remove it
        delete hiddenList[id]

        GM.setValue('hiddenList', JSON.stringify(hiddenList))
        $(element).removeClass('hidden').css('background-color', '')
      }
    })
  }

  //* Script
  clearOldCache()

  scriptList.find('li').each((index, element) => {
    const id = $(element).data('script-id')

    if (GM_config.get('hideNonLatinScripts')) hideNonLatinScripts(element)
    if (GM_config.get('hideBlacklistedScripts')) hideBlacklistedScripts(element)
    if (GM_config.get('hideScript')) hideScript(element, id)

    if (GM_config.get('installButton')) {
      getData(id).then((data) => {
        const version = data.version
        const url = data.code_url

        isInstalled(data.name, data.namespace).then((data) => {
          const update = compareVersions(version, data)
          const label = getLabel(update)

          addInstallButton(element, url, label, version)
        }).catch((error) => MU.error(error))
      }).catch((error) => MU.error(error))
    }
  })

  if (GM_config.get('showTotalInstalls')) {
    if (userScriptList.length) {
      const dailyInstalls = []
      const totalInstalls = []

      userScriptList.find('li dd.script-list-daily-installs').each((index, element) => {
        dailyInstalls.push(parseInt($(element).text().replace(/\D/g, ''), 10))
      })
      userScriptList.find('li dd.script-list-total-installs').each((index, element) => {
        totalInstalls.push(parseInt($(element).text().replace(/\D/g, ''), 10))
      })

      listSort.find('.list-option.list-current:nth-child(1), .list-option:not(list-current):nth-child(1) a').append(`<span> (${dailyInstalls.reduce((a, b) => a + b, 0).toLocaleString()})</span>`)
      listSort.find('.list-option.list-current:nth-child(2), .list-option:not(list-current):nth-child(2) a').append(`<span> (${totalInstalls.reduce((a, b) => a + b, 0).toLocaleString()})</span>`)
    }
  }
})()
