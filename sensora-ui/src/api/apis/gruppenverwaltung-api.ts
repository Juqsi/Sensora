import globalAxios, {type AxiosInstance, type AxiosRequestConfig, type AxiosResponse} from 'axios'
import {Configuration} from '@/api/configuration'

import {BASE_PATH, BaseAPI, type RequestArgs, RequiredError} from '@/api/base'
import type {Group, GroupBody, GroupGroupIdBody} from '@/api/models'

/**
 * GruppenverwaltungApi - axios parameter creator
 * @export
 */
export const GruppenverwaltungApiAxiosParamCreator = function (configuration?: Configuration) {
  return {
    /**
     * Gibt eine Liste der Gruppen zurück, zu denen der aktuell authentifizierte Benutzer gehört. Dies ermöglicht dem Benutzer, alle Gruppen zu sehen, an denen er teilnimmt, einschließlich der zugeordneten Räume und Pflanzen.
     * @summary Alle Gruppen des Benutzers anzeigen
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    groupGet: async (options: AxiosRequestConfig = {}): Promise<RequestArgs> => {
      const localVarPath = `/group`
      // use dummy base URL string because the URL constructor only accepts absolute URLs.
      const localVarUrlObj = new URL(localVarPath, 'https://example.com')
      let baseOptions
      if (configuration) {
        baseOptions = configuration.baseOptions
      }
      const localVarRequestOptions: AxiosRequestConfig = {
        method: 'GET',
        ...baseOptions,
        ...options,
      }
      const localVarHeaderParameter = {} as any
      const localVarQueryParameter = {} as any

      // authentication bearerAuth required
      // http bearer authentication required
      if (configuration && configuration.accessToken) {
        const accessToken =
          typeof configuration.accessToken === 'function'
            ? await configuration.accessToken()
            : await configuration.accessToken
        localVarHeaderParameter['Authorization'] = 'Bearer ' + accessToken
      }

      const query = new URLSearchParams(localVarUrlObj.search)
      for (const key in localVarQueryParameter) {
        query.set(key, localVarQueryParameter[key])
      }
      for (const key in options.params) {
        query.set(key, options.params[key])
      }
      localVarUrlObj.search = new URLSearchParams(query).toString()
      let headersFromBaseOptions = baseOptions && baseOptions.headers ? baseOptions.headers : {}
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
     * Beim Löschen einer Gruppe werden alle Benutzer aus der Gruppe entfernt und alle Daten über die Gruppe werden gelöscht. Die geteilten Ressourcen sind nur noch den Benutzern zugänglich, die als Besitzer eingetragen sind. Diese Aktion kann nicht rückgängig gemacht werden.
     * @summary Gruppe löschen
     * @param {string} groupId Die ID der zu löschenden Gruppe.
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    groupGroupIdDelete: async (
      groupId: string,
      options: AxiosRequestConfig = {},
    ): Promise<RequestArgs> => {
      // verify required parameter 'groupId' is not null or undefined
      if (groupId === null || groupId === undefined) {
        throw new RequiredError(
          'groupId',
          'Required parameter groupId was null or undefined when calling groupGroupIdDelete.',
        )
      }
      const localVarPath = `/group/{groupId}`.replace(
        `{${'groupId'}}`,
        encodeURIComponent(String(groupId)),
      )
      // use dummy base URL string because the URL constructor only accepts absolute URLs.
      const localVarUrlObj = new URL(localVarPath, 'https://example.com')
      let baseOptions
      if (configuration) {
        baseOptions = configuration.baseOptions
      }
      const localVarRequestOptions: AxiosRequestConfig = {
        method: 'DELETE',
        ...baseOptions,
        ...options,
      }
      const localVarHeaderParameter = {} as any
      const localVarQueryParameter = {} as any

      // authentication bearerAuth required
      // http bearer authentication required
      if (configuration && configuration.accessToken) {
        const accessToken =
          typeof configuration.accessToken === 'function'
            ? await configuration.accessToken()
            : await configuration.accessToken
        localVarHeaderParameter['Authorization'] = 'Bearer ' + accessToken
      }

      const query = new URLSearchParams(localVarUrlObj.search)
      for (const key in localVarQueryParameter) {
        query.set(key, localVarQueryParameter[key])
      }
      for (const key in options.params) {
        query.set(key, options.params[key])
      }
      localVarUrlObj.search = new URLSearchParams(query).toString()
      let headersFromBaseOptions = baseOptions && baseOptions.headers ? baseOptions.headers : {}
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
     * Beim Entfernen eines Gruppenmitglieds wird der Zugriff auf alle geteilten Ressourcen der Gruppe entfernt. Der entfernte Benutzer behält jedoch Zugriff auf Ressourcen, bei denen er als Eigentümer eingetragen ist. Diese Aktion kann nur von Gruppenadministratoren oder Gruppenbesitzern durchgeführt werden.
     * @summary Gruppenmitglied entfernen
     * @param {string} groupId Die ID der zu löschenden Gruppe.
     * @param {string} userId Die ID des Benutzers, der entfernt werden soll.
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    groupGroupIdKickUserIdDelete: async (
      groupId: string,
      userId: string,
      options: AxiosRequestConfig = {},
    ): Promise<RequestArgs> => {
      // verify required parameter 'groupId' is not null or undefined
      if (groupId === null || groupId === undefined) {
        throw new RequiredError(
          'groupId',
          'Required parameter groupId was null or undefined when calling groupGroupIdKickUserIdDelete.',
        )
      }
      // verify required parameter 'userId' is not null or undefined
      if (userId === null || userId === undefined) {
        throw new RequiredError(
          'userId',
          'Required parameter userId was null or undefined when calling groupGroupIdKickUserIdDelete.',
        )
      }
      const localVarPath = `/group/{groupId}/kick/{userId}`
        .replace(`{${'groupId'}}`, encodeURIComponent(String(groupId)))
        .replace(`{${'userId'}}`, encodeURIComponent(String(userId)))
      // use dummy base URL string because the URL constructor only accepts absolute URLs.
      const localVarUrlObj = new URL(localVarPath, 'https://example.com')
      let baseOptions
      if (configuration) {
        baseOptions = configuration.baseOptions
      }
      const localVarRequestOptions: AxiosRequestConfig = {
        method: 'DELETE',
        ...baseOptions,
        ...options,
      }
      const localVarHeaderParameter = {} as any
      const localVarQueryParameter = {} as any

      // authentication bearerAuth required
      // http bearer authentication required
      if (configuration && configuration.accessToken) {
        const accessToken =
          typeof configuration.accessToken === 'function'
            ? await configuration.accessToken()
            : await configuration.accessToken
        localVarHeaderParameter['Authorization'] = 'Bearer ' + accessToken
      }

      const query = new URLSearchParams(localVarUrlObj.search)
      for (const key in localVarQueryParameter) {
        query.set(key, localVarQueryParameter[key])
      }
      for (const key in options.params) {
        query.set(key, options.params[key])
      }
      localVarUrlObj.search = new URLSearchParams(query).toString()
      let headersFromBaseOptions = baseOptions && baseOptions.headers ? baseOptions.headers : {}
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
     * Ermöglicht es dem aktuellen Benutzer, die Gruppe freiwillig zu verlassen. Der Benutzer verliert den Zugriff auf alle geteilten Ressourcen der Gruppe, behält jedoch den Zugriff auf Ressourcen, bei denen er als Eigentümer eingetragen ist. Sollte der Benutzer das einzige Mitglied der Gruppe sein, wird die Gruppe unwiderruflich gelöscht.
     * @summary Gruppe verlassen
     * @param {string} groupId Die ID der zu löschenden Gruppe.
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    groupGroupIdLeaveDelete: async (
      groupId: string,
      options: AxiosRequestConfig = {},
    ): Promise<RequestArgs> => {
      // verify required parameter 'groupId' is not null or undefined
      if (groupId === null || groupId === undefined) {
        throw new RequiredError(
          'groupId',
          'Required parameter groupId was null or undefined when calling groupGroupIdLeaveDelete.',
        )
      }
      const localVarPath = `/group/{groupId}/leave`.replace(
        `{${'groupId'}}`,
        encodeURIComponent(String(groupId)),
      )
      // use dummy base URL string because the URL constructor only accepts absolute URLs.
      const localVarUrlObj = new URL(localVarPath, 'https://example.com')
      let baseOptions
      if (configuration) {
        baseOptions = configuration.baseOptions
      }
      const localVarRequestOptions: AxiosRequestConfig = {
        method: 'DELETE',
        ...baseOptions,
        ...options,
      }
      const localVarHeaderParameter = {} as any
      const localVarQueryParameter = {} as any

      // authentication bearerAuth required
      // http bearer authentication required
      if (configuration && configuration.accessToken) {
        const accessToken =
          typeof configuration.accessToken === 'function'
            ? await configuration.accessToken()
            : await configuration.accessToken
        localVarHeaderParameter['Authorization'] = 'Bearer ' + accessToken
      }

      const query = new URLSearchParams(localVarUrlObj.search)
      for (const key in localVarQueryParameter) {
        query.set(key, localVarQueryParameter[key])
      }
      for (const key in options.params) {
        query.set(key, options.params[key])
      }
      localVarUrlObj.search = new URLSearchParams(query).toString()
      let headersFromBaseOptions = baseOptions && baseOptions.headers ? baseOptions.headers : {}
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
     * Überarbeitet eine Gruppe
     * @summary Gruppe bearbeiten
     * @param {GroupGroupIdBody} body
     * @param {string} groupId Die ID der zu bearbeitenden Gruppe.
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    groupGroupIdPatch: async (
      body: GroupGroupIdBody,
      groupId: string,
      options: AxiosRequestConfig = {},
    ): Promise<RequestArgs> => {
      // verify required parameter 'body' is not null or undefined
      if (body === null || body === undefined) {
        throw new RequiredError(
          'body',
          'Required parameter body was null or undefined when calling groupGroupIdPatch.',
        )
      }
      // verify required parameter 'groupId' is not null or undefined
      if (groupId === null || groupId === undefined) {
        throw new RequiredError(
          'groupId',
          'Required parameter groupId was null or undefined when calling groupGroupIdPatch.',
        )
      }
      const localVarPath = `/group/{groupId}`.replace(
        `{${'groupId'}}`,
        encodeURIComponent(String(groupId)),
      )
      // use dummy base URL string because the URL constructor only accepts absolute URLs.
      const localVarUrlObj = new URL(localVarPath, 'https://example.com')
      let baseOptions
      if (configuration) {
        baseOptions = configuration.baseOptions
      }
      const localVarRequestOptions: AxiosRequestConfig = {
        method: 'PATCH',
        ...baseOptions,
        ...options,
      }
      const localVarHeaderParameter = {} as any
      const localVarQueryParameter = {} as any

      // authentication bearerAuth required
      // http bearer authentication required
      if (configuration && configuration.accessToken) {
        const accessToken =
          typeof configuration.accessToken === 'function'
            ? await configuration.accessToken()
            : await configuration.accessToken
        localVarHeaderParameter['Authorization'] = 'Bearer ' + accessToken
      }

      localVarHeaderParameter['Content-Type'] = 'application/json'

      const query = new URLSearchParams(localVarUrlObj.search)
      for (const key in localVarQueryParameter) {
        query.set(key, localVarQueryParameter[key])
      }
      for (const key in options.params) {
        query.set(key, options.params[key])
      }
      localVarUrlObj.search = new URLSearchParams(query).toString()
      let headersFromBaseOptions = baseOptions && baseOptions.headers ? baseOptions.headers : {}
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
     * Ermöglicht es einem Benutzer, einer Gruppe beizutreten, wenn er ein gültiges Einladungstoken besitzt. Das Token enthält die notwendige Gruppen-ID und weitere Informationen, um den Beitritt durchzuführen. Der Benutzer wird als Mitglied der Gruppe eingetragen und erhält Zugang zu den geteilten Ressourcen.
     * @summary Gruppenbeitritt mit Einladungstoken
     * @param {string} token Das Einladungstoken, das dem Benutzer zugeteilt wurde.
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    groupJoinPatch: async (
      token: string,
      options: AxiosRequestConfig = {},
    ): Promise<RequestArgs> => {
      // verify required parameter 'token' is not null or undefined
      if (token === null || token === undefined) {
        throw new RequiredError(
          'token',
          'Required parameter token was null or undefined when calling groupJoinPatch.',
        )
      }
      const localVarPath = `/group/join`
      // use dummy base URL string because the URL constructor only accepts absolute URLs.
      const localVarUrlObj = new URL(localVarPath, 'https://example.com')
      let baseOptions
      if (configuration) {
        baseOptions = configuration.baseOptions
      }
      const localVarRequestOptions: AxiosRequestConfig = {
        method: 'PATCH',
        ...baseOptions,
        ...options,
      }
      const localVarHeaderParameter = {} as any
      const localVarQueryParameter = {} as any

      // authentication bearerAuth required
      // http bearer authentication required
      if (configuration && configuration.accessToken) {
        const accessToken =
          typeof configuration.accessToken === 'function'
            ? await configuration.accessToken()
            : await configuration.accessToken
        localVarHeaderParameter['Authorization'] = 'Bearer ' + accessToken
      }

      if (token !== undefined) {
        localVarQueryParameter['token'] = token
      }

      const query = new URLSearchParams(localVarUrlObj.search)
      for (const key in localVarQueryParameter) {
        query.set(key, localVarQueryParameter[key])
      }
      for (const key in options.params) {
        query.set(key, options.params[key])
      }
      localVarUrlObj.search = new URLSearchParams(query).toString()
      let headersFromBaseOptions = baseOptions && baseOptions.headers ? baseOptions.headers : {}
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
     * Erstellt eine Gruppe und fügt den aktuellen Benutzer hinzu.
     * @summary Gruppe erstelen
     * @param {GroupBody} body
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    groupPost: async (body: GroupBody, options: AxiosRequestConfig = {}): Promise<RequestArgs> => {
      // verify required parameter 'body' is not null or undefined
      if (body === null || body === undefined) {
        throw new RequiredError(
          'body',
          'Required parameter body was null or undefined when calling groupPost.',
        )
      }
      const localVarPath = `/group`
      // use dummy base URL string because the URL constructor only accepts absolute URLs.
      const localVarUrlObj = new URL(localVarPath, 'https://example.com')
      let baseOptions
      if (configuration) {
        baseOptions = configuration.baseOptions
      }
      const localVarRequestOptions: AxiosRequestConfig = {
        method: 'POST',
        ...baseOptions,
        ...options,
      }
      const localVarHeaderParameter = {} as any
      const localVarQueryParameter = {} as any

      // authentication bearerAuth required
      // http bearer authentication required
      if (configuration && configuration.accessToken) {
        const accessToken =
          typeof configuration.accessToken === 'function'
            ? await configuration.accessToken()
            : await configuration.accessToken
        localVarHeaderParameter['Authorization'] = 'Bearer ' + accessToken
      }

      localVarHeaderParameter['Content-Type'] = 'application/json'

      const query = new URLSearchParams(localVarUrlObj.search)
      for (const key in localVarQueryParameter) {
        query.set(key, localVarQueryParameter[key])
      }
      for (const key in options.params) {
        query.set(key, options.params[key])
      }
      localVarUrlObj.search = new URLSearchParams(query).toString()
      let headersFromBaseOptions = baseOptions && baseOptions.headers ? baseOptions.headers : {}
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
 * GruppenverwaltungApi - functional programming interface
 * @export
 */
export const GruppenverwaltungApiFp = function (configuration?: Configuration) {
  return {
    /**
     * Gibt eine Liste der Gruppen zurück, zu denen der aktuell authentifizierte Benutzer gehört. Dies ermöglicht dem Benutzer, alle Gruppen zu sehen, an denen er teilnimmt, einschließlich der zugeordneten Räume und Pflanzen.
     * @summary Alle Gruppen des Benutzers anzeigen
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    async groupGet(
      options?: AxiosRequestConfig,
    ): Promise<(axios?: AxiosInstance, basePath?: string) => Promise<AxiosResponse<Array<Group>>>> {
      const localVarAxiosArgs =
        await GruppenverwaltungApiAxiosParamCreator(configuration).groupGet(options)
      return (axios: AxiosInstance = globalAxios, basePath: string = BASE_PATH) => {
        const axiosRequestArgs: AxiosRequestConfig = {
          ...localVarAxiosArgs.options,
          url: basePath + localVarAxiosArgs.url,
        }
        return axios.request(axiosRequestArgs)
      }
    },
    /**
     * Beim Löschen einer Gruppe werden alle Benutzer aus der Gruppe entfernt und alle Daten über die Gruppe werden gelöscht. Die geteilten Ressourcen sind nur noch den Benutzern zugänglich, die als Besitzer eingetragen sind. Diese Aktion kann nicht rückgängig gemacht werden.
     * @summary Gruppe löschen
     * @param {string} groupId Die ID der zu löschenden Gruppe.
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    async groupGroupIdDelete(
      groupId: string,
      options?: AxiosRequestConfig,
    ): Promise<(axios?: AxiosInstance, basePath?: string) => Promise<AxiosResponse<void>>> {
      const localVarAxiosArgs = await GruppenverwaltungApiAxiosParamCreator(
        configuration,
      ).groupGroupIdDelete(groupId, options)
      return (axios: AxiosInstance = globalAxios, basePath: string = BASE_PATH) => {
        const axiosRequestArgs: AxiosRequestConfig = {
          ...localVarAxiosArgs.options,
          url: basePath + localVarAxiosArgs.url,
        }
        return axios.request(axiosRequestArgs)
      }
    },
    /**
     * Beim Entfernen eines Gruppenmitglieds wird der Zugriff auf alle geteilten Ressourcen der Gruppe entfernt. Der entfernte Benutzer behält jedoch Zugriff auf Ressourcen, bei denen er als Eigentümer eingetragen ist. Diese Aktion kann nur von Gruppenadministratoren oder Gruppenbesitzern durchgeführt werden.
     * @summary Gruppenmitglied entfernen
     * @param {string} groupId Die ID der zu löschenden Gruppe.
     * @param {string} userId Die ID des Benutzers, der entfernt werden soll.
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    async groupGroupIdKickUserIdDelete(
      groupId: string,
      userId: string,
      options?: AxiosRequestConfig,
    ): Promise<(axios?: AxiosInstance, basePath?: string) => Promise<AxiosResponse<Group>>> {
      const localVarAxiosArgs = await GruppenverwaltungApiAxiosParamCreator(
        configuration,
      ).groupGroupIdKickUserIdDelete(groupId, userId, options)
      return (axios: AxiosInstance = globalAxios, basePath: string = BASE_PATH) => {
        const axiosRequestArgs: AxiosRequestConfig = {
          ...localVarAxiosArgs.options,
          url: basePath + localVarAxiosArgs.url,
        }
        return axios.request(axiosRequestArgs)
      }
    },
    /**
     * Ermöglicht es dem aktuellen Benutzer, die Gruppe freiwillig zu verlassen. Der Benutzer verliert den Zugriff auf alle geteilten Ressourcen der Gruppe, behält jedoch den Zugriff auf Ressourcen, bei denen er als Eigentümer eingetragen ist. Sollte der Benutzer das einzige Mitglied der Gruppe sein, wird die Gruppe unwiderruflich gelöscht.
     * @summary Gruppe verlassen
     * @param {string} groupId Die ID der zu löschenden Gruppe.
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    async groupGroupIdLeaveDelete(
      groupId: string,
      options?: AxiosRequestConfig,
    ): Promise<(axios?: AxiosInstance, basePath?: string) => Promise<AxiosResponse<void>>> {
      const localVarAxiosArgs = await GruppenverwaltungApiAxiosParamCreator(
        configuration,
      ).groupGroupIdLeaveDelete(groupId, options)
      return (axios: AxiosInstance = globalAxios, basePath: string = BASE_PATH) => {
        const axiosRequestArgs: AxiosRequestConfig = {
          ...localVarAxiosArgs.options,
          url: basePath + localVarAxiosArgs.url,
        }
        return axios.request(axiosRequestArgs)
      }
    },
    /**
     * Überarbeitet eine Gruppe
     * @summary Gruppe bearbeiten
     * @param {GroupGroupIdBody} body
     * @param {string} groupId Die ID der zu bearbeitenden Gruppe.
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    async groupGroupIdPatch(
      body: GroupGroupIdBody,
      groupId: string,
      options?: AxiosRequestConfig,
    ): Promise<(axios?: AxiosInstance, basePath?: string) => Promise<AxiosResponse<Group>>> {
      const localVarAxiosArgs = await GruppenverwaltungApiAxiosParamCreator(
        configuration,
      ).groupGroupIdPatch(body, groupId, options)
      return (axios: AxiosInstance = globalAxios, basePath: string = BASE_PATH) => {
        const axiosRequestArgs: AxiosRequestConfig = {
          ...localVarAxiosArgs.options,
          url: basePath + localVarAxiosArgs.url,
        }
        return axios.request(axiosRequestArgs)
      }
    },
    /**
     * Ermöglicht es einem Benutzer, einer Gruppe beizutreten, wenn er ein gültiges Einladungstoken besitzt. Das Token enthält die notwendige Gruppen-ID und weitere Informationen, um den Beitritt durchzuführen. Der Benutzer wird als Mitglied der Gruppe eingetragen und erhält Zugang zu den geteilten Ressourcen.
     * @summary Gruppenbeitritt mit Einladungstoken
     * @param {string} token Das Einladungstoken, das dem Benutzer zugeteilt wurde.
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    async groupJoinPatch(
      token: string,
      options?: AxiosRequestConfig,
    ): Promise<(axios?: AxiosInstance, basePath?: string) => Promise<AxiosResponse<Group>>> {
      const localVarAxiosArgs = await GruppenverwaltungApiAxiosParamCreator(
        configuration,
      ).groupJoinPatch(token, options)
      return (axios: AxiosInstance = globalAxios, basePath: string = BASE_PATH) => {
        const axiosRequestArgs: AxiosRequestConfig = {
          ...localVarAxiosArgs.options,
          url: basePath + localVarAxiosArgs.url,
        }
        return axios.request(axiosRequestArgs)
      }
    },
    /**
     * Erstellt eine Gruppe und fügt den aktuellen Benutzer hinzu.
     * @summary Gruppe erstelen
     * @param {GroupBody} body
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    async groupPost(
      body: GroupBody,
      options?: AxiosRequestConfig,
    ): Promise<(axios?: AxiosInstance, basePath?: string) => Promise<AxiosResponse<Group>>> {
      const localVarAxiosArgs = await GruppenverwaltungApiAxiosParamCreator(
        configuration,
      ).groupPost(body, options)
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
 * GruppenverwaltungApi - factory interface
 * @export
 */
export const GruppenverwaltungApiFactory = function (
  configuration?: Configuration,
  basePath?: string,
  axios?: AxiosInstance,
) {
  return {
    /**
     * Gibt eine Liste der Gruppen zurück, zu denen der aktuell authentifizierte Benutzer gehört. Dies ermöglicht dem Benutzer, alle Gruppen zu sehen, an denen er teilnimmt, einschließlich der zugeordneten Räume und Pflanzen.
     * @summary Alle Gruppen des Benutzers anzeigen
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    async groupGet(options?: AxiosRequestConfig): Promise<AxiosResponse<Array<Group>>> {
      return GruppenverwaltungApiFp(configuration)
        .groupGet(options)
        .then((request) => request(axios, basePath))
    },
    /**
     * Beim Löschen einer Gruppe werden alle Benutzer aus der Gruppe entfernt und alle Daten über die Gruppe werden gelöscht. Die geteilten Ressourcen sind nur noch den Benutzern zugänglich, die als Besitzer eingetragen sind. Diese Aktion kann nicht rückgängig gemacht werden.
     * @summary Gruppe löschen
     * @param {string} groupId Die ID der zu löschenden Gruppe.
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    async groupGroupIdDelete(
      groupId: string,
      options?: AxiosRequestConfig,
    ): Promise<AxiosResponse<void>> {
      return GruppenverwaltungApiFp(configuration)
        .groupGroupIdDelete(groupId, options)
        .then((request) => request(axios, basePath))
    },
    /**
     * Beim Entfernen eines Gruppenmitglieds wird der Zugriff auf alle geteilten Ressourcen der Gruppe entfernt. Der entfernte Benutzer behält jedoch Zugriff auf Ressourcen, bei denen er als Eigentümer eingetragen ist. Diese Aktion kann nur von Gruppenadministratoren oder Gruppenbesitzern durchgeführt werden.
     * @summary Gruppenmitglied entfernen
     * @param {string} groupId Die ID der zu löschenden Gruppe.
     * @param {string} userId Die ID des Benutzers, der entfernt werden soll.
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    async groupGroupIdKickUserIdDelete(
      groupId: string,
      userId: string,
      options?: AxiosRequestConfig,
    ): Promise<AxiosResponse<Group>> {
      return GruppenverwaltungApiFp(configuration)
        .groupGroupIdKickUserIdDelete(groupId, userId, options)
        .then((request) => request(axios, basePath))
    },
    /**
     * Ermöglicht es dem aktuellen Benutzer, die Gruppe freiwillig zu verlassen. Der Benutzer verliert den Zugriff auf alle geteilten Ressourcen der Gruppe, behält jedoch den Zugriff auf Ressourcen, bei denen er als Eigentümer eingetragen ist. Sollte der Benutzer das einzige Mitglied der Gruppe sein, wird die Gruppe unwiderruflich gelöscht.
     * @summary Gruppe verlassen
     * @param {string} groupId Die ID der zu löschenden Gruppe.
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    async groupGroupIdLeaveDelete(
      groupId: string,
      options?: AxiosRequestConfig,
    ): Promise<AxiosResponse<void>> {
      return GruppenverwaltungApiFp(configuration)
        .groupGroupIdLeaveDelete(groupId, options)
        .then((request) => request(axios, basePath))
    },
    /**
     * Überarbeitet eine Gruppe
     * @summary Gruppe bearbeiten
     * @param {GroupGroupIdBody} body
     * @param {string} groupId Die ID der zu bearbeitenden Gruppe.
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    async groupGroupIdPatch(
      body: GroupGroupIdBody,
      groupId: string,
      options?: AxiosRequestConfig,
    ): Promise<AxiosResponse<Group>> {
      return GruppenverwaltungApiFp(configuration)
        .groupGroupIdPatch(body, groupId, options)
        .then((request) => request(axios, basePath))
    },
    /**
     * Ermöglicht es einem Benutzer, einer Gruppe beizutreten, wenn er ein gültiges Einladungstoken besitzt. Das Token enthält die notwendige Gruppen-ID und weitere Informationen, um den Beitritt durchzuführen. Der Benutzer wird als Mitglied der Gruppe eingetragen und erhält Zugang zu den geteilten Ressourcen.
     * @summary Gruppenbeitritt mit Einladungstoken
     * @param {string} token Das Einladungstoken, das dem Benutzer zugeteilt wurde.
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    async groupJoinPatch(
      token: string,
      options?: AxiosRequestConfig,
    ): Promise<AxiosResponse<Group>> {
      return GruppenverwaltungApiFp(configuration)
        .groupJoinPatch(token, options)
        .then((request) => request(axios, basePath))
    },
    /**
     * Erstellt eine Gruppe und fügt den aktuellen Benutzer hinzu.
     * @summary Gruppe erstelen
     * @param {GroupBody} body
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    async groupPost(body: GroupBody, options?: AxiosRequestConfig): Promise<AxiosResponse<Group>> {
      return GruppenverwaltungApiFp(configuration)
        .groupPost(body, options)
        .then((request) => request(axios, basePath))
    },
  }
}

/**
 * GruppenverwaltungApi - object-oriented interface
 * @export
 * @class GruppenverwaltungApi
 * @extends {BaseAPI}
 */
export class GruppenverwaltungApi extends BaseAPI {
  /**
   * Gibt eine Liste der Gruppen zurück, zu denen der aktuell authentifizierte Benutzer gehört. Dies ermöglicht dem Benutzer, alle Gruppen zu sehen, an denen er teilnimmt, einschließlich der zugeordneten Räume und Pflanzen.
   * @summary Alle Gruppen des Benutzers anzeigen
   * @param {*} [options] Override http request option.
   * @throws {RequiredError}
   * @memberof GruppenverwaltungApi
   */
  public async groupGet(options?: AxiosRequestConfig): Promise<AxiosResponse<Array<Group>>> {
    return GruppenverwaltungApiFp(this.configuration)
      .groupGet(options)
      .then((request) => request(this.axios, this.basePath))
  }

  /**
   * Beim Löschen einer Gruppe werden alle Benutzer aus der Gruppe entfernt und alle Daten über die Gruppe werden gelöscht. Die geteilten Ressourcen sind nur noch den Benutzern zugänglich, die als Besitzer eingetragen sind. Diese Aktion kann nicht rückgängig gemacht werden.
   * @summary Gruppe löschen
   * @param {string} groupId Die ID der zu löschenden Gruppe.
   * @param {*} [options] Override http request option.
   * @throws {RequiredError}
   * @memberof GruppenverwaltungApi
   */
  public async groupGroupIdDelete(
    groupId: string,
    options?: AxiosRequestConfig,
  ): Promise<AxiosResponse<void>> {
    return GruppenverwaltungApiFp(this.configuration)
      .groupGroupIdDelete(groupId, options)
      .then((request) => request(this.axios, this.basePath))
  }

  /**
   * Beim Entfernen eines Gruppenmitglieds wird der Zugriff auf alle geteilten Ressourcen der Gruppe entfernt. Der entfernte Benutzer behält jedoch Zugriff auf Ressourcen, bei denen er als Eigentümer eingetragen ist. Diese Aktion kann nur von Gruppenadministratoren oder Gruppenbesitzern durchgeführt werden.
   * @summary Gruppenmitglied entfernen
   * @param {string} groupId Die ID der zu löschenden Gruppe.
   * @param {string} userId Die ID des Benutzers, der entfernt werden soll.
   * @param {*} [options] Override http request option.
   * @throws {RequiredError}
   * @memberof GruppenverwaltungApi
   */
  public async groupGroupIdKickUserIdDelete(
    groupId: string,
    userId: string,
    options?: AxiosRequestConfig,
  ): Promise<AxiosResponse<Group>> {
    return GruppenverwaltungApiFp(this.configuration)
      .groupGroupIdKickUserIdDelete(groupId, userId, options)
      .then((request) => request(this.axios, this.basePath))
  }

  /**
   * Ermöglicht es dem aktuellen Benutzer, die Gruppe freiwillig zu verlassen. Der Benutzer verliert den Zugriff auf alle geteilten Ressourcen der Gruppe, behält jedoch den Zugriff auf Ressourcen, bei denen er als Eigentümer eingetragen ist. Sollte der Benutzer das einzige Mitglied der Gruppe sein, wird die Gruppe unwiderruflich gelöscht.
   * @summary Gruppe verlassen
   * @param {string} groupId Die ID der zu löschenden Gruppe.
   * @param {*} [options] Override http request option.
   * @throws {RequiredError}
   * @memberof GruppenverwaltungApi
   */
  public async groupGroupIdLeaveDelete(
    groupId: string,
    options?: AxiosRequestConfig,
  ): Promise<AxiosResponse<void>> {
    return GruppenverwaltungApiFp(this.configuration)
      .groupGroupIdLeaveDelete(groupId, options)
      .then((request) => request(this.axios, this.basePath))
  }

  /**
   * Überarbeitet eine Gruppe
   * @summary Gruppe bearbeiten
   * @param {GroupGroupIdBody} body
   * @param {string} groupId Die ID der zu bearbeitenden Gruppe.
   * @param {*} [options] Override http request option.
   * @throws {RequiredError}
   * @memberof GruppenverwaltungApi
   */
  public async groupGroupIdPatch(
    body: GroupGroupIdBody,
    groupId: string,
    options?: AxiosRequestConfig,
  ): Promise<AxiosResponse<Group>> {
    return GruppenverwaltungApiFp(this.configuration)
      .groupGroupIdPatch(body, groupId, options)
      .then((request) => request(this.axios, this.basePath))
  }

  /**
   * Ermöglicht es einem Benutzer, einer Gruppe beizutreten, wenn er ein gültiges Einladungstoken besitzt. Das Token enthält die notwendige Gruppen-ID und weitere Informationen, um den Beitritt durchzuführen. Der Benutzer wird als Mitglied der Gruppe eingetragen und erhält Zugang zu den geteilten Ressourcen.
   * @summary Gruppenbeitritt mit Einladungstoken
   * @param {string} token Das Einladungstoken, das dem Benutzer zugeteilt wurde.
   * @param {*} [options] Override http request option.
   * @throws {RequiredError}
   * @memberof GruppenverwaltungApi
   */
  public async groupJoinPatch(
    token: string,
    options?: AxiosRequestConfig,
  ): Promise<AxiosResponse<Group>> {
    return GruppenverwaltungApiFp(this.configuration)
      .groupJoinPatch(token, options)
      .then((request) => request(this.axios, this.basePath))
  }

  /**
   * Erstellt eine Gruppe und fügt den aktuellen Benutzer hinzu.
   * @summary Gruppe erstelen
   * @param {GroupBody} body
   * @param {*} [options] Override http request option.
   * @throws {RequiredError}
   * @memberof GruppenverwaltungApi
   */
  public async groupPost(
    body: GroupBody,
    options?: AxiosRequestConfig,
  ): Promise<AxiosResponse<Group>> {
    return GruppenverwaltungApiFp(this.configuration)
      .groupPost(body, options)
      .then((request) => request(this.axios, this.basePath))
  }
}
