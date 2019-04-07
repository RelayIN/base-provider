/**
 * @relayapp/base-provider
 *
 * (c) Harminder Virk <harminder.virk@relay.in>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import * as test from 'japa'
import * as helpers from '../src/Helpers'

test.group('Helpers', () => {
  test('return error from an async function', async (assert) => {
    async function raisesError () {
      throw new Error('Bad request')
    }

    const [error] = await helpers.exec(raisesError())
    assert.equal(error!.message, 'Bad request')
  })

  test('return error from a function that returns promise', async (assert) => {
    function raisesError (message) {
      return new Promise((_resolve, reject) => {
        reject(new Error(message))
      })
    }

    const [error] = await helpers.exec(raisesError('Bad request'))
    assert.equal(error!.message, 'Bad request')
  })

  test('return response from async function when their are no errors', async (assert) => {
    async function worksFine () {
      return 'Hello world'
    }

    const [error, response] = await helpers.exec(worksFine())
    assert.equal(response, 'Hello world')
    assert.isNull(error)
  })

  test('return response from promise when their are no errors', async (assert) => {
    function worksFine () {
      return new Promise((resolve) => {
        resolve('Hello world')
      })
    }

    const [error, response] = await helpers.exec(worksFine())
    assert.equal(response, 'Hello world')
    assert.isNull(error)
  })
})
