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

const authApiClient = AuthentifizierungApiFactory(undefined, apiClient)

const userApiClient = BenutzerverwaltungApiFactory(undefined, apiClient)

const deviceApiClient = GeraeteverwaltungApiFactory(undefined, apiClient)

const groupApiClient = GruppenverwaltungApiFactory(undefined, apiClient)

const plansApiClient = PflanzenverwaltungApiFactory(undefined, apiClient)

const roomsApiClient = RaumverwaltungApiFactory(undefined, apiClient)

const staticApiClient = StatischApiFactory(undefined, apiClient)

export {
  authApiClient,
  userApiClient,
  groupApiClient,
  deviceApiClient,
  plansApiClient,
  roomsApiClient,
  staticApiClient,
}
