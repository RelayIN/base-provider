/**
 * @relayapp/base-provider
 *
 * (c) Harminder Virk <harminder.virk@relay.in>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import * as test from 'japa'
import * as rules from '../src/Validator'

test.group('Validator rules | phone', () => {
  test('return false when value is not a valid phone number', (assert) => {
    const data = {
      phone: 'hello world',
    }

    assert.isFalse(rules.phone.validate(data, 'phone', [], 'literal', {}, {}))
  })

  test('return false when value is not a valid indian number', (assert) => {
    const data = {
      phone: '+11800277908',
    }

    assert.isFalse(rules.phone.validate(data, 'phone', [], 'literal', {}, {}))
  })

  test('return false when value is not a valid indian mobile number', (assert) => {
    const data = {
      phone: '01294082265',
    }

    assert.isFalse(rules.phone.validate(data, 'phone', [], 'literal', {}, {}))
  })

  test('return true when number is a valid phone number', (assert) => {
    const data = {
      phone: '9944332200',
    }

    assert.isTrue(rules.phone.validate(data, 'phone', [], 'literal', {}, {}))
    assert.deepEqual(data, { phone: '9944332200' })
  })

  test('return true when number has country code', (assert) => {
    const data = {
      phone: '+919944332200',
    }

    assert.isTrue(rules.phone.validate(data, 'phone', [], 'literal', {}, {}))
    assert.deepEqual(data, { phone: '9944332200' })
  })

  test('return true when number has spaces inside it', (assert) => {
    const data = {
      phone: '+91 9944 332 200',
    }

    assert.isTrue(rules.phone.validate(data, 'phone', [], 'literal', {}, {}))
    assert.deepEqual(data, { phone: '9944332200' })
  })

  test('return true when number is prefixed with 0', (assert) => {
    const data = {
      phone: '09944332200',
    }

    assert.isTrue(rules.phone.validate(data, 'phone', [], 'literal', {}, {}))
    assert.deepEqual(data, { phone: '9944332200' })
  })

  test('return true when number is prefixed with 0 and country code both', (assert) => {
    const data = {
      phone: '+91 09944332200',
    }

    assert.isTrue(rules.phone.validate(data, 'phone', [], 'literal', {}, {}))
    assert.deepEqual(data, { phone: '9944332200' })
  })
})
