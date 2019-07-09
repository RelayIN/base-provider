/**
 * @relayapp/base-provider
 *
 * (c) Harminder Virk <harminder.virk@relay.in>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import * as test from 'japa'
import * as rules from '../src/Bindings/Validator'

test.group('Validator rules | phone', () => {
  test('return false when value is not a valid phone number', (assert) => {
    const data = {
      phone: 'hello world',
    }

    const root = { original: data, tip: data }

    assert.isFalse(rules.phone.validate(root, 'phone', [], {}))
  })

  test('return false when value is not a valid indian number', (assert) => {
    const data = {
      phone: '+11800277908',
    }

    const root = { original: data, tip: data }

    assert.isFalse(rules.phone.validate(root, 'phone', [], {}))
  })

  test('return false when value is not a valid indian mobile number', (assert) => {
    const data = {
      phone: '01294082265',
    }

    const root = { original: data, tip: data }

    assert.isFalse(rules.phone.validate(root, 'phone', [], {}))
  })

  test('return true when number is a valid phone number', (assert) => {
    const data = {
      phone: '9944332200',
    }

    const root = { original: data, tip: data }

    assert.isTrue(rules.phone.validate(root, 'phone', [], {}))
    assert.deepEqual(data, { phone: '9944332200' })
  })

  test('return true when number has country code', (assert) => {
    const data = {
      phone: '+919944332200',
    }

    const root = { original: data, tip: data }

    assert.isTrue(rules.phone.validate(root, 'phone', [], {}))
    assert.deepEqual(data, { phone: '9944332200' })
  })

  test('return true when number has spaces inside it', (assert) => {
    const data = {
      phone: '+91 9944 332 200',
    }

    const root = { original: data, tip: data }

    assert.isTrue(rules.phone.validate(root, 'phone', [], {}))
    assert.deepEqual(data, { phone: '9944332200' })
  })

  test('return true when number is prefixed with 0', (assert) => {
    const data = {
      phone: '09944332200',
    }

    const root = { original: data, tip: data }

    assert.isTrue(rules.phone.validate(root, 'phone', [], {}))
    assert.deepEqual(data, { phone: '9944332200' })
  })

  test('return true when number is prefixed with 0 and country code both', (assert) => {
    const data = {
      phone: '+91 09944332200',
    }

    const root = { original: data, tip: data }

    assert.isTrue(rules.phone.validate(root, 'phone', [], {}))
    assert.deepEqual(data, { phone: '9944332200' })
  })
})
