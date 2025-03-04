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

const groupStore = useGroupStore()
const { t } = useI18n()
const defaultOpenValues = ref(groupStore.groups.length === 1 ? [groupStore.groups[0].gid] : [])

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
      class="mb-4"
    >
      <Card>
        <AccordionTrigger class="p-2 text-left pr-6">
          <CardHeader>
            <CardTitle>{{ group.name }}</CardTitle>
          </CardHeader>
        </AccordionTrigger>
        <AccordionContent>
          <CardContent>
            <GroupCard :group="group"></GroupCard>
          </CardContent>
        </AccordionContent>
        <CardFooter class="grid grid-cols-1">
          <p class="pb-4 pl-2 text-xl font-medium">Räume</p>
          <GroupRoomCard :group="group"></GroupRoomCard>
        </CardFooter>
      </Card>
    </AccordionItem>
  </Accordion>
  <div
    class="flex justify-center flex-col items-center w-full flex-grow mt-20 py-6"
    v-if="groupStore.groups.length === 0"
  >
    <h2 class="mb-4 text-2xl font-semibold text-center">Create Your First Group</h2>
    <p class="text-center text-gray-600 mb-6">Start by creating your first group to get started.</p>
    <img
      class="w-32 h-32 object-contain mb-8"
      src="../../public/svg/undraw_social-sharing_t073.svg"
      alt="Create group illustration"
    />
  </div>
</template>
