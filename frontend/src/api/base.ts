import apiClient from './apiClient'
import type { AxiosRequestConfig } from 'axios'
import { UserAvatarRefEnum } from '@/api/models'

export const BASE_PATH = import.meta.env.VITE_API_BASE || ''
export const STATICS_PATH  =  (name:string | undefined) => {
  if (!name) {
    name = UserAvatarRefEnum.Peashooter
  }
  return 'profilePictures/' + name + ".jpeg"
};

export class BaseAPI {
  constructor(
    protected basePath: string = BASE_PATH,
    protected axios = apiClient,
  ) {}
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
