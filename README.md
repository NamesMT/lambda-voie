# Lambda Voie

![TypeScript](https://img.shields.io/badge/TYPESCRIPT-%23007ACC.svg?style=for-the-badge&logo=typescript&logoColor=white)
![AWS](https://img.shields.io/badge/AWS-%23FF9900.svg?style=for-the-badge&logo=amazon-aws&logoColor=white)

[![npm version][npm-version-src]][npm-version-href]
[![npm downloads][npm-downloads-src]][npm-downloads-href]
[![Codecov][codecov-src]][codecov-href]
[![License][license-src]][license-href]

## Project archived  
**Voie** was initially created to migrate some old projects to Typescript and a more modern router engine, aiming to be as effortlessly as possible, as well as a personal experience development *(also because there was no known good existing package that meets the needs)*.  
For newer projects, I recommend moving to `Hono` or Unjs's `Nitro`/`H3`.  
While a fan of Unjs, currently I would prefer `Hono` because their documentation covers a lot more things, and their middleware + generics binding + RPC is really good, also things like lambda response stream + compression just work!

---

**Voie** (French word for "way/path/lane/route", English for... "Very Opinionated Itinerary Editor"?)  
Nah, just a random word I came up for this package, haha.  

**Voie** is a simple router + middleware wrapper/engine for AWS Lambda with the main purpose of making things easier.

## Features

- [**find-my-way:**](https://github.com/delvedor/find-my-way) A **crazy fast** (used by [Fastify](https://fastify.dev/benchmarks)) HTTP router, internally uses an highly performant Radix Tree (aka compact Prefix Tree), supports route params, wildcards.
- **Clean syntax:** `app.route(method, path, handler)`, chainable to add middlewares easily: [Example](#deployed-indexmjs-example)
- **Packed to relieve headache:**
  - **event.route:** easy access object that contains:
    - **{** **method**, **path**, **params:** *postBody*+searchParams+[parametricRoute](https://github.com/delvedor/find-my-way#supported-path-formats), ***cookies*** **}**
      - *postBody*: event.body is automatically parsed and added to params if is object type
      - ***cookies***: event.cookies will be parsed to Record type if exists, can be undefined.
  - **response(statusCode, body, options):** with support for `compress`
  - **plugins**:
    - **cors**: app.use(cors, { routes: ['/corsEnabledPath/*', 'someAPI'] })

## Usage

### Install package:

```sh
# npm
npm install lambda-voie

# yarn
yarn add lambda-voie

# pnpm (recommended)
pnpm install lambda-voie
```

### Import:

```ts
// This package exports as ESM only (index.mjs)
import { Voie } from 'lambda-voie'
```

### Deployed `index.mjs` example:
```ts
import {
  Voie,
  // Built-in cors plugin:
  cors,
  // Lambda-configured pino-logger:
  logger,
} from 'lambda-voie'

const app = new Voie({
  // You can pass in your own logger:
  // logger: console
})

// Using plugins:
app.use(cors, {
  // paths: ['*'] // default enable for all paths
})
// Its actually just a simple wrapper for:
// app.route('OPTIONS', '*')

app.setDefaultRoute((event, context) => app.respone(400, {
  message: 'Route not found',
  // Voie by default adds a route object to event for easy access: { method, path, params, cookies }
  routeInfo: event.route
}))

// You can access the current instance's logger this way
app.logger.info('hi')

// Register the route (GET /test)
app.route('GET', '/test', (event, context) => ({
  statusCode: 200,
  body: 'Success',
  before: event.addedByBefore,
  willBeAddedChangedByAfter: 4,

  alsoAddedByAnotherBefore: event.addedByBefore2,
}))
  .before((event, context) => { event.addedByBefore = 'Hi' })
  // Note that in "after" middlewares, when using the app.response() function,
  // The res body is already stringified/compressed.
  .after((event, context, res) => { res.willBeChangedByAfter = res.willBeChangedByAfter * 4 })

// You can get registered route by calling the same function (omit the handler):
app.route('GET', '/test')
  // Registering more middlewares:
  .before((event, context) => { event.addedByBefore2 = 'Hi' })
  .after((event, context, res) => { res.addedByAfter = 'This wasnt defined' })

// Expected response of GET /test:
// {
//   statusCode: 200,
//   body: 'Success',
//   before: 'Hi',
//   willBeChangedByAfter: 160,
//   alsoAddedByAnotherBefore: 'Hi',
//   addedByAfter: 'This wasnt defined',
// }

// Voie also supports handling trigger events:
app.eventRoute('aws:s3', 'log S3 PutObject', (Record, context) => {
  if (Record.eventName === 'ObjectCreated:Put')
    logger.info(`S3 Put: ${Record.s3.bucket.name}/${Record.s3.object.key}`)
})

// Export the handler from handle() function and we're ready for Lambda!
export const handler = app.handle()
```

For advanced use cases, you can extend the class and modify Voie's behavior:
```ts
// Override the makeOnHandler to no longer adds route object to event, and instead adds a tracking ID
class MyVoie extends Voie {
  makeOnHandler(route: Route) {
    return this._lookupTransform(({ method, url, event, context, params, store, searchParams }) => {
      // const requestParams = { ...searchParams, ...params }

      // event.route = { method, url, params: requestParams }

      event._trackingId = '🦄'

      return this.routeHandler(route, event, context)
    })
  }
}
```

## Roadmap

- [x] Refactor autoCors option
  > (currently we have to both set the autoCors option and register the OPTIONS route with autoCors)  
  > **Updated**: use the included 'cors' plugin.
- [ ] Split the base router class to another repo?
- [ ] Creates a template (boiler-plate) repo
- [ ] Includes some advanced examples
- [x] Make it easy to test routes locally
  > You could do: `app._lookupShims(fakeEvent(method, path, eventSpread))`
- [ ] Find a way to supports?: [**response streaming**](https://aws.amazon.com/blogs/compute/introducing-aws-lambda-response-streaming/)
  - [Referrence Resource 1](https://github.com/astuyve/lambda-stream)
  - [Referrence Resource 2](https://advancedweb.hu/how-to-use-the-aws-lambda-streaming-response-type/)
  - [Referrence Resource 3](https://github.com/dherault/serverless-offline/issues/1681)

## License

[MIT](./LICENSE) License © 2023 [NamesMT](https://github.com/NamesMT)

<!-- Badges -->

[npm-version-src]: https://img.shields.io/npm/v/lambda-voie?style=flat&colorA=18181B&colorB=F0DB4F
[npm-version-href]: https://npmjs.com/package/lambda-voie
[npm-downloads-src]: https://img.shields.io/npm/dm/lambda-voie?style=flat&colorA=18181B&colorB=F0DB4F
[npm-downloads-href]: https://npmjs.com/package/lambda-voie
[codecov-src]: https://img.shields.io/codecov/c/gh/namesmt/lambda-voie/main?style=flat&colorA=18181B&colorB=F0DB4F
[codecov-href]: https://codecov.io/gh/namesmt/lambda-voie
[license-src]: https://img.shields.io/github/license/namesmt/lambda-voie.svg?style=flat&colorA=18181B&colorB=F0DB4F
[license-href]: https://github.com/namesmt/lambda-voie/blob/main/LICENSE
