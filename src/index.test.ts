import { createWait } from ".";

describe("createWait", () => {
  it("should properly block code execution", async () => {
    const fn = jest.fn();

    const wait = createWait();

    process.nextTick(() => {
      fn();
      wait.resolve();
    });

    expect(fn).toBeCalledTimes(0);
    await wait;
    expect(fn).toBeCalledTimes(1);
  });

  it("should provide the value provided at resolve as wait value", async () => {
    const wait = createWait<Record<string, string>>();

    process.nextTick(() => {
      wait.resolve({ foo: "bar" });
    });

    expect(await wait).toEqual({ foo: "bar" });
  });

  it("should provide the value provided at reject as wait throw", async () => {
    const wait = createWait();

    process.nextTick(() => {
      wait.reject(new Error("Failed to wait"));
    });

    await expect(wait).rejects.toThrow("Failed to wait");
  });
});
