/**
 * @relayin/base-provider
 *
 * (c) Harminder Virk <harminder.virk@relay.in>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import * as test from 'japa'
import { createServer } from 'http'

import { RelayServices } from '../src/RelayServices'
import { HttpClient } from '../src/RelayServices/HttpClient'

const fakeLogger = {}

test.group('Relay Services | Shim', () => {
  test('raise error when service is not defined in config', (assert) => {
    const services = new RelayServices({}, fakeLogger)

    const fn = () => services.get('notifications')
    assert.throw(fn, 'notifications service is not defined inside config/services.ts file')
  })

  test('raise error when service base url is missing', (assert) => {
    const config = {
      notifications: {
        baseUrl: '',
        version: '',
        actions: {},
      },
    }
    const services = new RelayServices(config, fakeLogger)

    const fn = () => services.get('notifications')
    assert.throw(fn, 'baseUrl is not defined for notifications service')
  })

  test('raise error when service version is missing', (assert) => {
    const config = {
      notifications: {
        baseUrl: 'http://localhost:8000',
        version: '',
        actions: {},
      },
    }
    const services = new RelayServices(config, fakeLogger)

    const fn = () => services.get('notifications')
    assert.throw(fn, 'version is not defined for notifications service')
  })

  test('get instance of http class for a given service', (assert) => {
    const config = {
      notifications: {
        baseUrl: 'http://localhost:8000',
        version: 'v1',
        actions: {},
      },
    }
    const services = new RelayServices(config, fakeLogger)
    assert.instanceOf(services.get('notifications'), HttpClient)
  })
})

test.group('Relay Services | Http client', () => {
  test('raise error when action is missing', async (assert) => {
    assert.plan(1)

    const config = {
      notifications: {
        baseUrl: 'http://localhost:8000',
        version: 'v1',
        actions: {},
      },
    }

    const services = new RelayServices(config, fakeLogger)
    try {
      await services.get('notifications').perform('sendOtp', {})
    } catch ({ message }) {
      assert.equal(message, 'Missing sendOtp action')
    }
  })

  test('use correct base url for HTTP request', async (assert) => {
    const config = {
      notifications: {
        baseUrl: 'http://localhost:8000',
        version: 'v1',
        actions: {
          sendOtp: 'sms/otp/send',
        },
      },
    }

    const server = createServer((req, res) => {
      res.writeHead(200, { 'content-type': 'application/json' })
      res.write(JSON.stringify({ url: req.url, isJson: req.headers['accept'] === 'application/json' }))
      res.end()
    })
    server.listen(8000)

    const services = new RelayServices(config, fakeLogger)
    const response = await services.get('notifications').perform('sendOtp', {})
    server.close()

    assert.equal(response.status, 200)
    assert.deepEqual(response.body, {
      url: '/v1/sms/otp/send',
      isJson: true,
    })
  })

  test('consume validation errors when they exist', async (assert) => {
    const config = {
      notifications: {
        baseUrl: 'http://localhost:8000',
        version: 'v1',
        actions: {
          sendOtp: 'sms/otp/send',
        },
      },
    }

    const server = createServer((_req, res) => {
      res.writeHead(400, { 'content-type': 'application/json' })
      res.write(JSON.stringify({
        errors: [{ code: 1001 }],
      }))
      res.end()
    })
    server.listen(8000)

    const services = new RelayServices(config, fakeLogger)
    const response = await services.get('notifications').perform('sendOtp', {})

    server.close()

    assert.equal(response.status, 400)
    assert.isTrue(response.hasValidationErrors)
    assert.isFalse(response.hasServerError)
    assert.deepEqual(response.error, [{ code: 1001 }])
    assert.isNull(response.body)
  })

  test('consume bad request errors', async (assert) => {
    const config = {
      notifications: {
        baseUrl: 'http://localhost:8000',
        version: 'v1',
        actions: {
          sendOtp: 'sms/otp/send',
        },
      },
    }

    const services = new RelayServices(config, fakeLogger)
    const response = await services.get('notifications').perform('sendOtp', { timeout: 500 })

    assert.isFalse(response.hasValidationErrors)
    assert.isTrue(response.hasServerError)
    assert.equal(response.status, 503)
    assert.equal(response.error.message, 'connect ECONNREFUSED 127.0.0.1:8000')
    assert.isNull(response.body)
  }).timeout(0)

  test('turn on debugging', async (assert) => {
    const config = {
      notifications: {
        baseUrl: 'http://localhost:8000',
        version: 'v1',
        actions: {
          sendOtp: 'sms/otp/send',
        },
      },
    }

    const logger: any = {
      log: {},
      debug (log: any) {
        this.log = log
      },
    }

    const server = createServer((_req, res) => {
      res.writeHead(400, { 'content-type': 'application/json' })
      res.write(JSON.stringify({
        errors: [{ code: 1001 }],
      }))
      res.end()
    })
    server.listen(8000)

    const services = new RelayServices(config, logger)
    await services.get('notifications').debug().perform('sendOtp', {
      body: { username: 'virk' },
    })

    server.close()
    assert.equal(logger.log.body, JSON.stringify({ username: 'virk' }))
    assert.equal(logger.log.url, 'http://localhost:8000/v1/sms/otp/send')
  })
})
