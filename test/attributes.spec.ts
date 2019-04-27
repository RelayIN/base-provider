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
import { configureModel } from '../src/Db/BaseModel'
import { Column } from '../src/Db/Decorators'
import { FakeConfig } from './helpers'
import { syncAttributes, reComputeAttributes, getDirty, validate } from '../src/Db/Attributes'

const BaseModel = configureModel(configureDb(new FakeConfig()))

test.group('Attributes | Sync attributes', () => {
  test('sync attributes with the given data', (assert) => {
    class User extends BaseModel {
      @Column()
      public username: string
    }

    const user = new User()
    syncAttributes(user, { username: 'virk' })

    assert.deepEqual(user.$attributes, { username: 'virk' })
    assert.equal(user.username, 'virk')
  })

  test('use column defaults when original missing', (assert) => {
    class User extends BaseModel {
      @Column({ default: 'nikk' })
      public username: string
    }

    const user = new User()
    syncAttributes(user, {})

    assert.deepEqual(user.$attributes, { username: 'nikk' })
    assert.equal(user.username, 'nikk')
  })

  test('use null when no default is defined', (assert) => {
    class User extends BaseModel {
      @Column()
      public username: string
    }

    const user = new User()
    syncAttributes(user, {})

    assert.deepEqual(user.$attributes, { username: null })
    assert.equal(user.username, null)
  })

  test('use correct key for model properties', (assert) => {
    class User extends BaseModel {
      @Column()
      public fullName: string
    }

    const user = new User()
    syncAttributes(user, { full_name: 'virk' })

    assert.deepEqual(user.$attributes, { full_name: 'virk' })
    assert.equal(user.fullName, 'virk')
  })
})

test.group('Attributes | Recompute attributes', () => {
  test('recompute attributes from model instance to attributes', (assert) => {
    class User extends BaseModel {
      @Column()
      public username: string
    }

    const user = new User()
    user.username = 'virk'
    reComputeAttributes(user)

    assert.deepEqual(user.$attributes, { username: 'virk' })
    assert.equal(user.username, 'virk')
  })

  test('use defaults when original value is missing', (assert) => {
    class User extends BaseModel {
      @Column({ default: 22 })
      public firstName: number
    }

    const user = new User()
    reComputeAttributes(user)

    assert.deepEqual(user.$attributes, { first_name: 22 })
    assert.isUndefined(user.firstName)
  })
})

test.group('Attributes | dirty', () => {
  test('return dirty set of values', (assert) => {
    class User extends BaseModel {
      @Column()
      public username: string
    }

    const user = new User()
    syncAttributes(user, { username: 'virk' })

    assert.deepEqual(getDirty(user), {})
    user.username = 'nikk'
    assert.deepEqual(getDirty(user), { username: 'nikk' })
  })

  test('mark as dirty when set value to null', (assert) => {
    class User extends BaseModel {
      @Column()
      public username: string | null
    }

    const user = new User()
    syncAttributes(user, { username: 'virk' })

    assert.deepEqual(getDirty(user), {})
    user.username = null
    assert.deepEqual(getDirty(user), { username: null })
  })

  test('mark as dirty when deleting value', (assert) => {
    class User extends BaseModel {
      @Column()
      public username: string | null
    }

    const user = new User()
    syncAttributes(user, { username: 'virk' })

    assert.deepEqual(getDirty(user), {})
    delete user.username
    assert.deepEqual(getDirty(user), { username: null })
  })
})

test.group('Attributes | validate', () => {
  test('raise error when value is undefined and nullable is set to false', (assert) => {
    class User extends BaseModel {
      @Column()
      public username: string
    }

    const user = new User()
    const fn = () => validate(user)
    assert.throw(fn, 'User.username: not null constraint failed')
  })

  test('work fine when value is undefined and nullable is set to true', (assert) => {
    class User extends BaseModel {
      @Column({ nullable: true })
      public username: string
    }

    const user = new User()
    const fn = () => validate(user)
    assert.doesNotThrow(fn)
  })

  test('work fine when value is undefined and default is set', (assert) => {
    class User extends BaseModel {
      @Column({ default: 0 })
      public maxPrice: number
    }

    const user = new User()
    const fn = () => validate(user)
    assert.doesNotThrow(fn)
  })

  test('work fine when value is undefined and default is set', (assert) => {
    class User extends BaseModel {
      @Column({ default: 0 })
      public maxPrice: number
    }

    const user = new User()
    const fn = () => validate(user)
    assert.doesNotThrow(fn)
  })
})
