# Papaya [![npm version](https://badge.fury.io/js/papaya.svg)](http://badge.fury.io/js/papaya)

[![Build Status](https://travis-ci.org/justinhoward/papaya.svg?branch=master)](https://travis-ci.org/justinhoward/papaya)
[![Code Climate](https://codeclimate.com/github/justinhoward/papaya/badges/gpa.svg)](https://codeclimate.com/github/justinhoward/papaya)
[![Test Coverage](https://codeclimate.com/github/justinhoward/papaya/badges/coverage.svg)](https://codeclimate.com/github/justinhoward/papaya)
[![Known Vulnerabilities](https://snyk.io/test/github/justinhoward/papaya/badge.svg?targetFile=package.json)](https://snyk.io/test/github/justinhoward/papaya?targetFile=package.json)

[Papaya](https://github.com/justinhoward/papaya) is a dependency injection
container. It's a way to organize your JavaScript application to take advantage
of the [dependency inversion principle][di].

- [Installation](#installation)
- [Getting Started](#getting-started)
- [TypeScript](#typescript)
- [Organizing Your Project](#organizing-your-project)
- [API](#api)
  - [constant](#constantname-constant)
  - [service](#servicename-service)
  - [get](#getname)
  - [factory](#factoryname-factory)
  - [extend](#extendname-extender)
  - [register](#registerprovider)
  - [keys](#keys)
  - [has](#hasname)
- [Changes](#changes)
- [Credits](#credits)

## Installation

Papaya is available as a npm package.

##### npm
```bash
npm install --save papaya
```

## Getting Started

> The examples here use modern JavaScript syntax, but Papaya is compatible back
> to ES5.

To start, create a new instance of Papaya:

```javascript
const { Papaya } = require('papaya')
const app = new Papaya()
```

The methods you will use most often in Papaya are the `get`, `constant`, and
`service` methods.  These allow you to create and access services and
attributes.

```javascript
// setting a constant
app.constant('api.url', 'http://example.com/api')

// setting a service
app.service('api', () => {
    return new RestApi(app.get('api.url'))
})

// Now we access the api service
// This would typically be done in a controller
app.get('api').request()
```

In this example, we set up and use an api service.

1. First, we use the `constant` method to create an attribute called `api.url`.
   There is no special meaning to the `.` in the service name. It's used purely
   for clarity.
2. Then, we create a service called `api`. This time we use the `service`
   method. This allows the service to be instantiated asynchronously.  The
   `RestApi` instance won't be created until we use it on the final line.
3. On the last line, we use the `get` method to retrieve the instance of
   `RestApi` and call a `request` method on it. Because of the way we defined
   the `api` service, the `api.url` parameter will be passed into the `RestApi`
   constructor when it is created.

Once it's constructed, the `api` service will be cached, so if we call it again,
Papaya will use the same instance of `RestApi`.

## Organizing Your Project

Feel free to manage your containers however you like, but this is the pattern I
typically use. To make it easier to reuse your container, you may want to extend
the Papaya class.

```javascript
# App.js

const env = require('./providers/env')
const db = require('./providers/db')

module.exports = class App extends Papaya {
  constructor() {
    super()

    this.register(env.provider)
    this.register(db.provider)
  }
}
```

Then split up your services into logical groups and move them into separate
provider files.

```javascript
# providers/env.js

module.exports = function provider(app) {
  app.constant('env.dbUser', process.env.DB_USER)
  app.constant('env.dbPassword', process.env.DB_PASS)
}
```

```javascript
# providers/db.js
const Database = require('./Database')

module.exports = function provider(app) {
  app.service('db', () => {
    return new Database(app.get('env.dbUser'), app.get('env.dbPassword'))
  })
}
```

Now when you want to boot your app, just create a new instance of your custom
class.
```javascript
const App = require('./App')
const app = new App()
app.get('db').connect()
```

## TypeScript

Papaya fully supports both JavaScript and TypeScript. To use types with your
container, you should define interfaces for each service.

```typescript
# app.ts
import { Papaya } from 'papaya'
import * as env from './providers/env'
import * as db from './providers/db'

export class App extends Papaya<
  EnvServices
  & DbServices
> {
  constructor() {
    super()

    this.register(env.provider)
    this.register(db.provider)
  }
}
```
```typescript
# providers/env.ts
export interface EnvServices {
  'env.baseUrl': string
  'env.dbUser': string
  'env.dbPassword': string
}

export function provider(app: Papaya<EnvServices>) {
  app.constant('env.dbUser', process.env.DB_USER)
  app.constant('env.dbPassword', process.env.DB_PASS)
}
```
```typescript
# providers/db.ts
import { Database } from './database'

// for providers with dependencies, define the types of the dependencies
export interface DbServices {
  'env.dbUser': string
  'env.dbPassword': string
  db: Database
}

export function provider(app: Papaya<DbServices>) {
  app.service('db', () => {
    return new Database(app.get('env.dbUser'), app.get('env.dbPassword'))
  })
}
```

If you strictly define your service interfaces this way, the TypeScript compiler
will be able to do compile-time type checking on your services.

```typescript
const db = app.get('db').connect()
# The TypeScript compiler knows that get returns a "Database"
```

If you want to turn off type checking, simply set the Papaya type to `any`.

```typescript
// to extend Papaya
export class App extends Papaya<any> {
  ...
}

// or to create a one-off instance
const app = new Papaya<any>()

const db = app.get('db').connect()
// typescript will allow this
// but doesn't gurantee that get returns a "Database"
```

## API

The generated [API docs](https://www.justinhoward.org/papaya/classes/papaya.html)
provide exact API definitions. See below for more user-friendly descriptions.

### constant(name, constant)

Creates a simple named value service from `constant`. The most common use of
attributes is to provide parameters for other services.

```javascript
// Create an attribute
app.constant('urlPrefix', 'http://example.com')
const prefix = app.get('urlPrefix') // http://example.com
```

### service(name, service)

Creates a singleton service.

Creates a singleton service. This is a service that will only be constructed
once. Services are lazy, so it will not be created until it is used. When the
service is requested with `get`, the function will be called to create the
service.

```javascript
app.service('images', function(container) {
  return new ImageService(app.get('urlPrefix'))
})

app.get('images').download('cat')
```

> Notice that `this` is used to access the Papaya instance. This is a matter of
> preference.  Papaya sets `this` to itself when calling service functions. In
> this example, `this`, `app`, and the `container` argument are the same thing.

### get(name)

Gets a service or attribute by name. `get` returns the value of a service
regardless of the function that was used to create a service.

```javascript
app.constant('foo', 'abc')
app.service('bar', () => '123')
app.factory('baz', () => 'xyz')

app.get('foo') // 'abc'
app.get('bar') // '123'
app.get('baz') // 'xyz'
```

### factory(name, factory)

Creates a service that will be reconstructed every time it is used. `factory`
is similar to `service`, but it does not cache the return value of your service
function.

```javascript
app.factory('api.request', () => {
   return app.get('api').request()
})

// Calls the factory function above
const request = app.get('api.request')

// Calls the factory function again
const otherRequest = app.get('api.request')

// request !== otherRequest
```

### extend(name, extender(extended, this))

The `extend` method can be used to modify existing services.

```javascript
app.service('api' () => new RestApi())

app.extend('api', api => {
  api.plugin(new MyPlugin())
  return api
})

app.get('api') // Creates RestApi with MyPlugin added
```

In this example, we use `extend` to add a plugin to the api service. Because we
defined `api` as a singleton service above, it will remain a singleton. It will
also remain lazy, meaning the `api` service and the extender will not be called
until the `api` service is used.

When extending a factory, it will remain a factory service, otherwise it will be
converted to a singleton service (like when using the `service` method).
Services can also be extended multiple times.

The `extender` function is passed 2 arguments, the previous value of the service
and the container. If the service does not exist when it is extended, `extend`
will throw an error. The `extender` function should return the new value for the
service.

### register(provider)

Registers a `provider` function, a convenient way to organize services into
groups.

```javascript
function apiProvider(container) {
  container.constant('api.url', 'http://example.com')

  container.service('api', function() {
      return new RestApi(container.get('api.url'))
  })
}

app.register(apiProvider)
```

The `register` method itself does not create services, but it allows you to
register functions that create related services. In this example, we use
`register` to group api related services together.

The `provider` function will be called immediately when it is registered. Its
`this` and first argument will be set to the Papaya instance, just like in
`service`.

### keys()

Get an array of all the registered service names with `keys`.

```javascript
app.constant('foo', '123')
app.factory('bar', () => 'abc')

app.keys() // ['foo', 'bar']
```

### has(name)

Check if a given service is registered with `has`.

```javascript
app.constant('api.url', 'http://example.com/api')

app.has('api.url') // true
app.has('foo') // false
```

## Changes

### Version 3

- Support strict TypeScript types

### Version 2

- Add typescript support
- Split the `set` method into `service` and `constant`.
- Remove the `protect` method (replaced by `constant`)
- Constants are no longer allowed in place of service functions.
- All service functions are now passed the container as an argument

## Credits
Created by [Justin Howard][github]

Thank you to [Fabien Potencier][fabien], the creator of [Pimple][pimple] for PHP
for the inspiration for Papaya.

[di]: https://en.wikipedia.org/wiki/Dependency_inversion_principle
[fabien]: http://fabien.potencier.org
[github]: https://github.com/justinhoward
[latest release]: https://github.com/justinhoward/papaya/releases/latest
[pimple]: http://pimple.sensiolabs.org
