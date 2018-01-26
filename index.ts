/**
 * A Papaya container
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
   * @param name The service name
   * @return The service or undefined if it is not set
   */
  public get<T>(name: string): T {
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
   * Creates a constant by name and value.
   *
   * @param name The service name
   * @param constant The value to be set
   */
  public constant<T>(name: string, constant: T) {
    this._setService(name, constant)
    return this
  }

  /**
   * Sets a service by name and a service function
   *
   * The return value of the `service` function will be treated as a singleton
   * service meaning it will be initialized the first time it is requested and
   * its value will be cached for subsequent requests.
   *
   * @param name The service name
   * @param service The service singleton function or static service
   */
  public service<T>(
    name: string,
    service: (this: this, container: this) => T
  ) {
    this._setService(name, service, this._functions)
    return this
  }

  /**
   * Sets a factory service by name and value.
   *
   * The `factory` function will be called every time the service is requested.
   * So if it returns an object, it will create a new object for every request.
   *
   * @param name The service name
   * @param factory The service factory function or static service
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
   * The `extender` function will be called with 2 argument which will be the
   * previous value of the service and the Papaya container. If there is no
   * existing `name` service, it will throw an error immediately. The
   * `extender` function should return the new value for the service that will
   * override the existing one.
   *
   * If `this.extend` is called for a service that was created with
   * `this.service`, the resulting service will be a singleton.
   *
   * If `this.extend` is called for a service that was created with
   * `this.factory` the resulting service will be a factory.
   *
   * If `this.extend` is called for a service that was created with
   * `this.constant`, the resulting service will be a singleton.
   *
   * @param name The service name
   * @param extender The service extender function or static service.
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
   * `provider` will be called with the container as the context. Service
   * providers are a good place to register related services using
   * `this.service` etc.
   *
   * @param provider The service provider function
   */
  public register(provider: (this: this, container: this) => void) {
    provider.call(this, this)
    return this
  }

  /**
   * Get an array of the regitered service names
   *
   * @return An array of service names
   */
  public keys() {
    return Object.keys(this._services)
  }

  /**
   * Check whether a service has been registered for the given name'
   *
   * @return True if a service has been registered for `name`, false otherwise.
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
