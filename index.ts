/**
 * @relayin/base-provider
 *
 * (c) Harminder Virk <harminder.virk@relay.in>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

export interface RelayHelpersContract {
  exec<T extends any> (fn: Promise<T>): Promise<[Error | null, T | null]>,
}

export {
  RelayServicesContract,
  HttpOptions,
  ServiceOptions,
  BaseModelConstructorContract,
  BaseModelContract,
  ModelRefs,
  JSONAPIRootNode,
  JSONAPISerializerContract,
} from './src/Contracts'

export { PrimaryColumn, Column } from './src/Db/Decorators'
