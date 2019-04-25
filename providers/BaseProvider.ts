/**
 * @relayin/base-provider
 *
 * (c) Harminder Virk <harminder.virk@relay.in>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import * as helpers from '../src/Helpers'
import * as rules from '../src/Bindings/Validator'
import { RelayServices } from '../src/RelayServices'

export default class BaseProvider {
  constructor (public container) {
  }

  /**
   * Registers bindings with the IoC container
   */
  public register () {
    this.container.singleton('Relay/Services', () => {
      const Config = this.container.use('Adonis/Src/Config')
      const Logger = this.container.use('Adonis/Src/Logger')
      return new RelayServices(Config.get('services'), Logger)
    })
  }

  public async boot () {
    /**
     * Extend helpers by adding methods to it
     */
    this.container.with(['Adonis/Src/Helpers'], (Helpers) => {
      Object.keys(helpers).forEach((fn) => {
        Helpers[fn] = helpers[fn]
      })
    })

    /**
     * Extend indicative, if it exists
     */
    try {
      const { extend } = require('indicative')
      Object.keys(rules).forEach((rule) => extend(rule, rules[rule]))
    } catch (error) {
      // ignore if indicative is not installed
    }
  }
}
