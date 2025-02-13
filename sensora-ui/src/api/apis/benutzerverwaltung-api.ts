import globalAxios, { type AxiosInstance, type AxiosRequestConfig, type AxiosResponse } from 'axios'
import { BASE_PATH, BaseAPI, type RequestArgs, RequiredError } from '@/api/base'
import type { updateUserBody, User } from '@/api/models'

/**
 * BenutzerverwaltungApi - axios parameter creator
 * @export
 */
export const BenutzerverwaltungApiAxiosParamCreator = function () {
  return {
    /**
     * Löscht einen Benutzer und alle seine zugehörigen Daten. Dies kann nicht rückgängig gemacht werden. Das Auth-Token verliert seine Gültigkeit.
     * @summary Benutzer löschen
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    delete: async (options: AxiosRequestConfig = {}): Promise<RequestArgs> => {
      const localVarPath = `/user`
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
     * Bearbeitet einen bereits existierenden Benutzeraccount. Alle gesetzten Felder werden überschrieben. Der Benutzeraccount wird anhand des Auth-Tokens identifiziert. Beim Verändern des Benutzernamens oder der E-Mail, erlischt die Gültigkeit des Auth-Tokens. Das ändern des Passworts ist hier nicht möglich. Wenn die E-Mail geändert wird, muss diese erneut bestätigt werden, bevor der Account weiter benutzt werden kann.
     * @summary Benutzer bearbeiten
     * @param {updateUserBody} body
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    update: async (
      body: updateUserBody,
      options: AxiosRequestConfig = {},
    ): Promise<RequestArgs> => {
      // verify required parameter 'body' is not null or undefined
      if (body === null || body === undefined) {
        throw new RequiredError(
          'body',
          'Required parameter body was null or undefined when calling update.',
        )
      }
      const localVarPath = `/user`
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
     * Ruft die Informationen eines Benutzers ab. Wenn keine Benutzer-ID angegeben wird, werden die Informationen des authentifizierten Benutzers abgerufen. Wenn eine Benutzer-ID angegeben wird, werden die Informationen des angegebenen Benutzers abgerufen.
     * @summary Benutzerinformationen abrufen
     * @param {string} userId Die ID des Benutzers, dessen Informationen abgerufen werden sollen. Wenn nicht angegeben, werden die Informationen des authentifizierten Benutzers abgerufen.
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    get: async (userId: string, options: AxiosRequestConfig = {}): Promise<RequestArgs> => {
      // verify required parameter 'userId' is not null or undefined
      if (userId === null || userId === undefined) {
        throw new RequiredError(
          'userId',
          'Required parameter userId was null or undefined when calling get.',
        )
      }
      let localVarPath = `/user/{userId}`.replace(
        `{${'userId'}}`,
        encodeURIComponent(String(userId)),
      )
      if (userId.length === 0) {
        localVarPath = localVarPath.substring(0, localVarPath.length - 1)
      }
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
 * BenutzerverwaltungApi - functional programming interface
 * @export
 */
export const BenutzerverwaltungApiFp = function () {
  return {
    /**
     * Löscht einen Benutzer und alle seine zugehörigen Daten. Dies kann nicht rückgängig gemacht werden. Das Auth-Token verliert seine Gültigkeit.
     * @summary Benutzer löschen
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    async delete(
      options?: AxiosRequestConfig,
    ): Promise<(axios?: AxiosInstance, basePath?: string) => Promise<AxiosResponse<void>>> {
      const localVarAxiosArgs = await BenutzerverwaltungApiAxiosParamCreator().delete(options)
      return (axios: AxiosInstance = globalAxios, basePath: string = BASE_PATH) => {
        const axiosRequestArgs: AxiosRequestConfig = {
          ...localVarAxiosArgs.options,
          url: basePath + localVarAxiosArgs.url,
        }
        return axios.request(axiosRequestArgs)
      }
    },
    /**
     * Bearbeitet einen bereits existierenden Benutzeraccount. Alle gesetzten Felder werden überschrieben. Der Benutzeraccount wird anhand des Auth-Tokens identifiziert. Beim Verändern des Benutzernamens oder der E-Mail, erlischt die Gültigkeit des Auth-Tokens. Das ändern des Passworts ist hier nicht möglich. Wenn die E-Mail geändert wird, muss diese erneut bestätigt werden, bevor der Account weiter benutzt werden kann.
     * @summary Benutzer bearbeiten
     * @param {updateUserBody} body
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    async update(
      body: updateUserBody,
      options?: AxiosRequestConfig,
    ): Promise<(axios?: AxiosInstance, basePath?: string) => Promise<AxiosResponse<User>>> {
      const localVarAxiosArgs = await BenutzerverwaltungApiAxiosParamCreator().update(body, options)
      return (axios: AxiosInstance = globalAxios, basePath: string = BASE_PATH) => {
        const axiosRequestArgs: AxiosRequestConfig = {
          ...localVarAxiosArgs.options,
          url: basePath + localVarAxiosArgs.url,
        }
        return axios.request(axiosRequestArgs)
      }
    },
    /**
     * Ruft die Informationen eines Benutzers ab. Wenn keine Benutzer-ID angegeben wird, werden die Informationen des authentifizierten Benutzers abgerufen. Wenn eine Benutzer-ID angegeben wird, werden die Informationen des angegebenen Benutzers abgerufen.
     * @summary Benutzerinformationen abrufen
     * @param {string} userId Die ID des Benutzers, dessen Informationen abgerufen werden sollen. Wenn nicht angegeben, werden die Informationen des authentifizierten Benutzers abgerufen.
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    async get(
      userId: string,
      options?: AxiosRequestConfig,
    ): Promise<(axios?: AxiosInstance, basePath?: string) => Promise<AxiosResponse<User>>> {
      const localVarAxiosArgs = await BenutzerverwaltungApiAxiosParamCreator().get(userId, options)
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
 * BenutzerverwaltungApi - factory interface
 * @export
 */
export const BenutzerverwaltungApiFactory = function (basePath?: string, axios?: AxiosInstance) {
  return {
    /**
     * Löscht einen Benutzer und alle seine zugehörigen Daten. Dies kann nicht rückgängig gemacht werden. Das Auth-Token verliert seine Gültigkeit.
     * @summary Benutzer löschen
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    async delete(options?: AxiosRequestConfig): Promise<AxiosResponse<void>> {
      return BenutzerverwaltungApiFp()
        .delete(options)
        .then((request) => request(axios, basePath))
    },
    /**
     * Bearbeitet einen bereits existierenden Benutzeraccount. Alle gesetzten Felder werden überschrieben. Der Benutzeraccount wird anhand des Auth-Tokens identifiziert. Beim Verändern des Benutzernamens oder der E-Mail, erlischt die Gültigkeit des Auth-Tokens. Das ändern des Passworts ist hier nicht möglich. Wenn die E-Mail geändert wird, muss diese erneut bestätigt werden, bevor der Account weiter benutzt werden kann.
     * @summary Benutzer bearbeiten
     * @param {updateUserBody} body
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    async update(body: updateUserBody, options?: AxiosRequestConfig): Promise<AxiosResponse<User>> {
      return BenutzerverwaltungApiFp()
        .update(body, options)
        .then((request) => request(axios, basePath))
    },
    /**
     * Ruft die Informationen eines Benutzers ab. Wenn keine Benutzer-ID angegeben wird, werden die Informationen des authentifizierten Benutzers abgerufen. Wenn eine Benutzer-ID angegeben wird, werden die Informationen des angegebenen Benutzers abgerufen.
     * @summary Benutzerinformationen abrufen
     * @param {string} userId Die ID des Benutzers, dessen Informationen abgerufen werden sollen. Wenn nicht angegeben, werden die Informationen des authentifizierten Benutzers abgerufen.
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    async get(userId: string, options?: AxiosRequestConfig): Promise<AxiosResponse<User>> {
      return BenutzerverwaltungApiFp()
        .get(userId, options)
        .then((request) => request(axios, basePath))
    },
  }
}

/**
 * BenutzerverwaltungApi - object-oriented interface
 * @export
 * @class BenutzerverwaltungApi
 * @extends {BaseAPI}
 */
export class BenutzerverwaltungApi extends BaseAPI {
  /**
   * Löscht einen Benutzer und alle seine zugehörigen Daten. Dies kann nicht rückgängig gemacht werden. Das Auth-Token verliert seine Gültigkeit.
   * @summary Benutzer löschen
   * @param {*} [options] Override http request option.
   * @throws {RequiredError}
   * @memberof BenutzerverwaltungApi
   */
  public async delete(options?: AxiosRequestConfig): Promise<AxiosResponse<void>> {
    return BenutzerverwaltungApiFp()
      .delete(options)
      .then((request) => request(this.axios, this.basePath))
  }

  /**
   * Bearbeitet einen bereits existierenden Benutzeraccount. Alle gesetzten Felder werden überschrieben. Der Benutzeraccount wird anhand des Auth-Tokens identifiziert. Beim Verändern des Benutzernamens oder der E-Mail, erlischt die Gültigkeit des Auth-Tokens. Das ändern des Passworts ist hier nicht möglich. Wenn die E-Mail geändert wird, muss diese erneut bestätigt werden, bevor der Account weiter benutzt werden kann.
   * @summary Benutzer bearbeiten
   * @param {updateUserBody} body
   * @param {*} [options] Override http request option.
   * @throws {RequiredError}
   * @memberof BenutzerverwaltungApi
   */
  public async update(
    body: updateUserBody,
    options?: AxiosRequestConfig,
  ): Promise<AxiosResponse<User>> {
    return BenutzerverwaltungApiFp()
      .update(body, options)
      .then((request) => request(this.axios, this.basePath))
  }

  /**
   * Ruft die Informationen eines Benutzers ab. Wenn keine Benutzer-ID angegeben wird, werden die Informationen des authentifizierten Benutzers abgerufen. Wenn eine Benutzer-ID angegeben wird, werden die Informationen des angegebenen Benutzers abgerufen.
   * @summary Benutzerinformationen abrufen
   * @param {string} userId Die ID des Benutzers, dessen Informationen abgerufen werden sollen. Wenn nicht angegeben, werden die Informationen des authentifizierten Benutzers abgerufen.
   * @param {*} [options] Override http request option.
   * @throws {RequiredError}
   * @memberof BenutzerverwaltungApi
   */
  public async get(userId: string, options?: AxiosRequestConfig): Promise<AxiosResponse<User>> {
    return BenutzerverwaltungApiFp()
      .get(userId, options)
      .then((request) => request(this.axios, this.basePath))
  }
}
