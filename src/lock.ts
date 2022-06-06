const LOCK_CHECK_SPAN = 500;

const state: Record<string, boolean> = {};

export const lock = (key: string) => {
  return new Promise<void>((resolve) => {
    if (!state[key]) {
      state[key] = true;
      resolve();
      return;
    }
    const timer = setInterval(() => {
      if (!state[key]) {
        state[key] = true;
        clearInterval(timer);
        resolve();
      }
    }, LOCK_CHECK_SPAN);
  });
};

export const unlock = (key: string) => {
  if (state[key]) state[key] = false;
};
