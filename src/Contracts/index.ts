/**
 * @relayin/base-provider
 *
 * (c) Harminder Virk <harminder.virk@relay.in>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import * as Knex from 'knex'

export type HttpOptions = {
  headers: {
    [key: string]: any,
  },
  stream: boolean,
  body: any,
  method: string,
  encoding: string,
  form: boolean,
  json: boolean,
  query: any,
  timeout: number,
  retry: number,
  followRedirect: boolean,
  decompress: boolean,
  cache: boolean,
}

export type ServiceOptions = {
  baseUrl: string,
  version: string,
  actions: {
    [key: string]: string,
  },
}

export interface HttpResponseContract {
  body: any,
  error: any,
  state: 'initiated' | 'success' | 'error',
  hasValidationErrors: boolean,
  hasServerError: boolean,
}

export interface HttpClientContract {
  debug (): HttpClientContract,
  perform (action: string, options: Partial<HttpOptions>): Promise<HttpResponseContract>,
}

export interface RelayServicesContract {
  get (service: string): HttpClientContract
}

/**
 * Column node added via decorator
 */
export type ColumnNode = {
  type: StringConstructor | NumberConstructor | BooleanConstructor | ObjectConstructor,
  primary: boolean,
  ref: string,
  serialize: boolean,
  serializeAs: string,
  nullable: boolean,
  default: any,
  enum?: any[],
}

/**
 * Shape of static properties on the base model
 */
export interface BaseModelConstructorContract<Model extends BaseModelContract> {
  new (): Model,
  table: string,
  primaryKey: string,
  columns: {
    [key: string]: ColumnNode,
  },
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
  fetch (): Promise<Model[]>,
  persist (model: Model): Promise<void>,
}
