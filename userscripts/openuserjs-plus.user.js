// ==UserScript==
// @name               OpenUserJS+
// @name:de            OpenUserJS+
// @name:es            OpenUserJS+
// @name:fr            OpenUserJS+
// @name:it            OpenUserJS+
// @name:ru            OpenUserJS+
// @name:zh-CN         OpenUserJS+
// @author             Davide <iFelix18@protonmail.com>
// @namespace          https://github.com/iFelix18
// @icon               https://www.google.com/s2/favicons?domain=openuserjs.org
// @description        Adds various features and improves the OpenUserJS experience
// @description:de     Fügt verschiedene Funktionen hinzu und verbessert das OpenUserJS-Erlebnis
// @description:es     Agrega varias funciones y mejora la experiencia de OpenUserJS
// @description:fr     Ajoute diverses fonctionnalités et améliore l'expérience OpenUserJS
// @description:it     Aggiunge varie funzionalità e migliora l'esperienza di OpenUserJS
// @description:ru     Добавляет различные функции и улучшает работу с OpenUserJS
// @description:zh-CN  添加各种功能并改善 OpenUserJS 体验
// @copyright          2021, Davide (https://github.com/iFelix18)
// @license            MIT
// @version            1.7.2
// @homepage           https://github.com/iFelix18/Userscripts#readme
// @homepageURL        https://github.com/iFelix18/Userscripts#readme
// @supportURL         https://github.com/iFelix18/Userscripts/issues
// @updateURL          https://raw.githubusercontent.com/iFelix18/Userscripts/master/userscripts/meta/openuserjs-plus.meta.js
// @downloadURL        https://raw.githubusercontent.com/iFelix18/Userscripts/master/userscripts/openuserjs-plus.user.js
// @require            https://cdn.jsdelivr.net/gh/sizzlemctwizzle/GM_config@43fd0fe4de1166f343883511e53546e87840aeaf/gm_config.min.js
// @require            https://cdn.jsdelivr.net/npm/@ifelix18/utils@5.0.0/lib/index.min.js
// @require            https://cdn.jsdelivr.net/npm/jquery@3.6.0/dist/jquery.min.js
// @require            https://cdn.jsdelivr.net/npm/@violentmonkey/shortcut@1.2.6/dist/index.min.js
// @match              *://openuserjs.org/*
// @connect            openuserjs.org
// @grant              GM_getValue
// @grant              GM_setValue
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
  u.migrateConfig('config', 'openuserjs-plus') // migrate to the new config ID

  //* Constants
  const logo = 'data:image/png;base64,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'
  const nonLatins = /[^\p{Script=Latin}\p{Script=Common}\p{Script=Inherited}]/gu
  const blacklist = new RegExp([ /* cspell: disable-next-line */
    '\\bagar((.)?io)?\\b', '\\bagma((.)?io)?\\b', '\\baimbot\\b', '\\barras((.)?io)?\\b', '\\bbot(s)?\\b', '\\bbubble((.)?am)?\\b', '\\bcheat(s)?\\b', '\\bdiep((.)?io)?\\b', '\\bfreebitco((.)?in)?\\b', '\\bgota((.)?io)?\\b', '\\bhack(s)?\\b', '\\bkrunker((.)?io)?\\b', '\\blostworld((.)?io)?\\b', '\\bmoomoo((.)?io)?\\b', '\\broblox(.com)?\\b', '\\bshell\\sshockers\\b', '\\bshellshock((.)?io)?\\b', '\\bshellshockers\\b', '\\bskribbl((.)?io)?\\b', '\\bslither((.)?io)?\\b', '\\bsurviv((.)?io)?\\b', '\\btaming((.)?io)?\\b', '\\bvenge((.)?io)?\\b', '\\bvertix((.)?io)?\\b', '\\bzombs((.)?io)?\\b', '\\p{Extended_Pictographic}'
  ].join('|'), 'giu')
  const hiddenList = JSON.parse(await GM.getValue('hiddenList', '{}'))

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
  const id = 'openuserjs-plus'

  if (document.location.pathname === '/settings') {
    document.title = title
    config.init({
      frame: $('.panel-default').empty().get(0),
      id,
      title,
      fields,
      css: '#openuserjs-plus *{font-family:"Helvetica Neue",Helvetica,Arial,sans-serif!important;color:#2c3e50!important}#openuserjs-plus{background-color:#fff!important;border-radius:4px!important;border:1px solid transparent!important;box-shadow:0 1px 1px rgba(0,0,0,.05)!important;box-sizing:border-box!important;height:auto!important;list-style-type:none!important;margin-bottom:0!important;margin-left:auto!important;margin-right:auto!important;margin-top:0!important;max-height:none!important;max-width:1200px!important;padding:0 1em 1em!important;position:static!important;width:auto!important}#openuserjs-plus .config_header{display:block!important;font-size:1.5em!important;font-weight:700!important;margin-bottom:.83em!important;margin-left:0!important;margin-right:0!important;margin-top:.83em!important}#openuserjs-plus .section_header{background-color:#2c3e50!important;background-image:none!important;border:1px solid transparent!important;color:#fff!important}#openuserjs-plus .field_label{font-size:.85em!important;font-weight:600!important;margin-left:6px!important}#openuserjs-plus_field_milestoneNotification{display:ruby-text-container!important;width:100%!important}#openuserjs-plus_closeBtn{display:none!important}',
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
    $('.panel-default > .table .tr-link.non-latin').toggle()
  })
  register('ctrl-alt-b', () => {
    $('.panel-default > .table .tr-link.blacklisted').toggle()
  })
  register('ctrl-alt-h', () => {
    $('.panel-default > .table .tr-link.hidden-script').toggle()
  })

  //* Functions
  /**
   * Adds a link to the menu to access the script configuration
   */
  const addSettings = () => {
    const menu = `<li class='${GM.info.script.name.toLowerCase().replace(/\s/g, '-')}_settings'><a href='/settings' title='Settings'>${GM.info.script.name}</a></li>`
    if (document.location.pathname !== '/settings') $('.navbar-collapse-top > .navbar-right > li').first().before(menu)
  }

  /**
   * Adds buttons to the side menu to quickly show/hide scripts hidden by filters
   */
  const addOptions = () => {
    // create menu
    const html = `
    <div class="panel panel-default">
      <a href="/settings" onclick="return false" class="panel-heading">
        <div class="panel-title"><i class="fa fa-fw fa-exclamation-circle"></i>${GM.info.script.name} filters</div>
      </a>
      <div>
        <div class="table-responsive">
          <table class="table table-hover table-condensed table-striped">
            <tbody>
              <tr class="list-option non-latin"><td class="align-middle"><b><a class="tr-link-a" href="/non-latin-scripts" onclick="return false">Non-Latin scripts</a></b></td></tr>
              <tr class="list-option blacklisted"><td class="align-middle"><b><a class="tr-link-a" href="/blacklisted-scripts" onclick="return false">Blacklisted scripts</a></b></td></tr>
              <tr class="list-option hidden-script"><td class="align-middle"><b><a class="tr-link-a" href="/hidden-script-scripts" onclick="return false">Hidden scripts</a></b></td></tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
    `
    $('.col-sm-4 > .panel-default').first().before(html)

    // click
    $('.list-option.non-latin').click(() => $('.panel-default > .table .tr-link.non-latin').toggle())
    $('.list-option.blacklisted').click(() => $('.panel-default > .table .tr-link.blacklisted').toggle())
    $('.list-option.hidden-script').click(() => $('.panel-default > .table .tr-link.hidden-script').toggle())
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
        url: `https://openuserjs.org/users/${userID}`,
        onload: (response) => {
          UU.log(`${response.status}: ${response.finalUrl}`)
          const data = response.responseText
          resolve(data)
        }
      })
    })
  }

  /**
   * Return label for the hide script button
   *
   * @param {boolean} hidden Is hidden
   * @returns {string} Label
   */
  const blockLabel = (hidden) => {
    return hidden ? '✔️ Not hide this script' : '❌ Hide this script'
  }

  /**
   * Hide all scripts with non-Latin characters in the name or description
   *
   * @param {object} element Script
   */
  const hideNonLatinScripts = (element) => {
    const name = $(element).find('.tr-link-a b').text()
    const description = $(element).find('td:nth-child(1) p').text()

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
    const name = $(element).find('.tr-link-a b').text()
    const description = $(element).find('td:nth-child(1) p').text()

    if (!name) return

    if (blacklist.test(name) || blacklist.test(description)) {
      $(element).addClass('blacklisted')
    }
  }

  /**
   * Hide scripts
   *
   * @param {object} element SCript
   * @param {boolean} list Is list
   */
  const hideScript = async (element, list) => {
    const name = list ? $(element).find('.tr-link-a b').text() : $(element).find('.script-name').text()

    if (!name) return

    // if is in hiddenlist hide it
    if (name in JSON.parse(await GM.getValue('hiddenList', '{}'))) { $(element).addClass('hidden-script') }

    // add button to hide the script
    $(element).find('td:nth-child(1) span:last-of-type').after(`<span class="block-button" role="button" style="cursor: pointer; margin-left: 1ex;">${blockLabel($(element).hasClass('hidden-script'))}</span>`)
    $(element).find('.script-name').after(`<span class="block-button" role="button" style="cursor: pointer; margin-left: 1ex; font-size: 70%;">${blockLabel($(element).hasClass('hidden-script'))}</span>`)

    // on click...
    $(element).find('.block-button').click(async (event) => {
      event.stopPropagation()

      // ...if it is not in the list add it and hide it...
      if (!(name in hiddenList)) {
        hiddenList[name] = name

        GM.setValue('hiddenList', JSON.stringify(hiddenList))

        if (list) {
          $(element).hide(750).addClass('hidden-script').find('.block-button').text(blockLabel($(element).hasClass('hidden-script')))
        } else {
          $(element).addClass('hidden-script').find('.block-button').text(blockLabel($(element).hasClass('hidden-script')))
        }
      } else { // ...else remove it
        delete hiddenList[name]

        GM.setValue('hiddenList', JSON.stringify(hiddenList))

        $(element).removeClass('hidden-script').find('.block-button').text(blockLabel($(element).hasClass('hidden-script')))
      }
    })
  }

  /**
   * Shows a button to install the script
   *
   * @param {object} element Script
   */
  const addInstallButton = (element) => {
    const regex = /\/scripts\//g
    let url = $(element).find('.tr-link-a').attr('href')

    if (!url) return

    if (regex.test(url)) {
      url = url.replace(regex, '/install/') + '.user.js'

      $(element).find('.script-version').before(`<span class="install-script label label-info" style="margin-right: 1ex;"><a href="${url}">Install</a></span>`)
    }
  }

  //* Script
  $(document).ready(async () => {
    addSettings()

    if (config.get('hideNonLatinScripts') || config.get('hideBlacklistedScripts') || config.get('hideScript') || config.get('installButton')) {
      if (config.get('hideNonLatinScripts') || config.get('hideBlacklistedScripts') || config.get('hideScript')) {
        addOptions()
        $('head').append('<style>.panel-default > .table .tr-link.non-latin, .panel-default > .table .tr-link.non-latin:hover, .panel-default > .table .tr-link.blacklisted, .panel-default > .table .tr-link.blacklisted:hover, .panel-default > .table .tr-link.hidden-script, .panel-default > .table .tr-link.hidden-script:hover { display: none; background-color: rgb(50, 25, 25) !important; color: rgb(232, 230, 227) !important; } .container-fluid.hidden-script .col-sm-8, .container-fluid.hidden-script .col-sm-8 .panel-body { background: rgb(50, 25, 25); color: rgb(232, 230, 227); } .container-fluid.hidden-script .col-sm-8 code { background-color: transparent; }</style>')
      }

      $('.panel-default > .table .tr-link').each((index, element) => {
        if (config.get('hideNonLatinScripts')) hideNonLatinScripts(element)
        if (config.get('hideBlacklistedScripts')) hideBlacklistedScripts(element)
        if (config.get('hideScript')) hideScript(element, true)
        if (config.get('installButton')) addInstallButton(element)
      })
      if (config.get('hideScript') && window.location.pathname.includes('/scripts/')) {
        const element = $('#body > .container-fluid')
        if (config.get('hideScript')) hideScript(element, false)
      }
    }

    if (config.get('milestoneNotification')) {
      const userID = $('a[title="My profile"]').text()
      const milestones = config.get('milestoneNotification').replace(/\s/g, '').split(',').map((element) => Number(element))

      if (!userID) return

      const userData = await getUserData(userID).then()
      const totalInstalls = $(userData).find('.dl-horizontal dt:contains("Total installs")').next('dd').text()
      const lastMilestone = await GM.getValue('lastMilestone', 0)
      const milestone = $($.grep(milestones, (milestone) => totalInstalls >= milestone)).get(-1)

      UU.log(`total installs are "${totalInstalls}", milestone reached is "${milestone}", last milestone reached is "${lastMilestone}"`)

      if (milestone <= lastMilestone) return

      GM.setValue('lastMilestone', milestone)

      const text = `Congrats, your scripts got over the milestone of ${milestone.toLocaleString()} total installs!`
      if (GM.info.scriptHandler !== 'Userscripts') { //! Userscripts Safari: GM.notification is missing
        GM.notification({
          text,
          title: GM.info.script.name,
          image: logo,
          onclick: () => {
            window.location = `https://${window.location.hostname}users/${$(userID).text()}/scripts`
          }
        })
      } else {
        UU.alert(text)
      }
    }
  })
})()
