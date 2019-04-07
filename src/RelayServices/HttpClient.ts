/**
 * @relayin/base-provider
 *
 * (c) Harminder Virk <harminder.virk@relay.in>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import * as got from 'got'
import { HttpClientContract, ServiceOptions, HttpOptions } from '../Contracts'
import { HttpResponse } from './HttpResponse'

/**
 * Http client class is used to make an HTTP request to a given service
 * using it's configuration defined inside `config/services.ts` file.
 */
export class HttpClient implements HttpClientContract {
  private _debug: boolean = false

  constructor (private _config: ServiceOptions, private _logger) {
  }

  /**
   * Returns a configured instance of `got` based upon the user
   * config defined inside `config/services.ts` file.
   */
  private _getClient () {
    const options: any = {
      baseUrl: `${this._config.baseUrl}/${this._config.version}`,
      json: true,
      hooks: {},
    }

    if (this._debug) {
      options.hooks.beforeRequest = [
        (options: any) => {
          this._logger.debug({
            url: options.href,
            headers: options.headers,
            body: options.body,
          })
        },
      ]
    }

    return got.extend(options)
  }

  /**
   * Turn on debugging. This will print all request body, headers and the
   * URL.
   */
  public debug (): this {
    this._debug = true
    return this
  }

  /**
   * Perform an HTTP request on a given action. Make sure the actions
   * are defined inside the service config.
   */
  public async perform (name: string, options: Partial<HttpOptions>) {
    const action = this._config.actions[name]
    if (!action) {
      throw new Error(`Missing ${name} action`)
    }

    try {
      const response = await this._getClient()(action, options)
      return new HttpResponse(response, false)
    } catch (error) {
      return new HttpResponse(error, true)
    }
  }
}
