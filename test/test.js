/* global describe, it */
"use strict";

var expect = require('chai').expect;
var Papaya = require('../dist').Papaya;

describe('Papaya', function() {
  it('should return exact match for contsants', function() {
    var p = new Papaya();
    var obj = {};
    p.constant('num', obj);
    expect(p.get('num')).to.equal(obj);
  });

  it('should return same object multiple times from service', function() {
    var p = new Papaya();
    var p2;
    p.service('shared', function() {
      p2 = this;
      return {};
    });
    expect(p.get('shared')).to.equal(p.get('shared'));
    expect(p2).to.equal(p)
  });

  it('should return different objects from factory', function() {
    var p = new Papaya();
    var p2;
    p.factory('obj_factory', function() {
      p2 = this;
      return {};
    });
    expect(p.get('obj_factory')).not.to.equal(p.get('obj_factory'));
    expect(p2).to.equal(p);
  });

  it('should return constant function', function() {
    var p = new Papaya();
    var func = function() {};
    p.constant('protected', func);
    expect(p.get('protected')).to.equal(func);
  });

  it('should call provider with papaya as context', function() {
    var p = new Papaya();
    var p2;
    p.register(function() {
      p2 = this;
    });
    expect(p2).to.equal(p)
  });

  it('can extend object', function() {
    var p = new Papaya();
    var obj = {};
    p.constant('obj', obj);
    p.extend('obj', function(orig) {
      orig.extended = true;
      return orig;
    });
    expect(p.get('obj')).to.equal(obj);
    expect(p.get('obj').extended).to.equal(true);
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
    expect(p.get('fact').extended).to.equal(true);
    expect(p.get('fact')).not.to.equal(p.get('fact'));
    expect(p2).to.equal(p);
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
    expect(p.get('shared').extended).to.equal(true);
    expect(p.get('shared')).to.equal(p.get('shared'));
    expect(p2).to.equal(p);
  });

  it('can extend constant function', function() {
    var p = new Papaya();
    var p2;
    var func = function() {};
    var func2 = function() {};
    p.constant('prot', func);
    p.extend('prot', function(orig) {
      p2 = this;
      expect(orig).to.equal(func)
      return func2;
    });
    expect(p.get('prot')).to.equal(func2);
    expect(p2).to.equal(p);
  });

  it('cannot extend an undefined service', function() {
    var p = new Papaya();
    var value = 'original value';
    expect(() => {
      p.extend('foo', function(orig) {});
    }).to.throw('Cannot extend missing service: foo')
  });

  it('can be chained', function() {
    var p = new Papaya();
    var p2 = p
      .service('1', '1')
      .constant('2', '2')
      .factory('3', '3')
      .extend('3', function() {})
      .register(function() {});

    expect(p2).to.equal(p);
  });

  it('should override a function service with a static service', function() {
    var p = new Papaya();
    p.service('test', function() {});
    p.service('test', 'hi');
    expect(p.get('test')).to.equal('hi');
  });

  it('can get all the registered service keys', function() {
    var p = new Papaya();
    p.service('static', 'static');
    p.service('shared', function() {});
    p.factory('factory', function() {});
    p.constant('protected', function() {});

    var keys = p.keys();
    expect(keys).to.have.length(4)
    expect(keys).to.contain('static');
    expect(keys).to.contain('shared');
    expect(keys).to.contain('factory');
    expect(keys).to.contain('protected');
  });

  it('can check if it has a service', function() {
    var p = new Papaya();
    p.service('static', 'static');
    p.service('shared', function() {});
    p.factory('factory', function() {});
    p.constant('protected', function() {});

    expect(p.has('static')).to.equal(true);
    expect(p.has('shared')).to.equal(true);
    expect(p.has('factory')).to.equal(true);
    expect(p.has('protected')).to.equal(true);

    expect(p.has('foo')).to.equal(false);
  });
});
