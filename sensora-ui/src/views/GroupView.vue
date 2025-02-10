<script setup lang="ts">
import GroupCard from '@/components/GroupCard.vue'
import { Accordion, AccordionContent } from '@/components/ui/accordion'
import { AccordionItem, AccordionTrigger } from '@/components/ui/custom-accordion'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

const accordionItems = [
  {
    value: 'item-1',
    title: 'Group 1',
  },
]
</script>

<template>
  <h1 class="font-bold text-3xl m-3 mb-6 w-full">Meine Gruppen</h1>
  <Accordion type="multiple" class="w-full" collapsible>
    <AccordionItem
      class="mb-4"
      v-for="item in accordionItems"
      :key="item.value"
      :value="item.value"
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
            <GroupCard></GroupCard>
          </CardContent>
        </AccordionContent>
      </Card>
    </AccordionItem>
  </Accordion>
</template>

<style scoped></style>
