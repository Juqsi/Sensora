import { defineStore } from 'pinia'
import { type Controller, deviceApiClient } from '@/api'
import { handleApiError } from '@/utils/apiErrorHandler'
import { toast } from 'vue-sonner'

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
          const response = await deviceApiClient.getList()
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
          const response = await deviceApiClient.get(deviceId)
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
        await deviceApiClient.get(deviceId)

        this.devices = this.devices.filter((device) => device.did !== deviceId)

        toast.success('Device successfully deleted')
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
