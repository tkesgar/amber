# amber

[![Amber](https://uploadstatic-sea.mihoyo.com/contentweb/20191009/2019100914372396510.png)](https://genshin.mihoyo.com/en/character/mondstadt?char=1)

> Outrider Amber reporting for duty! Just say the word if you ever need my help!

amber is a utility helper for creating *manually resolved or rejected promises*.

```jsx
import { createWait } from '@tkesgar/amber';

<form onSubmit={(evt) => {
    evt.preventDefault();

    (async () => {
        // Create a wait for user confirmation.
        const waitConfirm = createWait();

        // Obtain a value for wait from user input.
        // Here we provide the result value as resolve value for wait.
        Screen.showConfirmDialog((result) => {
            waitConfirm.resolve(result);
        });
        // Use await to block the code from progressing.
        // Subsequent code will only be executed after the wait object is resolved.
        const confirm = await waitConfirm();

        // By this time, the confirm value contains the resolved wait value.
        if (!confirm) {
            return;
        }

        submitForm();
    })().catch(error => alert(error.message));
}}>
    <input type='text' name='username' required />
    <input type='password' name='password' required />
</form>
```
