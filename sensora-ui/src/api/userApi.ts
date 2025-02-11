import { BenutzerverwaltungApiFactory } from '@/api'
import apiClient from '@/api/apiClient'

const userApi = BenutzerverwaltungApiFactory(undefined, undefined, apiClient)

export default userApi
