/**
 * @relayin/base-provider
 *
 * (c) Harminder Virk <harminder.virk@relay.in>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

/**
 * Executes a promise and returns an array of `error` and `response`. If error
 * was never raised, then it will return `null` in that position.
 *
 * @example
 * ```js
 * const [error, response] = await exec(fn())
 * if (error) {
 * }
 * ```
 */
export async function exec<T extends any> (fn: Promise<T>): Promise<[Error | null, T | null]> {
  try {
    const response = await fn
    return [null, response]
  } catch (error) {
    return [error, null]
  }
}
