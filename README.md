# amber

[![TypeScript](https://img.shields.io/badge/%3C%2F%3E-TypeScript-%230074c1.svg)](http://www.typescriptlang.org/)
[![tested with jest](https://img.shields.io/badge/tested_with-jest-99424f.svg)](https://github.com/facebook/jest)

> Outrider Amber reporting for duty! Just say the word if you ever need my help!

amber is a utility helper for creating _manually resolved or rejected promises_.

It is nothing new or revolutionary; it is the standard `Promise` object, but
with the `resolve` and `reject` exposed so it can be called elsewhere.

```js
import { createWait } from "@tkesgar/amber";

const wait = createWait();

// Up until this line the code is still executed.
console.log("foo");

// Blocks the code from progressing until wait is resolved.
// There should be a mechanism that will resolve or reject the wait.
await wait;

// This code will never be executed because wait is never resolved.
console.log("bar");
```

You can see [Examples](#examples) below for some example usage.

## Installation

```bash
$ npm i @tkesgar/amber
```

## Usage

### createWait: WaitObject

Returns a `WaitObject`, which is a regular Promise object with addition of two
methods:

- **.resolve(value)**: resolves the wait object with the given `value`.
- **.reject(value)**: rejects the wait object with the given `value`.

As a Promise object, it will never be resolved or rejected unless `.resolve` or
`.reject` is called.

## Examples

### Polling if a file exists

```js
import { createWait } from "@tkesgar/amber";

// Create a wait object for use in polling.
const waitForFileExists = createWait();

// Polls every 1 second, checking for the file.
// If the file exists, resolve the wait.
setInterval(() => {
  (async () => {
    if (await fileExists("foo.txt")) {
      waitForFileExists.resolve();
    }
  })().catch((error) => {
    console.error(error.message);
  });
}, 1000);

// Blocks the code from progressing until the wait is resolved.
console.log("Waiting for file foo.txt to be created...");
await waitForFileExists;

// By this time, the wait is resolved (i.e. foo.txt exists).
console.log("foo.txt is successfully created!");
```

### Asynchronous UI flow

```jsx
import { createWait } from "@tkesgar/amber";

// confirmAction and confirmTerms are example functions that return the wait
// object. Here they use a hypothetical Screen object that provides
// asynchronous methods to show some UI to user.

function confirmAction() {
  const wait = createWait();

  (async () => {
    const isConfirmed = await Screen.showDialogBox("confirm");
    wait.resolve(isConfirmed);
  })().catch(handleError);

  return wait;
}

function confirmTerms() {
  const wait = createWait();

  Screen.showModal("terms", (result) => {
    wait.resolve(result.confirmed);
  });

  return wait;
}

// This is an example JSX element that handles the form submission by showing
// the required UI to user first before actually processing the form.
<form
  onSubmit={(evt) => {
    evt.preventDefault();

    (async () => {
      // Since confirmTerms and confirmActions returns the wait object, which
      // in turn is just a standard Promise, sequences of asynchronous UI flow
      // can be cleanly expressed in synchronous code.

      const confirmTerms = await confirmTerms();
      if (!confirmTerms) {
        return;
      }

      const confirmAction = await confirmAction();
      if (!confirmAction) {
        return;
      }

      processForm();
    })().catch(handleError);
  }}
>
  <input type="text" name="username" required />
  <input type="password" name="password" required />
</form>;
```

### Alternative interface with Node-style callbacks

With creating a new `Promise`:

```js
router.post("/", [
  validateBody(
    Joi.object({
      name: Joi.string(),
      password: Joi.string(),
    })
  ),
  send(async ({ req }) => {
    const { name, password } = req.body;

    const user = await authenticateUserByPassword(name, password);
    if (!user) {
      throw new AuthRequiredError("Invalid user name or password");
    }

    await new Promise((resolve, reject) => {
      req.login(user, (err) => {
        if (err) {
          reject(err);
          return;
        }

        resolve();
      });
    });

    return createAuthResponse(user);
  }),
]);
```

With `createWait`:

```js
router.post("/", [
  validateBody(
    Joi.object({
      name: Joi.string(),
      password: Joi.string(),
    })
  ),
  send(async ({ req }) => {
    const { name, password } = req.body;

    const user = await authenticateUserByPassword(name, password);
    if (!user) {
      throw new AuthRequiredError("Invalid user name or password");
    }

    const waitForLogin = createWait();

    req.login(user, (err) => {
      if (err) {
        waitForLogin.reject(err);
        return;
      }

      waitForLogin.resolve();
    });

    await waitForLogin;

    return createAuthResponse(user);
  }),
]);
```

## Contribute

Feel free to [send issues][issues] or [create pull requests][pulls].

## License

Licensed under MIT License.

[issues]: https://github.com/tkesgar/amber/issues
[pulls]: https://github.com/tkesgar/amber/pulls
