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
import { configureDb } from '../src/Db'
import { configureModel } from '../src/Db/BaseModel'
import { JSONAPISerializer } from '../src/Db/Serializers/JsonApi'
import { Column, PrimaryColumn } from '../src/Db/Decorators'
import { S3 } from '../src/Drive/S3'

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

    this.container.singleton('Relay/Db', () => {
      const Config = this.container.use('Adonis/Src/Config')
      return configureDb(Config)
    })

    this.container.singleton('Relay/Orm/BaseModel', () => {
      return configureModel(this.container.use('Relay/Db'))
    })

    this.container.singleton('Relay/Orm/Column', () => Column)
    this.container.singleton('Relay/Orm/PrimaryColumn', () => PrimaryColumn)

    this.container.singleton('Relay/Orm/JsonApiSerializer', () => {
      return new JSONAPISerializer()
    })

    this.container.bind('Relay/Drive', () => {
      const Config = this.container.use('Adonis/Src/Config')
      return new S3(Config.get('drive.s3'))
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
