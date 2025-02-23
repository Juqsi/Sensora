import { defineStore } from 'pinia'
import { type Controller, deviceApiClient } from '@/api'

export const useDeviceStore = defineStore('device', {
  state: () => ({
    devices: [] as Array<Controller>,
  }),

  actions: {
    async fetchDevices(force = false) {
      if (force || this.devices.length === 0) {
        const response = await deviceApiClient.getList()
        this.devices = response.data
      }
    },

    async fetchDeviceDetails(deviceId: string, force = false) {
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
    },

    async removeDevice(deviceId: string) {
      await deviceApiClient.get(deviceId)
      this.devices = this.devices.filter((device) => device.did !== deviceId)
    },

    clearData() {
      this.devices = []
    },
  },
  persist: {
    storage: localStorage,
  },
})
