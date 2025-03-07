<script lang="ts" setup>
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import {
  CloudHail,
  Droplet,
  Siren,
  Sun,
  Thermometer,
  TriangleAlert,
  WifiOff,
  Wrench,
} from 'lucide-vue-next'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { ilk, type Sensor, type Value, type Plant } from '@/api'
import { latestSensorValue } from '@/composables/useLatestSensorValue.ts'

defineProps({
  connectionLost: Boolean,
  alert: Boolean,
  siren: Boolean,
  wrench: Boolean,
  plant: { type: Object, required: true },
})
</script>

<template>
  <Card>
    <CardHeader class="text-lg py-4 truncate">{{ plant.name }}</CardHeader>
    <CardContent>
      <div class="grid gap-4 grid-cols-2">
        <div class="grid gap-2 iconWithLabel">
          <Thermometer id="temperature" />
          <Label for="temperature">
            {{ latestSensorValue([plant as Plant], ilk.temperature) ?? '--' }}</Label
          >
        </div>
        <div class="grid gap-2 iconWithLabel">
          <CloudHail id="humidity" />
          <Label for="humidity"
            >{{ latestSensorValue([plant as Plant], ilk.humidity) ?? '--' }}
          </Label>
        </div>
        <div class="grid gap-2 iconWithLabel">
          <Sun id="light" />
          <Label for="light">{{
            latestSensorValue([plant as Plant], ilk.brightness) ?? '--'
          }}</Label>
        </div>
        <div class="grid gap-2 iconWithLabel">
          <Droplet id="water" />
          <Label for="water">{{
            latestSensorValue([plant as Plant], ilk.soilMoisture) ?? '--'
          }}</Label>
        </div>
        <TooltipProvider v-if="connectionLost">
          <Tooltip>
            <TooltipTrigger class="flex justify-center items-center">
              <Badge class="max-w-fit" variant="destructive">
                <WifiOff />
              </Badge>
            </TooltipTrigger>
            <TooltipContent>
              <p>Help here</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
        <TooltipProvider v-if="alert">
          <Tooltip>
            <TooltipTrigger class="flex justify-center items-center">
              <Badge class="max-w-fit" variant="destructive">
                <TriangleAlert />
              </Badge>
            </TooltipTrigger>
            <TooltipContent>
              <p>Help here</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
        <TooltipProvider v-if="siren">
          <Tooltip>
            <TooltipTrigger class="flex justify-center items-center">
              <Badge class="max-w-fit" variant="destructive">
                <Siren />
              </Badge>
            </TooltipTrigger>
            <TooltipContent>
              <p>Help here</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
        <TooltipProvider v-if="wrench">
          <Tooltip>
            <TooltipTrigger class="flex justify-center items-center">
              <Badge class="max-w-fit" variant="destructive">
                <Wrench />
              </Badge>
            </TooltipTrigger>
            <TooltipContent>
              <p>Help here</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
    </CardContent>
  </Card>
</template>

<style scoped>
.iconWithLabel {
  @apply flex items-center justify-center;
}
</style>
