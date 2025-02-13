import {
  AuthentifizierungApiFactory,
  BenutzerverwaltungApiFactory,
  GeraeteverwaltungApiFactory,
  GruppenverwaltungApiFactory,
  PflanzenverwaltungApiFactory,
  RaumverwaltungApiFactory,
  StatischApiFactory,
} from '@/api'
import apiClient from '@/api/apiClient'

const authApiClient = AuthentifizierungApiFactory(undefined, undefined, apiClient)

const userApiClient = BenutzerverwaltungApiFactory(undefined, undefined, apiClient)

const deviceApiClient = GeraeteverwaltungApiFactory(undefined, undefined, apiClient)

const groupApiClient = GruppenverwaltungApiFactory(undefined, undefined, apiClient)

const plansApiClient = PflanzenverwaltungApiFactory(undefined, undefined, apiClient)

const roomsApiClient = RaumverwaltungApiFactory(undefined, undefined, apiClient)

const staticApiClient = StatischApiFactory(undefined, undefined, apiClient)

export default {
  authApiClient,
  userApiClient,
  groupApiClient,
  deviceApiClient,
  plansApiClient,
  roomsApiClient,
  staticApiClient,
}
