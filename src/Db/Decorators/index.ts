/*
* @relayin/base-provider
*
* (c) Harminder Virk <harminder.virk@relay.in>
*
* For the full copyright and license information, please view the LICENSE
* file that was distributed with this source code.
*/

import 'reflect-metadata'
import decamelize from 'decamelize'
import { ColumnContract, ColumnNode } from '../../Contracts'

const PROP_TYPE = 'design:type'
const ALLOWED_TYPES = [String, Number, Boolean, Object, Date]

/**
 * Returns error when attempting to override existing primary key
 */
function cannotOverridePrimaryKey (model: string, column: string) {
  return new Error(`${model}: Attempt to override primary key \`${column}\` failed`)
}

/**
 * Returns error for invalid column type
 */
function invalidType (model: string, column: string, type: string) {
  return new Error(`${model}.${column}: Column type ${type} is not supported`)
}

/**
 * Returns error for invalid column type
 */
function invalidDefaultValue (model: string, column: string, type: string) {
  return new Error(`${model}.${column}: Invalid default value. Only ${type} is allowed`)
}

/**
 * Define a primary column
 */
export const PrimaryColumn: ColumnContract = function PrimaryColumn (options = {}) {
  return Column(Object.assign({ primary: true }, options))
}

/**
 * A decorator function to mark class fields as columns
 */
export const Column: ColumnContract = function Column (options = {}) {
  return function ColumnDecorator (target: any, key: string) {
    const columnName = options.columnName || decamelize(key)

    const column: ColumnNode = Object.assign({
      type: Reflect.getMetadata(PROP_TYPE, target, key),
      primary: false,
      serialize: true,
      serializeAs: columnName,
      nullable: false,
      default: null,
      ref: key,
    }, options)

    /**
     * Ensure the type is valid
     */
    if (ALLOWED_TYPES.indexOf(column.type) === -1) {
      throw invalidType(target.constructor.name, key, column.type.name)
    }

    if (
      column.default !== undefined
      && column.default !== null
      && typeof (column.default) !== column.type.name.toLowerCase()
    ) {
      throw invalidDefaultValue(target.constructor.name, key, column.type.name)
    }

    /**
     * Raise error when multiple keys are defined primary
     */
    if (target.constructor.primaryKey && column.primary) {
      throw cannotOverridePrimaryKey(target.constructor.name, target.constructor.primaryKey.ref)
    }

    /**
     * Update primary column when primary key is defined
     */
    if (column.primary) {
      target.constructor.primaryKey = {
        column: columnName,
        ref: key,
        increments: options.increments === undefined ? true : options.increments,
      }
    }

    /**
     * Updated columns object
     */
    target.constructor.columns = target.constructor.columns || {}
    target.constructor.columns[columnName] = column

    /**
     * Update columns inside refs for quick dynamic access
     */
    target.constructor.refs = target.constructor.refs || {}
    target.constructor.refs[key] = columnName
  }
}
