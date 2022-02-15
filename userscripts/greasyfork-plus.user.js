// ==UserScript==
// @name            Greasy Fork+
// @name:it         Greasy Fork+
// @author          Davide <iFelix18@protonmail.com>
// @namespace       https://github.com/iFelix18
// @icon            https://www.google.com/s2/favicons?domain=https://greasyfork.org
// @description     Adds various features and improves the Greasy Fork experience
// @description:it  Aggiunge varie funzionalità e migliora l'esperienza di Greasy Fork
// @copyright       2021, Davide (https://github.com/iFelix18)
// @license         MIT
// @version         1.4.13
// @homepage        https://github.com/iFelix18/Userscripts#readme
// @homepageURL     https://github.com/iFelix18/Userscripts#readme
// @supportURL      https://github.com/iFelix18/Userscripts/issues
// @updateURL       https://raw.githubusercontent.com/iFelix18/Userscripts/master/userscripts/meta/greasyfork-plus.meta.js
// @downloadURL     https://raw.githubusercontent.com/iFelix18/Userscripts/master/userscripts/greasyfork-plus.user.js
// @require         https://cdn.jsdelivr.net/gh/sizzlemctwizzle/GM_config@43fd0fe4de1166f343883511e53546e87840aeaf/gm_config.min.js
// @require         https://cdn.jsdelivr.net/gh/iFelix18/Userscripts@utils-2.3.4/lib/utils/utils.min.js
// @require         https://cdn.jsdelivr.net/npm/jquery@3.6.0/dist/jquery.min.js
// @require         https://cdn.jsdelivr.net/npm/@violentmonkey/shortcut@1.2.6/dist/index.js
// @match           *://greasyfork.org/*
// @match           *://sleazyfork.org/*
// @connect         greasyfork.org
// @grant           GM_getValue
// @grant           GM_setValue
// @grant           GM.deleteValue
// @grant           GM.getValue
// @grant           GM.listValues
// @grant           GM.notification
// @grant           GM.registerMenuCommand
// @grant           GM.setValue
// @grant           GM.xmlHttpRequest
// @run-at          document-idle
// @inject-into     page
// ==/UserScript==

/* global $, GM_config, MonkeyUtils, VM */

