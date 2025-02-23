<script setup lang="ts">
import GroupCard from '@/components/GroupCard.vue'
import { Accordion, AccordionContent } from '@/components/ui/accordion'
import { AccordionItem, AccordionTrigger } from '@/components/ui/custom-accordion'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ref } from 'vue'
import { useGroupStore } from '@/stores'
import CreateGroupComponent from '@/components/CreateGroupComponent.vue'
import { useI18n } from 'vue-i18n'

const groupStore = useGroupStore()

const { t } = useI18n()

const defaultOpenValues = ref(groupStore.groups.length === 1 ? [groupStore.groups[0].gid] : [])
</script>

<template>
  <div class="flex justify-between items-center w-full">
    <h1 class="font-bold text-3xl m-3 mb-6">{{ t('groups.myGroups') }}</h1>
    <CreateGroupComponent />
  </div>

  <Accordion type="multiple" class="w-full" collapsible :default-value="defaultOpenValues">
    <AccordionItem
      class="mb-4"
      v-for="group in groupStore.groups"
      :key="group.gid"
      :value="group.gid"
    >
      <Card>
        <AccordionTrigger class="p-2 text-left pr-6">
          <CardHeader>
            <CardTitle>{{ group.groupName }}</CardTitle>
            <CardDescription> {{ group.rooms }}</CardDescription>
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

<style scoped></style>
