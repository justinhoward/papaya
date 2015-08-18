# Papaya [![npm version](https://badge.fury.io/js/papaya.svg)](http://badge.fury.io/js/papaya)

[![Build Status](https://travis-ci.org/justinhoward/papaya.svg?branch=master)](https://travis-ci.org/justinhoward/papaya)
[![Code Climate](https://codeclimate.com/github/justinhoward/papaya/badges/gpa.svg)](https://codeclimate.com/github/justinhoward/papaya)
[![Test Coverage](https://codeclimate.com/github/justinhoward/papaya/badges/coverage.svg)](https://codeclimate.com/github/justinhoward/papaya)

Papaya is a dependency injection container. It's a way to organize your JavaScript application
to take advantage of the [dependency inversion principle][di].

- [Installation](#installation)
- [Getting Started](#getting-started)
- [API](#api)
  - [set](#setname-service)
  - [get](#getname)
  - [factory](#factoryname-factory)
  - [protect](#protectname-service)
  - [extend](#extendname-extender)
  - [register](#registerprovider)
  - [keys](#keys)
  - [has](#hasname)
- [Credits](#credits)

## Installation

Papaya is available as a npm package, or as a UMD module.

##### npm
```bash
npm install --save papaya
```

##### bower
```bash
# Replace 1.1.3 with the current version
bower install --save https://github.com/justinhoward/papaya/releases/download/v1.1.3/papaya-1.1.3.zip
```
##### Download
You can also download the [latest release][latest release] manually and include
it in your app however you like. Here's an example using a script tag.

```html
<script src="/js/papaya.min.js"></script>
<script>
var app = new Papaya();
</script>
```

## Getting Started

To start, create a new instance of Papaya:

```javascript
var Papaya = require('papaya');
var app = new Papaya();
```

The methods you will use most often in Papaya are the `get` and `set` methods.
These allow you to create and access services and attributes.

```javascript
// setting an attribute
app.set('api.url', 'http://example.com/api');

// setting a service
app.set('api', function() {
    return new RestApi(this.get('api.url'));
});

// Now we access the api service
// This would typically be done in a controller
app.get('api').request();
```

In this example, we set up and use an api service.

1. First, we use the `set` method to create an attribute called `api.url`.
2. Then, we create a service called `api`. This time we pass a function into
the `set` method. This allows the service to be instantiated asynchronously.
The `RestApi` instance won't be created until we use it on the final line.
3. On the last line, we use the `get` method to retrieve the instance
of `RestApi` and call a `request` method on it. Because of the way we defined
the `api` service, the `api.url` parameter will be passed into the `RestApi` constructor
when it is created.

Once it's constructed, the `api` service will be cached, so if we call it again,
Papaya will use the same instance of `RestApi`.

## API

### set(name, service)

Creates an attribute or singleton service.

If `service` is not a function, `set` will create an attribute. This is a
simple named value. The most common use of attributes is to provide parameters
for other services.

```javascript
// Create an attribute
app.set('url_prefix', 'http://example.com');
```

If `service` is a function, `set` will create a singleton service. This is a
service that will only be constructed once. Services are lazy, so a service
constructed with `set` will not be created until it is used. The return value
of the `service` function is returned when that service is requested with `get`.

```javascript
app.set('images', function() {
    return new ImageService(this.get('url_prefix'));
});
```

Notice that `this` is used to access the Papaya instance. This is a matter of preference.
Papaya sets `this` to itself when calling service functions. In this example,
`this` and `app` are the same thing.

### get(name)

Gets a service or attribute by name. `get` returns the value of a service regardless of
the function that was used to create a service.

```javascript
app.set('foo', 'abc');
app.set('bar', function() { return '123'; });
app.factory('baz', function() { return 'xyz'; });

app.get('foo'); // 'abc'
app.get('bar'); // '123'
app.get('baz'); // 'xyz'
```

### factory(name, factory)

Creates a service that will be reconstructed every time it is used.
`factory` is similar to set, but it does not cache the return value of
your service function.

```javascript
app.factory('api.request', function() {
   return this.get('api').request();
});

// Calls the factory function above
var request = app.get('api.request');

// Calls the factory function again
var otherRequest = app.get('api.request');
```

### protect(name, service)

When passing a function to the `set` method, Papaya assumes that the service
is the return value of the function. The `get` method
will call that function and get its return value.

The `protect` method allows you to define a service that returns the
function itself. If you pass a function to `protect`, `get` will never call
the function, it will just pass it along unmodified.

```javascript
app.protect('log', function(message) {
    console.log(message);
});

app.get('log'); // Returns the function given above
app.get('log')('hi'); // Prints 'hi' to the console
```

### extend(name, extender)

The `extend` method can be used to modify existing services.

```javascript
app.extend('api', function(api) {
    api.plugin(new MyPlugin());
    return api;
});

```

In this example, we use `extend` to add a plugin to the api service. Because we defined
`api` as a singleton service above, it will remain a singleton. It will also remain lazy,
meaning the `api` service and the extender will not be called until the `api` service is
used.

Regardless of the type of service, it will remain that type when extended. This is true of
`set`, `factory`, and `protect`. Services can also be extended multiple times.

The `extender` function takes a single argument, the previous value of the service. If the service
does not exist when it is extended, the argument will be `undefined`. The `extender` function should
return the new value for the service.

### register(provider)

Registers a `provider` function, a convenient way to organize services into groups.

```javascript
app.register(function()) {
    this.set('api.url', 'http://example.com');

    this.set('api', function() {
        return new RestApi(this.get('api.url'));
    });
});
```

The `register` method itself does not create services, but it allows you to register
functions that create related services. In this example, we use `register` to group
api related services together.

The `provider` function will be called immediately
when it is registered. Its `this` will be set to the Papaya instance, just like in
`set`.

### keys()

Get an array of all the registered service names with `keys`.

```javascript
app.set('foo', '123');
app.factory('bar', function() { return 'abc' });

app.keys(); // ['foo', 'bar']
```

### has(name)

Check if a given service is registered with `has`.

```javascript
app.set('api.url', 'http://example.com/api');

app.has('api.url'); // true
app.has('foo'); // false
```

## Credits
Created by [Justin Howard][github]

Thank you to [Fabien Potencier][fabien], the creator of [Pimple][pimple] for PHP for the inspiration for Papaya.

[di]: https://en.wikipedia.org/wiki/Dependency_inversion_principle
[fabien]: http://fabien.potencier.org
[github]: https://github.com/justinhoward
[latest release]: https://github.com/justinhoward/papaya/releases/latest
[pimple]: http://pimple.sensiolabs.org
