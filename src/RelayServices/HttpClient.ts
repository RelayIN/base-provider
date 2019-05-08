/**
 * @relayin/base-provider
 *
 * (c) Harminder Virk <harminder.virk@relay.in>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import * as got from 'got'
import { HttpResponse } from './HttpResponse'
import { HttpClientContract, ServiceOptions, HttpResponseContract, ClientActionOptions } from '../Contracts'

/**
 * Http client class is used to make an HTTP request to a given service
 * using it's configuration defined inside `config/services.ts` file.
 */
export class HttpClient implements HttpClientContract {
  private _debug: boolean = false

  constructor (private _config: ServiceOptions, private _logger) {
  }

  /**
   * Returns base options for the got instance
   */
  private _getBaseOptions (): got.GotBodyOptions<'utf-8'> {
    const options: got.GotBodyOptions<'utf-8'> = {
      baseUrl: `${this._config.baseUrl}/${this._config.version}`,
      hooks: {},
    }

    if (this._debug) {
      options.hooks!.beforeRequest = [
        (options: any) => {
          this._logger.debug({
            url: options.href,
            headers: options.headers,
            body: options.body,
          })
        },
      ]
    }

    return options
  }

  /**
   * Returns a configured instance of `got` based upon the user
   * config defined inside `config/services.ts` file.
   */
  private _getJSONClient (): got.GotInstance<got.GotJSONFn> {
    return got.extend(Object.assign({ json: true }, this._getBaseOptions()))
  }

  /**
   * Returns a configure instance of `got` to stream data from a service
   */
  private _getStreamClient () {
    return got.extend(Object.assign({ stream: true }, this._getBaseOptions()))
  }

  /**
   * Returns URL for the service action
   */
  private _getActionUrl (name: string, params: any) {
    const action = this._config.actions[name]
    if (!action) {
      throw new Error(`Missing ${name} action`)
    }

    let url: string
    if (typeof (action) === 'function') {
      url = action(params)
    } else {
      url = action
    }

    return url
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
  public async perform (name: string, options: ClientActionOptions): Promise<HttpResponseContract> {
    const url = this._getActionUrl(name, options.params)

    try {
      const response = await this._getJSONClient()(url, options)
      return new HttpResponse(response, false)
    } catch (error) {
      return new HttpResponse(error, true)
    }
  }

  /**
   * Returns a stream pointing to the given service
   */
  public stream (name: string, options: ClientActionOptions) {
    const url = this._getActionUrl(name, options.params)
    return this._getStreamClient().stream(url, options)
  }
}
