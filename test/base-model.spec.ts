/**
 * @relayin/base-provider
 *
 * (c) Harminder Virk <harminder.virk@relay.in>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import * as test from 'japa'
import { configureModel } from '../src/Db/BaseModel'
import { configureDb } from '../src/Db'
import { FakeConfig } from './helpers'
import { Column } from '../src/Db/Decorators'

const BaseModel = configureModel(configureDb(new FakeConfig()))

test.group('BaseModel', () => {
  test('return isDirty false for newly instantiated models', (assert) => {
    class User extends BaseModel {
      @Column()
      public username: string

      @Column()
      public firstName: string
    }

    const user = new User()
    assert.isFalse(user.$isDirty)
  })

  test('return isDirty false when columns have default value', (assert) => {
    class User extends BaseModel {
      @Column({ default: 'virk' })
      public username: string

      @Column()
      public firstName: string
    }

    const user = new User()
    assert.isFalse(user.$isDirty)
  })

  test('return isDirty true when column value is set', (assert) => {
    class User extends BaseModel {
      @Column({ default: 'virk' })
      public username: string

      @Column()
      public firstName: string
    }

    const user = new User()
    user.username = 'virk'

    assert.isTrue(user.$isDirty)
    assert.deepEqual(user.$dirty, { username: 'virk' })
  })
})
