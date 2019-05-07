/**
 * @relayin/base-provider
 *
 * (c) Harminder Virk <harminder.virk@relay.in>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { GotJSONOptions } from 'got'
import * as Knex from 'knex'
import { Stream } from 'stream'

/**
 * Converts array to an object with array values
 * as object keys
 */
export type Refs<T extends any[]> = {
  [Y in T[number]]: string
}

/**
 * Filter model whitelisted properties
 */
export type FilterModelProps<T extends any> = Exclude<T, '$attributes' | '$isNew' | '$isDirty' | '$dirty'>

/**
 * Dynamic list of model references
 */
export type ModelRefs<T extends any> = Refs<FilterModelProps<T>[]>

/**
 * Http service options
 */
export type ServiceOptions = {
  baseUrl: string,
  version: string,
  actions: {
    [key: string]: string | ((params?: any) => string),
  },
}

export type ClientActionOptions = Pick<GotJSONOptions, Exclude<keyof GotJSONOptions, 'json' | 'baseUrl'>> & {
  params?: any,
}

/**
 * Shape of HTTP response
 */
export interface HttpResponseContract {
  body: any,
  error: any,
  status: number,
  state: 'success' | 'error',
  hasValidationErrors: boolean,
  hasServerError: boolean,
}

/**
 * Http client exposes the API to execute actions
 * on a given service.
 */
export interface HttpClientContract {
  debug (): HttpClientContract,
  perform (name: string, options: ClientActionOptions): Promise<HttpResponseContract>,
}

/**
 * Relay services contract
 */
export interface RelayServicesContract {
  get (service: string): HttpClientContract
}

/**
 * Column node added via decorator
 */
export type ColumnNode = {
  type: StringConstructor | NumberConstructor | BooleanConstructor | ObjectConstructor | DateConstructor,
  primary: boolean,
  ref: string,
  serialize: boolean,
  serializeAs: string,
  nullable: boolean,
  default: any,
  enum?: any[],
}

export type ColumnContract = (
  options?: Partial<ColumnNode & { columnName: string, increments: boolean }>,
) => ((target: any, key: string) => void)

/**
 * Shape of static properties on the base model
 */
export interface BaseModelConstructorContract<Model extends BaseModelContract> {
  new (): Model,
  table: string,
  primaryKey: {
    column: string,
    ref: string,
    increments: boolean,
  },
  resource: string,

  query <T extends BaseModelContract> (
    this: BaseModelConstructorContract<T>,
    customDb?: Knex,
  ): QueryBuilderContract & RepositoryContract<T>,

  columns: {
    [key: string]: ColumnNode,
  },

  bootIfNotBooted (): void,

  db: Knex
}

/**
 * Shape of BaseModel
 */
export interface BaseModelContract {
  $attributes: any,
  $dirty: any,
  $isNew: boolean,
  $isDirty: boolean,
  save (): Promise<void>,
}

/**
 * Shape of JSONAPIRootNode returned by the [[JSONAPISerializer.serialize]]
 * method
 */
export type JSONAPIRootNode = {
  id: string | number,
  type: string,
  attributes: any,
}

/**
 * JSONAPI serializer interface
 */
export interface JSONAPISerializerContract {
  serialize (model: null): null
  serialize (model: BaseModelContract): JSONAPIRootNode
  serialize (model: BaseModelContract[]): JSONAPIRootNode[]
  serialize (
    model: null | BaseModelContract | BaseModelContract[],
  ): null | JSONAPIRootNode | JSONAPIRootNode[]
}

export type WhereCallback<Repository> = (query: Repository) => any

export interface QueryBuilderContract {
  where (callack: WhereCallback<this>): this,
  where (key: string, value: any): this,
  where (key: string, operator: string, value: any): this,

  whereIn (key: string, value: WhereCallback<this> | any): this,
  whereNotIn (key: string, value: WhereCallback<this> | any): this,

  whereNull (key: string): this,
  whereNotNull (key: string): this,

  distinct (...keys: string[]): this,

  groupBy (...names: string[]): this,
  orderBy (key: string, directory: string): this,

  tap (callback: (builder: Knex.QueryBuilder) => void): this,
  toSQL (): Knex.Sql,
}

export interface RepositoryContract<Model extends BaseModelContract> {
  findBy (key: string, value: any): Promise<Model | null>,
  find (value: any): Promise<Model | null>,
  first (): Promise<Model | null>,
  fetch (): Promise<Model[]>,
  exec (): Promise<any>,
  persist (model: Model): Promise<void>,
}

/**
 * S3 config object shape
 */
export type S3Config = {
  accessKeyId: string,
  secretAccessKey: string,
  region: string,
  bucket: string,
}

export interface DriveContract {
  get (location: string, encoding?: string): Promise<any>,
  getJSON (location: string, encoding?: string): Promise<null | any>,
  put (location: string, content: Buffer): Promise<string>,
  exists (location: string): Promise<boolean>,
  stream (location: string): Stream,
  delete (location: string): Promise<void>,
}
