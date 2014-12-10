"use strict";

/**
 * Creates a new Papaya container.
 */
var Papaya = function () {
    this._services = {};
    this._functions = {};
    this._factories = {};
};

function resetService(self, name) {
    delete self._services[name];
    delete self._functions[name];
    delete self._factories[name];
}

/**
 * Gets a service by name.
 *
 * If the service is not set, will return undefined.
 *
 * @param  {string} name The service name
 * @return {mixed|unefined} The service or undefined if it is not set
 */
Papaya.prototype.get = function(name) {
    if (this._factories.hasOwnProperty(name)) {
        return this._services[name].call(this);
    }

    if (this._functions.hasOwnProperty(name)) {
        this._services[name] = this._services[name].call(this);
        delete this._functions[name];
    }

    return this._services[name];
};

/**
 * Sets a service by name and value.
 *
 * If `service` is a function, its return value
 * will be treated as a singleton service meaning
 * it will be initialized the first time it is requested
 * and its value will be cached for subsequent requests.
 *
 * If `service` is not a function, its value will be stored directly.
 *
 * @param {string} name The service name
 * @param {function|mixed} service The service singleton function or static service
 * @return {this} The container
 */
Papaya.prototype.set = function(name, service) {
    resetService(this, name);
    if (typeof service === 'function') {
        this._functions[name] = true;
    }

    this._services[name] = service;
    return this;
};

/**
 * Sets a factory service by name and value.
 *
 * If `factory` is a function, it will be called every time
 * the service is requested. So if it returns an object,
 * it will create a new object for every request.
 *
 * If `factory` is not a function, this method acts
 * like `set`.
 *
 * @param  {string} name The service name
 * @param  {function|mixed} factory The service factory function or static service
 * @return {this} The container
 */
Papaya.prototype.factory = function(name, factory) {
    resetService(this, name);
    if (typeof factory === 'function') {
        this._factories[name] = true;
    }

    this._services[name] = factory;
    return this;
};

/**
 * Extends an existing service and overrides it.
 *
 * The `extender` function will be called with 1 argument which will
 * be the previous value of the service. If there is no existing `name`
 * service, the `extender` method will be called with its argument `undefined`.
 * The function should return the new value for the service that will override
 * the existing one.
 *
 * If `extend` is called for a service that was created with `set`,
 * the resulting service will be a singleton.
 *
 * If `extend` is called for a service that was created with `factory`
 * the resulting service will be a factory.
 *
 * If `extend` is called for a service that was created with `protect`,
 * the resulting service will also be protected.
 *
 * If `extender` is not a function, this method will override any
 * existing service.
 *
 * @param  {string} name The service name
 * @param  {function|mixed} extender The service extender function or static service.
 * @return {[type]}
 */
Papaya.prototype.extend = function(name, extender) {
    if (typeof extender !== 'function' || !this._services.hasOwnProperty(name)) {
        return this.set(name, extender);
    }

    var extended = this._services[name];
    var method = 'set';
    var call = false;

    if (this._factories.hasOwnProperty(name)) {
        method = 'factory';
        call = true;
    } else if (this._functions.hasOwnProperty(name)) {
        call = true;
    }

    return this[method](name, function() {
        return extender.call(this, call ? extended.call(this) : extended);
    });
};

/**
 * Sets a protected service by name and value.
 *
 * If `service` is a function, the function itself will
 * be registered as a service. So when it is requested
 * with `get` the function will be returned instead of
 * the function's return value.
 *
 * If `service` is not a function, this method acts
 * like `set`.
 *
 * @param  {string} name The service name
 * @param  {function|mixed} service The service function or static service
 * @return {this} The container
 */
Papaya.prototype.protect = function(name, service) {
    resetService(this, name);
    this._services[name] = service;
    return this;
};

/**
 * Register a service provider function.
 *
 * `provider` will be called with the container
 * as the context. Service providers are a good
 * place to register related services using `set`
 * etc.
 *
 * @param  {function} provider The service provider function
 * @return {this} The container
 */
Papaya.prototype.register = function(provider) {
    provider.call(this);
    return this;
};

/**
 * Get an array of the regitered service names
 *
 * @return {array[string]} An array of service names
 */
Papaya.prototype.keys = function() {
    var keys = [], i = 0;
    for (var key in this._services) {
        keys[i++] = key;
    }
    return keys;
};

/**
 * Check whether a service has been registered for the given name'
 *
 * @return {boolean} True if a service has been registered for `name`, false otherwise.
 */
Papaya.prototype.has = function(name) {
    return this._services.hasOwnProperty(name);
};

module.exports = Papaya;
