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

### (Optional) Get the collected data

You can do it before submitting your form and attach the result to your request.

```html
<script>
    Guardian.getData().then((data) => {
        console.log(data);
    });
</script>
```
