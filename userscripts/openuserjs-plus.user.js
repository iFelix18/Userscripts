// ==UserScript==
// @name            OpenUserJS+
// @name:it         OpenUserJS+
// @author          Davide <iFelix18@protonmail.com>
// @namespace       https://github.com/iFelix18
// @icon            https://www.google.com/s2/favicons?sz=64&domain=openuserjs.org
// @description     Adds various features, and improves the OpenUserJS experience
// @description:it  Aggiunge varie funzionalità, e migliora l'esperienza di OpenUserJS
// @copyright       2021, Davide (https://github.com/iFelix18)
// @license         MIT
// @version         1.0.2
//
// @homepageURL     https://github.com/iFelix18/Userscripts#readme
// @supportURL      https://github.com/iFelix18/Userscripts/issues
// @updateURL       https://raw.githubusercontent.com/iFelix18/Userscripts/master/userscripts/meta/openuserjs-plus.meta.js
// @downloadURL     https://raw.githubusercontent.com/iFelix18/Userscripts/master/userscripts/openuserjs-plus.user.js
//
// @require         https://cdn.jsdelivr.net/gh/iFelix18/Userscripts@abce8796cedbe28ac8e072d9824c4b9342985098/lib/utils/utils.min.js
// @require         https://cdn.jsdelivr.net/npm/gm4-polyfill@1.0.1/gm4-polyfill.min.js#sha256-qmLl2Ly0/+2K+HHP76Ul+Wpy1Z41iKtzptPD1Nt8gSk=
// @require         https://cdn.jsdelivr.net/npm/jquery@3.6.0/dist/jquery.min.js#sha256-/xUj+3OJU5yExlq6GSYGSHk7tPXikynS7ogEvDej/m4=
// @require         https://cdn.jsdelivr.net/npm/@violentmonkey/shortcut@1.2.4/dist/index.js#sha256-ac//SadDzOEkne8ECdtu6YwY5YJj0oJBazsbYk/mvzg=
//
// @match           *://openuserjs.org/*
//
// @grant           GM.info
//
// @grant           GM_info
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
  const nonLatins = /[^\p{Script=Latin}\p{Script=Common}\p{Script=Inherited}]/gu
  const blacklist = new RegExp([ /* cspell: disable-next-line */
    '\\bagar((.)?io)?\\b', '\\bagma((.)?io)?\\b', '\\baimbot\\b', '\\barras((.)?io)?\\b', '\\bbot(s)?\\b', '\\bbubble((.)?am)?\\b', '\\bcheat(s)?\\b', '\\bdiep((.)?io)?\\b', '\\bfreebitco((.)?in)?\\b', '\\bgota((.)?io)?\\b', '\\bhack(s)?\\b', '\\bkrunker((.)?io)?\\b', '\\blostworld((.)?io)?\\b', '\\bmoomoo((.)?io)?\\b', '\\broblox(.com)?\\b', '\\bshell\\sshockers\\b', '\\bshellshock((.)?io)?\\b', '\\bshellshockers\\b', '\\bskribbl((.)?io)?\\b', '\\bslither((.)?io)?\\b', '\\bsurviv((.)?io)?\\b', '\\btaming((.)?io)?\\b', '\\bvenge((.)?io)?\\b', '\\bvertix((.)?io)?\\b', '\\bzombs((.)?io)?\\b', '\\p{Extended_Pictographic}'
  ].join('|'), 'giu')

  MU.log(nonLatins)
  MU.log(blacklist)

  //* Shortcuts
  VM.shortcut.register('ctrl-alt-l', () => {
    $('.panel-default > .table .tr-link.non-latin').toggle()
  })
  VM.shortcut.register('ctrl-alt-b', () => {
    $('.panel-default > .table .tr-link.blacklisted').toggle()
  })

  //* Functions
  /**
   * Hide all scripts with non-Latin characters in the name or description
   * @param {Object} element
   */
  const hideNonLatinScripts = (element) => {
    const name = $(element).find('.tr-link-a b').text()
    const description = $(element).find('td:nth-child(1) p').text()

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
    const name = $(element).find('.tr-link-a b').text()
    const description = $(element).find('td:nth-child(1) p').text()

    if (!name) return

    if (name.match(blacklist) || description.match(blacklist)) {
      $(element).addClass('blacklisted').css('background-color', 'rgba(255, 0, 0, 0.10)').hide()
    }
  }

  /**
   * Shows a button to install the script
   * @param {Object} element
   */
  const addInstallButton = (element) => {
    const regex = /\/scripts\//g
    let url = $(element).find('.tr-link-a').attr('href')

    if (!url) return

    if (url.match(regex)) {
      url = url.replace(regex, '/install/') + '.user.js'

      $(element)
        .find('.script-version')
        .before(`<span class="install-script label label-info" style="margin-right: 1ex;"><a href="${url}">Install</a></span>`)
    }
  }

  //* Script
  $('.panel-default > .table .tr-link').each((index, element) => {
    hideNonLatinScripts(element)
    hideBlacklistedScripts(element)
    addInstallButton(element)
  })
})()
