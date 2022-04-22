# Guardian

![release](https://github.com/fluidpay/fluidpay-guardian/actions/workflows/release.yml/badge.svg)

Guardian is a user data collector tool, created for payment fraud protection.

## Usage

### With CDN:

Add the following code snippet into your html file's head.

```html
<script src="https://unpkg.com/@gwservices/guardian@latest/dist/guardian.umd.js"></script>
<script>
    new Guardian('https://my_gateway_url', 'public_api_key').process();
</script>
```

### Get the collected data

You can do it before submitting your form and attach the result to your request.

```html
<script>
    Guardian.getData().then((data) => {
        console.log(data);
    });
</script>
```

### Guardian functions

| Function                                                         | Description                                                                                          |
| ---------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------- |
| process(): void                                                  | Starting the guardian data collect process, by getting a session ID and collecting the data locally. |
| observe(): void                                                  | Start listen on pre-defined events and event changes. (Part of the process method)                   |
| observe(): void                                                  | Stops the event listening and recording.                                                             |
| static version(): string                                         | Returns the current guardian version.                                                                |
| static getData(): Promise<{events: Event[]; session_id: string}> | Returns with the collected data, ordered by the creation time. You can verify and save it.           |
