import path from 'path';
import fs from 'fs';
import userDataPath from 'userdata-path';

import { lock, lockSync, unlock } from './lock';
import { decryptContent, encryptContent } from './crypto';
import { UserDataStorageOptions } from './types';

export type UserDataStorageState<K> = K extends Record<string, any> ? K : Record<string, unknown>;

export class UserDataStorage<K extends Record<string, unknown>> {
  // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
  public state = {} as K;

  private storageDir: string;
  private storageFilePath: string;
  private safeKey?: string;

  public constructor(options: UserDataStorageOptions) {
    this.storageDir = path.resolve(userDataPath, options.appName);
    this.storageFilePath = path.resolve(
      this.storageDir,
      `${options.storageName || 'default'}.${options.extName || 'json'}`,
    );
    this.safeKey = options.safeKey;
    if (!fs.existsSync(this.storageDir)) {
      fs.mkdirSync(this.storageDir);
    } else if (fs.existsSync(this.storageFilePath)) {
      try {
        this.restore();
      } catch (err) {
        console.error('Storage corrupted.', err);
      }
    }
  }

  public async get<T extends keyof K>(key: T): Promise<K[T]> {
    await lock(key as string);
    const state = this.state[key];
    unlock(key as string);
    return state;
  }

  public async set<T extends keyof K>(key: T, value: K[T]) {
    await lock(key as string);
    this.state[key] = value;
    unlock(key as string);
    this.persist();
  }

  public async remove(key: string) {
    await lock(key);
    delete this.state[key];
    this.persist();
    unlock(key);
  }

  public getSync<T extends keyof K>(key: T) {
    return this.state[key];
  }

  public setSync<T extends keyof K>(key: T, value: K[T]) {
    lockSync(key as string);
    this.state[key] = value;
    this.persist();
    unlock(key as string);
  }

  public removeSync<T extends keyof K>(key: T) {
    lockSync(key as string);
    delete this.state[key];
    this.persist();
    unlock(key as string);
  }

  public getState() {
    return this.state;
  }

  /**
   * @desc Remove all the data (actually the storage file) from the disk
   */
  public purge() {
    fs.rmSync(this.storageFilePath, { force: true });
  }

  private restore() {
    const fileContent = fs.readFileSync(this.storageFilePath, { encoding: 'utf-8' });
    this.state = JSON.parse(this.safeKey ? decryptContent(fileContent, this.safeKey) : fileContent);
  }

  private persist() {
    const stringified = JSON.stringify(this.state);
    const content = this.safeKey ? encryptContent(stringified, this.safeKey) : stringified;
    fs.writeFileSync(this.storageFilePath, content, { encoding: 'utf-8' });
  }
}
