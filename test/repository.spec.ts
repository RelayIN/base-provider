/*
* @relayin/base-provider
*
* (c) Harminder Virk <harminder.virk@relay.in>
*
* For the full copyright and license information, please view the LICENSE
* file that was distributed with this source code.
*/

import * as test from 'japa'
import * as QueryBuilder from 'knex/lib/query/builder'

import { configureDb } from '../src/Db'
import { configureModel } from '../src/Db/BaseModel'
import { Repository } from '../src/Db/Repository'
import { Column } from '../src/Db/Decorators'
import { FakeConfig, migrateDb, cleanup, db } from './helpers'

const BaseModel = configureModel(configureDb(new FakeConfig()))

class User extends BaseModel {
  public static table = 'users'

  @Column({ primary: true })
  public id: number

  @Column()
  public username: string

  @Column()
  public fullName: string
}

test.group('Repository', (group) => {
  group.before(async () => {
    await migrateDb()
  })

  group.after(async () => {
    await cleanup()
  })

  test('create base query builder from model table', (assert) => {
    const repo = new Repository(User, configureDb(new FakeConfig()))
    assert.instanceOf(repo['builder'], QueryBuilder)
  })

  test('add where clause to the query', (assert) => {
    const repo = new Repository(User, configureDb(new FakeConfig()))
    const sql = repo.where('username', 'virk').toSQL().sql
    assert.equal(sql, 'select * from `users` where `username` = ?')
  })

  test('add whereIn clause to the query', (assert) => {
    const repo = new Repository(User, configureDb(new FakeConfig()))
    const sql = repo.whereIn('type', ['admin', 'guest']).toSQL().sql
    assert.equal(sql, 'select * from `users` where `type` in (?, ?)')
  })

  test('add whereNotIn clause to the query', (assert) => {
    const repo = new Repository(User, configureDb(new FakeConfig()))
    const sql = repo.whereNotIn('type', ['admin', 'guest']).toSQL().sql
    assert.equal(sql, 'select * from `users` where `type` not in (?, ?)')
  })

  test('add distinct clause to the query', (assert) => {
    const repo = new Repository(User, configureDb(new FakeConfig()))
    const sql = repo.distinct('age').toSQL().sql
    assert.equal(sql, 'select distinct `age` from `users`')
  })

  test('add orderBy clause to the query', (assert) => {
    const repo = new Repository(User, configureDb(new FakeConfig()))
    const sql = repo.orderBy('id', 'desc').toSQL().sql
    assert.equal(sql, 'select * from `users` order by `id` desc')
  })

  test('add groupBy clause to the query', (assert) => {
    const repo = new Repository(User, configureDb(new FakeConfig()))
    const sql = repo.groupBy('age').toSQL().sql
    assert.equal(sql, 'select * from `users` group by `age`')
  })

  test('tab into query chain to access knex', (assert) => {
    const repo = new Repository(User, configureDb(new FakeConfig()))
    const sql = repo.tap((query) => query.count('* as total')).toSQL().sql
    assert.equal(sql, 'select count(*) as `total` from `users`')
  })

  test('wrap findBy result in model instance', async (assert) => {
    await db().table('users').insert({
      username: 'virk',
      full_name: 'Harminder Virk',
      email: 'virk@adonisjs.com',
    })

    const repo = new Repository(User, configureDb(new FakeConfig()))
    const user = await repo.findBy('username', 'virk')

    assert.instanceOf(user, User)
    assert.deepEqual(user!.$attributes, {
      id: 1,
      full_name: 'Harminder Virk',
      username: 'virk',
    })

    await db().table('users').truncate()

    assert.deepEqual(user!.$dirty, {})
    assert.isFalse(user!.$isNew)
    assert.isFalse(user!.$isDirty)
  })

  test('set model instance properties when exists as column', async (assert) => {
    await db().table('users').insert({
      username: 'virk',
      full_name: 'Harminder Virk',
      email: 'virk@adonisjs.com',
    })

    const repo = new Repository(User, configureDb(new FakeConfig()))
    const user = await repo.findBy('username', 'virk')

    await db().table('users').truncate()

    assert.instanceOf(user, User)
    assert.equal(user!.username, 'virk')
  })

  test('set model instance properties when display value is different', async (assert) => {
    await db().table('users').insert({
      username: 'virk',
      full_name: 'Harminder Virk',
      email: 'virk@adonisjs.com',
    })

    const repo = new Repository(User, configureDb(new FakeConfig()))
    const user = await repo.findBy('username', 'virk')

    await db().table('users').truncate()

    assert.instanceOf(user, User)
    assert.equal(user!.fullName, 'Harminder Virk')
  })

  test('set model instance properties when display value is different', async (assert) => {
    await db().table('users').insert({
      username: 'virk',
      full_name: 'Harminder Virk',
      email: 'virk@adonisjs.com',
    })

    const repo = new Repository(User, configureDb(new FakeConfig()))
    const user = await repo.findBy('username', 'virk')

    await db().table('users').truncate()

    assert.instanceOf(user, User)
    assert.equal(user!.fullName, 'Harminder Virk')
  })

  test('wrap fetch result in model instance', async (assert) => {
    await db().table('users').insert({
      username: 'virk',
      full_name: 'Harminder Virk',
      email: 'virk@adonisjs.com',
    })

    const repo = new Repository(User, configureDb(new FakeConfig()))
    const users = await repo.fetch()
    await db().table('users').truncate()

    assert.lengthOf(users, 1)
    assert.deepEqual(users[0].$attributes, {
      id: 1,
      full_name: 'Harminder Virk',
      username: 'virk',
    })

    assert.deepEqual(users[0].$dirty, {})
    assert.isFalse(users[0].$isNew)
    assert.isFalse(users[0].$isDirty)
  })

  test('persist model instance with values', async (assert) => {
    let query: any = null
    function queryListener (sqlQuery) {
      query = sqlQuery
    }

    const db = configureDb(new FakeConfig())
    db.on('query', queryListener)

    const repo = new Repository(User, db)
    const user = new User()
    user.username = 'virk'
    user.fullName = 'H virk'
    await repo.persist(user)

    db['removeAllListeners']('query', queryListener)
    await db.table('users').truncate()

    assert.equal(query.sql, 'insert into `users` (`full_name`, `username`) values (?, ?)')
    assert.deepEqual(query.bindings, ['H virk', 'virk'])
    assert.isFalse(user.$isNew)
    assert.deepEqual(user.$attributes, { id: 1, username: 'virk', full_name: 'H virk' })
    assert.isFalse(user.$isDirty)
  })

  test('multiple calls to persist should ignore with values are same', async (assert) => {
    let queries: any[] = []
    function queryListener (sqlQuery) {
      queries.push(sqlQuery)
    }

    const db = configureDb(new FakeConfig())
    db.on('query', queryListener)

    const repo = new Repository(User, db)
    const user = new User()
    user.username = 'virk'
    user.fullName = 'H virk'
    await repo.persist(user)
    await repo.persist(user)
    await repo.persist(user)

    db['removeAllListeners']('query', queryListener)
    await db.table('users').truncate()

    assert.lengthOf(queries, 1)
    assert.equal(queries[0].sql, 'insert into `users` (`full_name`, `username`) values (?, ?)')
    assert.deepEqual(queries[0].bindings, ['H virk', 'virk'])
    assert.isFalse(user.$isNew)
    assert.deepEqual(user.$attributes, { id: 1, username: 'virk', full_name: 'H virk' })
    assert.isFalse(user.$isDirty)
  })

  test('multiple calls to persist after values change must result in update', async (assert) => {
    let queries: any[] = []
    function queryListener (sqlQuery) {
      queries.push(sqlQuery)
    }

    const db = configureDb(new FakeConfig())
    db.on('query', queryListener)

    const repo = new Repository(User, db)
    const user = new User()
    user.username = 'virk'
    user.fullName = 'H virk'
    await repo.persist(user)
    assert.isFalse(user.$isNew)
    assert.isFalse(user.$isDirty)

    user.fullName = 'Harminder virk'
    assert.isTrue(user.$isDirty)
    assert.deepEqual(user.$dirty, { full_name: 'Harminder virk' })

    await repo.persist(user)

    db['removeAllListeners']('query', queryListener)
    await db.table('users').truncate()

    assert.lengthOf(queries, 2)
    assert.equal(queries[0].sql, 'insert into `users` (`full_name`, `username`) values (?, ?)')
    assert.deepEqual(queries[0].bindings, ['H virk', 'virk'])

    assert.equal(queries[1].sql, 'update `users` set `full_name` = ? where `id` = ?')
    assert.deepEqual(queries[1].bindings, ['Harminder virk', 1])
    assert.isFalse(user.$isDirty)
    assert.deepEqual(user.$attributes, { id: 1, username: 'virk', full_name: 'Harminder virk' })
  })
})
