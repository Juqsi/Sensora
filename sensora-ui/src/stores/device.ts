import { defineStore } from 'pinia'
import { type Controller, GeraeteverwaltungApiFactory } from '@/api'
import { handleApiError } from '@/utils/apiErrorHandler'
import { toast } from 'vue-sonner'

const geraeteApi = GeraeteverwaltungApiFactory()

export const useDeviceStore = defineStore('device', {
  state: () => ({
    devices: [] as Array<Controller>,
    loading: false,
  }),

  actions: {
    async fetchDevices(force = false) {
      this.loading = true
      try {
        if (force || this.devices.length === 0) {
          const response = await geraeteApi.devicesGet()
          this.devices = response.data
        }

        return this.devices
      } catch (error) {
        handleApiError(error)
        return []
      } finally {
        this.loading = false
      }
    },

    async fetchDeviceDetails(deviceId: string, force = false) {
      this.loading = true
      try {
        if (force || !this.devices.some((d) => d.did === deviceId)) {
          const response = await geraeteApi.deviceDeviceIdGet(deviceId)
          const device = response.data

          const existingDeviceIndex = this.devices.findIndex((d) => d.did === deviceId)
          if (existingDeviceIndex === -1) {
            this.devices.push(device)
          } else {
            this.devices[existingDeviceIndex] = device
          }

          return device
        } else {
          return this.devices.find((d) => d.did === deviceId) || null
        }
      } catch (error) {
        handleApiError(error)
        return null
      } finally {
        this.loading = false
      }
    },

    async removeDevice(deviceId: string) {
      this.loading = true
      try {
        // Gerät über API löschen
        await geraeteApi.deviceDeviceIdGet(deviceId)

        // Entferne das Gerät aus der Liste
        this.devices = this.devices.filter((device) => device.did !== deviceId)

        toast.success('Device successfully deleted') // Erfolgsnachricht
      } catch (error) {
        handleApiError(error)
      } finally {
        this.loading = false
      }
    },

    clearData() {
      this.devices = []
    },
  },
  persist: {
    storage: localStorage,
  },
})
