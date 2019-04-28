/**
 * @relay/base-provider
 *
 * (c) Harminder Virk <harminder.virk@relay.in>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import * as Knex from 'knex'
import {
  BaseModelContract,
  QueryBuilderContract,
  BaseModelConstructorContract,
  WhereCallback,
} from '../../Contracts'

/**
 * Extends knex query builder to perform build a fluent query chain. The class
 * is work in progress, so make sure to use [[QueryBuilder.tap]] to get
 * access to the knex query builder.
 */
export class QueryBuilder<Model extends BaseModelContract> implements QueryBuilderContract {
  /**
   * Creating instance of query builder and use table name
   * from the parent model
   */
  protected builder: Knex.QueryBuilder

  constructor (
    protected parent: BaseModelConstructorContract<Model>,
    protected db: Knex,
  ) {
    this.parent.bootIfNotBooted()
    this.builder = this.db.table(this.parent.table)
  }

  public whereNull (key: string): this {
    this.builder.whereNull(key)
    return this
  }

  public whereNotNull (key: string): this {
    this.builder.whereNotNull(key)
    return this
  }

  public where (callback: WhereCallback<this>): this
  public where (key: string, value: any): this
  public where (key: string, operator: string, value: any): this
  public where (key: string | WhereCallback<this>, operator?: string, value?: any): this {
    if (operator && value) {
      this.builder.where(key as string, operator, value)
    } else if (operator) {
      this.builder.where(key as string, operator)
    } else {
      this.builder.where(key)
    }

    return this
  }

  public whereIn (key: string, value: WhereCallback<this> | any): this {
    this.builder.whereIn(key, value)
    return this
  }

  public whereNotIn (key: string, value: WhereCallback<this> | any): this {
    this.builder.whereNotIn(key, value)
    return this
  }

  public distinct (...columns: string[]): this {
    this.builder.distinct(...columns)
    return this
  }

  public orderBy (columnName: string, direction: string): this {
    this.builder.orderBy(columnName, direction)
    return this
  }

  public groupBy (...columns: string[]): this {
    this.builder.groupBy(...columns)
    return this
  }

  public tap (callback: (builder: Knex.QueryBuilder) => any): this {
    callback(this.builder)
    return this
  }

  public toSQL (): Knex.Sql {
    return this.builder.toSQL()
  }
}
