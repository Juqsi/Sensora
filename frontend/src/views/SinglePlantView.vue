<script lang="ts" setup>
import { onMounted, ref } from 'vue'
import MeasuredTiles from '@/components/MeasuredTiles.vue'
import { useRoute } from 'vue-router'
import NavCard from '@/components/NavCard.vue'
import { usePlantStore, useRoomStore } from '@/stores'
import { ilk, type Plant, type Room } from '@/api'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import PlantMeassuredValuesChart from '@/components/PlantMeassuredValuesChart.vue'
import Plant3d from '@/components/plant3d/plant3d.vue'
import { Settings } from 'lucide-vue-next'
import { useSearch } from '@/composables/useSearch.ts'
import {  type Recognition } from '@/composables/useImageUpload.ts'
import PlantInformationCard from '@/components/PlantInformationCard.vue'
import EmtyState from '@/components/EmtyState.vue'
import {useI18n} from 'vue-i18n'
import { usePullToRefresh } from '@/composables/usePullToRefresh.ts'

const {t} = useI18n()

const route = useRoute()
const plantStore = usePlantStore()
const roomStore = useRoomStore()
const plant = ref<Plant>()
const room = ref<Room | undefined>()

const {searchPlant} = useSearch()

const measuredTiles = ref<InstanceType<typeof MeasuredTiles> | null>(null)

let values: Record<string, { timestamp: Date; value: number; unit: string }[]> | null

onMounted(async () => {
  if (route.params.id !== undefined) {
    plant.value = await plantStore.getPlantDetails(route.params.id as string, oneHourAgo, today)
    values = await plantStore.getCombinedSensorData(plant.value?.plantId ?? '', yesterday, today)
    room.value = await roomStore.getRoomDetails(plant.value?.room??'')?? undefined
    const plantInfos : Recognition[] = await searchPlant(plant.value?.plantType && plant.value?.plantType.length !== 0 ? plant.value?.plantType:plant.value?.name) ?? []
    plantInformation.value = plantInfos[0]

    if (plant.value && measuredTiles.value) {
      measuredTiles.value.initializeWithPlant(plant.value)
    }
    updateActiveKey(ilk.temperature, true)
  }
})

const plantInformation = ref<Recognition>()

const today = new Date()
const oneHourAgo = new Date()
oneHourAgo.setHours(oneHourAgo.getHours() - 5)
const yesterday = new Date()
yesterday.setDate(today.getDate() - 3)

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

const updateActiveKey = (key: ilk, force: boolean = false) => {
  if (force || activeKey.value !== key) {
    activeKey.value = key

    if (values === null) {
      activeData.value = {
        values: [],
        unit: '',
        ilk: activeKey.value,
      }
      return
    }

    const rawData = values[activeKey.value] || []
    const unit = rawData[0]?.unit ?? ''
    activeData.value = {
      values: rawData.map(({ timestamp, value }) => ({
        timestamp: new Date(timestamp).getTime(),
        [activeKey.value]: value,
      })),
      unit: unit,
      ilk: activeKey.value,
    }
  }
}

usePullToRefresh(async () => {
  await plantStore.fetchPlants(true);
});
</script>

<template>
  <NavCard :title="plant?.name ?? ''" :sub-title="room?.name">
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
      <MeasuredTiles ref="measuredTiles" :plant="plant" @updateActiveKey="updateActiveKey" />
      <PlantMeassuredValuesChart :data="activeData" />
    </TabsContent>
    <TabsContent value="infos" class="w-full">
     <PlantInformationCard class="mx-auto" v-if="plantInformation" :recognition="plantInformation ?? {} as Recognition " />
    </TabsContent>
  </Tabs>
</template>

<style scoped></style>
