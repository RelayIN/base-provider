/**
 * @relay/base-provider
 *
 * (c) Harminder Virk <harminder.virk@relay.in>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import * as Knex from 'knex'
import { BaseModelContract, ColumnNode, BaseModelConstructorContract } from '../../Contracts'
import { Repository } from '../Repository'
import { getDirty } from '../Attributes'

abstract class BaseModel implements BaseModelContract {
  public $attributes = {}
  public $isNew = true

  /**
   * Returns dirty values
   */
  public get $dirty () {
    return getDirty(this)
  }

  /**
   * Returns a boolean telling if model is dirty to be
   * persisted
   */
  public get $isDirty () {
    return Object.keys(this.$dirty).length > 0
  }

  /**
   * Returns a new repository instance to execute queries
   * scoped to this model only
   */
  public static query<T extends BaseModelContract> (
    this: BaseModelConstructorContract<T>,
    customDb?: Knex,
  ): Repository<T> {
    return new Repository(this, customDb || this.db)
  }

  /**
   * Following values must be set to undefined, so that Decorators
   * can instantiate fresh copy for each model.
   */
  public static columns: { [key: string]: ColumnNode }
  public static primaryKey: string
  public static table: string
  public static db: Knex
}

/**
 * Base model to be extended for creating new models
 */
export function configureModel (db: Knex) {
  BaseModel.db = db
  return BaseModel
}
