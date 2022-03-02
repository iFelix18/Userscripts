// ==UserScript==
// @name               Greasy Fork+
// @name:de            Greasy Fork+
// @name:es            Greasy Fork+
// @name:fr            Greasy Fork+
// @name:it            Greasy Fork+
// @name:ru            Greasy Fork+
// @name:zh-CN         Greasy Fork+
// @author             Davide <iFelix18@protonmail.com>
// @namespace          https://github.com/iFelix18
// @icon               https://www.google.com/s2/favicons?domain=https://greasyfork.org
// @description        Adds various features and improves the Greasy Fork experience
// @description:de     Fügt verschiedene Funktionen hinzu und verbessert das Greasy Fork-Erlebnis
// @description:es     Agrega varias funciones y mejora la experiencia de Greasy Fork
// @description:fr     Ajoute diverses fonctionnalités et améliore l'expérience Greasy Fork
// @description:it     Aggiunge varie funzionalità e migliora l'esperienza di Greasy Fork
// @description:ru     Добавляет различные функции и улучшает работу с Greasy Fork
// @description:zh-CN  添加各种功能并改善 Greasy Fork 体验
// @copyright          2021, Davide (https://github.com/iFelix18)
// @license            MIT
// @version            1.8.6
// @homepage           https://github.com/iFelix18/Userscripts#readme
// @homepageURL        https://github.com/iFelix18/Userscripts#readme
// @supportURL         https://github.com/iFelix18/Userscripts/issues
// @updateURL          https://raw.githubusercontent.com/iFelix18/Userscripts/master/userscripts/meta/greasyfork-plus.meta.js
// @downloadURL        https://raw.githubusercontent.com/iFelix18/Userscripts/master/userscripts/greasyfork-plus.user.js
// @require            https://cdn.jsdelivr.net/gh/sizzlemctwizzle/GM_config@43fd0fe4de1166f343883511e53546e87840aeaf/gm_config.min.js
// @require            https://cdn.jsdelivr.net/npm/@ifelix18/utils@5.0.0/lib/index.min.js
// @require            https://cdn.jsdelivr.net/npm/jquery@3.6.0/dist/jquery.min.js
// @require            https://cdn.jsdelivr.net/npm/@violentmonkey/shortcut@1.2.6/dist/index.min.js
// @match              *://greasyfork.org/*
// @match              *://sleazyfork.org/*
// @connect            greasyfork.org
// @compatible         chrome
// @compatible         edge
// @compatible         firefox
// @compatible         safari
// @grant              GM_getValue
// @grant              GM_setValue
// @grant              GM.addStyle
// @grant              GM.deleteValue
// @grant              GM.getValue
// @grant              GM.notification
// @grant              GM.registerMenuCommand
// @grant              GM.setValue
// @grant              GM.xmlHttpRequest
// @run-at             document-idle
// @inject-into        page
// ==/UserScript==

/* global $, GM_configStruct, u, UserscriptUtils, VM */

