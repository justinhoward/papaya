import { expect } from 'chai'
import { Papaya } from '../index'

describe('Papaya', function() {
  it('should return exact match for contsants', function() {
    const p = new Papaya()
    const obj = {}
    p.constant('num', obj)
    expect(p.get('num')).to.equal(obj)
  })

  it('should return same object multiple times from service', function() {
    const p = new Papaya()
    p.service('shared', () => ({}))
    expect(p.get('shared')).to.equal(p.get('shared'))
  })

  it('should return different objects from factory', function() {
    const p = new Papaya()
    p.factory('obj_factory', () => ({}))
    expect(p.get('obj_factory')).not.to.equal(p.get('obj_factory'))
  })

  it('should return constant function', function() {
    const p = new Papaya()
    const func = function() { return }
    p.constant('protected', func)
    expect(p.get('protected')).to.equal(func)
  })

  it('should call provider with papaya as context', function() {
    const p = new Papaya()
    let p2: any
    p.register(function() {
      p2 = this
    })
    expect(p2).to.equal(p)
  })

  it('can extend object', function() {
    const p = new Papaya()
    const obj = {}
    p.constant('obj', obj)
    p.extend<any>('obj', (orig) => {
      orig.extended = true
      return orig
    })
    expect(p.get('obj')).to.equal(obj)
    expect(p.get('obj').extended).to.equal(true)
  })

  it('can extend factory', function() {
    const p = new Papaya()
    p.factory('fact', () => ({}))
    p.extend<any>('fact', function(orig, c) {
      orig.extended = true
      return orig
    })
    expect(p.get('fact').extended).to.equal(true)
    expect(p.get('fact')).not.to.equal(p.get('fact'))
  })

  it('can extend shared', function() {
    const p = new Papaya()
    p.service('shared', function() {
      return {}
    })
    p.extend<any>('shared', (orig) => {
      orig.extended = true
      return orig
    })
    expect(p.get('shared').extended).to.equal(true)
    expect(p.get('shared')).to.equal(p.get('shared'))
  })

  it('can extend constant function', function() {
    const p = new Papaya()
    const func = function() { return }
    const func2 = function() { return }
    p.constant('prot', func)
    p.extend('prot', function(orig) {
      expect(orig).to.equal(func)
      return func2
    })
    expect(p.get('prot')).to.equal(func2)
  })

  it('cannot extend an undefined service', function() {
    const p = new Papaya()
    const value = 'original value'
    expect(() => {
      p.extend('foo', () => undefined)
    }).to.throw('Cannot extend missing service: foo')
  })

  it('can be chained', function() {
    const p = new Papaya()
    const p2 = p
      .service('1', () => undefined)
      .constant('2', '2')
      .factory('3', () => undefined)
      .extend('3', () => undefined)
      .register(() => undefined)

    expect(p2).to.equal(p)
  })

  it('should override a function service with a static service', function() {
    const p = new Papaya()
    p.service('test', () => undefined)
    p.constant('test', 'hi')
    expect(p.get('test')).to.equal('hi')
  })

  it('can get all the registered service keys', function() {
    const p = new Papaya()
    p.constant('static', 'static')
    p.service('shared', () => undefined)
    p.factory('factory', () => undefined)
    p.constant('protected', () => undefined)

    const keys = p.keys()
    expect(keys).to.have.length(4)
    expect(keys).to.contain('static')
    expect(keys).to.contain('shared')
    expect(keys).to.contain('factory')
    expect(keys).to.contain('protected')
  })

  it('can check if it has a service', function() {
    const p = new Papaya()
    p.constant('static', 'static')
    p.service('shared', () => undefined)
    p.factory('factory', () => undefined)
    p.constant('protected', () => undefined)

    expect(p.has('static')).to.equal(true)
    expect(p.has('shared')).to.equal(true)
    expect(p.has('factory')).to.equal(true)
    expect(p.has('protected')).to.equal(true)

    expect(p.has('foo')).to.equal(false)
  })

  it('sets this and argument to itself in service callback', function() {
    const app = new Papaya()
    let self: any
    let arg: any
    app.service('foo', function(container) {
      self = this
      arg = container
    })
    app.get('foo')
    expect(self).to.equal(app)
    expect(arg).to.equal(app)
  })

  it('sets this and argument to itself in factory callback', function() {
    const app = new Papaya()
    let self: any
    let arg: any
    app.factory('foo', function(container) {
      self = this
      arg = container
    })
    app.get('foo')
    expect(self).to.equal(app)
    expect(arg).to.equal(app)
  })

  it('sets this and second argument to itself in extend callback', function() {
    const app = new Papaya()
    let self: any
    let arg: any
    app.constant('foo', 'bar')
    app.extend('foo', function(foo, container) {
      self = this
      arg = container
      return 'baz'
    })
    app.get('foo')
    expect(self).to.equal(app)
    expect(arg).to.equal(app)
  })

  it('sets this and argument to itself in extended service', function() {
    const app = new Papaya()
    let self: any
    let arg: any
    app.service('foo', function(container) {
      self = this
      arg = container
    })
    app.extend('foo', function(foo, container) {
      return 'baz'
    })
    app.get('foo')
    expect(self).to.equal(app)
    expect(arg).to.equal(app)
  })
})
