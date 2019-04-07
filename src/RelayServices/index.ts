/**
 * @relayin/base-provider
 *
 * (c) Harminder Virk <harminder.virk@relay.in>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { RelayServicesContract, ServiceOptions } from '../Contracts'
import { HttpClient } from './HttpClient'

/**
 * Relay services is a shim layer to make HTTP requests inter micro
 * services. It does abstract away some repitive work of constructing
 * URL's and handling response.
 *
 * @example
 * ```
 * const Services = use('Relay/Services')
 * const response = await Services.get('notifications').perform('sendOtp')
 *
 * if (response.hasValidationErrors) {
 * }
 * ```
 */
export class RelayServices implements RelayServicesContract {
  constructor (private _services: { [service: string]: ServiceOptions }, private _logger) {
  }

  /**
   * Returns HTTP client for a given service defined inside `config/services.ts`
   * file
   */
  public get (service: string): HttpClient {
    if (!this._services[service]) {
      throw new Error(`${service} service is not defined inside config/services.ts file`)
    }

    if (!this._services[service].baseUrl) {
      throw new Error(`baseUrl is not defined for ${service} service`)
    }

    if (!this._services[service].version) {
      throw new Error(`version is not defined for ${service} service`)
    }

    return new HttpClient(this._services[service], this._logger)
  }
}
