import { defineStore } from 'pinia'
import type { createGroupBody, Group, GroupPatchBody } from '@/api'
import { groupApiClient } from '@/api'
import { handleApiError } from '@/utils/apiErrorHandler'
import { toast } from 'vue-sonner'
import i18n from '@/i18n'

const t = i18n.global?.t || ((key: string) => key)

export const useGroupStore = defineStore('group', {
  state: () => ({
    groups: [] as Group[],
    loading: false,
  }),

  actions: {
    async fetchGroups(force = false) {
      if (this.groups.length > 0 && !force) return
      this.loading = true
      try {
        const response = await groupApiClient.get()
        this.groups = response.data
      } catch (error) {
        handleApiError(error)
      } finally {
        this.loading = false
      }
    },

    async deleteGroup(groupId: string) {
      try {
        await groupApiClient.delete(groupId)
        this.groups = this.groups.filter((g) => g.gid !== groupId)
        toast.success(t('group.deleted'))
      } catch (error) {
        handleApiError(error)
      }
    },

    async removeUserFromGroup(groupId: string, userId: string) {
      try {
        const response = await groupApiClient.kick(groupId, userId)
        const updatedGroup = response.data
        this.groups = this.groups.map((g) => (g.gid === groupId ? updatedGroup : g))
        toast.success(t('group.userRemoved'))
      } catch (error) {
        handleApiError(error)
      }
    },

    async leaveGroup(groupId: string) {
      try {
        await groupApiClient.leave(groupId)
        this.groups = this.groups.filter((g) => g.gid !== groupId)
        toast.success(t('group.left'))
      } catch (error) {
        handleApiError(error)
      }
    },

    async updateGroup(groupId: string, body: GroupPatchBody) {
      try {
        const response = await groupApiClient.update(body, groupId)
        const updatedGroup = response.data
        this.groups = this.groups.map((g) => (g.gid === groupId ? updatedGroup : g))
        toast.success(t('group.updated'))
      } catch (error) {
        handleApiError(error)
      }
    },

    async joinGroup(token: string) {
      try {
        const response = await groupApiClient.join(token)
        this.groups.push(response.data)
        toast.success(t('group.joined'))
      } catch (error) {
        handleApiError(error)
      }
    },

    async createGroup(body: createGroupBody) {
      try {
        const response = await groupApiClient.create(body)
        this.groups.push(response.data)
        toast.success(t('group.created'))
      } catch (error) {
        handleApiError(error)
      }
    },

    clearData() {
      this.groups = []
    },
  },
  persist: {
    storage: localStorage,
  },
})
