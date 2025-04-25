<script lang="ts" setup>
import { nextTick, onMounted, ref,watch, computed } from 'vue'
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
import router from '@/router'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

const {t} = useI18n()

const route = useRoute()
const plantStore = usePlantStore()
const roomStore = useRoomStore()
const plant = ref<Plant>()
const room = ref<Room | undefined>()

const plantavatar = ref('')

const rangeOptions = [
  { label: t('plant.last24h'), value: '24h', hours: 24 },
  { label: t('plant.last3d'), value: '3d', days: 3 },
  { label: t('plant.last7d'), value: '7d', days: 7 },
  { label: t('plant.last30d'), value: '30d', days: 30 },
]
const selectedRange = ref(rangeOptions[1].value)

const {searchPlant} = useSearch()

const measuredTiles = ref<InstanceType<typeof MeasuredTiles> | null>(null)

let values: Record<string, { timestamp: Date; value: number; unit: string }[]> | null

onMounted(async () => {
  if (route.params.id !== undefined) {
    await loadPlant()
    plantavatar.value = "/models3d/" + (plant.value?.avatarId ?? "plant.glb")
  }
})

const plantInformation = ref<Recognition>()

const today = ref(new Date())
const startDate = computed(() => {
  const now = new Date()
  const opt = rangeOptions.find(o => o.value === selectedRange.value)!
  const d = new Date(now)
  if (opt.hours) d.setHours(d.getHours() - opt.hours)
  if (opt.days) d.setDate(d.getDate() - opt.days)
  return d
})

const activeKey = ref<ilk>(ilk.temperature)

const activeData = ref<{
  values: { timestamp: number; targetValue : number ; [key: string]: number }[]
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

    const targetValue = plant.value?.targetValues?.find(
      (target) => target.ilk === activeKey.value
    )?.value ?? -1

    activeData.value = {
      values: rawData.map(({ timestamp, value }) => ({
        timestamp: new Date(timestamp).getTime(),
        [activeKey.value]: value,
        targetValue: targetValue,
      })),
      unit: unit,
      ilk: activeKey.value,
    }
  }
}
usePullToRefresh(async () => {
  await plantStore.fetchPlants(true);
});

watch(selectedRange, () => {
  loadPlant()
})

async function loadPlant() {
  if (!route.params.id) return
  try {
    plant.value = await plantStore.getPlantDetails(route.params.id as string, startDate.value, today.value)
  } catch {
    await nextTick(() => router.push('/plants'))
  }
  const pid = plant.value?.plantId ?? ''
  const [sensorData, roomInfo, plantInfos] = await Promise.all([
    plantStore.getCombinedSensorData(pid, startDate.value, today.value),
    roomStore.getRoomDetails(plant.value?.room ?? ''),
    searchPlant(plant.value?.plantType && plant.value.plantType.length ? plant.value.plantType : plant.value!.name)
  ])
  values = sensorData
  room.value = roomInfo ?? undefined
  plantInformation.value = (plantInfos as Recognition[])[0] ?? null

  if (plant.value && measuredTiles.value) measuredTiles.value.initializeWithPlant(plant.value)
  updateActiveKey(activeKey.value, true)
}
</script>

<template>
  <NavCard :title="plant?.name ?? ''" :sub-title="room?.name">
    <template #TitleRight>
      <RouterLink :to="`/plant/${route.params.id}/edit`" >
        <Button size="icon" variant="ghost" class="cursor-pointer">
          <Settings />
        </Button>
      </RouterLink>
    </template>
  </NavCard>
  <Plant3d :plant-model-path="plantavatar" />
  <Tabs class="w-full" default-value="values">
    <TabsList class="grid w-full grid-cols-2">
      <TabsTrigger value="values">{{t('plant.Values')}}</TabsTrigger>
      <TabsTrigger value="infos">{{t('plant.Info')}}</TabsTrigger>

    </TabsList>
    <TabsContent value="values">
      <MeasuredTiles ref="measuredTiles" :plant="plant" @updateActiveKey="updateActiveKey" />
      <div class="my-4">
        <Select id="zeitraum-select" v-model="selectedRange">
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem v-for="opt in rangeOptions" :key="opt.value" :value="opt.value">
              {{ opt.label }}
            </SelectItem>
          </SelectContent>
        </Select>
      </div>
      <PlantMeassuredValuesChart :data="activeData" />
    </TabsContent>
    <TabsContent value="infos" class="w-full">
     <PlantInformationCard class="mx-auto" v-if="plantInformation" :recognition="plantInformation ?? {} as Recognition " />
      <EmtyState v-if="!plantInformation" :title="t('plant.NoInformationTitle')" :condition="true" :subtitle="t('plant.NoInformationSubtitle')" img-src="/svg/undraw_no-data_ig65.svg" />
    </TabsContent>
  </Tabs>
</template>

<style scoped></style>
