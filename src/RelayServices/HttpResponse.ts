/**
 * @relayin/base-provider
 *
 * (c) Harminder Virk <harminder.virk@relay.in>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

/**
 * Encapsulates the response from HTTP request to be more relay
 * friendly.
 */
export class HttpResponse {
  /**
   * HTTP error body. It can be anything based upon the output
   * received from the remote service.
   */
  public error: any = null

  /**
   * A boolean to know if the error received from the remote
   * service is a server error or not. Server errors occurs
   * in unexpected situations
   */
  public hasServerError: boolean = false

  /**
   * Http response status
   */
  public status = this._response.statusCode || 503

  /**
   * A boolean to know if errors received from the remote
   * service are validation errors or not
   */
  public hasValidationErrors: boolean = false

  /**
   * Successful response body. Only available when their are
   * no errors
   */
  public body: any = this._hasError ? null : this._response.body

  /**
   * The state of response.
   */
  public state: 'success' | 'error' = this._hasError ? 'error' : 'success'

  constructor (private _response: any, private _hasError: boolean) {
    this._computeError()
  }

  /**
   * Computes the error property from the error response
   */
  private _computeError () {
    if (!this._response.response) {
      this.hasServerError = true
      this.error = this._response
      return
    }

    if (this._response.response.body.errors) {
      this.hasValidationErrors = true
      this.error = this._response.response.body.errors
      return
    }

    this.hasServerError = true
    this.error = this._response.response.body
  }
}
