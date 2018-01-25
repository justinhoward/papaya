/* global describe, it */
"use strict";

var should = require('should');
var Papaya = require('../dist').Papaya;

describe('Papaya', function() {
  it('should return exact match for contsants', function() {
    var p = new Papaya();
    var obj = {};
    p.constant('num', obj);
    p.get('num').should.be.exactly(obj);
  });

  it('should return same object multiple times from service', function() {
    var p = new Papaya();
    var p2;
    p.service('shared', function() {
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

  it('should return constant function', function() {
    var p = new Papaya();
    var func = function() {};
    p.constant('protected', func);
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
    p.constant('obj', obj);
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
    p.service('shared', function() {
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

  it('can extend constant function', function() {
    var p = new Papaya();
    var p2;
    var func = function() {};
    var func2 = function() {};
    p.constant('prot', func);
    p.extend('prot', function(orig) {
      p2 = this;
      orig.should.be.exactly(func);
      return func2;
    });
    p.get('prot').should.be.exactly(func2);
    p2.should.be.exactly(p);
  });

  xit('cannot extend an undefined service', function() {
    var p = new Papaya();
    var value = 'original value';
    p.extend('foo', function(orig) {});
  });

  it('can be chained', function() {
    var p = new Papaya();
    var p2 = p
      .service('1', '1')
      .constant('2', '2')
      .factory('3', '3')
      .extend('3', function() {})
      .register(function() {});

    p2.should.be.exactly(p);

  });

  it('should override a function service with a static service', function() {
    var p = new Papaya();
    p.service('test', function() {});
    p.service('test', 'hi');
    p.get('test').should.be.exactly('hi');
  });

  it('can get all the registered service keys', function() {
    var p = new Papaya();
    p.service('static', 'static');
    p.service('shared', function() {});
    p.factory('factory', function() {});
    p.constant('protected', function() {});

    var keys = p.keys();
    keys.should.have.length(4);
    keys.should.containEql('static');
    keys.should.containEql('shared');
    keys.should.containEql('factory');
    keys.should.containEql('protected');
  });

  it('can check if it has a service', function() {
    var p = new Papaya();
    p.service('static', 'static');
    p.service('shared', function() {});
    p.factory('factory', function() {});
    p.constant('protected', function() {});

    p.has('static').should.be.exactly(true);
    p.has('shared').should.be.exactly(true);
    p.has('factory').should.be.exactly(true);
    p.has('protected').should.be.exactly(true);

    p.has('foo').should.be.exactly(false);
  });
});
