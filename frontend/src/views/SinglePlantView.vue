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

import { useRoute } from 'vue-router'
import NavCard from '@/components/NavCard.vue'
import { plantAvatars } from '@/components/plant3d/plantAvatars.ts'
import { usePlantStore } from '@/stores'
import { onMounted } from 'vue'
import { ilk, type Plant } from '@/api'

const route = useRoute()

const plantStore = usePlantStore()

const plant = ref<Plant>()

let values: Record<string, { timestamp: Date; value: number; unit: string }[]> | null
onMounted(async () => {
  if (route.params.id !== undefined) {
    plant.value = await plantStore.getPlantDetails(route.params.id as string)
    values = await plantStore.getCombinedSensorData(plant.value?.plantId ?? '', yesterday, today)
    updateActiveKey(ilk.temperature, true)
  }
})

const defaultValue = 'item-1'

const accordionItems = [
  {
    value: 'item-1',
    title: "What is the plant's groupName?",
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

const today = new Date()
const yesterday = new Date()
yesterday.setDate(today.getDate() - 1)

const activeKey = ref<ilk>(ilk.temperature)

const activeData = ref<{
  values: { timestamp: number; [key: string]: number }[]
  ilk: ilk
  unit: string
}>({
  values: [],
  unit: '',
  ilk: ilk.temperature,
})

const updateActiveKey = (key: ilk, force: Boolean = false) => {
  if (force || activeKey.value !== key) {
    activeKey.value = key

    if (values === null) {
      activeData.value = {
        values: [],
        unit: '',
        ilk: activeKey.value,
      }
      console.log('no activeData')
      return
    }

    const rawData = values[activeKey.value] || []
    const unit = rawData[0]?.unit ?? ''
    console.log('rawData', rawData)
    activeData.value = {
      values: rawData.map(({ timestamp, value }) => ({
        timestamp: new Date(timestamp).getTime(), // X-Achse benötigt UNIX-Zeitstempel
        [activeKey.value]: value, // Dynamischer Key basierend auf `ilk`
      })),
      unit: unit,
      ilk: activeKey.value,
    }
    console.log('activeData', activeData.value)
  }
}
</script>

<template>
  <NavCard sub-title="Wohnzimmer" :title="plant?.name ?? ''">
    <template #TitleRight>
      <router-link :to="`/plant/${route.params.id}/edit`">
        <Button size="icon" variant="ghost">
          <Settings />
        </Button>
      </router-link>
    </template>
  </NavCard>

  <Plant3d plant-model-path="/models3d/plant.glb" />
  <Tabs class="w-full" default-value="values">
    <TabsList class="grid w-full grid-cols-2">
      <TabsTrigger value="values"> Values</TabsTrigger>
      <TabsTrigger value="infos"> Infos</TabsTrigger>
    </TabsList>
    <TabsContent value="values">
      <MeasuredTiles @updateActiveKey="updateActiveKey" :plant="plant" />
      <PlantMeassuredValuesChart v-if="activeData.values.length !== 3" :data="activeData" />
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
