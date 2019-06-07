import { S3 } from 'aws-sdk';
import { StoreItems, Storage } from 'botbuilder-core';

export default class S3Storage implements Storage {
  private s3Client: S3;
  private bucketName: string;
  protected etag: number;

  constructor(bucketName: string) {
    this.bucketName = bucketName;
    this.s3Client = new S3({
      region: 'ap-northeast-1',
      apiVersion: '2006-03-01',
    });
  }

  async getObject(key: string) {
    return this.s3Client
      .getObject({
        Bucket: this.bucketName,
        Key: key.replace(/\/$/, ''),
      })
      .promise();
  }

  async putObject(key: string, payload: string) {
    return this.s3Client
      .putObject({
        Bucket: this.bucketName,
        Key: key.replace(/\/$/, ''),
        Body: JSON.stringify(payload),
      })
      .promise();
  }

  async read(keys: string[]) {
    const data = {};
    for (let key of keys) {
      try {
        const item = await this.getObject(key);
        data[key] = JSON.parse(item.Body.toString());
      } catch (e) {
        // console.log(e);
      }
    }
    return data;
  }
  async write(changes: StoreItems) {
    let old: any;
    for (let key of Object.keys(changes)) {
      const newItem = changes[key];
      try {
        const item = await this.getObject(key);
        old = item.Body.toString();
      } catch (e) {
        old = false;
      }
      if (!old || newItem.eTag === '*') {
        await this.putObject(key, newItem);
      } else {
        const oldItem = JSON.parse(old);
        if (newItem.eTag === oldItem.eTag) {
          await this.putObject(key, newItem);
        } else {
          new Error(`Storage: error writing "${key}" due to eTag conflict.`);
        }
      }
    }
  }
  async delete(keys: string[]) {
    for (let key of keys) {
      try {
        await this.s3Client
          .deleteObject({
            Bucket: this.bucketName,
            Key: key.replace(/\/$/, ''),
          })
          .promise();
      } catch (e) {
        // console.log(e);
      }
    }
  }
}
