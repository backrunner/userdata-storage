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

const storage = new UserDataStorage({
  appName: '<appName>',
  storageName: '[storageName]', // optional
  safeKey: '[safeKey]', // better for security, can avoid others to read the data.
});

await storage.set(key, payload);
await storage.get(key);
await storage.remove(key);

// or using the synchronous methods (⚠ The methods include locks, be aware of dead lock)

storage.setSync(key, payload);
storage.getSync(key);
storage.removeSync(key);
```

## License

MIT
