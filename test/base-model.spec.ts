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
import { ModelRefs } from '../src/Contracts'

const BaseModel = configureModel(configureDb(new FakeConfig()))

test.group('BaseModel', () => {
  test('return isDirty false for newly instantiated models', (assert) => {
    class User extends BaseModel {
      @Column()
      public username: string

      @Column()
      public firstName: string

      public static refs: ModelRefs<keyof User>
    }

    const user = new User()
    assert.isFalse(user.$isDirty)
    assert.deepEqual(User.refs, { username: 'username', firstName: 'first_name' })
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

  test('set table and primary key when bootIfNotBooted is called', (assert) => {
    class User extends BaseModel {
      @Column({ default: 'virk' })
      public username: string

      @Column()
      public firstName: string
    }

    User.bootIfNotBooted()
    assert.equal(User.table, 'users')
    assert.deepEqual(User.primaryKey, {
      column: 'id',
      ref: 'id',
      increments: true,
    })
  })

  test('do not override explicitly defined table name', (assert) => {
    class User extends BaseModel {
      @Column({ default: 'virk' })
      public username: string

      @Column()
      public firstName: string

      public static table = 'my_users'
    }

    User.bootIfNotBooted()
    assert.equal(User.table, 'my_users')
    assert.deepEqual(User.primaryKey, {
      column: 'id',
      ref: 'id',
      increments: true,
    })
  })

  test('do not override explicitly defined primary key', (assert) => {
    class User extends BaseModel {
      @Column({ primary: true })
      public userId: string
    }

    User.bootIfNotBooted()
    assert.equal(User.table, 'users')
    assert.deepEqual(User.primaryKey, {
      column: 'user_id',
      ref: 'userId',
      increments: true,
    })
  })

  test('set increments false', (assert) => {
    class User extends BaseModel {
      @Column({ primary: true, increments: false })
      public userId: string
    }

    User.bootIfNotBooted()
    assert.equal(User.table, 'users')
    assert.deepEqual(User.primaryKey, {
      column: 'user_id',
      ref: 'userId',
      increments: false,
    })
  })
})
