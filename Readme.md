# userdata-storage

Simple JSON storage based on system user data folder.

This project is created by [create-a-typescript-lib](https://github.com/backrunner/create-a-typescript-lib).

## Usage

Step 1: Install package

```bash
$ npm install userdata-storage
```

Step 2: Import and use this library

```ts
import UserDataStorage from 'userdata-storage';

const storage = new UserDataStorage('<appName>', '<storageName>');

await storage.set(key, payload);
await storage.get(key);
await storage.remove(key);
```

## License

MIT
