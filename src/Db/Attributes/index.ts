/*
* @relayin/base-provider
*
* (c) Harminder Virk <harminder.virk@relay.in>
*
* For the full copyright and license information, please view the LICENSE
* file that was distributed with this source code.
*/

import { Exception } from '@adonisjs/utils'
import { BaseModelContract, ColumnNode } from '../../Contracts'

/**
 * Updates the `$attributes` object on the model by using `data`
 * as the source of truth.
 *
 * The `$attributes` object and properties for each column on the
 * model instance are also mutated.
 */
export function syncAttributes (model: BaseModelContract, data: any) {
  const columns: { [key: string]: ColumnNode } = (model.constructor as any).columns
  model.$attributes = {}

  Object.keys(columns).forEach((key) => {
    const column = columns[key]
    const value = data[key] !== undefined
      ? data[key]
      : (column.default !== undefined ? column.default : null)

    model.$attributes[key] = value
    model[column.ref] = value
  })
}

/**
 * Re-computes the model attributes by using the model instance
 * values as the source of truth.
 *
 * The `$attributes` object on the model is mutated.
 */
export function reComputeAttributes (model: BaseModelContract) {
  const columns: { [key: string]: ColumnNode } = (model.constructor as any).columns
  Object.keys(columns).forEach((key) => {
    const column = columns[key]

    const value = model[column.ref] !== undefined
      ? model[column.ref]
      : (column.default !== undefined ? column.default : null)

    model.$attributes[key] = value
  })
}

/**
 * Returns an object with dirty values. It's a diff between last sync
 * of `$attributes` and the actual values on the model instance
 */
export function getDirty (model: BaseModelContract) {
  const columns: { [key: string]: ColumnNode } = (model.constructor as any).columns

  return Object.keys(columns).reduce((result, key) => {
    const column = columns[key]
    const modelValue = model[column.ref]
    const attributeValue = model.$attributes[key]

    if (modelValue !== attributeValue) {
      result[key] = modelValue !== undefined ? modelValue : null
    }

    return result
  }, {})
}

/**
 * Validate columns value on the model instance to ensure they can
 * be written to the DB
 */
export function validate (model: BaseModelContract) {
  const columns: { [key: string]: ColumnNode } = (model.constructor as any).columns

  Object.keys(columns).forEach((key) => {
    const column = columns[key]
    const modelValue = model[column.ref]

    if (column.nullable) {
      return
    }

    if ((modelValue === undefined || modelValue === null) && column.default === null) {
      throw new Exception(`${model.constructor.name}.${column.ref}: not null constraint failed`, 500)
    }
  })
}
