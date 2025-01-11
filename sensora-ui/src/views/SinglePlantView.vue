<script lang="ts" setup>
import Plant3d from '@/components/plant3d/plant3d.vue'
import MeasuredTiles from '@/components/MeasuredTiles.vue'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs/index.ts'
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Settings } from 'lucide-vue-next'
import { Button } from '@/components/ui/button'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion/index.ts'

const defaultValue = 'item-1'

const accordionItems = [
  {
    value: 'item-1',
    title: "What is the plant's name?",
    content:
      "The plant is called 'Aloe Vera'. It is known for its medicinal properties and its ability to thrive in dry conditions.",
  },
  {
    value: 'item-2',
    title: 'Is it easy to care for?',
    content:
      'Yes. Aloe Vera is a low-maintenance plant that requires minimal watering and can grow in a variety of light conditions.',
  },
  {
    value: 'item-3',
    title: 'What are its benefits?',
    content:
      'Aloe Vera is famous for its soothing gel that can be used to treat burns, skin irritations, and as a natural moisturizer.',
  },
  {
    value: 'item-4',
    title: 'How tall does it grow?',
    content:
      'Aloe Vera plants typically grow up to 12-18 inches tall, though some varieties can grow larger with optimal conditions.',
  },
  {
    value: 'item-5',
    title: 'What kind of light does it need?',
    content:
      'Aloe Vera thrives in bright, indirect sunlight but can also tolerate some direct sunlight. It should not be placed in dark, low-light areas.',
  },
]
</script>

<template>
  <Card class="w-full">
    <CardHeader>
      <div class="flex items-center justify-between w-full">
        <div class="flex items-center space-x-4">
          <div>
            <CardTitle>Pflanze Berta</CardTitle>
            <CardDescription> Seit X Tagen dabei</CardDescription>
          </div>
        </div>
        <Button size="icon" variant="ghost">
          <Settings />
        </Button>
      </div>
    </CardHeader>
  </Card>

  <Plant3d />
  <Tabs class="w-full" default-value="values">
    <TabsList class="grid w-full grid-cols-2">
      <TabsTrigger value="values"> Values</TabsTrigger>
      <TabsTrigger value="infos"> Infos</TabsTrigger>
    </TabsList>
    <TabsContent value="values">
      <MeasuredTiles />
    </TabsContent>
    <TabsContent value="infos">
      <Accordion :default-value="defaultValue" class="w-full" collapsible type="single">
        <AccordionItem v-for="item in accordionItems" :key="item.value" :value="item.value">
          <AccordionTrigger>{{ item.title }}</AccordionTrigger>
          <AccordionContent>
            {{ item.content }}
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </TabsContent>
  </Tabs>
</template>

<style scoped></style>
