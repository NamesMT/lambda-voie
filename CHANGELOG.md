# Changelog


## v0.12.7

[compare changes](https://github.com/namesmt/lambda-voie/compare/v0.12.6...v0.12.7)

### 📦 Build

- Fix build error with `type-fest` as devDep ([105ef7c](https://github.com/namesmt/lambda-voie/commit/105ef7c))

### 🌊 Types

- Improve `LambdaHandlerResponse` ([7f26905](https://github.com/namesmt/lambda-voie/commit/7f26905))
- Add `VoieRouteAdapter` ([146ede6](https://github.com/namesmt/lambda-voie/commit/146ede6))

### ❤️ Contributors

- NamesMT ([@NamesMT](http://github.com/NamesMT))

## v0.12.6

[compare changes](https://github.com/namesmt/lambda-voie/compare/v0.12.5...v0.12.6)

### 🩹 Fixes

- **plugins.cors:** `event` not exists in some cases (calling `app.response` in eventRoute) ([f21609f](https://github.com/namesmt/lambda-voie/commit/f21609f))

### ❤️ Contributors

- NamesMT ([@NamesMT](http://github.com/NamesMT))

## v0.12.5

[compare changes](https://github.com/namesmt/lambda-voie/compare/v0.12.4...v0.12.5)

### 🩹 Fixes

- Some type fixes ([61c527d](https://github.com/namesmt/lambda-voie/commit/61c527d))

### ❤️ Contributors

- NamesMT ([@NamesMT](http://github.com/NamesMT))

## v0.12.4

[compare changes](https://github.com/namesmt/lambda-voie/compare/v0.12.3...v0.12.4)

### 🚀 Enhancements

- **utils:** Add `eventMethodUrl` ([6f330c1](https://github.com/namesmt/lambda-voie/commit/6f330c1))
- Improve and move `autoCors` checker into a function ([037f83a](https://github.com/namesmt/lambda-voie/commit/037f83a))

### 🩹 Fixes

- **response:** Should optional chain `event.route.method` check ([354d8ae](https://github.com/namesmt/lambda-voie/commit/354d8ae))

### ✅ Tests

- Use decodeResponse ([5596090](https://github.com/namesmt/lambda-voie/commit/5596090))

### ❤️ Contributors

- NamesMT ([@NamesMT](http://github.com/NamesMT))

## v0.12.3

[compare changes](https://github.com/namesmt/lambda-voie/compare/v0.12.2...v0.12.3)

### 🚀 Enhancements

- **utils:** Add `pickEventContext()` ([8911935](https://github.com/namesmt/lambda-voie/commit/8911935))

### ❤️ Contributors

- NamesMT ([@NamesMT](http://github.com/NamesMT))

## v0.12.2

[compare changes](https://github.com/namesmt/lambda-voie/compare/v0.12.1...v0.12.2)

### 🚀 Enhancements

- Extends DetailedError with `statusCode`, fixes `code` wasn't setable ([3f7584f](https://github.com/namesmt/lambda-voie/commit/3f7584f))

### ✅ Tests

- **eventRoute:** Add `testSourceRootString` ([f2ac94b](https://github.com/namesmt/lambda-voie/commit/f2ac94b))

### ❤️ Contributors

- NamesMT ([@NamesMT](http://github.com/NamesMT))

## v0.12.1

[compare changes](https://github.com/namesmt/lambda-voie/compare/v0.12.0...v0.12.1)

### 🚀 Enhancements

- **response:** Auto set `isBase64Encoded=true` if headers contains `Content-Encoding` ([0cc117e](https://github.com/namesmt/lambda-voie/commit/0cc117e))

### ❤️ Contributors

- NamesMT ([@NamesMT](http://github.com/NamesMT))

## v0.12.0

[compare changes](https://github.com/namesmt/lambda-voie/compare/v0.11.0...v0.12.0)

### 🩹 Fixes

- Inconsistent oGet and oSet ([f7bb14c](https://github.com/namesmt/lambda-voie/commit/f7bb14c))
- **setDefaultRoute:** Should only set `allowEmptyRouteLookup` when `passThrough=true` ([1e650e3](https://github.com/namesmt/lambda-voie/commit/1e650e3))

### 💅 Refactors

- ⚠️  EventRoutes special `$` root level return ([dbe36f4](https://github.com/namesmt/lambda-voie/commit/dbe36f4))
- Remove local oPath utils ([8b86bef](https://github.com/namesmt/lambda-voie/commit/8b86bef))

### 🏡 Chore

- Update deps ([d1c28ec](https://github.com/namesmt/lambda-voie/commit/d1c28ec))

### ✅ Tests

- Wording ([3acbdfb](https://github.com/namesmt/lambda-voie/commit/3acbdfb))
- Reset passthrough after test it ([5d99fcc](https://github.com/namesmt/lambda-voie/commit/5d99fcc))
- Add some tests for eventRoute() ([b71d014](https://github.com/namesmt/lambda-voie/commit/b71d014))

#### ⚠️ Breaking Changes

- ⚠️  EventRoutes special `$` root level return ([dbe36f4](https://github.com/namesmt/lambda-voie/commit/dbe36f4))

### ❤️ Contributors

- NamesMT ([@NamesMT](http://github.com/NamesMT))

## v0.11.0

[compare changes](https://github.com/namesmt/lambda-voie/compare/v0.10.1...v0.11.0)

### 🚀 Enhancements

- **response:** ⚠️  Only stringifies body when needed ([583f6fd](https://github.com/namesmt/lambda-voie/commit/583f6fd))
- Only auto set contentType='application/json' for plain object/array ([35d0577](https://github.com/namesmt/lambda-voie/commit/35d0577))

### 🩹 Fixes

- **response:** AutoCors broke because response no longer stringified ([ef4f99d](https://github.com/namesmt/lambda-voie/commit/ef4f99d))
- Options.contentType ([94373bb](https://github.com/namesmt/lambda-voie/commit/94373bb))

### 💅 Refactors

- Remove default response logging ([19d3791](https://github.com/namesmt/lambda-voie/commit/19d3791))

#### ⚠️ Breaking Changes

- **response:** ⚠️  Only stringifies body when needed ([583f6fd](https://github.com/namesmt/lambda-voie/commit/583f6fd))

### ❤️ Contributors

- NamesMT ([@NamesMT](http://github.com/NamesMT))

## v0.10.1

[compare changes](https://github.com/namesmt/lambda-voie/compare/v0.10.0...v0.10.1)

### 🚀 Enhancements

- Adds `DetailedError` class ([84c99f5](https://github.com/namesmt/lambda-voie/commit/84c99f5))
- **handler:** Better catch handle ([a2efa0f](https://github.com/namesmt/lambda-voie/commit/a2efa0f))

### ✅ Tests

- Wording ([5e8eb92](https://github.com/namesmt/lambda-voie/commit/5e8eb92))

### ❤️ Contributors

- NamesMT ([@NamesMT](http://github.com/NamesMT))

## v0.10.0

[compare changes](https://github.com/namesmt/lambda-voie/compare/v0.3.1...v0.10.0)

### 🚀 Enhancements

- Default register `pino-lambda`'s `lambdaRequestTracker()` ([e4aac74](https://github.com/namesmt/lambda-voie/commit/e4aac74))
- Allow configuring `withRequest` ([3a9e85a](https://github.com/namesmt/lambda-voie/commit/3a9e85a))

### 🩹 Fixes

- **reponse:** Cookies processing ([c72aae5](https://github.com/namesmt/lambda-voie/commit/c72aae5))
- **compress:** Headers might be undefined ([6ac37ba](https://github.com/namesmt/lambda-voie/commit/6ac37ba))

### 💅 Refactors

- Re-base repo with namesmt/starter-ts (desc) ([33a80fe](https://github.com/namesmt/lambda-voie/commit/33a80fe))
- ⚠️  Exports changes, direct exports `utils`, subpath export `plugins` ([df86709](https://github.com/namesmt/lambda-voie/commit/df86709))

### 📖 Documentation

- Fix wrong doc of function ([50a1996](https://github.com/namesmt/lambda-voie/commit/50a1996))

### 📦 Build

- Fix build error (Implicit inlined destr) ([4e43347](https://github.com/namesmt/lambda-voie/commit/4e43347))

### 🌊 Types

- Type basic interface for `LambdaHandlerResponse` ([7e0a871](https://github.com/namesmt/lambda-voie/commit/7e0a871))
- Type fixes ([3ae6b3b](https://github.com/namesmt/lambda-voie/commit/3ae6b3b))

#### ⚠️ Breaking Changes

- ⚠️  Exports changes, direct exports `utils`, subpath export `plugins` ([df86709](https://github.com/namesmt/lambda-voie/commit/df86709))

### ❤️ Contributors

- NamesMT ([@NamesMT](http://github.com/NamesMT))

## v0.3.1

[compare changes](https://github.com/namesmt/lambda-voie/compare/v0.3.0...v0.3.1)

### 💅 Refactors

- Refactor compress and decodeBody logic to utils ([627fc83](https://github.com/namesmt/lambda-voie/commit/627fc83))

### ✅ Tests

- Add test for decodeResponse ([32a1fe9](https://github.com/namesmt/lambda-voie/commit/32a1fe9))

### ❤️ Contributors

- NamesMT ([@NamesMT](http://github.com/NamesMT))

## v0.3.0

[compare changes](https://github.com/namesmt/lambda-voie/compare/v0.2.3...v0.3.0)

### 🚀 Enhancements

- Allow returning result from eventRoute ([e451f3b](https://github.com/namesmt/lambda-voie/commit/e451f3b))

### 💅 Refactors

- ⚠️  Remove morphing for `cron: true` events (desc) ([291742b](https://github.com/namesmt/lambda-voie/commit/291742b))

#### ⚠️ Breaking Changes

- ⚠️  Remove morphing for `cron: true` events (desc) ([291742b](https://github.com/namesmt/lambda-voie/commit/291742b))

### ❤️ Contributors

- NamesMT ([@NamesMT](http://github.com/NamesMT))

## v0.2.3

[compare changes](https://github.com/namesmt/lambda-voie/compare/v0.2.2...v0.2.3)

### 🚀 Enhancements

- Update autoCors logic ([9891930](https://github.com/namesmt/lambda-voie/commit/9891930))

### ❤️ Contributors

- NamesMT ([@NamesMT](http://github.com/NamesMT))

## v0.2.2

[compare changes](https://github.com/namesmt/lambda-voie/compare/v0.2.1...v0.2.2)

### 🚀 Enhancements

- **allowEmptyRouteLookup:** Use empty string instead of 'N_LL' ([98c4277](https://github.com/namesmt/lambda-voie/commit/98c4277))
- Use named `defu` export ([69b07d6](https://github.com/namesmt/lambda-voie/commit/69b07d6))

### 📦 Build

- Lock `pino` to 8.16.2 because of build error ([9c85360](https://github.com/namesmt/lambda-voie/commit/9c85360))

### 🏡 Chore

- Update deps ([e93166b](https://github.com/namesmt/lambda-voie/commit/e93166b))

### ✅ Tests

- Fix: use toMatchObject instead of toContain ([5be96ea](https://github.com/namesmt/lambda-voie/commit/5be96ea))

### ❤️ Contributors

- NamesMT ([@NamesMT](http://github.com/NamesMT))

## v0.2.1

[compare changes](https://github.com/namesmt/lambda-voie/compare/v0.2.0...v0.2.1)

### 🚀 Enhancements

- Add simple morphing for top-level eventSource ([7d018db](https://github.com/namesmt/lambda-voie/commit/7d018db))

### ❤️ Contributors

- NamesMT ([@NamesMT](http://github.com/NamesMT))

## v0.2.0

[compare changes](https://github.com/namesmt/lambda-voie/compare/v0.1.9...v0.2.0)

### 💅 Refactors

- ⚠️  Removed `options.defaultRoute` on constructor ([e38ebe1](https://github.com/namesmt/lambda-voie/commit/e38ebe1))

#### ⚠️ Breaking Changes

- ⚠️  Removed `options.defaultRoute` on constructor ([e38ebe1](https://github.com/namesmt/lambda-voie/commit/e38ebe1))

### ❤️ Contributors

- NamesMT ([@NamesMT](http://github.com/NamesMT))

## v0.1.9

[compare changes](https://github.com/namesmt/lambda-voie/compare/v0.1.8...v0.1.9)

### 🚀 Enhancements

- Introduce app.allowEmptyRouteLookup ([9ae26af](https://github.com/namesmt/lambda-voie/commit/9ae26af))
- Auto set allowEmptyRouteLookup on defaultRoute with passThrough ([053c67f](https://github.com/namesmt/lambda-voie/commit/053c67f))

### 📖 Documentation

- Link issue number for allowEmptyRouteLookup ([a459496](https://github.com/namesmt/lambda-voie/commit/a459496))

### ❤️ Contributors

- NamesMT ([@NamesMT](http://github.com/NamesMT))

## v0.1.8

[compare changes](https://github.com/namesmt/lambda-voie/compare/v0.1.7...v0.1.8)

### 🩹 Fixes

- PassThrough logic ([3f3e51d](https://github.com/namesmt/lambda-voie/commit/3f3e51d))

### ❤️ Contributors

- NamesMT ([@NamesMT](http://github.com/NamesMT))

## v0.1.7

[compare changes](https://github.com/namesmt/lambda-voie/compare/v0.1.6...v0.1.7)

### 🚀 Enhancements

- Introduce passThrough for setDefaultRoute ([b70e2a7](https://github.com/namesmt/lambda-voie/commit/b70e2a7))

### 🩹 Fixes

- Should only return if eventRoutes matched ([6c6b7d5](https://github.com/namesmt/lambda-voie/commit/6c6b7d5))
- DefaultRoute not shimmed as expected ([c9b1865](https://github.com/namesmt/lambda-voie/commit/c9b1865))

### 🏡 Chore

- **.vscode:** Setting value name changed ([9032bfc](https://github.com/namesmt/lambda-voie/commit/9032bfc))

### ✅ Tests

- Add tests for defaultRoute ([2193323](https://github.com/namesmt/lambda-voie/commit/2193323))

### ❤️ Contributors

- NamesMT ([@NamesMT](http://github.com/NamesMT))

## v0.1.6

[compare changes](https://github.com/namesmt/lambda-voie/compare/v0.1.5...v0.1.6)

### 🩹 Fixes

- Optional chain for manual Lambda invoke cases ([2721f05](https://github.com/namesmt/lambda-voie/commit/2721f05))

### 🏡 Chore

- **.vscode:** Remove peacock customization ([808888b](https://github.com/namesmt/lambda-voie/commit/808888b))

### ❤️ Contributors

- NamesMT ([@NamesMT](http://github.com/NamesMT))

## v0.1.5

[compare changes](https://github.com/namesmt/lambda-voie/compare/v0.1.4...v0.1.5)

### 🩹 Fixes

- AutoCors error when origin not found ([048c1f3](https://github.com/namesmt/lambda-voie/commit/048c1f3))
- AutoAllow shouldn't allow simple cors (Allow-Origin=*) ([7f9b69f](https://github.com/namesmt/lambda-voie/commit/7f9b69f))

### ✅ Tests

- Minor ([23a8907](https://github.com/namesmt/lambda-voie/commit/23a8907))

### ❤️ Contributors

- NamesMT ([@NamesMT](http://github.com/NamesMT))

## v0.1.4

[compare changes](https://github.com/namesmt/lambda-voie/compare/v0.1.3...v0.1.4)

### 🩹 Fixes

- $event empty on async handlers ([b0e30b1](https://github.com/namesmt/lambda-voie/commit/b0e30b1))

### ✅ Tests

- Add healthAsync test ([c327dcf](https://github.com/namesmt/lambda-voie/commit/c327dcf))

### ❤️ Contributors

- NamesMT ([@NamesMT](http://github.com/NamesMT))

## v0.1.3

[compare changes](https://github.com/namesmt/lambda-voie/compare/v0.1.2...v0.1.3)

### 🚀 Enhancements

- Fallback to routeKey if routePath doesn't exists Support for internal Lambda invoke() using routeKey ([5c83c16](https://github.com/namesmt/lambda-voie/commit/5c83c16))

### 🩹 Fixes

- Array queryStringParameters not parsed ([b381271](https://github.com/namesmt/lambda-voie/commit/b381271))

### ✅ Tests

- Fix tests ([7e6ed7e](https://github.com/namesmt/lambda-voie/commit/7e6ed7e))

### ❤️ Contributors

- NamesMT ([@NamesMT](http://github.com/NamesMT))

## v0.1.2

[compare changes](https://github.com/namesmt/lambda-voie/compare/v0.1.1...v0.1.2)

### 🩹 Fixes

- Pnpm bug duplicated main file packed, Reference: (http://pnpm/pnpm#6193) ([#6193](https://github.com/namesmt/lambda-voie/issues/6193))

### 🏡 Chore

- **package.json:** Remove typesVersions ([9efa703](https://github.com/namesmt/lambda-voie/commit/9efa703))
- Update keywords ([c099859](https://github.com/namesmt/lambda-voie/commit/c099859))

### ❤️ Contributors

- NamesMT ([@NamesMT](http://github.com/NamesMT))

## v0.1.1

[compare changes](https://github.com/namesmt/lambda-voie/compare/v0.1.0...v0.1.1)

### 🚀 Enhancements

- Adds VitePress at ./docs ([b3e2597](https://github.com/namesmt/lambda-voie/commit/b3e2597))
- Better types inherit for Plugin ([d768f71](https://github.com/namesmt/lambda-voie/commit/d768f71))

### 📖 Documentation

- Badges! ([bcfcdea](https://github.com/namesmt/lambda-voie/commit/bcfcdea))

### 🏡 Chore

- Remove `bumpp` package ([86b3e92](https://github.com/namesmt/lambda-voie/commit/86b3e92))

### 🤖 CI

- Test.yml ([eb5832a](https://github.com/namesmt/lambda-voie/commit/eb5832a))
- Fix pnpm setup error, let @antfu/ni installs the manager ([b492b27](https://github.com/namesmt/lambda-voie/commit/b492b27))

### ❤️ Contributors

- NamesMT ([@NamesMT](http://github.com/NamesMT))

## v0.1.0

[compare changes](https://github.com/namesmt/lambda-voie/compare/v0.0.16...v0.1.0)

### 💅 Refactors

- AutoCors and cors plugin was broken I forgot about cors return in OPTIONS call ([a50d440](https://github.com/namesmt/lambda-voie/commit/a50d440))

### 🏡 Chore

- ⚠️  Rename cors plugin options.routes > paths ([adf63e6](https://github.com/namesmt/lambda-voie/commit/adf63e6))

### ✅ Tests

- Health check should be without any plugin ([77c77d0](https://github.com/namesmt/lambda-voie/commit/77c77d0))

### 🎨 Styles

- Expect matcher condition chained on newline ([f75aa93](https://github.com/namesmt/lambda-voie/commit/f75aa93))

#### ⚠️ Breaking Changes

- ⚠️  Rename cors plugin options.routes > paths ([adf63e6](https://github.com/namesmt/lambda-voie/commit/adf63e6))

### ❤️ Contributors

- NamesMT ([@NamesMT](http://github.com/NamesMT))

