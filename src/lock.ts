const LOCK_CHECK_SPAN = 10;

const state: Record<string, { isLocked: boolean; buffer: SharedArrayBuffer; view: Int32Array }> = {};

export const lock = (key: string) => {
  return new Promise<void>((resolve) => {
    if (!state[key] || !state[key].isLocked) {
      state[key] = state[key] || { buffer: new SharedArrayBuffer(4), view: new Int32Array(new SharedArrayBuffer(4)) };
      state[key].isLocked = true;
      Atomics.store(state[key].view, 0, 1);
      resolve();
      return;
    }
    const timer = setInterval(() => {
      if (!state[key].isLocked) {
        state[key].isLocked = true;
        Atomics.store(state[key].view, 0, 1);
        clearInterval(timer);
        resolve();
      }
    }, LOCK_CHECK_SPAN);
  });
};

export const unlock = (key: string) => {
  if (state[key]?.isLocked) {
    state[key].isLocked = false;
    Atomics.store(state[key].view, 0, 0);
    Atomics.notify(state[key].view, 0, 1);
  }
};

export const lockSync = (key: string) => {
  if (!state[key]) {
    const buffer = new SharedArrayBuffer(4);
    const view = new Int32Array(buffer);
    Atomics.store(view, 0, 0);
    state[key] = { isLocked: false, buffer, view };
  }

  while (Atomics.load(state[key].view, 0) === 1) {
    Atomics.wait(state[key].view, 0, 1);
  }

  state[key].isLocked = true;
  Atomics.store(state[key].view, 0, 1);
};

export const unlockSync = (key: string) => {
  if (state[key]) {
    state[key].isLocked = false;
    Atomics.store(state[key].view, 0, 0);
    Atomics.notify(state[key].view, 0, 1);
  }
};
