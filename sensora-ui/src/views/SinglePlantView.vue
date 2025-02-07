<script lang="ts" setup>
import Plant3d from '@/components/plant3d/plant3d.vue'
import MeasuredTiles from '@/components/MeasuredTiles.vue'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs/index.ts'
import { Settings } from 'lucide-vue-next'
import { Button } from '@/components/ui/button'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion/index.ts'
import PlantMeassuredValuesChart from '@/components/PlantMeassuredValuesChart.vue'
import { computed, ref } from 'vue'
import { measuredValues } from '@/composables/useMeasuredValues.ts'

import { useRouter } from 'vue-router'
import NavCard from '@/components/NavCard.vue'

const router = useRouter()

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
const values = {
  temperature: [
    {
      year: 1970,
      'Export Growth Rate': 2.04,
      'Import Growth Rate': 1.53,
    },
    {
      year: 1971,
      'Export Growth Rate': 1.96,
      'Import Growth Rate': 1.58,
    },
  ],
  soilMoisture: [
    {
      year: 1970,
      'Export Growth Rate': 3.04,
      'Import Growth Rate': 4.53,
    },
    {
      year: 1971,
      'Export Growth Rate': 1.96,
      'Import Growth Rate': 1.58,
    },
  ],
  brightness: [
    {
      year: 1970,
      'Export Growth Rate': 3.04,
      'Import Growth Rate': 4.53,
    },
    {
      year: 1971,
      'Export Growth Rate': 1.96,
      'Import Growth Rate': 1.58,
    },
  ],
  humidity: [
    {
      year: 1970,
      'Export Growth Rate': 3.04,
      'Import Growth Rate': 4.53,
    },
    {
      year: 1971,
      'Export Growth Rate': 1.96,
      'Import Growth Rate': 1.58,
    },
  ],
}

const activeKey = ref<measuredValues>(measuredValues.temperature)

const updateActiveKey = (key: measuredValues) => {
  activeKey.value = key
}
const activeData = computed(() => values[activeKey.value] || [])
</script>

<template>
  <NavCard sub-title="Geht es gut" title="Pflanze Berta">
    <template #TitleRight>
      <router-link to="/plant/123/edit">
        <Button size="icon" variant="ghost">
          <Settings />
        </Button>
      </router-link>
    </template>
  </NavCard>

  <Plant3d />
  <Tabs class="w-full" default-value="values">
    <TabsList class="grid w-full grid-cols-2">
      <TabsTrigger value="values"> Values</TabsTrigger>
      <TabsTrigger value="infos"> Infos</TabsTrigger>
    </TabsList>
    <TabsContent value="values">
      <MeasuredTiles @updateActiveKey="updateActiveKey" />
      <PlantMeassuredValuesChart :data="activeData" />
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
