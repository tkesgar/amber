export type Wait<T> = Promise<T> & {
  resolve(value: T): void;
  reject(reason: unknown): void;
};

export function createWait<T = void>(): Wait<T> {
  let resolve: (value: T) => void;
  let reject: (reason: unknown) => void;

  const promise = new Promise<T>((_resolve, _reject) => {
    resolve = _resolve;
    reject = _reject;
  });

  return Object.assign(promise, {
    resolve,
    reject,
  });
}
