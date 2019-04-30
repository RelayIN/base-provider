/*
* relayin/base-provider
*
* (c) Harminder Virk <harminder.virk@relay.in>
*
* For the full copyright and license information, please view the LICENSE
* file that was distributed with this source code.
*/

import * as Knex from 'knex'
import { join } from 'path'
import { remove } from 'fs-extra'

export class FakeConfig {
  public get (key?: string): any {
    if (key === 'database.connection') {
      return 'sqlite'
    }

    return {
      connection: 'sqlite',
      sqlite: {
        client: 'sqlite',
        useNullAsDefault: true,
        connection: {
          filename: join(__dirname, 'db.sqlite'),
        },
      },
    }
  }
}

export function db () {
  return Knex(new FakeConfig().get().sqlite)
}

export async function migrateDb () {
  await db().schema.createTable('users', (table) => {
    table.increments()
    table.string('username')
    table.string('email')
    table.string('full_name')
    table.timestamps()
  })

  await db().schema.createTable('posts', (table) => {
    table.increments('post_id')
    table.string('title')
    table.timestamps()
  })
}

export async function cleanup () {
  await db().schema.dropTable('users')
  await db().schema.dropTable('posts')
  await remove(join(__dirname, 'db.sqlite'))
}
