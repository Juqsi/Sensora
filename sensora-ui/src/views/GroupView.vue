<script setup lang="ts">
import GroupCard from '@/components/GroupCard.vue'
import { Accordion, AccordionContent } from '@/components/ui/accordion'
import { AccordionItem, AccordionTrigger } from '@/components/ui/custom-accordion'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ref } from 'vue'
import { useGroupStore } from '@/stores'
import { Button } from '@/components/ui/button'

const groupStore = useGroupStore()
await groupStore.fetchGroups()

const defaultOpenValues = ref(groupStore.groups.length === 1 ? [groupStore.groups[0].gid] : [])
</script>

<template>
  <h1 class="font-bold text-3xl m-3 mb-6 w-full">Meine Gruppen</h1>
  <Button></Button>
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
            <CardTitle>Group</CardTitle>
            <CardDescription> more infos here Infos </CardDescription>
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
