# Relay Base Provider
Base application provider for AdonisJs

[![circleci-image]][circleci-url]
[![npm-image]][npm-url]
![](https://img.shields.io/badge/Uses-Typescript-294E80.svg?style=flat-square&colorA=ddd)

The base application provider extends the AdonisJs core to add features required by almost
every micro service written at Relay.

<!-- START doctoc generated TOC please keep comment here to allow auto update -->
<!-- DON'T EDIT THIS SECTION, INSTEAD RE-RUN doctoc TO UPDATE -->
## Table of contents

- [Setup](#setup)
- [Validation rules](#validation-rules)
    - [`phone`](#phone)
- [Helpers](#helpers)
    - [`exec`](#exec)
- [Change log](#change-log)
- [Contributing](#contributing)
- [Authors & License](#authors--license)

<!-- END doctoc generated TOC please keep comment here to allow auto update -->

## Setup
Install it from npm

```sh
npm i @relayin/base-provider
```

and then register it to the list of providers

```js
const providers = [
  '@relayin/base-provider/build/providers/BaseProvider'
]
```

## Validation rules
The base provider adds following validation rules to `indicative`.

#### `phone`
Validates the user phone number as an Indian mobile number. This rule also mutates the phone number value by formatting it. This makes sure that all mobile numbers are properly formatted after validation.

```js
const schema = {
  phone_number: 'required|phone',
}
```

## Helpers
The base provider also extends the `Helpers` class of AdonisJs and adds following methods to it.

#### `exec`
Executes an async function by returning it's exception inline. The idea is highly inspired by `go` style error handling.

This is how you usually handle errors.

```js
let response

try {
  response = await fn()
} catch (error) {
}
```

using the `exec` function, you can make the process inline, as follows:

```js
const [error, response]  = await Helpers.exec(fn())
if (error) {  
}
```

In order to get `intellisense` for `exec` function, you need to extend the `Helpers` interface from the
following interface.

```ts
import { RelayHelpersContract } from '@relayin/base-provider'

interface Helpers extends HelpersContract, RelayHelpersContract {}
```

## Change log
The change log can be found in the [CHANGELOG.md](CHANGELOG.md) file.

## Contributing

Everyone is welcome to contribute. Please take a moment to review the [contributing guidelines](CONTRIBUTING.md).

## Authors & License
[Harminder virk](https://github.com/Harminder virk) and [contributors](https://github.com/RelayIN/relay-base-provider/graphs/contributors).

MIT License, see the included [MIT](LICENSE.md) file.

[circleci-image]: https://img.shields.io/circleci/project/github/RelayIN/relay-base-provider/master.svg?style=flat-square&logo=circleci
[circleci-url]: https://circleci.com/gh/RelayIN/relay-base-provider "circleci"

[npm-image]: https://img.shields.io/npm/v/relay-base-provider.svg?style=flat-square&logo=npm
[npm-url]: https://npmjs.org/package/relay-base-provider "npm"
