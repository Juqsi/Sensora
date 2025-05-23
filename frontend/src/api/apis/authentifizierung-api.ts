import globalAxios, { type AxiosInstance, type AxiosRequestConfig, type AxiosResponse } from 'axios'
import { BASE_PATH, BaseAPI, type RequestArgs, RequiredError } from '@/api/base'
import type { AuthLoginBody, AuthRegisterBody, User } from '@/api/models'
import type { AuthResponse } from '@/api/models/authResponse.ts'
import type { CustomAxiosRequestConfig } from '@/api/apiClient.ts'

/**
 * AuthentifizierungApi - axios parameter creator
 * @export
 */
export const AuthentifizierungApiAxiosParamCreator = function () {
  return {
    /**
     * Authentifiziert einen Benutzer und gibt ein Token zurück.  **Test-Credentials für Staging**: - Benutzername: testuser@sensora.com - Passwort: Test!1234
     * @summary Benutzeranmeldung
     * @param {AuthLoginBody} body Es muss mindestens username oder mail vorhanden sein.
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    Login: async (body: AuthLoginBody, options: CustomAxiosRequestConfig): Promise<RequestArgs> => {
      // verify required parameter 'body' is not null or undefined
      if (body === null || body === undefined) {
        throw new RequiredError(
          'body',
          'Required parameter body was null or undefined when calling Login.',
        )
      }
      const localVarPath = `/auth/login`
      // use dummy base URL string because the URL constructor only accepts absolute URLs.
      const localVarUrlObj = new URL(localVarPath, 'https://example.com')
      let baseOptions

      const localVarRequestOptions: CustomAxiosRequestConfig = {
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
     * Erstellt einen Benutzer. Die angegebene E-Mail muss bestätigt werden. Danach ist ein anmelden über `/auth/login` möglich. In der Staging-Umgebung wird die verifikation der E-Mail übersprungen. Es ist ein anmelden direkt nach dem registrieren möglich.
     * @summary Benutzererstellung
     * @param {AuthRegisterBody} body
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    createAccount: async (
      body: AuthRegisterBody,
      options: CustomAxiosRequestConfig,
    ): Promise<RequestArgs> => {
      // verify required parameter 'body' is not null or undefined
      if (body === null || body === undefined) {
        throw new RequiredError(
          'body',
          'Required parameter body was null or undefined when calling createAccount.',
        )
      }
      const localVarPath = `/auth/register`
      // use dummy base URL string because the URL constructor only accepts absolute URLs.
      const localVarUrlObj = new URL(localVarPath, 'https://example.com')
      let baseOptions

      const localVarRequestOptions: CustomAxiosRequestConfig = {
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
 * AuthentifizierungApi - functional programming interface
 * @export
 */
export const AuthentifizierungApiFp = function () {
  return {
    /**
     * Authentifiziert einen Benutzer und gibt ein Token zurück.  **Test-Credentials für Staging**: - Benutzername: testuser@sensora.com - Passwort: Test!1234
     * @summary Benutzeranmeldung
     * @param {AuthLoginBody} body Es muss mindestens username oder mail vorhanden sein.
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    async Login(
      body: AuthLoginBody,
      options?: CustomAxiosRequestConfig,
    ): Promise<(axios?: AxiosInstance, basePath?: string) => Promise<AxiosResponse<AuthResponse>>> {
      const localVarAxiosArgs = await AuthentifizierungApiAxiosParamCreator().Login(
        body,
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
     * Erstellt einen Benutzer. Die angegebene E-Mail muss bestätigt werden. Danach ist ein anmelden über `/auth/login` möglich. In der Staging-Umgebung wird die verifikation der E-Mail übersprungen. Es ist ein anmelden direkt nach dem registrieren möglich.
     * @summary Benutzererstellung
     * @param {AuthRegisterBody} body
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    async createAccount(
      body: AuthRegisterBody,
      options?: CustomAxiosRequestConfig,
    ): Promise<(axios?: AxiosInstance, basePath?: string) => Promise<AxiosResponse<User>>> {
      const localVarAxiosArgs = await AuthentifizierungApiAxiosParamCreator().createAccount(
        body,
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
 * AuthentifizierungApi - factory interface
 * @export
 */
export const AuthentifizierungApiFactory = function (basePath?: string, axios?: AxiosInstance) {
  return {
    /**
     * Authentifiziert einen Benutzer und gibt ein Token zurück.  **Test-Credentials für Staging**: - Benutzername: testuser@sensora.com - Passwort: Test!1234
     * @summary Benutzeranmeldung
     * @param {AuthLoginBody} body Es muss mindestens username oder mail vorhanden sein.
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    async Login(
      body: AuthLoginBody,
      options?: CustomAxiosRequestConfig,
    ): Promise<AxiosResponse<AuthResponse>> {
      return AuthentifizierungApiFp()
        .Login(body, options)
        .then((request) => request(axios, basePath))
    },
    /**
     * Erstellt einen Benutzer. Die angegebene E-Mail muss bestätigt werden. Danach ist ein anmelden über `/auth/login` möglich. In der Staging-Umgebung wird die verifikation der E-Mail übersprungen. Es ist ein anmelden direkt nach dem registrieren möglich.
     * @summary Benutzererstellung
     * @param {AuthRegisterBody} body
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    async createAccount(
      body: AuthRegisterBody,
      options?: CustomAxiosRequestConfig,
    ): Promise<AxiosResponse<User>> {
      return AuthentifizierungApiFp()
        .createAccount(body, options)
        .then((request) => request(axios, basePath))
    },
  }
}

/**
 * AuthentifizierungApi - object-oriented interface
 * @export
 * @class AuthentifizierungApi
 * @extends {BaseAPI}
 */
export class AuthentifizierungApi extends BaseAPI {
  /**
   * Authentifiziert einen Benutzer und gibt ein Token zurück.  **Test-Credentials für Staging**: - Benutzername: testuser@sensora.com - Passwort: Test!1234
   * @summary Benutzeranmeldung
   * @param {AuthLoginBody} body Es muss mindestens username oder mail vorhanden sein.
   * @param {*} [options] Override http request option.
   * @throws {RequiredError}
   * @memberof AuthentifizierungApi
   */
  public async Login(
    body: AuthLoginBody,
    options?: CustomAxiosRequestConfig,
  ): Promise<AxiosResponse<AuthResponse>> {
    return AuthentifizierungApiFp()
      .Login(body, options)
      .then((request) => request(this.axios, this.basePath))
  }

  /**
   * Erstellt einen Benutzer. Die angegebene E-Mail muss bestätigt werden. Danach ist ein anmelden über `/auth/login` möglich. In der Staging-Umgebung wird die verifikation der E-Mail übersprungen. Es ist ein anmelden direkt nach dem registrieren möglich.
   * @summary Benutzererstellung
   * @param {AuthRegisterBody} body
   * @param {*} [options] Override http request option.
   * @throws {RequiredError}
   * @memberof AuthentifizierungApi
   */
  public async createAccount(
    body: AuthRegisterBody,
    options?: CustomAxiosRequestConfig,
  ): Promise<AxiosResponse<User>> {
    return AuthentifizierungApiFp()
      .createAccount(body, options)
      .then((request) => request(this.axios, this.basePath))
  }
}
