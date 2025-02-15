import { type InternalAxiosRequestConfig } from 'axios'

export interface CustomAxiosRequestConfig<T = any> extends InternalAxiosRequestConfig<T> {
  meta?: {
    toastId?: string | number
    successMessage?: string
    errorMessage?: string
  }
}