(() => {
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
      milestoneNotification: {
        label: 'Get notified whenever your total installs got over any of these milestone (leave blank to disable) - Separate milestones with a comma!',
        labelPos: 'left',
        type: 'text',
        title: 'Separate milestones with a comma!',
        size: 150,
        default: '10, 100, 500, 1000, 2500, 5000, 10000, 100000, 1000000'
      },
      logging: {
        label: 'Logging',
        section: ['Develop'],
        labelPos: 'right',
        type: 'checkbox',
        default: false
      },
      clearCache: {
        label: 'Clear the cache',
        type: 'button',
        click: async () => {
          const values = await GM.listValues()

          for (const value of values) {
            const cache = await GM.getValue(value) // get cache
            if (cache.time) { GM.deleteValue(value) } // delete cache
          }

          MU.log('cache cleared')
          GM_config.close()
        }
      }
    },
    css: ':root{--mainBackground:#343433;--background:#282828;--text:#fff}#config{background-color:var(--mainBackground);color:var(--text)}#config .section_header{background-color:var(--background);border-bottom:none;border:1px solid var(--background);color:var(--text)}#config .section_desc{background-color:var(--background);border-top:none;border:1px solid var(--background);color:var(--text)}#config .reset{color:var(--text)}',
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
  MU.init('config')

  //* Constants
  const cachePeriod = 60_000 // 1 minute
  const logo = 'data:image/png;base64,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'
  const color = 'rgba(255, 0, 0, 0.10)'
  const nonLatins = /[^\p{Script=Latin}\p{Script=Common}\p{Script=Inherited}]/gu
  const blacklist = new RegExp([ /* cSpell: disable-next-line */
    '\\bagar((.)?io)?\\b', '\\bagma((.)?io)?\\b', '\\baimbot\\b', '\\barras((.)?io)?\\b', '\\bbot(s)?\\b', '\\bbubble((.)?am)?\\b', '\\bcheat(s)?\\b', '\\bdiep((.)?io)?\\b', '\\bfreebitco((.)?in)?\\b', '\\bgota((.)?io)?\\b', '\\bhack(s)?\\b', '\\bkrunker((.)?io)?\\b', '\\blostworld((.)?io)?\\b', '\\bmoomoo((.)?io)?\\b', '\\broblox(.com)?\\b', '\\bshell\\sshockers\\b', '\\bshellshock((.)?io)?\\b', '\\bshellshockers\\b', '\\bskribbl((.)?io)?\\b', '\\bslither((.)?io)?\\b', '\\bsurviv((.)?io)?\\b', '\\btaming((.)?io)?\\b', '\\bvenge((.)?io)?\\b', '\\bvertix((.)?io)?\\b', '\\bzombs((.)?io)?\\b', '\\p{Extended_Pictographic}'
  ].join('|'), 'giu')
  const milestones = GM_config.get('milestoneNotification').replace(/\s/g, '').split(',').map((element) => Number(element))
  const lang = $('html').attr('lang')
  const locales = { /* cSpell: disable */
    de: {
      downgrade: 'Auf zurückstufen',
      hide: '🛇 Dieses skript ausblenden',
      install: 'Installieren',
      notHide: '✓ Dieses skript nicht ausblenden',
      milestone: 'Herzlichen Glückwunsch, Ihre Skripte haben den Meilenstein von insgesamt $1 Installationen überschritten!',
      reinstall: 'Erneut installieren',
      update: 'Auf aktualisieren'
    },
    en: {
      downgrade: 'Downgrade to',
      hide: '🛇 Hide this script',
      install: 'Install',
      notHide: '✓ Not hide this script',
      milestone: 'Congrats, your scripts got over the milestone of $1 total installs!',
      reinstall: 'Reinstall',
      update: 'Update to'
    },
    es: {
      downgrade: 'Degradar a',
      hide: '🛇 Ocultar este script',
      install: 'Instalar',
      notHide: '✓ No ocultar este script',
      milestone: '¡Felicidades, sus scripts superaron el hito de $1 instalaciones totales!',
      reinstall: 'Reinstalar',
      update: 'Actualizar a'
    },
    fr: {
      downgrade: 'Revenir à',
      hide: '🛇 Cacher ce script',
      install: 'Installer',
      notHide: '✓ Ne pas cacher ce script',
      milestone: 'Félicitations, vos scripts ont franchi le cap des $1 installations au total!',
      reinstall: 'Réinstaller',
      update: 'Mettre à'
    },
    it: {
      downgrade: 'Riporta a',
      hide: '🛇 Nascondi questo script',
      install: 'Installa',
      notHide: '✓ Non nascondere questo script',
      milestone: 'Congratulazioni, i tuoi script hanno superato il traguardo di $1 installazioni totali!',
      reinstall: 'Reinstalla',
      update: 'Aggiorna a'
    },
    ru: {
      downgrade: 'Откатить до',
      hide: '🛇 Скрыть этот скрипт',
      install: 'Установить',
      notHide: '✓ Не скрывать этот сценарий',
      milestone: 'Поздравляем, ваши скрипты преодолели рубеж в $1 установок!',
      reinstall: 'Переустановить',
      update: 'Обновить до'
    },
    'zh-CN': {
      downgrade: '降级到',
      hide: '🛇 隐藏此脚本',
      install: '安装',
      notHide: '✓ 不隐藏此脚本',
      milestone: '恭喜，您的脚本超过了 $1 次总安装的里程碑！',
      reinstall: '重新安装',
      update: '更新到'
    }
  } /* cSpell: enable */
  const scriptList = $('.script-list')
  const userScriptList = $('#user-script-list')
  const listSort = $('#script-list-sort')
  const scriptInfo = $('#script-info')
  const userID = $('.user-profile-link a').attr('href')

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

    if (nonLatins.test(name) || nonLatins.test(description)) {
      $(element).addClass('non-latin').css('background-color', color).hide()
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

    if (blacklist.test(name) || blacklist.test(description)) {
      $(element).addClass('blacklisted').css('background-color', color).hide()
    }
  }

  /**
   * Hide scripts
   * @param {Object}  element
   * @param {number}  id
   * @param {boolean} list
   */
  const hideScript = async (element, id, list) => {
    // if is in list hide it
    if (id in JSON.parse(await GM.getValue('hiddenList', '{}')) && list) {
      $(element).addClass('hidden').css('background-color', color).hide()
    } else if (id in JSON.parse(await GM.getValue('hiddenList', '{}')) && !list) {
      $(element).addClass('hidden').css('background-color', color)
    }

    // add button to hide the script
    if (list) {
      $(element)
        .find('.badge-js, .badge-css')
        .before(`<span class="block-button" role="button" style="cursor: pointer; font-size: 70%;">${blockLabel($(element).hasClass('hidden'))}</span>`)
    } else {
      $(element)
        .find('header h2')
        .append(`<span class="block-button" role="button" style="cursor: pointer; font-size: 50%; margin-left: 1ex;">${blockLabel($(element).hasClass('hidden'))}</span>`)
    }

    // on click...
    $(element).find('.block-button').click(async () => {
      const hiddenList = JSON.parse(await GM.getValue('hiddenList', '{}'))

      // ...if it is not in the list add it and hide it...
      if (!(id in hiddenList)) {
        hiddenList[id] = id

        GM.setValue('hiddenList', JSON.stringify(hiddenList))

        if (list) {
          $(element).hide(750).addClass('hidden').css('background-color', color)
            .find('.block-button').text(blockLabel($(element).hasClass('hidden')))
        } else {
          $(element).addClass('hidden').css('background-color', color)
            .find('.block-button').text(blockLabel($(element).hasClass('hidden')))
        }
      } else { // ...else remove it
        delete hiddenList[id]

        GM.setValue('hiddenList', JSON.stringify(hiddenList))
        $(element).removeClass('hidden').css('background-color', '')
          .find('.block-button').text(blockLabel($(element).hasClass('hidden')))
      }
    })
  }

  /**
   * Get script data from Greasy Fork API
   * @param {number} id
   * @returns {Promise}
   */
  const getScriptData = async (id) => {
    const cache = await GM.getValue(id) // get cache

    return new Promise((resolve, reject) => {
      if (cache !== undefined && ((Date.now() - cache.time) < cachePeriod)) { // cache valid
        MU.log(`script ${id} data from cache`)
        resolve(cache.data)
      } else { // cache not valid
        GM.xmlHttpRequest({
          method: 'GET',
          url: `https://${window.location.hostname}/scripts/${id}.json`,
          onload: (response) => {
            MU.log(`${response.status}: ${response.finalUrl}`)
            const data = JSON.parse(response.responseText)
            GM.setValue(id, { data, time: Date.now() }) // set cache
            MU.log(`script ${id} data from api`)
            resolve(data)
          }
        })
      }
    })
  }

  /**
   * Get user data from Greasy Fork API
   * @param {string} userID
   * @returns {Promise}
   */
  const getUserData = (userID) => {
    return new Promise((resolve, reject) => {
      GM.xmlHttpRequest({
        method: 'GET',
        url: `https://${window.location.hostname}/users/${userID}.json`,
        onload: (response) => {
          MU.log(`${response.status}: ${response.finalUrl}`)
          const data = JSON.parse(response.responseText)
          resolve(data)
        }
      })
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
          (data.installed) ? resolve(data.version) : resolve()
        })
        return
      }

      resolve()
    })
  }

  /**
   * Compare two version
   * @param {string} v1
   * @param {string} v2
   * @returns {number}
   */
  const compareVersions = (v1, v2) => {
    if (v1 === null || v2 === null) return
    if (v1 === v2) return 0

    const sv1 = v1.split('.').map((index) => +index)
    const sv2 = v2.split('.').map((index) => +index)

    for (let index = 0; index < Math.max(sv1.length, sv2.length); index++) {
      if (sv1[index] > sv2[index]) return 1
      if (sv1[index] < sv2[index]) return -1
    }

    return 0
  }

  /**
   * Get user total installs
   * @param {object} data
   * @returns {Promise}
   */
  const getTotalInstalls = (data) => {
    return new Promise((resolve, reject) => {
      const totalInstalls = []

      $.each(data.scripts, (index, element) => {
        totalInstalls.push(Number.parseInt(element.total_installs, 10))
      })

      resolve(totalInstalls.reduce((a, b) => a + b, 0))
    })
  }

  /**
   * Return label for the install button
   * @param {number} update
   * @returns {string}
   */
  const installLabel = (update) => {
    switch (update) {
      case undefined: {
        return locales[lang] ? locales[lang].install : locales.en.install
      }
      case 1: {
        return locales[lang] ? locales[lang].update : locales.en.update
      }
      case -1: {
        return locales[lang] ? locales[lang].downgrade : locales.en.downgrade
      }
      default: {
        return locales[lang] ? locales[lang].reinstall : locales.en.reinstall
      }
    }
  }

  /**
   * Return label for the hide script button
   * @param {boolean} hidden
   * @returns {string}
   */
  const blockLabel = (hidden) => {
    return hidden ? (locales[lang] ? locales[lang].notHide : locales.en.notHide) : (locales[lang] ? locales[lang].hide : locales.en.hide)
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

    for (const value of values) {
      const cache = await GM.getValue(value) // get cache
      if ((Date.now() - cache.time) > cachePeriod) { GM.deleteValue(value) } // delete old cache
    }
  }

  //* Script
  clearOldCache()

  scriptList.find('li').each((index, element) => {
    const id = $(element).data('script-id')

    if (GM_config.get('hideNonLatinScripts')) hideNonLatinScripts(element)
    if (GM_config.get('hideBlacklistedScripts')) hideBlacklistedScripts(element)
    if (GM_config.get('hideScript')) hideScript(element, id, true)

    if (GM_config.get('installButton')) {
      getScriptData(id).then((data) => {
        const version = data.version
        const url = data.code_url

        isInstalled(data.name, data.namespace).then((data) => {
          const update = compareVersions(version, data)
          const label = installLabel(update)

          addInstallButton(element, url, label, version)
        }).catch((error) => MU.error(error))
      }).catch((error) => MU.error(error))
    }
  })

  if (GM_config.get('hideScript') && scriptInfo.length > 0) {
    const id = $(scriptInfo).find('.install-link').data('script-id')

    hideScript(scriptInfo, id, false)
  }

  if (GM_config.get('showTotalInstalls') && userScriptList.length > 0) {
    const dailyInstalls = []
    const totalInstalls = []

    userScriptList.find('li dd.script-list-daily-installs').each((index, element) => {
      dailyInstalls.push(Number.parseInt($(element).text().replace(/\D/g, ''), 10))
    })
    userScriptList.find('li dd.script-list-total-installs').each((index, element) => {
      totalInstalls.push(Number.parseInt($(element).text().replace(/\D/g, ''), 10))
    })

    listSort.find('.list-option.list-current:nth-child(1), .list-option:not(list-current):nth-child(1) a').append(`<span> (${dailyInstalls.reduce((a, b) => a + b, 0).toLocaleString()})</span>`)
    listSort.find('.list-option.list-current:nth-child(2), .list-option:not(list-current):nth-child(2) a').append(`<span> (${totalInstalls.reduce((a, b) => a + b, 0).toLocaleString()})</span>`)
  }

  if (GM_config.get('milestoneNotification')) {
    if (!userID) return

    getUserData(userID.match(/(?<=s\/).*?(?=-)/g)).then((data) => {
      getTotalInstalls(data).then(async (totalInstalls) => {
        const lastMilestone = await GM.getValue('lastMilestone', 0)
        const milestone = $($.grep(milestones, (milestone) => totalInstalls >= milestone)).get(-1)

        MU.log(`total installs are "${totalInstalls}", milestone reached is "${milestone}", last milestone reached is "${lastMilestone}"`)

        if (milestone <= lastMilestone) return

        GM.setValue('lastMilestone', milestone)

        GM.notification({
          text: (locales[lang] ? locales[lang].milestone : locales.en.milestone).replace('$1', milestone.toLocaleString()),
          title: GM.info.script.name,
          image: logo,
          onclick: () => {
            window.location = `https://${window.location.hostname}${userID}#user-script-list-section`
          }
        })
      }).catch((error) => MU.error(error))
    }).catch((error) => MU.error(error))
  }
})()
