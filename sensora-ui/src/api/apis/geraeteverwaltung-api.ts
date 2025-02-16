import globalAxios, {type AxiosInstance, type AxiosRequestConfig, type AxiosResponse} from 'axios'

import {BASE_PATH, BaseAPI, type RequestArgs, RequiredError} from '@/api/base'
import {type Controller} from '@/api/models'

import type {CustomAxiosRequestConfig} from '@/api/apiClient.ts'

/**
 * GeraeteverwaltungApi - axios parameter creator
 * @export
 */
export const GeraeteverwaltungApiAxiosParamCreator = function () {
  return {
    /**
     * Gibt die Informationen über ein Gerät zurück, einschließlich der zugehörigen Sensoren und deren Daten.
     * @summary Gerät abfragen
     * @param {string} deviceId Die ID des abzufragenden Geräts
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    get: async (deviceId: string, options: CustomAxiosRequestConfig): Promise<RequestArgs> => {
      // verify required parameter 'deviceId' is not null or undefined
      if (deviceId === null || deviceId === undefined) {
        throw new RequiredError(
          'deviceId',
          'Required parameter deviceId was null or undefined when calling get.',
        )
      }
      const localVarPath = `/device/{deviceId}`.replace(
        `{${'deviceId'}}`,
        encodeURIComponent(String(deviceId)),
      )
      // use dummy base URL string because the URL constructor only accepts absolute URLs.
      const localVarUrlObj = new URL(localVarPath, 'https://example.com')
      let baseOptions

      const localVarRequestOptions: AxiosRequestConfig = {
        method: 'GET',
        ...baseOptions,
        ...options,
      }
      const localVarHeaderParameter = {} as any
      const localVarQueryParameter = {} as any

      const query = new URLSearchParams(localVarUrlObj.search)
      for (const key in localVarQueryParameter) {
        query.set(key, localVarQueryParameter[key])
      }
      for (const key in options.params) {
        query.set(key, options.params[key])
      }
      localVarUrlObj.search = new URLSearchParams(query).toString()
      const headersFromBaseOptions = baseOptions && baseOptions.headers ? baseOptions.headers : {}
      localVarRequestOptions.headers = {
        ...localVarHeaderParameter,
        ...headersFromBaseOptions,
        ...options.headers,
      }

      return {
        url: localVarUrlObj.pathname + localVarUrlObj.search + localVarUrlObj.hash,
        options: localVarRequestOptions,
      }
    },
    /**
     * Gibt eine Liste aller verfügbaren Geräte zurück, ohne dass eine Geräte-ID angegeben werden muss. Dies ermöglicht es, alle Sensoren des Systems abzurufen, die zur Überwachung von verschiedenen Geräten  verwendet werden.
     * @summary Alle verfügbaren Geräte anzeigen
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    getList: async (options: CustomAxiosRequestConfig): Promise<RequestArgs> => {
      const localVarPath = `/devices`
      // use dummy base URL string because the URL constructor only accepts absolute URLs.
      const localVarUrlObj = new URL(localVarPath, 'https://example.com')
      let baseOptions

      const localVarRequestOptions: AxiosRequestConfig = {
        method: 'GET',
        ...baseOptions,
        ...options,
      }
      const localVarHeaderParameter = {} as any
      const localVarQueryParameter = {} as any

      const query = new URLSearchParams(localVarUrlObj.search)
      for (const key in localVarQueryParameter) {
        query.set(key, localVarQueryParameter[key])
      }
      for (const key in options.params) {
        query.set(key, options.params[key])
      }
      localVarUrlObj.search = new URLSearchParams(query).toString()
      const headersFromBaseOptions = baseOptions && baseOptions.headers ? baseOptions.headers : {}
      localVarRequestOptions.headers = {
        ...localVarHeaderParameter,
        ...headersFromBaseOptions,
        ...options.headers,
      }

      return {
        url: localVarUrlObj.pathname + localVarUrlObj.search + localVarUrlObj.hash,
        options: localVarRequestOptions,
      }
    },
  }
}

/**
 * GeraeteverwaltungApi - functional programming interface
 * @export
 */
export const GeraeteverwaltungApiFp = function () {
  return {
    /**
     * Gibt die Informationen über ein Gerät zurück, einschließlich der zugehörigen Sensoren und deren Daten.
     * @summary Gerät abfragen
     * @param {string} deviceId Die ID des abzufragenden Geräts
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    async get(
      deviceId: string,
      options?: CustomAxiosRequestConfig,
    ): Promise<(axios?: AxiosInstance, basePath?: string) => Promise<AxiosResponse<Controller>>> {
      const localVarAxiosArgs = await GeraeteverwaltungApiAxiosParamCreator().get(
        deviceId,
        options ? options : ({} as CustomAxiosRequestConfig),
      )
      return (axios: AxiosInstance = globalAxios, basePath: string = BASE_PATH) => {
        const axiosRequestArgs: AxiosRequestConfig = {
          ...localVarAxiosArgs.options,
          url: basePath + localVarAxiosArgs.url,
        }
        return axios.request(axiosRequestArgs)
      }
    },
    /**
     * Gibt eine Liste aller verfügbaren Geräte zurück, ohne dass eine Geräte-ID angegeben werden muss. Dies ermöglicht es, alle Sensoren des Systems abzurufen, die zur Überwachung von verschiedenen Geräten  verwendet werden.
     * @summary Alle verfügbaren Geräte anzeigen
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    async getList(
      options?: CustomAxiosRequestConfig,
    ): Promise<
      (axios?: AxiosInstance, basePath?: string) => Promise<AxiosResponse<Array<Controller & any>>>
    > {
      const localVarAxiosArgs = await GeraeteverwaltungApiAxiosParamCreator().getList(
        options ? options : ({} as CustomAxiosRequestConfig),
      )
      return (axios: AxiosInstance = globalAxios, basePath: string = BASE_PATH) => {
        const axiosRequestArgs: AxiosRequestConfig = {
          ...localVarAxiosArgs.options,
          url: basePath + localVarAxiosArgs.url,
        }
        return axios.request(axiosRequestArgs)
      }
    },
  }
}

/**
 * GeraeteverwaltungApi - factory interface
 * @export
 */
export const GeraeteverwaltungApiFactory = function (basePath?: string, axios?: AxiosInstance) {
  return {
    /**
     * Gibt die Informationen über ein Gerät zurück, einschließlich der zugehörigen Sensoren und deren Daten.
     * @summary Gerät abfragen
     * @param {string} deviceId Die ID des abzufragenden Geräts
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    async get(
      deviceId: string,
      options?: CustomAxiosRequestConfig,
    ): Promise<AxiosResponse<Controller>> {
      return GeraeteverwaltungApiFp()
        .get(deviceId, options)
        .then((request) => request(axios, basePath))
    },
    /**
     * Gibt eine Liste aller verfügbaren Geräte zurück, ohne dass eine Geräte-ID angegeben werden muss. Dies ermöglicht es, alle Sensoren des Systems abzurufen, die zur Überwachung von verschiedenen Geräten  verwendet werden.
     * @summary Alle verfügbaren Geräte anzeigen
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    async getList(options?: CustomAxiosRequestConfig): Promise<AxiosResponse<Array<Controller>>> {
      return GeraeteverwaltungApiFp()
        .getList(options)
        .then((request) => request(axios, basePath))
    },
  }
}

/**
 * GeraeteverwaltungApi - object-oriented interface
 * @export
 * @class GeraeteverwaltungApi
 * @extends {BaseAPI}
 */
export class GeraeteverwaltungApi extends BaseAPI {
  /**
   * Gibt die Informationen über ein Gerät zurück, einschließlich der zugehörigen Sensoren und deren Daten.
   * @summary Gerät abfragen
   * @param {string} deviceId Die ID des abzufragenden Geräts
   * @param {*} [options] Override http request option.
   * @throws {RequiredError}
   * @memberof GeraeteverwaltungApi
   */
  public async get(
    deviceId: string,
    options?: CustomAxiosRequestConfig,
  ): Promise<AxiosResponse<Controller>> {
    return GeraeteverwaltungApiFp()
      .get(deviceId, options)
      .then((request) => request(this.axios, this.basePath))
  }

  /**
   * Gibt eine Liste aller verfügbaren Geräte zurück, ohne dass eine Geräte-ID angegeben werden muss. Dies ermöglicht es, alle Sensoren des Systems abzurufen, die zur Überwachung von verschiedenen Geräten  verwendet werden.
   * @summary Alle verfügbaren Geräte anzeigen
   * @param {*} [options] Override http request option.
   * @throws {RequiredError}
   * @memberof GeraeteverwaltungApi
   */
  public async getList(
    options?: CustomAxiosRequestConfig,
  ): Promise<AxiosResponse<Array<Controller & any>>> {
    return GeraeteverwaltungApiFp()
      .getList(options)
      .then((request) => request(this.axios, this.basePath))
  }
}
