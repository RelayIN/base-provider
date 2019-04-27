/**
 * @relay/base-provider
 *
 * (c) Harminder Virk <harminder.virk@relay.in>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import * as Knex from 'knex'
import { types } from 'pg'

const DIM = '\x1b[2m'
const RESET = '\x1b[0m'

/**
 * Configures and returns knex instance
 */
export function configureDb (config): Knex {
  types.setTypeParser(1082, (timestamp: string) => timestamp)

  const db = Knex(config.get('database')[config.get('database.connection')])

  /**
   * Pretty print queries when `LOG_QUERIES` is set to true
   */
  /* istanbul ignore next */
  if (process.env.LOG_QUERIES) {
    const colorize = require('igniculus')({
      standardKeywords: { fg: 'cyan', casing: 'uppercase' },
      output: (formattedSql) => {
        return function foo (params) {
          const formattedParams = `${DIM}-- PARAMETERS: ${JSON.stringify(params)}${RESET}`
          console.log(formattedSql, formattedParams)
        }
      },
    })

    db.on('query', ({ sql, bindings }) => {
      colorize(sql)(bindings)
    })
  }

  return db
}
