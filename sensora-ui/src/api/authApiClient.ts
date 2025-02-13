import { AuthentifizierungApiFactory } from '@/api'
import apiClient from '@/api/apiClient'

const authApiClient = AuthentifizierungApiFactory(undefined, undefined, apiClient)

export default authApiClient
