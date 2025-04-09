<script lang="ts" setup>
import { usePullToRefresh } from '@/composables/usePullToRefresh'
import { useGroupStore } from '@/stores'
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import CreateGroupComponent from '@/components/CreateGroupComponent.vue'
import GroupRoomCard from '@/components/GroupRoomCard.vue'
import GroupCard from '@/components/GroupCard.vue'
import EmtyState from '@/components/EmtyState.vue'
import { Settings } from 'lucide-vue-next'
import ShareLink from '@/components/ShareLink.vue'
import { useGenerateInviteToken } from '@/composables/useGenerateInviteToken.ts'
import {useRoute} from 'vue-router'
import { Capacitor } from '@capacitor/core'

const route = useRoute()

const groupStore = useGroupStore()
const { t } = useI18n()
const defaultOpenValues = ref(groupStore.groups.length === 1 ? [groupStore.groups[0].gid] : [])
const inviteToken = ref('')


const generateInviteToken = async (groupId: string) => {
  let frontendBaseUrl = ''

  if (Capacitor.getPlatform() === 'android') {
    frontendBaseUrl = import.meta.env.VITE_FRONTEND_URL
  } else {
    const portPart =
      window.location.port && window.location.port !== '443'
        ? `:${window.location.port}`
        : ''
    frontendBaseUrl = `${window.location.protocol}//${window.location.hostname}${portPart}`
  }

  // 👇 Token generieren
  inviteToken.value = `${frontendBaseUrl}/groups?inviteToken=${await useGenerateInviteToken().generateInviteToken(groupId)}`
}

if (route.query.inviteToken){
  groupStore.joinGroup(route.query.inviteToken as string)
}

usePullToRefresh(async () => {
  await groupStore.fetchGroups(true)
})
</script>

<template>
  <div class="flex justify-between items-center w-full">
    <h1 class="font-bold text-3xl m-3 mb-6">{{ t('groups.myGroups') }}</h1>
    <CreateGroupComponent />
  </div>

  <Accordion :default-value="defaultOpenValues" class="w-full" collapsible type="multiple">
    <AccordionItem
      v-for="group in groupStore.groups"
      :key="group.gid"
      :value="group.gid"
      class="mb-4 rounded-lg"
    >
      <Card>
        <AccordionTrigger class="p-2 text-left pr-6">
          <CardHeader>
            <CardTitle>
              {{ group.name }}
              <ShareLink
                :description="t('groups.ShareDescription')"
                :link="inviteToken"
                :title="t('group.ShareTitle')"
                @generate="generateInviteToken(group.gid)"
              />
            </CardTitle>
          </CardHeader>
        </AccordionTrigger>
        <AccordionContent>
          <CardContent>
            <GroupCard :group="group"></GroupCard>
          </CardContent>
        </AccordionContent>
        <CardFooter class="grid grid-cols-1">
          <div class="flex justify-between items-center">
            <h3 class="text-xl pl-3 my-2 font-medium">{{ t('Group.Rooms') }}</h3>
            <CreateGroupComponent :group="group">
              <template #desktop>
                <Button :aria-label="t('group.addRoom')" size="icon" variant="default">
                  <Settings class="w-4" />
                </Button>
              </template>
              <template #mobile>
                <Button :aria-label="t('group.addRoom')" size="icon" variant="default">
                  <Settings class="w-4" />
                </Button>
              </template>
            </CreateGroupComponent>
          </div>
          <GroupRoomCard :group="group"></GroupRoomCard>
        </CardFooter>
      </Card>
    </AccordionItem>
  </Accordion>
  <EmtyState
    :condition="groupStore.groups.length === 0"
    :subtitle="t('group.emptyGroupSubtitle')"
    :title="t('group.emptyGroupTitle')"
    img-src="/svg/undraw_social-sharing_t073.svg"
  />
</template>
