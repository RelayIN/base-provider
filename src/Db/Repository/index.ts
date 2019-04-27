/**
 * @relay/base-provider
 *
 * (c) Harminder Virk <harminder.virk@relay.in>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { BaseModelContract, RepositoryContract } from '../../Contracts'
import { QueryBuilder } from '../QueryBuilder'
import { syncAttributes, reComputeAttributes } from '../Attributes'

/**
 * Repository to execute SQL queries scoped to a given
 * Model only.
 */
export class Repository <Model extends BaseModelContract>
  extends QueryBuilder<Model>
  implements RepositoryContract<Model>
{
  /**
   * Creates a new model instance for the given row.
   */
  private _newUp (row: any, persisted: boolean): Model {
    const parentInstance = new this.parent()
    syncAttributes(parentInstance, row)

    if (persisted) {
      parentInstance.$isNew = false
    }

    return parentInstance
  }

  /**
   * Find a row by given key/value pair
   */
  public async findBy (key: string, value: any): Promise<Model | null> {
    const row = await this.builder.where(key, value).first()
    if (!row) {
      return null
    }

    return this._newUp(row, true)
  }

  /**
   * Execute the query and return results as an array
   * of model instance.
   */
  public async fetch (): Promise<Model[]> {
    const rows = await this.builder
    if (!rows.length) {
      return []
    }

    return rows.map((row: any) => this._newUp(row, true))
  }

  /**
   * Execute the query by adding `limit=1` clause to it
   */
  public async first (): Promise<Model | null> {
    const row = await this.builder.first()
    if (!row) {
      return null
    }

    return this._newUp(row, true)
  }

  /**
   * Find a row using the primary key
   */
  public async find (value: any): Promise<Model | null> {
    return this.findBy(this.parent.primaryKey, value)
  }

  /**
   * Persist a model instance to the database based upon it's
   * current state
   */
  public async persist (model: Model): Promise<void> {
    const dirty = model.$dirty

    /**
     * Always persist when model is new
     */
    if (model.$isNew) {
      const query = this.db.client.constructor.name === 'Client_PG'
        ? this.builder.returning(this.parent.primaryKey)
        : this.builder

      const id = await query.insert(dirty)
      model.$isNew = false

      /**
       * Update id on the model
       */
      model[this.parent.primaryKey] = id[0]

      /**
       * Update attributes only after the model has been persisted to the DB
       */
      reComputeAttributes(model)
      return
    }

    /**
     * If dirty values length is over 1, then we should perform
     * the update
     */
    if (Object.keys(dirty).length) {
      await this.builder.where(this.parent.primaryKey, model[this.parent.primaryKey]).update(dirty)
      reComputeAttributes(model)
    }
  }
}
