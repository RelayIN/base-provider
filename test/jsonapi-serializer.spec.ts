/**
 * @relayin/base-provider
 *
 * (c) Harminder Virk <harminder.virk@relay.in>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import * as test from 'japa'
import { Column } from '../src/Db/Decorators'
import { configureDb } from '../src/Db'
import { configureModel } from '../src/Db/BaseModel'
import { reComputeAttributes } from '../src/Db/Attributes'
import { JSONAPISerializer } from '../src/Db/Serializers/JsonApi'
import { FakeConfig } from './helpers'

const BaseModel = configureModel(configureDb(new FakeConfig()))

test.group('JSONAPISerializer', () => {
  test('serialize model instance', (assert) => {
    class User extends BaseModel {
      @Column()
      public id: number

      @Column()
      public username: string
    }

    const user = new User()
    user.id = 1
    user.username = 'virk'

    reComputeAttributes(user)

    assert.deepEqual(new JSONAPISerializer().serialize(user), {
      id: 1,
      type: 'users',
      attributes: {
        username: 'virk',
      },
    })
  })

  test('always serialize primary key even when serialize is turned of', (assert) => {
    class User extends BaseModel {
      @Column({ serialize: false })
      public id: number

      @Column()
      public username: string
    }

    const user = new User()
    user.id = 1
    user.username = 'virk'

    reComputeAttributes(user)

    assert.deepEqual(new JSONAPISerializer().serialize(user), {
      id: 1,
      type: 'users',
      attributes: {
        username: 'virk',
      },
    })
  })

  test('serialize with custom serializeAs label', (assert) => {
    class User extends BaseModel {
      @Column({ serializeAs: 'userId' })
      public id: number

      @Column()
      public username: string
    }

    const user = new User()
    user.id = 1
    user.username = 'virk'

    reComputeAttributes(user)

    assert.deepEqual(new JSONAPISerializer().serialize(user), {
      id: 1,
      type: 'users',
      attributes: {
        username: 'virk',
      },
    })
  })

  test('use custom resource name', (assert) => {
    class User extends BaseModel {
      public static resource = 'myUsers'

      @Column({ serializeAs: 'userId' })
      public id: number

      @Column()
      public username: string
    }

    const user = new User()
    user.id = 1
    user.username = 'virk'

    reComputeAttributes(user)

    assert.deepEqual(new JSONAPISerializer().serialize(user), {
      id: 1,
      type: 'myUsers',
      attributes: {
        username: 'virk',
      },
    })
  })

  test('return null when input is null', (assert) => {
    assert.isNull(new JSONAPISerializer().serialize(null))
  })

  test('serialize array of models', (assert) => {
    class User extends BaseModel {
      public static resource = 'myUsers'

      @Column({ serializeAs: 'userId' })
      public id: number

      @Column()
      public username: string
    }

    const user = new User()
    user.id = 1
    user.username = 'virk'

    reComputeAttributes(user)

    assert.deepEqual(new JSONAPISerializer().serialize([user]), [{
      id: 1,
      type: 'myUsers',
      attributes: {
        username: 'virk',
      },
    }])
  })
})
