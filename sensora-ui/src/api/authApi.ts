import { AuthentifizierungApiFactory } from '@/api'
import apiClient from '@/api/apiClient'

const authApi = AuthentifizierungApiFactory(undefined, undefined, apiClient)

export default authApi
