/**
 * @relayin/base-provider
 *
 * (c) Harminder Virk <harminder.virk@relay.in>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import {
  BaseModelContract,
  JSONAPISerializerContract,
  BaseModelConstructorContract,
  JSONAPIRootNode,
} from '../../Contracts'

export class JSONAPISerializer implements JSONAPISerializerContract {
  private _serializeOne (model: BaseModelContract): JSONAPIRootNode {
    const modelConstructor = model.constructor as BaseModelConstructorContract<BaseModelContract>
    const columns = modelConstructor.columns

    const output: JSONAPIRootNode = {
      attributes: {},
      id: model.$attributes[modelConstructor.primaryKey],
      type: modelConstructor.resource,
    }

    return Object.keys(columns).reduce((result, key) => {
      const column = columns[key]

      if (column.serialize && !column.primary && column.ref !== modelConstructor.primaryKey) {
        result.attributes[column.serializeAs] = model.$attributes[key]
      }

      return result
    }, output)
  }

  public serialize (model: null): null
  public serialize (model: BaseModelContract): JSONAPIRootNode
  public serialize (model: BaseModelContract[]): JSONAPIRootNode[]
  public serialize (
    model: null | BaseModelContract | BaseModelContract[],
  ): null | JSONAPIRootNode | JSONAPIRootNode[]

  public serialize (
    model: null | BaseModelContract | BaseModelContract[],
  ): null | JSONAPIRootNode | JSONAPIRootNode[] {
    if (!model) {
      return null
    }

    if (Array.isArray(model)) {
      return model.map((one) => this._serializeOne(one))
    }
    return this._serializeOne(model)
  }
}
