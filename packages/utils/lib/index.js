// ==UserScript==
// @author       Davide <iFelix18@protonmail.com>
// @namespace    https://github.com/iFelix18
// @exclude      *
// ==UserLibrary==
// @name         Utils
// @description  Utils for my userscripts
// @copyright    2019, Davide (https://github.com/iFelix18)
// @license      MIT
// @version      4.0.0
// @homepage     https://github.com/iFelix18/Userscripts/tree/master/packages/utils#readme
// @homepageURL  https://github.com/iFelix18/Userscripts/tree/master/packages/utils#readme
// @supportURL   https://github.com/iFelix18/Userscripts/issues
// ==/UserLibrary==
// @grant        GM.deleteValue
// @grant        GM.getValue
// @grant        GM.setValue
// ==/UserScript==

((exports) => {
  const name = GM.info.script.name
  const version = GM.info.script.version
  const matches = /^(.*?)\s<\S[^\s@]*@\S[^\s.]*\.\S+>$/.exec(GM.info.script.author)
  const author = matches ? matches[1] : GM.info.script.author

  /**
   * Log userscript header and, if logging is true, script config values
   *
   * @param {string} ID Config ID
   */
  const init = async (ID) => {
    console.log(`%c${name}\n` + `%cv${version} by ${author} is running!`, 'color:red;font-weight:bold;font-size:18px;', '') // Userscript header

    if (!ID) throw new Error('A config ID is required')

    let data = await GM.getValue(ID)
    if (!data) throw new Error('Wrong config ID')

    data = JSON.parse(data)
    const logging = data.logging
    GM.setValue('logging', logging)

    if (logging) { // if logging is true, log script config values
      for (const key of Object.keys(data)) {
        console.log(`${name}:`, `${key} is "${data[key]}"`)
      }
    }
  }

  /**
   * Log, if logging is true
   *
   * @param {string} message Message
   */
  const log = async (message) => {
    const logging = await GM.getValue('logging', false)

    if (logging) {
      console.log(`${name}:`, message)
    }
  }

  /**
   * Error
   *
   * @param {string} message Message
   */
  const error = (message) => {
    console.error(`${name}:`, message)
  }

  /**
   * Alert
   *
   * @param {string} message Message
   */
  const alert = (message) => {
    window.alert(`${name}: ${message}`)
  }

  /**
   * Returns shortened version of a message
   *
   * @param {string} message Message
   * @returns {string} Shortened message
   */
  const short = (message) => {
    return message.split(' ').length > 6 ? `${message.split(' ', 6).join(' ')} [...]` : message
  }

  /**
   * Migrate configuration
   *
   * @param {string} oldID Old config ID
   * @param {string} newID New config ID
   */
  const migrateConfig = async (oldID, newID) => {
    if (!oldID) throw new Error('An old config ID is required')
    if (!newID) throw new Error('An new config ID is required')

    const oldConfig = await GM.getValue(oldID) // get old config
    if (oldConfig) {
      GM.setValue(newID, oldConfig) // set new config
      GM.deleteValue(oldID) // delete old config
      window.location.reload(false)
    }
  }

  exports.alert = alert
  exports.error = error
  exports.init = init
  exports.log = log
  exports.migrateConfig = migrateConfig
  exports.short = short
})(this.MU = this.MU || {})
