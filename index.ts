interface Registry { [name: string]: any }

/**
 * Creates a new Papaya container.
 */
export class Papaya {
  private _services: Registry = {}
  private _functions: Registry = {}
  private _factories: Registry = {}

  /**
   * Gets a service by name.
   *
   * If the service is not set, will return undefined.
   *
   * @param  {string} name The service name
   * @return {mixed|undefined} The service or undefined if it is not set
   */
  public get<T = any>(name: string): T {
    if (this._factories.hasOwnProperty(name)) {
      return this._services[name].call(this)
    }

    if (this._functions.hasOwnProperty(name)) {
      this._services[name] = this._services[name].call(this)
      delete this._functions[name]
    }

    return this._services[name]
  }

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
  public set(name: string, service: any) {
    this._setService(name, service, this._functions)
    return this
  }

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
  public factory(name: string, factory: any) {
    this._setService(name, factory, this._factories)
    return this
  }

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
  public extend(name: string, extender: any) {
    if (typeof extender !== 'function' || !this._services.hasOwnProperty(name)) {
      return this.set(name, extender)
    }

    const extended = this._services[name]
    let method: 'set' | 'factory' = 'set'
    let call = false

    if (this._factories.hasOwnProperty(name)) {
      method = 'factory'
      call = true
    } else if (this._functions.hasOwnProperty(name)) {
      call = true
    }

    return this[method](name, () => {
      return extender.call(this, call ? extended.call(this) : extended)
    })
  }

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
  public protect(name: string, service: any) {
    this._setService(name, service)
    return this
  }

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
  public register(provider: (this: this) => void) {
    provider.call(this)
    return this
  }

  /**
   * Get an array of the regitered service names
   *
   * @return {array[string]} An array of service names
   */
  public keys() {
    const keys = []
    let i = 0
    for (const key in this._services) {
      if (this.has(key)) {
        keys[i++] = key
      }
    }
    return keys
  }

  /**
   * Check whether a service has been registered for the given name'
   *
   * @return {boolean} True if a service has been registered for `name`, false otherwise.
   */
  public has(name: string) {
    return this._services.hasOwnProperty(name)
  }

  private _setService(name: string, service: any, registry?: Registry) {
    delete this._services[name]
    delete this._functions[name]
    delete this._factories[name]
    if (registry && typeof service === 'function') {
      registry[name] = true
    }

    this._services[name] = service
  }
}
