<script lang="ts" setup>
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Droplet, Sun, Thermometer } from 'lucide-vue-next'
import { ilk, type Plant, type Value } from '@/api'
import { latestSensorValue } from '@/composables/useLatestSensorValue.ts'
import type { PropType } from 'vue'
import { ref } from 'vue'

const props = defineProps({
  plant: { type: Object as PropType<Plant | undefined>, required: true },
})

defineEmits(['updateActiveKey'])

const temperature = ref<Value | undefined>(
  latestSensorValue([props.plant as Plant], ilk.temperature),
)
const soilMoisture = ref<Value | undefined>(
  latestSensorValue([props.plant as Plant], ilk.soilMoisture),
)
const brightness = ref<Value | undefined>(latestSensorValue([props.plant as Plant], ilk.brightness))
const humidity = ref<Value | undefined>(latestSensorValue([props.plant as Plant], ilk.humidity))
</script>

<template>
  <div class="grid gap-4 grid-cols-2 sm:grid-cols-4">
    <Card @click="$emit('updateActiveKey', ilk.temperature)">
      <CardHeader class="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle class="text-sm font-medium"> Temperature</CardTitle>
        <Thermometer class="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div class="text-2xl font-bold">
          {{ temperature?.value ?? '--' }}
        </div>
        <p class="text-xs text-muted-foreground">{{ temperature?.timestamp ?? '' }}</p>
      </CardContent>
    </Card>
    <Card @click="$emit('updateActiveKey', ilk.soilMoisture)">
      <CardHeader class="flex flex-row items-center justify-between space-y-0 pb-1">
        <CardTitle class="text-sm font-medium"> Soil moisture</CardTitle>
        <Droplet class="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div class="text-2xl font-bold">
          {{ soilMoisture?.value ?? '--' }}
        </div>
        <p class="text-xs text-muted-foreground">{{ soilMoisture?.timestamp ?? '' }}</p>
      </CardContent>
    </Card>
    <Card @click="$emit('updateActiveKey', ilk.humidity)">
      <CardHeader class="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle class="text-sm font-medium">Humidity</CardTitle>
        <Sun class="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div class="text-2xl font-bold">
          {{ humidity?.value ?? '--' }}
        </div>
        <p class="text-xs text-muted-foreground">{{ humidity?.timestamp ?? '' }}</p>
      </CardContent>
    </Card>
    <Card @click="$emit('updateActiveKey', ilk.brightness)">
      <CardHeader class="flex flex-row items-center justify-between space-y-0 pb-1">
        <CardTitle class="text-sm font-medium">Brightness</CardTitle>
        <Sun class="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div class="text-2xl font-bold">
          {{ brightness?.value ?? '--' }}
        </div>
        <p class="text-xs text-muted-foreground">{{ brightness?.timestamp ?? '' }}</p>
      </CardContent>
    </Card>
  </div>
</template>
