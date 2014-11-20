/* global describe, it */
"use strict";

var should = require('should');
var Papaya = require('../papaya');

describe('papaya', function() {
    it('should return exact match if not a function', function() {
        var p = new Papaya();
        var obj = {};
        p.set('num', obj);
        p.get('num').should.be.exactly(obj);
    });

    it('should return same object multiple times from function', function() {
        var p = new Papaya();
        var p2;
        p.set('shared', function() {
            p2 = this;
            return {};
        });
        p.get('shared').should.be.exactly(p.get('shared'));
        p2.should.be.exactly(p);
    });

    it('should return different objects from factory', function() {
        var p = new Papaya();
        var p2;
        p.factory('obj_factory', function() {
            p2 = this;
            return {};
        });
        p.get('obj_factory').should.not.be.exactly(p.get('obj_factory'));
        p2.should.be.exactly(p);
    });

    it('should return protected function', function() {
        var p = new Papaya();
        var func = function() {};
        p.protect('protected', func);
        p.get('protected').should.be.exactly(func);
    });

    it('should call provider with papaya as context', function() {
        var p = new Papaya();
        var p2;
        p.register(function() {
            p2 = this;
        });
        p2.should.be.exactly(p);
    });

    it('can extend object', function() {
        var p = new Papaya();
        var obj = {};
        p.set('obj', obj);
        p.extend('obj', function(orig) {
            orig.extended = true;
            return orig;
        });
        p.get('obj').should.be.exactly(obj);
        p.get('obj').extended.should.be.exactly(true);
    });

    it('can extend factory', function() {
        var p = new Papaya();
        var p2;
        p.factory('fact', function() {
            return {};
        });
        p.extend('fact', function(orig) {
            p2 = this;
            orig.extended = true;
            return orig;
        });
        p.get('fact').extended.should.be.exactly(true);
        p.get('fact').should.not.be.exactly(p.get('fact'));
        p2.should.be.exactly(p);
    });

    it('can extend shared', function() {
        var p = new Papaya();
        var p2;
        p.set('shared', function() {
            return {};
        });
        p.extend('shared', function(orig) {
            p2 = this;
            orig.extended = true;
            return orig;
        });
        p.get('shared').extended.should.be.exactly(true);
        p.get('shared').should.be.exactly(p.get('shared'));
        p2.should.be.exactly(p);
    });

    it('can extend protected', function() {
        var p = new Papaya();
        var p2;
        var func = function() {};
        var func2 = function() {};
        p.protect('prot', func);
        p.extend('prot', function(orig) {
            p2 = this;
            orig.should.be.exactly(func);
            return func2;
        });
        p.get('prot').should.be.exactly(func2);
        p2.should.be.exactly(p);
    });

    it('can be chained', function() {
        var p = new Papaya();
        var p2 = p
            .set('1', '1')
            .protect('2', '2')
            .factory('3', '3')
            .extend('3', function() {})
            .register(function() {});

        p2.should.be.exactly(p);

    });

    it('should override a function service with a static service', function() {
        var p = new Papaya();
        p.set('test', function() {});
        p.set('test', 'hi');
        p.get('test').should.be.exactly('hi');
    });
});