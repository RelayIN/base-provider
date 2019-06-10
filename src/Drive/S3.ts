import { S3Config, DriveContract } from '../Contracts'
import { PassThrough } from 'stream';

/**
 * S3 client is used to read and write user passbooks from
 * s3.
 */
export class S3 implements DriveContract {
  private _client: any
  private _bucket: string

  constructor (config: S3Config) {
    this._client = new (require('aws-sdk/clients/s3'))(config)
    this._bucket = config.bucket
  }

  /**
   * Writes file to s3
   */
  public put (location: string, content: Buffer, bucket?: string): Promise<string> {
    return new Promise((resolve, reject) => {
      const params = {
        Key: location,
        Body: content,
        Bucket: bucket || this._bucket,
      }

      this._client.upload(params, (error: Error, response: any) => {
        if (error) {
          return reject(error)
        }

        return resolve(response.Location)
      })
    })
  }

  /**
   * Pipe stream to s3.
   */
  public putStream (location: string, bucket?: string): Promise<string> {
    return new Promise((resolve, reject) => {
      const pass = new PassThrough()

      const params = {
        Key: location,
        Body: pass,
        Bucket: bucket || this._bucket,
      }

      this._client.upload(params, (error: Error, response: any) => {
        if (error) {
          return reject(error)
        }
        return resolve(response.Location)
      })
    })
  }

  /**
   * Returns a boolean telling if a file exists or not.
   */
  public exists (location: string, bucket?: string): Promise<boolean> {
    return new Promise((resolve, reject) => {
      const clonedParams = {
        Bucket: bucket || this._bucket,
        Key: location,
      }

      this._client.headObject(clonedParams, (error: any) => {
        if (error && error.statusCode === 404) {
          resolve(false)
          return
        }

        if (error) {
          reject(error)
          return
        }

        resolve(true)
      })
    })
  }

  /**
   * Stream file from a given location
   */
  public stream (location: string, bucket?: string) {
    const params = {
      Bucket: bucket || this._bucket,
      Key: location,
    }

    return this._client.getObject(params).createReadStream()
  }

  /**
   * Remove file from s3 bucket
   */
  public delete (location: string, bucket?: string): Promise<void> {
    return new Promise((resolve, reject) => {
      const params = {
        Bucket: bucket || this._bucket,
        Key: location,
      }

      this._client.deleteObject(params, (error: any) => {
        if (error) {
          return reject(error)
        }

        return resolve()
      })
    })
  }

  /**
   * Reads file from s3 bucket
   */
  public get (location: string, encoding = 'utf-8', bucket?: string): Promise<any> {
    return new Promise((resolve, reject) => {
      const params = {
        Bucket: bucket || this._bucket,
        Key: location,
      }

      this._client.getObject(params, (error: any, response: any) => {
        if (error) {
          return reject(error)
        }

        const body = response.Body
        resolve(Buffer.isBuffer(body) ? body.toString(encoding) : body)
      })
    })
  }

  /**
   * Reads file from s3 bucket
   */
  public async getJSON (location: string, encoding = 'utf-8', bucket?: string): Promise<null | any> {
    const output = await this.get(location, encoding, bucket)
    try {
      return JSON.parse(output)
    } catch (error) {
      return null
    }
  }
}
