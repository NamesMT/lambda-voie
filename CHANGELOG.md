# Changelog


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

