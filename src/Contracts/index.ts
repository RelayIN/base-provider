/**
 * @relayin/base-provider
 *
 * (c) Harminder Virk <harminder.virk@relay.in>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

export type HttpOptions = {
  headers: {
    [key: string]: any,
  },
  stream: boolean,
  body: any,
  method: string,
  encoding: string,
  form: boolean,
  json: boolean,
  query: any,
  timeout: number,
  retry: number,
  followRedirect: boolean,
  decompress: boolean,
  cache: boolean,
}

export type ServiceOptions = {
  baseUrl: string,
  version: string,
  actions: {
    [key: string]: string,
  },
}

export interface HttpResponseContract {
  body: any,
  error: any,
  state: 'initiated' | 'success' | 'error',
  hasValidationErrors: boolean,
  hasServerError: boolean,
}

export interface HttpClientContract {
  debug (): HttpClientContract,
  perform (action: string, options: Partial<HttpOptions>): Promise<HttpResponseContract>,
}

export interface RelayServicesContract {
  get (service: string): HttpClientContract
}
