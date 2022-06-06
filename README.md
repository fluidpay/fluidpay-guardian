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

### With import:

```js
import Guardian from '@gwservices/guardian';

let guard = new Guardian('https://my_gateway_url', 'public_api_key').process();

// Optional
Guardian.getData().then((data) => {
    console.log(data);
});
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

## Running demo instance

### Install dependencies

```sh
npm run demo:install
```

### Run demo dev server

```sh
npm run demo:dev
```

### Run demo application

```sh
npm install # install guardian dependencies
npm run demo:install # install the demo app dependencies
npm run build # build guardian
npm preview # this command will block your terminal, please open a new tab to continue; this command will provide the built guardian files
npm run demo:dev # this command will block your terminal, please open a new tab to continue; this command will run the demo app's development server
```

### Run e2e tests
Running the cypress tests:
```sh
npm run cypress:open # this command will start the e2e test framework
# or
npx cypress run --headless -b chrome # this command will run tests in headless mode
```