(async () => {
  u.migrateConfig('config', 'greasyfork-plus') // migrate to the new config ID

  //* Constants
  const logo = 'data:image/png;base64,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'
  const nonLatins = /[^\p{Script=Latin}\p{Script=Common}\p{Script=Inherited}]/gu
  const blacklist = new RegExp([ /* cSpell: disable-next-line */
    '\\bagar((.)?io)?\\b', '\\bagma((.)?io)?\\b', '\\baimbot\\b', '\\barras((.)?io)?\\b', '\\bbot(s)?\\b', '\\bbubble((.)?am)?\\b', '\\bcheat(s)?\\b', '\\bdiep((.)?io)?\\b', '\\bfreebitco((.)?in)?\\b', '\\bgota((.)?io)?\\b', '\\bhack(s)?\\b', '\\bkrunker((.)?io)?\\b', '\\blostworld((.)?io)?\\b', '\\bmoomoo((.)?io)?\\b', '\\broblox(.com)?\\b', '\\bshell\\sshockers\\b', '\\bshellshock((.)?io)?\\b', '\\bshellshockers\\b', '\\bskribbl((.)?io)?\\b', '\\bslither((.)?io)?\\b', '\\bsurviv((.)?io)?\\b', '\\btaming((.)?io)?\\b', '\\bvenge((.)?io)?\\b', '\\bvertix((.)?io)?\\b', '\\bzombs((.)?io)?\\b', '\\p{Extended_Pictographic}'
  ].join('|'), 'giu')
  const hiddenList = JSON.parse(await GM.getValue('hiddenList', '{}'))
  const lang = $('html').attr('lang')
  const locales = { /* cSpell: disable */
    de: {
      downgrade: 'Auf zurückstufen',
      hide: '❌ Dieses skript ausblenden',
      install: 'Installieren',
      notHide: '✔️ Dieses skript nicht ausblenden',
      milestone: 'Herzlichen Glückwunsch, Ihre Skripte haben den Meilenstein von insgesamt $1 Installationen überschritten!',
      reinstall: 'Erneut installieren',
      update: 'Auf aktualisieren'
    },
    en: {
      downgrade: 'Downgrade to',
      hide: '❌ Hide this script',
      install: 'Install',
      notHide: '✔️ Not hide this script',
      milestone: 'Congrats, your scripts got over the milestone of $1 total installs!',
      reinstall: 'Reinstall',
      update: 'Update to'
    },
    es: {
      downgrade: 'Degradar a',
      hide: '❌ Ocultar este script',
      install: 'Instalar',
      notHide: '✔️ No ocultar este script',
      milestone: '¡Felicidades, sus scripts superaron el hito de $1 instalaciones totales!',
      reinstall: 'Reinstalar',
      update: 'Actualizar a'
    },
    fr: {
      downgrade: 'Revenir à',
      hide: '❌ Cacher ce script',
      install: 'Installer',
      notHide: '✔️ Ne pas cacher ce script',
      milestone: 'Félicitations, vos scripts ont franchi le cap des $1 installations au total!',
      reinstall: 'Réinstaller',
      update: 'Mettre à'
    },
    it: {
      downgrade: 'Riporta a',
      hide: '❌ Nascondi questo script',
      install: 'Installa',
      notHide: '✔️ Non nascondere questo script',
      milestone: 'Congratulazioni, i tuoi script hanno superato il traguardo di $1 installazioni totali!',
      reinstall: 'Reinstalla',
      update: 'Aggiorna a'
    },
    ru: {
      downgrade: 'Откатить до',
      hide: '❌ Скрыть этот скрипт',
      install: 'Установить',
      notHide: '✔️ Не скрывать этот сценарий',
      milestone: 'Поздравляем, ваши скрипты преодолели рубеж в $1 установок!',
      reinstall: 'Переустановить',
      update: 'Обновить до'
    },
    'zh-CN': {
      downgrade: '降级到',
      hide: '❌ 隐藏此脚本',
      install: '安装',
      notHide: '✔️ 不隐藏此脚本',
      milestone: '恭喜，您的脚本超过了 $1 次总安装的里程碑！',
      reinstall: '重新安装',
      update: '更新到'
    }
  } /* cSpell: enable */

  //* GM_config
  const config = new GM_configStruct()
  const fields = {
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
    }
  }
  const title = `${GM.info.script.name} v${GM.info.script.version} Settings`
  const id = 'greasyfork-plus'

  if (document.location.pathname === '/settings') {
    $('html').attr('style', 'background: none !important;')
    document.title = title
    config.init({
      frame: $('body > .width-constraint').empty().get(0),
      id,
      title,
      fields,
      css: '#greasyfork-plus *{font-family:Open Sans,sans-serif,Segoe UI Emoji!important}#greasyfork-plus{background-color:#fff!important;border-radius:5px!important;border:1px solid #bbb!important;box-shadow:0 0 5px #ddd!important;box-sizing:border-box!important;height:auto!important;list-style-type:none!important;margin-bottom:0!important;margin-left:auto!important;margin-right:auto!important;margin-top:14px!important;max-height:none!important;max-width:1200px!important;padding:0 1em 1em!important;position:static!important;width:auto!important}#greasyfork-plus .config_header{display:block!important;font-size:1.5em!important;font-weight:700!important;margin-bottom:.83em!important;margin-left:0!important;margin-right:0!important;margin-top:.83em!important}#greasyfork-plus .field_label{font-size:.85em!important;font-weight:500!important}#greasyfork-plus .section_header{background-color:#670000!important;background-image:linear-gradient(#670000,#900)!important;border:1px solid transparent!important}#greasyfork-plus_closeBtn{display:none!important}',
      events: {
        init: () => {
          config.open()
        },
        save: () => {
          window.location = document.referrer
        }
      }
    })
  } else {
    config.init({
      id,
      title,
      fields,
      events: {
        init: () => {
          if (GM.info.scriptHandler !== 'Userscripts') { //! Userscripts Safari: GM.registerMenuCommand is missing
            GM.registerMenuCommand('Configure', () => config.open())
          }
        },
        save: () => {
          config.close()
          setTimeout(window.location.reload(false), 500)
        }
      }
    })
  }

  //* Utils
  const UU = new UserscriptUtils({
    name: GM.info.script.name,
    version: GM.info.script.version,
    author: GM.info.script.author,
    logging: config.get('logging')
  })
  UU.init(id)
  UU.log(nonLatins)
  UU.log(blacklist)
  UU.log(hiddenList)

  //* Shortcuts
  const { register } = VM.shortcut
  register('ctrl-alt-l', () => {
    $('.script-list li.non-latin').toggle()
  })
  register('ctrl-alt-b', () => {
    $('.script-list li.blacklisted').toggle()
  })
  register('ctrl-alt-h', () => {
    $('.script-list li.hidden').toggle()
  })

  //* Functions
  /**
   * Adds a link to the menu to access the script configuration
   */
  const addSettings = () => {
    const menu = `<li class='${GM.info.script.name.toLowerCase().replace(/\s/g, '-')}-settings'><a href='/settings' title='Settings'>${GM.info.script.name}</a></li>`
    if (document.location.pathname !== '/settings') $('#site-nav > nav > li').first().before(menu)
  }

  /**
   * Adds buttons to the side menu to quickly show/hide scripts hidden by filters
   */
  const addOptions = () => {
    // create menu
    const html = `
    <div id="${GM.info.script.name.toLowerCase().replace(/\s/g, '-')}-options" class="list-option-group">${GM.info.script.name} filters:
      <ul>
        <li class="list-option non-latin"><a href="/non-latin-scripts" onclick="return false">Non-Latin scripts</a></li>
        <li class="list-option blacklisted"><a href="/blacklisted-scripts" onclick="return false">Blacklisted scripts</a></li>
        <li class="list-option hidden"><a href="/hidden-scripts" onclick="return false">Hidden scripts</a></li>
      </ul>
    </div>
    `
    $('.list-option-groups > div').first().before(html)

    // click
    $('.list-option-group li.non-latin').click(() => $('.script-list li.non-latin').toggle())
    $('.list-option-group li.blacklisted').click(() => $('.script-list li.blacklisted').toggle())
    $('.list-option-group li.hidden').click(() => $('.script-list li.hidden').toggle())
  }

  /**
   * Get script data from Greasy Fork API
   *
   * @param {number} id Script ID
   * @returns {Promise} Script data
   */
  const getScriptData = async (id) => {
    return new Promise((resolve, reject) => {
      GM.xmlHttpRequest({
        method: 'GET',
        url: `https://${window.location.hostname}/scripts/${id}.json`,
        onload: (response) => {
          UU.log(`${response.status}: ${response.finalUrl}`)
          const data = JSON.parse(response.responseText)
          resolve(data)
        }
      })
    })
  }

  /**
   * Get user data from Greasy Fork API
   *
   * @param {string} userID User ID
   * @returns {Promise} User data
   */
  const getUserData = (userID) => {
    return new Promise((resolve, reject) => {
      GM.xmlHttpRequest({
        method: 'GET',
        url: `https://${window.location.hostname}/users/${userID}.json`,
        onload: (response) => {
          UU.log(`${response.status}: ${response.finalUrl}`)
          const data = JSON.parse(response.responseText)
          resolve(data)
        }
      })
    })
  }

  /**
   * Get user total installs
   *
   * @param {object} data Data
   * @returns {Promise} Total installs
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
   * Returns installed version
   *
   * @param {string} name Script name
   * @param {string} namespace Script namespace
   * @returns {string} Installed version
   */
  const isInstalled = (name, namespace) => {
    return new Promise((resolve, reject) => {
      if (window.external && window.external.Violentmonkey) {
        window.external.Violentmonkey.isInstalled(name, namespace).then((data) => resolve(data))
        return
      }

      if (window.external && window.external.Tampermonkey) {
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
   *
   * @param {string} v1 First version
   * @param {string} v2 Second version
   * @returns {number} Comparison value
   */
  const compareVersions = (v1, v2) => {
    if (!v1 || !v2) return
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
   * Return label for the hide script button
   *
   * @param {boolean} hidden Is hidden
   * @returns {string} Label
   */
  const blockLabel = (hidden) => {
    return hidden ? (locales[lang] ? locales[lang].notHide : locales.en.notHide) : (locales[lang] ? locales[lang].hide : locales.en.hide)
  }

  /**
   * Return label for the install button
   *
   * @param {number} update Update value
   * @returns {string} Label
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
   * Hide all scripts with non-Latin characters in the name or description
   *
   * @param {object} element Script
   */
  const hideNonLatinScripts = (element) => {
    const name = $(element).find('.script-link').text()
    const description = $(element).find('.script-description').text()

    if (!name) return

    if (nonLatins.test(name) || nonLatins.test(description)) {
      $(element).addClass('non-latin')
    }
  }

  /**
   * Hide all scripts with blacklisted words in the name or description
   *
   * @param {object} element Script
   */
  const hideBlacklistedScripts = (element) => {
    const name = $(element).find('.script-link').text()
    const description = $(element).find('.script-description').text()

    if (!name) return

    if (blacklist.test(name) || blacklist.test(description)) {
      $(element).addClass('blacklisted')
    }
  }

  /**
   * Hide scripts
   *
   * @param {object} element Script
   * @param {number} id Script ID
   * @param {boolean} list Is list
   */
  const hideScript = async (element, id, list) => {
    // if is in hiddenlist hide it
    if (id in hiddenList) { $(element).addClass('hidden') }

    // add button to hide the script
    $(element).find('.badge-js, .badge-css').before(`<span class="block-button" role="button" style="cursor: pointer; font-size: 70%;">${blockLabel($(element).hasClass('hidden'))}</span>`)
    $(element).find('header h2').append(`<span class="block-button" role="button" style="cursor: pointer; font-size: 50%; margin-left: 1ex;">${blockLabel($(element).hasClass('hidden'))}</span>`)

    // on click...
    $(element).find('.block-button').click(async () => {
      // ...if it is not in the list add it and hide it...
      if (!(id in hiddenList)) {
        hiddenList[id] = id

        GM.setValue('hiddenList', JSON.stringify(hiddenList))

        if (list) {
          $(element).hide(750).addClass('hidden').find('.block-button').text(blockLabel($(element).hasClass('hidden')))
        } else {
          $(element).addClass('hidden').find('.block-button').text(blockLabel($(element).hasClass('hidden')))
        }
      } else { // ...else remove it
        delete hiddenList[id]

        GM.setValue('hiddenList', JSON.stringify(hiddenList))

        $(element).removeClass('hidden').find('.block-button').text(blockLabel($(element).hasClass('hidden')))
      }
    })
  }

  /**
   * Shows a button to install the script
   *
   * @param {object} element Script
   * @param {string} url Script URL
   * @param {string} label Label
   * @param {string} version Script version
   */
  const addInstallButton = (element, url, label, version) => {
    $(element)
      .find('.badge-js, .badge-css')
      .after(`<a class="install-link" href="${url}" style="float: right; zoom: 0.7; -moz-transform: scale(0.7); text-decoration: none;">${label} ${version}</a>`)
  }

  //* Script
  $(document).ready(async () => {
    addSettings()

    if (config.get('hideNonLatinScripts') || config.get('hideBlacklistedScripts') || config.get('hideScript') || config.get('installButton')) {
      if (config.get('hideNonLatinScripts') || config.get('hideBlacklistedScripts') || config.get('hideScript')) {
        addOptions()
        GM.addStyle('.script-list li.non-latin, .script-list li.blacklisted, .script-list li.hidden { display: none; background: rgb(50, 25, 25); color: rgb(232, 230, 227); } .script-list li.non-latin a:not(.install-link), .script-list li.blacklisted a:not(.install-link), .script-list li.hidden a:not(.install-link) { color: rgb(255, 132, 132); } #script-info.hidden, #script-info.hidden .user-content { background: rgb(50, 25, 25); color: rgb(232, 230, 227); } #script-info.hidden a:not(.install-link):not(.install-help-link) { color: rgb(255, 132, 132); } #script-info.hidden code { background-color: transparent; }')
      }

      $('.script-list').find('li').each(async (index, element) => {
        const scriptID = $(element).data('script-id')

        if (config.get('hideNonLatinScripts')) hideNonLatinScripts(element)
        if (config.get('hideBlacklistedScripts')) hideBlacklistedScripts(element)
        if (config.get('hideScript')) hideScript(element, scriptID, true)
        if (config.get('installButton')) {
          const script = await getScriptData(scriptID).then()
          const installed = await isInstalled(script.name, script.namespace).then()
          const update = compareVersions(script.version, installed)
          const label = installLabel(update)

          addInstallButton(element, script.code_url, label, script.version)
        }
      })
      if (config.get('hideScript') && $('#script-info').length > 0) {
        const id = $('#script-info').find('.install-link').data('script-id')
        hideScript($('#script-info'), id, false)
      }
    }
    if (config.get('showTotalInstalls') && $('#user-script-list').length > 0) {
      const dailyInstalls = []
      const totalInstalls = []

      $('#user-script-list').find('li dd.script-list-daily-installs').each((index, element) => {
        dailyInstalls.push(Number.parseInt($(element).text().replace(/\D/g, ''), 10))
      })
      $('#user-script-list').find('li dd.script-list-total-installs').each((index, element) => {
        totalInstalls.push(Number.parseInt($(element).text().replace(/\D/g, ''), 10))
      })

      $('#script-list-sort').find('.list-option.list-current:nth-child(1), .list-option:not(list-current):nth-child(1) a').append(`<span> (${dailyInstalls.reduce((a, b) => a + b, 0).toLocaleString()})</span>`)
      $('#script-list-sort').find('.list-option.list-current:nth-child(2), .list-option:not(list-current):nth-child(2) a').append(`<span> (${totalInstalls.reduce((a, b) => a + b, 0).toLocaleString()})</span>`)
    }
    if (config.get('milestoneNotification')) {
      const userID = $('.user-profile-link a').attr('href')
      const milestones = config.get('milestoneNotification').replace(/\s/g, '').split(',').map((element) => Number(element))

      if (!userID) return

      const userData = await getUserData(userID.match(/\d+(?=\D)/g)).then()
      const totalInstalls = await getTotalInstalls(userData).then()
      const lastMilestone = await GM.getValue('lastMilestone', 0)
      const milestone = $($.grep(milestones, (milestone) => totalInstalls >= milestone)).get(-1)

      UU.log(`total installs are "${totalInstalls}", milestone reached is "${milestone}", last milestone reached is "${lastMilestone}"`)

      if (milestone <= lastMilestone) return

      GM.setValue('lastMilestone', milestone)

      const text = (locales[lang] ? locales[lang].milestone : locales.en.milestone).replace('$1', milestone.toLocaleString())
      if (GM.info.scriptHandler !== 'Userscripts') { //! Userscripts Safari: GM.notification is missing
        GM.notification({
          text,
          title: GM.info.script.name,
          image: logo,
          onclick: () => {
            window.location = `https://${window.location.hostname}${userID}#user-script-list-section`
          }
        })
      } else {
        UU.alert(text)
      }
    }
  })
})()
