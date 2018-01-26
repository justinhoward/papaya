/**
 * Creates a new Papaya container.
 */
export class Papaya {
  private _services: { [name: string]: any } = {}
  private _functions: { [name: string]: true } = {}
  private _factories: { [name: string]: true } = {}

  /**
   * Gets a service by name.
   *
   * If the service is not set, will return undefined.
   *
   * @param  {string} name The service name
   * @return {mixed|undefined} The service or undefined if it is not set
   */
  public get<T = any>(name: string): T {
    if (this._factories[name]) {
      return this._services[name].call(this, this)
    }

    if (this._functions[name]) {
      this._services[name] = this._services[name].call(this, this)
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
  public service<T>(
    name: string,
    service: (this: this, container: this) => T
  ) {
    this._setService(name, service, this._functions)
    return this
  }

  public constant<T>(name: string, service: T) {
    this._setService(name, service)
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
  public factory<T>(
    name: string,
    factory: (this: this, container: this) => T
  ) {
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
  public extend<T>(
    name: string,
    extender: (this: this, extended: T, container: this) => T
  ) {
    if (!this.has(name)) {
      throw new Error(`Cannot extend missing service: ${name}`)
    }

    const extended = this._services[name]
    let protect = false
    const service = () => {
      return extender.call(
        this,
        protect ? extended : extended.call(this, this),
        this
      )
    }

    if (this._factories[name]) {
      return this.factory(name, service)
    } else {
      protect = !this._functions[name]
      return this.service(name, service)
    }
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
  public register(provider: (this: this, container: this) => void) {
    provider.call(this, this)
    return this
  }

  /**
   * Get an array of the regitered service names
   *
   * @return {array[string]} An array of service names
   */
  public keys() {
    return Object.keys(this._services)
  }

  /**
   * Check whether a service has been registered for the given name'
   *
   * @return {boolean} True if a service has been registered for `name`, false otherwise.
   */
  public has(name: string) {
    return this._services.hasOwnProperty(name)
  }

  private _setService(
    name: string,
    service: any,
    registry?: { [name: string]: true }
  ) {
    delete this._services[name]
    delete this._functions[name]
    delete this._factories[name]
    if (registry && typeof service === 'function') {
      registry[name] = true
    }

    this._services[name] = service
  }
}
