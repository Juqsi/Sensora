import globalAxios, { type AxiosInstance, type AxiosRequestConfig, type AxiosResponse } from 'axios'
import { BASE_PATH, BaseAPI, type RequestArgs, RequiredError } from '@/api/base'
import type { createRoomBody, Room, RoomPatchBody } from '@/api/models'

/**
 * RaumverwaltungApi - axios parameter creator
 * @export
 */
export const RaumverwaltungApiAxiosParamCreator = function () {
  return {
    /**
     * Erstellt einen Raum und fügt ihn einer Gruppe zu.
     * @summary Raum erstellen
     * @param {createRoomBody} body
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    create: async (
      body: createRoomBody,
      options: AxiosRequestConfig = {},
    ): Promise<RequestArgs> => {
      // verify required parameter 'body' is not null or undefined
      if (body === null || body === undefined) {
        throw new RequiredError(
          'body',
          'Required parameter body was null or undefined when calling create.',
        )
      }
      const localVarPath = `/room`
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
    /**
     * Löscht einen Raum aus dem System.
     * @summary Raum löschen
     * @param {string} roomId Die ID des zu löschenden Raums.
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    delete: async (roomId: string, options: AxiosRequestConfig = {}): Promise<RequestArgs> => {
      // verify required parameter 'roomId' is not null or undefined
      if (roomId === null || roomId === undefined) {
        throw new RequiredError(
          'roomId',
          'Required parameter roomId was null or undefined when calling delete.',
        )
      }
      const localVarPath = `/room/{roomId}`.replace(
        `{${'roomId'}}`,
        encodeURIComponent(String(roomId)),
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
     * Ruft die Informationen zu einem spezifischen Raum ab.
     * @summary Raum abfragen
     * @param {string} roomId Die ID des Raums, den du abfragen möchtest.
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    get: async (roomId: string, options: AxiosRequestConfig = {}): Promise<RequestArgs> => {
      // verify required parameter 'roomId' is not null or undefined
      if (roomId === null || roomId === undefined) {
        throw new RequiredError(
          'roomId',
          'Required parameter roomId was null or undefined when calling get.',
        )
      }
      const localVarPath = `/room/{roomId}`.replace(
        `{${'roomId'}}`,
        encodeURIComponent(String(roomId)),
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
     * Ermöglicht das Aktualisieren der Raumdetails.
     * @summary Raum aktualisieren
     * @param {RoomPatchBody} body
     * @param {string} roomId Die ID des zu aktualisierenden Raums.
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    update: async (
      body: RoomPatchBody,
      roomId: string,
      options: AxiosRequestConfig = {},
    ): Promise<RequestArgs> => {
      // verify required parameter 'body' is not null or undefined
      if (body === null || body === undefined) {
        throw new RequiredError(
          'body',
          'Required parameter body was null or undefined when calling update.',
        )
      }
      // verify required parameter 'roomId' is not null or undefined
      if (roomId === null || roomId === undefined) {
        throw new RequiredError(
          'roomId',
          'Required parameter roomId was null or undefined when calling update.',
        )
      }
      const localVarPath = `/room/{roomId}`.replace(
        `{${'roomId'}}`,
        encodeURIComponent(String(roomId)),
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
  }
}

/**
 * RaumverwaltungApi - functional programming interface
 * @export
 */
export const RaumverwaltungApiFp = function () {
  return {
    /**
     * Erstellt einen Raum und fügt ihn einer Gruppe zu.
     * @summary Raum erstellen
     * @param {createRoomBody} body
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    async create(
      body: createRoomBody,
      options?: AxiosRequestConfig,
    ): Promise<(axios?: AxiosInstance, basePath?: string) => Promise<AxiosResponse<Room>>> {
      const localVarAxiosArgs = await RaumverwaltungApiAxiosParamCreator().create(body, options)
      return (axios: AxiosInstance = globalAxios, basePath: string = BASE_PATH) => {
        const axiosRequestArgs: AxiosRequestConfig = {
          ...localVarAxiosArgs.options,
          url: basePath + localVarAxiosArgs.url,
        }
        return axios.request(axiosRequestArgs)
      }
    },
    /**
     * Löscht einen Raum aus dem System.
     * @summary Raum löschen
     * @param {string} roomId Die ID des zu löschenden Raums.
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    async delete(
      roomId: string,
      options?: AxiosRequestConfig,
    ): Promise<(axios?: AxiosInstance, basePath?: string) => Promise<AxiosResponse<void>>> {
      const localVarAxiosArgs = await RaumverwaltungApiAxiosParamCreator().delete(roomId, options)
      return (axios: AxiosInstance = globalAxios, basePath: string = BASE_PATH) => {
        const axiosRequestArgs: AxiosRequestConfig = {
          ...localVarAxiosArgs.options,
          url: basePath + localVarAxiosArgs.url,
        }
        return axios.request(axiosRequestArgs)
      }
    },
    /**
     * Ruft die Informationen zu einem spezifischen Raum ab.
     * @summary Raum abfragen
     * @param {string} roomId Die ID des Raums, den du abfragen möchtest.
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    async get(
      roomId: string,
      options?: AxiosRequestConfig,
    ): Promise<(axios?: AxiosInstance, basePath?: string) => Promise<AxiosResponse<Room>>> {
      const localVarAxiosArgs = await RaumverwaltungApiAxiosParamCreator().get(roomId, options)
      return (axios: AxiosInstance = globalAxios, basePath: string = BASE_PATH) => {
        const axiosRequestArgs: AxiosRequestConfig = {
          ...localVarAxiosArgs.options,
          url: basePath + localVarAxiosArgs.url,
        }
        return axios.request(axiosRequestArgs)
      }
    },
    /**
     * Ermöglicht das Aktualisieren der Raumdetails.
     * @summary Raum aktualisieren
     * @param {RoomPatchBody} body
     * @param {string} roomId Die ID des zu aktualisierenden Raums.
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    async update(
      body: RoomPatchBody,
      roomId: string,
      options?: AxiosRequestConfig,
    ): Promise<(axios?: AxiosInstance, basePath?: string) => Promise<AxiosResponse<Room>>> {
      const localVarAxiosArgs = await RaumverwaltungApiAxiosParamCreator().update(
        body,
        roomId,
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
  }
}

/**
 * RaumverwaltungApi - factory interface
 * @export
 */
export const RaumverwaltungApiFactory = function (basePath?: string, axios?: AxiosInstance) {
  return {
    /**
     * Erstellt einen Raum und fügt ihn einer Gruppe zu.
     * @summary Raum erstellen
     * @param {createRoomBody} body
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    async create(body: createRoomBody, options?: AxiosRequestConfig): Promise<AxiosResponse<Room>> {
      return RaumverwaltungApiFp()
        .create(body, options)
        .then((request) => request(axios, basePath))
    },
    /**
     * Löscht einen Raum aus dem System.
     * @summary Raum löschen
     * @param {string} roomId Die ID des zu löschenden Raums.
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    async delete(roomId: string, options?: AxiosRequestConfig): Promise<AxiosResponse<void>> {
      return RaumverwaltungApiFp()
        .delete(roomId, options)
        .then((request) => request(axios, basePath))
    },
    /**
     * Ruft die Informationen zu einem spezifischen Raum ab.
     * @summary Raum abfragen
     * @param {string} roomId Die ID des Raums, den du abfragen möchtest.
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    async get(roomId: string, options?: AxiosRequestConfig): Promise<AxiosResponse<Room>> {
      return RaumverwaltungApiFp()
        .get(roomId, options)
        .then((request) => request(axios, basePath))
    },
    /**
     * Ermöglicht das Aktualisieren der Raumdetails.
     * @summary Raum aktualisieren
     * @param {RoomPatchBody} body
     * @param {string} roomId Die ID des zu aktualisierenden Raums.
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    async update(
      body: RoomPatchBody,
      roomId: string,
      options?: AxiosRequestConfig,
    ): Promise<AxiosResponse<Room>> {
      return RaumverwaltungApiFp()
        .update(body, roomId, options)
        .then((request) => request(axios, basePath))
    },
  }
}

/**
 * RaumverwaltungApi - object-oriented interface
 * @export
 * @class RaumverwaltungApi
 * @extends {BaseAPI}
 */
export class RaumverwaltungApi extends BaseAPI {
  /**
   * Erstellt einen Raum und fügt ihn einer Gruppe zu.
   * @summary Raum erstellen
   * @param {createRoomBody} body
   * @param {*} [options] Override http request option.
   * @throws {RequiredError}
   * @memberof RaumverwaltungApi
   */
  public async create(
    body: createRoomBody,
    options?: AxiosRequestConfig,
  ): Promise<AxiosResponse<Room>> {
    return RaumverwaltungApiFp()
      .create(body, options)
      .then((request) => request(this.axios, this.basePath))
  }

  /**
   * Löscht einen Raum aus dem System.
   * @summary Raum löschen
   * @param {string} roomId Die ID des zu löschenden Raums.
   * @param {*} [options] Override http request option.
   * @throws {RequiredError}
   * @memberof RaumverwaltungApi
   */
  public async delete(roomId: string, options?: AxiosRequestConfig): Promise<AxiosResponse<void>> {
    return RaumverwaltungApiFp()
      .delete(roomId, options)
      .then((request) => request(this.axios, this.basePath))
  }

  /**
   * Ruft die Informationen zu einem spezifischen Raum ab.
   * @summary Raum abfragen
   * @param {string} roomId Die ID des Raums, den du abfragen möchtest.
   * @param {*} [options] Override http request option.
   * @throws {RequiredError}
   * @memberof RaumverwaltungApi
   */
  public async get(roomId: string, options?: AxiosRequestConfig): Promise<AxiosResponse<Room>> {
    return RaumverwaltungApiFp()
      .get(roomId, options)
      .then((request) => request(this.axios, this.basePath))
  }

  /**
   * Ermöglicht das Aktualisieren der Raumdetails.
   * @summary Raum aktualisieren
   * @param {RoomPatchBody} body
   * @param {string} roomId Die ID des zu aktualisierenden Raums.
   * @param {*} [options] Override http request option.
   * @throws {RequiredError}
   * @memberof RaumverwaltungApi
   */
  public async update(
    body: RoomPatchBody,
    roomId: string,
    options?: AxiosRequestConfig,
  ): Promise<AxiosResponse<Room>> {
    return RaumverwaltungApiFp()
      .update(body, roomId, options)
      .then((request) => request(this.axios, this.basePath))
  }
}
