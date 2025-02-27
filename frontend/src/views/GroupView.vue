<script lang="ts" setup>
import { usePullToRefresh } from '@/composables/usePullToRefresh'
import { useGroupStore } from '@/stores'
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'
import GroupCard from '@/components/GroupCard.vue'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import CreateGroupComponent from '@/components/CreateGroupComponent.vue'

const groupStore = useGroupStore()
const { t } = useI18n()
const defaultOpenValues = ref(groupStore.groups.length === 1 ? [groupStore.groups[0].gid] : [])

const { isRefreshing } = usePullToRefresh(async () => {
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
      </Card>
    </AccordionItem>
  </Accordion>
</template>
