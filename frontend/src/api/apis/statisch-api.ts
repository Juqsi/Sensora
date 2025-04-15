import globalAxios, { type AxiosInstance, type AxiosRequestConfig, type AxiosResponse } from 'axios'
import { BASE_PATH, BaseAPI, type RequestArgs, RequiredError } from '@/api/base'
import type { CustomAxiosRequestConfig } from '@/api/apiClient.ts'

/**
 * StatischApi - axios parameter creator
 * @export
 */
export const StatischApiAxiosParamCreator = function () {
  return {
    /**
     * Kann statische Resourcen abrufen, die im Fileserver gespeichert werden.
     * @summary Statische Resourcen abrufen
     * @param {string} resource Der vollständige Name der Resource
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    staticsResourceGet: async (
      resource: string,
      options: CustomAxiosRequestConfig,
    ): Promise<RequestArgs> => {
      // verify required parameter 'resource' is not null or undefined
      if (resource === null || resource === undefined) {
        throw new RequiredError(
          'resource',
          'Required parameter resource was null or undefined when calling staticsResourceGet.',
        )
      }
      const localVarPath = `/statics/{resource}`.replace(
        `{${'resource'}}`,
        encodeURIComponent(String(resource)),
      )
      // use dummy base URL string because the URL constructor only accepts absolute URLs.
      const localVarUrlObj = new URL(localVarPath, 'https://example.com')
      let baseOptions

      const localVarRequestOptions: CustomAxiosRequestConfig = {
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
 * StatischApi - functional programming interface
 * @export
 */
export const StatischApiFp = function () {
  return {
    /**
     * Kann statische Resourcen abrufen, die im Fileserver gespeichert werden.
     * @summary Statische Resourcen abrufen
     * @param {string} resource Der vollständige Name der Resource
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    async staticsResourceGet(
      resource: string,
      options?: CustomAxiosRequestConfig,
    ): Promise<(axios?: AxiosInstance, basePath?: string) => Promise<AxiosResponse<void>>> {
      const localVarAxiosArgs = await StatischApiAxiosParamCreator().staticsResourceGet(
        resource,
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
 * StatischApi - factory interface
 * @export
 */
export const StatischApiFactory = function (basePath?: string, axios?: AxiosInstance) {
  return {
    /**
     * Kann statische Resourcen abrufen, die im Fileserver gespeichert werden.
     * @summary Statische Resourcen abrufen
     * @param {string} resource Der vollständige Name der Resource
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    async staticsResourceGet(
      resource: string,
      options?: CustomAxiosRequestConfig,
    ): Promise<AxiosResponse<any>> {
      return StatischApiFp()
        .staticsResourceGet(resource, options)
        .then((request) => request(axios, basePath))
    },
  }
}

/**
 * StatischApi - object-oriented interface
 * @export
 * @class StatischApi
 * @extends {BaseAPI}
 */
export class StatischApi extends BaseAPI {
  /**
   * Kann statische Resourcen abrufen, die im Fileserver gespeichert werden.
   * @summary Statische Resourcen abrufen
   * @param {string} resource Der vollständige Name der Resource
   * @param {*} [options] Override http request option.
   * @throws {RequiredError}
   * @memberof StatischApi
   */
  public async staticsResourceGet(
    resource: string,
    options?: CustomAxiosRequestConfig,
  ): Promise<AxiosResponse<void>> {
    return StatischApiFp()
      .staticsResourceGet(resource, options)
      .then((request) => request(this.axios, this.basePath))
  }
}
