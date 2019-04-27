/*
* @relayin/base-provider
*
* (c) Harminder Virk <harminder.virk@relay.in>
*
* For the full copyright and license information, please view the LICENSE
* file that was distributed with this source code.
*/

import * as test from 'japa'
import { configureDb } from '../src/Db'
import { FakeConfig } from './helpers'

test.group('Db', () => {
  test('configure db by reading config from the config provider', (assert) => {
    const db = configureDb(new FakeConfig())
    assert.exists(db.client)
  })
})
