import globalAxios, { type AxiosInstance, type AxiosRequestConfig, type AxiosResponse } from 'axios'
import { BASE_PATH, BaseAPI, type RequestArgs, RequiredError } from '@/api/base'
import type { createPlantBody, Plant, updatePlantBody } from '@/api/models'

/**
 * PflanzenverwaltungApi - axios parameter creator
 * @export
 */
export const PflanzenverwaltungApiAxiosParamCreator = function () {
  return {
    /**
     * Löscht eine Pflanze aus dem System.
     * @summary Pflanze löschen
     * @param {string} plantId Die ID der zu löschenden Pflanze.
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    delete: async (plantId: string, options: AxiosRequestConfig = {}): Promise<RequestArgs> => {
      // verify required parameter 'plantId' is not null or undefined
      if (plantId === null || plantId === undefined) {
        throw new RequiredError(
          'plantId',
          'Required parameter plantId was null or undefined when calling delete.',
        )
      }
      const localVarPath = `/plant/{plantId}`.replace(
        `{${'plantId'}}`,
        encodeURIComponent(String(plantId)),
      )
      // use dummy base URL string because the URL constructor only accepts absolute URLs.
      const localVarUrlObj = new URL(localVarPath, 'https://example.com')
      let baseOptions

      const localVarRequestOptions: AxiosRequestConfig = {
        method: 'DELETE',
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
     * Ruft die Pflanzendaten sowie die Sensordaten ab, die im angegebenen Zeitraum liegen.
     * @summary Pflanze abfragen
     * @param {string} plantId Die ID der Pflanze, die abgefragt werden soll.
     * @param {Date} [startTime] Der Startzeitpunkt des Zeitraums, für den die Sensordaten abgerufen werden sollen. Wenn nicht angegeben von vor 24 Stunden.
     * @param {Date} [endTime] Der Endzeitpunkt des Zeitraums, für den die Sensordaten abgerufen werden sollen. Wenn nicht angegen bis zum aktuellen Zeitpunkt.
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    get: async (
      plantId: string,
      startTime?: Date,
      endTime?: Date,
      options: AxiosRequestConfig = {},
    ): Promise<RequestArgs> => {
      // verify required parameter 'plantId' is not null or undefined
      if (plantId === null || plantId === undefined) {
        throw new RequiredError(
          'plantId',
          'Required parameter plantId was null or undefined when calling get.',
        )
      }
      const localVarPath = `/plant/{plantId}`.replace(
        `{${'plantId'}}`,
        encodeURIComponent(String(plantId)),
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

      if (startTime !== undefined) {
        localVarQueryParameter['startTime'] =
          (startTime as any) instanceof Date ? (startTime as any).toISOString() : startTime
      }

      if (endTime !== undefined) {
        localVarQueryParameter['endTime'] =
          (endTime as any) instanceof Date ? (endTime as any).toISOString() : endTime
      }

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
     * Ermöglicht das Aktualisieren von Pflanzendaten.
     * @summary Pflanze aktualisieren
     * @param {updatePlantBody} body
     * @param {string} plantId Die ID der zu aktualisierenden Pflanze.
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    update: async (
      body: updatePlantBody,
      plantId: string,
      options: AxiosRequestConfig = {},
    ): Promise<RequestArgs> => {
      // verify required parameter 'body' is not null or undefined
      if (body === null || body === undefined) {
        throw new RequiredError(
          'body',
          'Required parameter body was null or undefined when calling update.',
        )
      }
      // verify required parameter 'plantId' is not null or undefined
      if (plantId === null || plantId === undefined) {
        throw new RequiredError(
          'plantId',
          'Required parameter plantId was null or undefined when calling update.',
        )
      }
      const localVarPath = `/plant/{plantId}`.replace(
        `{${'plantId'}}`,
        encodeURIComponent(String(plantId)),
      )
      // use dummy base URL string because the URL constructor only accepts absolute URLs.
      const localVarUrlObj = new URL(localVarPath, 'https://example.com')
      let baseOptions

      const localVarRequestOptions: AxiosRequestConfig = {
        method: 'PATCH',
        ...baseOptions,
        ...options,
      }
      const localVarHeaderParameter = {} as any
      const localVarQueryParameter = {} as any

      localVarHeaderParameter['Content-Type'] = 'application/json'

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
      localVarRequestOptions.data = JSON.stringify(body)

      return {
        url: localVarUrlObj.pathname + localVarUrlObj.search + localVarUrlObj.hash,
        options: localVarRequestOptions,
      }
    },
    /**
     * Erstellt eine neue Pflanze und verknüpft sie mit einem Raum und einem Sensor.
     * @summary Pflanze erstellen
     * @param {createPlantBody} body
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    create: async (
      body: createPlantBody,
      options: AxiosRequestConfig = {},
    ): Promise<RequestArgs> => {
      // verify required parameter 'body' is not null or undefined
      if (body === null || body === undefined) {
        throw new RequiredError(
          'body',
          'Required parameter body was null or undefined when calling create.',
        )
      }
      const localVarPath = `/plant`
      // use dummy base URL string because the URL constructor only accepts absolute URLs.
      const localVarUrlObj = new URL(localVarPath, 'https://example.com')
      let baseOptions

      const localVarRequestOptions: AxiosRequestConfig = {
        method: 'POST',
        ...baseOptions,
        ...options,
      }
      const localVarHeaderParameter = {} as any
      const localVarQueryParameter = {} as any

      localVarHeaderParameter['Content-Type'] = 'application/json'

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
      localVarRequestOptions.data = JSON.stringify(body)

      return {
        url: localVarUrlObj.pathname + localVarUrlObj.search + localVarUrlObj.hash,
        options: localVarRequestOptions,
      }
    },
  }
}

/**
 * PflanzenverwaltungApi - functional programming interface
 * @export
 */
export const PflanzenverwaltungApiFp = function () {
  return {
    /**
     * Löscht eine Pflanze aus dem System.
     * @summary Pflanze löschen
     * @param {string} plantId Die ID der zu löschenden Pflanze.
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    async delete(
      plantId: string,
      options?: AxiosRequestConfig,
    ): Promise<(axios?: AxiosInstance, basePath?: string) => Promise<AxiosResponse<void>>> {
      const localVarAxiosArgs = await PflanzenverwaltungApiAxiosParamCreator().delete(
        plantId,
        options,
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
     * Ruft die Pflanzendaten sowie die Sensordaten ab, die im angegebenen Zeitraum liegen.
     * @summary Pflanze abfragen
     * @param {string} plantId Die ID der Pflanze, die abgefragt werden soll.
     * @param {Date} [startTime] Der Startzeitpunkt des Zeitraums, für den die Sensordaten abgerufen werden sollen. Wenn nicht angegeben von vor 24 Stunden.
     * @param {Date} [endTime] Der Endzeitpunkt des Zeitraums, für den die Sensordaten abgerufen werden sollen. Wenn nicht angegen bis zum aktuellen Zeitpunkt.
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    async get(
      plantId: string,
      startTime?: Date,
      endTime?: Date,
      options?: AxiosRequestConfig,
    ): Promise<(axios?: AxiosInstance, basePath?: string) => Promise<AxiosResponse<Plant>>> {
      const localVarAxiosArgs = await PflanzenverwaltungApiAxiosParamCreator().get(
        plantId,
        startTime,
        endTime,
        options,
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
     * Ermöglicht das Aktualisieren von Pflanzendaten.
     * @summary Pflanze aktualisieren
     * @param {updatePlantBody} body
     * @param {string} plantId Die ID der zu aktualisierenden Pflanze.
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    async update(
      body: updatePlantBody,
      plantId: string,
      options?: AxiosRequestConfig,
    ): Promise<(axios?: AxiosInstance, basePath?: string) => Promise<AxiosResponse<Plant>>> {
      const localVarAxiosArgs = await PflanzenverwaltungApiAxiosParamCreator().update(
        body,
        plantId,
        options,
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
     * Erstellt eine neue Pflanze und verknüpft sie mit einem Raum und einem Sensor.
     * @summary Pflanze erstellen
     * @param {createPlantBody} body
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    async create(
      body: createPlantBody,
      options?: AxiosRequestConfig,
    ): Promise<(axios?: AxiosInstance, basePath?: string) => Promise<AxiosResponse<Plant>>> {
      const localVarAxiosArgs = await PflanzenverwaltungApiAxiosParamCreator().create(body, options)
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
 * PflanzenverwaltungApi - factory interface
 * @export
 */
export const PflanzenverwaltungApiFactory = function (basePath?: string, axios?: AxiosInstance) {
  return {
    /**
     * Löscht eine Pflanze aus dem System.
     * @summary Pflanze löschen
     * @param {string} plantId Die ID der zu löschenden Pflanze.
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    async delete(plantId: string, options?: AxiosRequestConfig): Promise<AxiosResponse<void>> {
      return PflanzenverwaltungApiFp()
        .delete(plantId, options)
        .then((request) => request(axios, basePath))
    },
    /**
     * Ruft die Pflanzendaten sowie die Sensordaten ab, die im angegebenen Zeitraum liegen.
     * @summary Pflanze abfragen
     * @param {string} plantId Die ID der Pflanze, die abgefragt werden soll.
     * @param {Date} [startTime] Der Startzeitpunkt des Zeitraums, für den die Sensordaten abgerufen werden sollen. Wenn nicht angegeben von vor 24 Stunden.
     * @param {Date} [endTime] Der Endzeitpunkt des Zeitraums, für den die Sensordaten abgerufen werden sollen. Wenn nicht angegen bis zum aktuellen Zeitpunkt.
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    async get(
      plantId: string,
      startTime?: Date,
      endTime?: Date,
      options?: AxiosRequestConfig,
    ): Promise<AxiosResponse<Plant>> {
      return PflanzenverwaltungApiFp()
        .get(plantId, startTime, endTime, options)
        .then((request) => request(axios, basePath))
    },
    /**
     * Ermöglicht das Aktualisieren von Pflanzendaten.
     * @summary Pflanze aktualisieren
     * @param {updatePlantBody} body
     * @param {string} plantId Die ID der zu aktualisierenden Pflanze.
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    async update(
      body: updatePlantBody,
      plantId: string,
      options?: AxiosRequestConfig,
    ): Promise<AxiosResponse<Plant>> {
      return PflanzenverwaltungApiFp()
        .update(body, plantId, options)
        .then((request) => request(axios, basePath))
    },
    /**
     * Erstellt eine neue Pflanze und verknüpft sie mit einem Raum und einem Sensor.
     * @summary Pflanze erstellen
     * @param {createPlantBody} body
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    async create(
      body: createPlantBody,
      options?: AxiosRequestConfig,
    ): Promise<AxiosResponse<Plant>> {
      return PflanzenverwaltungApiFp()
        .create(body, options)
        .then((request) => request(axios, basePath))
    },
  }
}

/**
 * PflanzenverwaltungApi - object-oriented interface
 * @export
 * @class PflanzenverwaltungApi
 * @extends {BaseAPI}
 */
export class PflanzenverwaltungApi extends BaseAPI {
  /**
   * Löscht eine Pflanze aus dem System.
   * @summary Pflanze löschen
   * @param {string} plantId Die ID der zu löschenden Pflanze.
   * @param {*} [options] Override http request option.
   * @throws {RequiredError}
   * @memberof PflanzenverwaltungApi
   */
  public async delete(plantId: string, options?: AxiosRequestConfig): Promise<AxiosResponse<void>> {
    return PflanzenverwaltungApiFp()
      .delete(plantId, options)
      .then((request) => request(this.axios, this.basePath))
  }

  /**
   * Ruft die Pflanzendaten sowie die Sensordaten ab, die im angegebenen Zeitraum liegen.
   * @summary Pflanze abfragen
   * @param {string} plantId Die ID der Pflanze, die abgefragt werden soll.
   * @param {Date} [startTime] Der Startzeitpunkt des Zeitraums, für den die Sensordaten abgerufen werden sollen. Wenn nicht angegeben von vor 24 Stunden.
   * @param {Date} [endTime] Der Endzeitpunkt des Zeitraums, für den die Sensordaten abgerufen werden sollen. Wenn nicht angegen bis zum aktuellen Zeitpunkt.
   * @param {*} [options] Override http request option.
   * @throws {RequiredError}
   * @memberof PflanzenverwaltungApi
   */
  public async get(
    plantId: string,
    startTime?: Date,
    endTime?: Date,
    options?: AxiosRequestConfig,
  ): Promise<AxiosResponse<Plant>> {
    return PflanzenverwaltungApiFp()
      .get(plantId, startTime, endTime, options)
      .then((request) => request(this.axios, this.basePath))
  }

  /**
   * Ermöglicht das Aktualisieren von Pflanzendaten.
   * @summary Pflanze aktualisieren
   * @param {updatePlantBody} body
   * @param {string} plantId Die ID der zu aktualisierenden Pflanze.
   * @param {*} [options] Override http request option.
   * @throws {RequiredError}
   * @memberof PflanzenverwaltungApi
   */
  public async update(
    body: updatePlantBody,
    plantId: string,
    options?: AxiosRequestConfig,
  ): Promise<AxiosResponse<Plant>> {
    return PflanzenverwaltungApiFp()
      .update(body, plantId, options)
      .then((request) => request(this.axios, this.basePath))
  }

  /**
   * Erstellt eine neue Pflanze und verknüpft sie mit einem Raum und einem Sensor.
   * @summary Pflanze erstellen
   * @param {createPlantBody} body
   * @param {*} [options] Override http request option.
   * @throws {RequiredError}
   * @memberof PflanzenverwaltungApi
   */
  public async create(
    body: createPlantBody,
    options?: AxiosRequestConfig,
  ): Promise<AxiosResponse<Plant>> {
    return PflanzenverwaltungApiFp()
      .create(body, options)
      .then((request) => request(this.axios, this.basePath))
  }
}
