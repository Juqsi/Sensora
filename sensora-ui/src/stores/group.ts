import { defineStore } from 'pinia'
import type { Group, GroupPatchBody, GroupPostBody } from '@/api'
import { GruppenverwaltungApiFactory } from '@/api'
import apiClient from '@/api/apiClient'
import { handleApiError } from '@/utils/apiErrorHandler'
import { toast } from 'vue-sonner'
import { useI18n } from 'vue-i18n'

const groupApi = GruppenverwaltungApiFactory(undefined, undefined, apiClient)

const { t } = useI18n()

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
        const response = await groupApi.groupGet()
        this.groups = response.data
      } catch (error) {
        handleApiError(error)
      } finally {
        this.loading = false
      }
    },

    async deleteGroup(groupId: string) {
      try {
        await groupApi.groupGroupIdDelete(groupId)
        this.groups = this.groups.filter((g) => g.gid !== groupId)
        toast.success(t('group.deleted'))
      } catch (error) {
        handleApiError(error)
      }
    },

    async removeUserFromGroup(groupId: string, userId: string) {
      try {
        const response = await groupApi.groupGroupIdKickUserIdDelete(groupId, userId)
        const updatedGroup = response.data
        this.groups = this.groups.map((g) => (g.gid === groupId ? updatedGroup : g))
        toast.success(t('group.userRemoved'))
      } catch (error) {
        handleApiError(error)
      }
    },

    async leaveGroup(groupId: string) {
      try {
        await groupApi.groupGroupIdLeaveDelete(groupId)
        this.groups = this.groups.filter((g) => g.gid !== groupId)
        toast.success(t('group.left'))
      } catch (error) {
        handleApiError(error)
      }
    },

    async updateGroup(groupId: string, body: GroupPatchBody) {
      try {
        const response = await groupApi.groupGroupIdPatch(body, groupId)
        const updatedGroup = response.data
        this.groups = this.groups.map((g) => (g.gid === groupId ? updatedGroup : g))
        toast.success(t('group.updated'))
      } catch (error) {
        handleApiError(error)
      }
    },

    async joinGroup(token: string) {
      try {
        const response = await groupApi.groupJoinPatch(token)
        this.groups.push(response.data)
        toast.success(t('group.joined'))
      } catch (error) {
        handleApiError(error)
      }
    },

    async createGroup(body: GroupPostBody) {
      try {
        const response = await groupApi.groupPost(body)
        this.groups.push(response.data)
        toast.success(t('group.created'))
      } catch (error) {
        handleApiError(error)
      }
    },

    clearGroups() {
      this.groups = []
    },
  },
})
