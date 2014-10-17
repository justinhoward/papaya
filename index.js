"use strict";

var Papaya = function () {
    this._services = {};
    this._functions = {};
    this._factories = {};
};

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

Papaya.prototype.set = function(name, service) {
    if (typeof service === 'function') {
        this._functions[name] = true;
    }

    this._services[name] = service;
    return this;
};

Papaya.prototype.factory = function(name, factory) {
    if (typeof factory === 'function') {
        this._factories[name] = true;
    }

    this._services[name] = factory;
    return this;
};

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

Papaya.prototype.protect = function(name, service) {
    this._services[name] = service;
    return this;
};

Papaya.prototype.register = function(provider) {
    provider.call(this);
    return this;
};

module.exports = Papaya;
