# Papaya

[![Build Status](https://travis-ci.org/justinhoward/papaya.svg?branch=master)](https://travis-ci.org/justinhoward/papaya)

Create a new instance of Papaya

```javascript
var Papaya = require('papaya');
var app = new Papaya();
```

Declare your services with the `set` method and access them with
the `get` method.

```javascript
app.set('api_url', 'http://example.com/api');

app.set('rest', function() {
    return new RestApi(this.get('api_url'));
});

var myController = function(app) {
    app.get('rest').request();
};
```

By default, all services are singletons, if you want a new instace
to be created every time you call `get`, use the `factory` method.

```javascript
app.factory('rest.request', function() {
   return this.get('rest').request();
});

var myController = function(app) {
    var request = app.get('rest.request');
    var otherRequest = app.get('rest.request');
};
```

When passing a function to the `set` method the `get` method
will get the return value of the function. Use the `protect` method
if you want `get` to return the function itself.

```javascript
app.protect('alert', function(message) {
    console.log(message);
});

app.get('alert')('hi');
```

The `extend` method can be used to modify existing services.

```javascript
app.extend('rest', function(rest) {
    rest.plugin(new MyPlugin());
    return rest;
});

```

Groups of services can be registered with a service provider function

```javascript
app.register(function()) {
    this.set('api_url', 'http://example.com');
    app.set('rest', function() {
        return new RestApi(this.get('api_url'));
    });
});
```

### Thanks
Thank you to [Fabien Potencier](http://fabien.potencier.org), the creator of [Pimple](http://pimple.sensiolabs.org) for PHP for the inspiration for Papaya.