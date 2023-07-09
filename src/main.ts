import path from 'path';
import fs from 'fs';
import userDataPath from 'userdata-path';

import { lock, lockSync, unlock } from './lock';
import { decryptContent, encryptContent } from './crypto';
import { UserDataStorageOptions } from './types';

export class UserDataStorage {
  public state: Record<string, unknown> = {};

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

  public async get<T = unknown>(key: string) {
    await lock(key);
    const state = this.state[key];
    unlock(key);
    return state as T;
  }

  public async set(key: string, value: unknown) {
    await lock(key);
    this.state[key] = value;
    unlock(key);
    this.persist();
  }

  public async remove(key: string) {
    await lock(key);
    delete this.state[key];
    this.persist();
    unlock(key);
  }

  public getSync<T = unknown>(key: string) {
    lockSync(key);
    const state = this.state[key];
    unlock(key);
    return state as T;
  }

  public setSync(key: string, value: unknown) {
    lockSync(key);
    this.state[key] = value;
    this.persist();
    unlock(key);
  }

  public removeSync(key: string) {
    lockSync(key);
    delete this.state[key];
    this.persist();
    unlock(key);
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
