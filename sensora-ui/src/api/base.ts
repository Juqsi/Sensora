import { Configuration } from './configuration'
import apiClient from './apiClient'
import type { AxiosRequestConfig } from 'axios'

export const BASE_PATH = import.meta.env.VITE_API_BASE || '' //TODO Domain eintragen

export class BaseAPI {
  protected configuration: Configuration | undefined

  constructor(
    configuration?: Configuration,
    protected basePath: string = BASE_PATH,
    protected axios = apiClient, // Nutzt die zentrale Axios-Instanz
  ) {
    if (configuration) {
      this.configuration = configuration
      this.basePath = configuration.basePath || this.basePath
    }
  }
}

// RequestArgs manuell definieren
export interface RequestArgs {
  url: string
  options: AxiosRequestConfig
}

// RequiredError Klasse definieren
export class RequiredError extends Error {
  constructor(
    public field: string,
    msg?: string,
  ) {
    super(msg || `Required parameter ${field} was null or undefined.`)
    this.name = 'RequiredError'
  }
}
