# Lambda Voie [![NPM version](https://img.shields.io/npm/v/lambda-voie?color=a1b858&label=)](https://www.npmjs.com/package/lambda-voie)

**Voie** (French word for "way/path/lane/route", English for... "Very Opinionated Itinerary Editor"?)  
Nah, just a random word I came up for this package, haha.  

**Voie** is a simple router + middleware wrapper/engine for AWS Lambda, it utilizes:
+ [find-my-way](https://github.com/delvedor/find-my-way), which is:  
  > A crazy fast HTTP router, internally uses an highly performant [Radix Tree](https://en.wikipedia.org/wiki/Radix_tree) (aka compact [Prefix Tree](https://en.wikipedia.org/wiki/Trie)), supports route params, wildcards, and it's framework independent.

## Usage

Install package:

```sh
# npm
npm install lambda-voie

# yarn
yarn add lambda-voie

# pnpm (recommended)
pnpm install lambda-voie
```

Import:

```ts
// ESM
import { Voie } from 'lambda-voie'
```

Example deployed Lambda `index.mjs`:
```ts
import {
  Voie,
  logger, // Voie includes a pino-logger configured for Lambda
} from 'lambda-voie'

const app = new Voie({
  // logger: console // You can pass in your own logger
  defaultRoute: (event, context) => ({
    statusCode: 500,
    message: 'Route not found',
    routeInfo: event.route // Voie by default adds a route object to event for easy access: { method, path, params }
  })
})

app.logger.info('hi') // You can also access the logger this way

// Register the route (GET /test)
app.route('GET', '/test', (event, context) =>
  ({
    statusCode: 200,
    message: 'Success',
    before: event.addedByBefore,
    willBeChangedByAfter: 'Yolo',

    alsoAddedByAnotherBefore: event.addedByBefore2,
  }),
)
  .before((event, context) => { event.addedByBefore = 'Hi' })
  .after((event, context, res) => { res.willBeChangedByAfter = 'So Ezzzz' })

// You can get registered route by calling the same function omit the handler:
app.route('GET', '/test')
  .before((event, context) => { event.addedByBefore2 = 'Hi' })

// Voie also supports handling trigger events:
app.eventRoute('aws:s3', 'log S3 PutObject', (Record, context) => {
  if (Record.eventName === 'ObjectCreated:Put')
    logger.info(`S3 Put: ${Record.s3.bucket.name}/${Record.s3.object.key}`)
})

// Export the handler from handle() function for AWS Lambda
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

## License

[MIT](./LICENSE) License © 2023 [NamesMT](https://github.com/NamesMT)
