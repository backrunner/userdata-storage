import path from 'path';
import fs from 'fs';
import userDataPath from 'userdata-path';
import { lock, unlock } from './lock';
export default class UserDataStorage {
  public state: Record<string, unknown> = {};
  private storageDir: string;
  private storageFilePath: string;

  public constructor(appName: string, storageName: string) {
    this.storageDir = path.resolve(userDataPath, appName);
    this.storageFilePath = path.resolve(this.storageDir, `${storageName}.json`);
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

  public async get(key: string) {
    await lock(key);
    const state = this.state[key];
    unlock(key);
    return state;
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
    unlock(key);
    this.persist();
  }

  private restore() {
    this.state = JSON.parse(fs.readFileSync(this.storageFilePath, { encoding: 'utf-8' }));
  }

  private persist() {
    fs.writeFileSync(this.storageFilePath, JSON.stringify(this.state), { encoding: 'utf-8' });
  }
}
