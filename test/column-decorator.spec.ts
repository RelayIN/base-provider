/*
* @relayin/base-provider
*
* (c) Harminder Virk <harminder.virk@relay.in>
*
* For the full copyright and license information, please view the LICENSE
* file that was distributed with this source code.
*/

import * as test from 'japa'
import { Column } from '../src/Db/Decorators'
import { ColumnNode, ModelRefs } from '../src/Contracts'

test.group('Decorators | Column', () => {
  test('generate meta data with defaults', (assert) => {
    class Foo {
      public static columns: { [key: string]: ColumnNode } = {}
      @Column({})
      public username: string

      public static refs: ModelRefs<keyof Foo>
    }

    assert.deepEqual(Foo.columns, {
      username: {
        ref: 'username',
        type: String,
        nullable: false,
        default: null,
        primary: false,
        serialize: true,
        serializeAs: 'username',
      },
    })

    assert.deepEqual(Foo.refs, { username: 'username' })
  })

  test('set column as primary', (assert) => {
    class Foo {
      public static columns: { [key: string]: ColumnNode } = {}
      public static primaryKey: string

      @Column({ primary: true })
      public username: string

      public static refs: ModelRefs<keyof Foo>
    }

    assert.equal(Foo.primaryKey, 'username')
    assert.deepEqual(Foo.columns, {
      username: {
        ref: 'username',
        type: String,
        nullable: false,
        default: null,
        primary: true,
        serialize: true,
        serializeAs: 'username',
      },
    })

    assert.deepEqual(Foo.refs, { username: 'username' })
  })

  test('raise error when 2 keys are defined as primary', (assert) => {
    assert.plan(1)

    try {
      class Foo {
        public static columns: { [key: string]: ColumnNode } = {}
        public static primary: string

        @Column({ primary: true })
        public id: string

        @Column({ primary: true })
        public username: string
      }

      new Foo()
    } catch ({ message }) {
      assert.equal(message, 'Foo: Attempt to override primary key `id` failed')
    }
  })

  test('hide column from serialization', (assert) => {
    class Foo {
      public static columns: { [key: string]: ColumnNode } = {}
      public static primary: string

      @Column({ primary: true })
      public id: string

      @Column({ serialize: false })
      public username: string

      public static refs: ModelRefs<keyof Foo>
    }

    assert.deepEqual(Foo.columns, {
      id: {
        ref: 'id',
        type: String,
        nullable: false,
        default: null,
        primary: true,
        serialize: true,
        serializeAs: 'id',
      },
      username: {
        ref: 'username',
        type: String,
        nullable: false,
        default: null,
        primary: false,
        serialize: false,
        serializeAs: 'username',
      },
    })

    assert.deepEqual(Foo.refs, { username: 'username', id: 'id' })
  })

  test('define different serialization key', (assert) => {
    class Foo {
      public static columns: { [key: string]: ColumnNode } = {}
      public static primary: string

      @Column({ primary: true })
      public id: string

      @Column({ serializeAs: 'name' })
      public username: string
    }

    assert.deepEqual(Foo.columns, {
      id: {
        ref: 'id',
        type: String,
        nullable: false,
        default: null,
        primary: true,
        serialize: true,
        serializeAs: 'id',
      },
      username: {
        ref: 'username',
        type: String,
        nullable: false,
        default: null,
        primary: false,
        serialize: true,
        serializeAs: 'name',
      },
    })
  })

  test('hide column from serialization', (assert) => {
    class Foo {
      public static columns: { [key: string]: ColumnNode } = {}
      public static primary: string

      @Column({ primary: true })
      public id: string

      @Column({ serialize: false })
      public username: string
    }

    assert.deepEqual(Foo.columns, {
      id: {
        ref: 'id',
        type: String,
        nullable: false,
        default: null,
        primary: true,
        serialize: true,
        serializeAs: 'id',
      },
      username: {
        ref: 'username',
        type: String,
        nullable: false,
        default: null,
        primary: false,
        serialize: false,
        serializeAs: 'username',
      },
    })
  })

  test('raise error when type is not supported', (assert) => {
    assert.plan(1)
    try {
      class Foo {
        public static columns: { [key: string]: ColumnNode } = {}
        public static primary: string

        @Column({ serializeAs: 'name', type: Array } as any)
        public username: string
      }
      new Foo()
    } catch ({ message }) {
      assert.equal(message, 'Foo.username: Column type Array is not supported')
    }
  })

  test('raise error when default value type is different from actual type', (assert) => {
    assert.plan(1)
    try {
      class Foo {
        public static columns: { [key: string]: ColumnNode } = {}
        public static primary: string

        @Column({ serializeAs: 'name', default: 22 })
        public username: string
      }
      new Foo()
    } catch ({ message }) {
      assert.equal(message, 'Foo.username: Invalid default value. Only String is allowed')
    }
  })

  test('allow null as default', (assert) => {
    class Foo {
      public static columns: { [key: string]: ColumnNode } = {}
      public static primary: string

      @Column({ serializeAs: 'name', default: null })
      public username: string
    }

    assert.isNull(Foo.columns.username.default)
  })
})
