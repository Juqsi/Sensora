<script lang="ts" setup>
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Droplet, Sun, Thermometer } from 'lucide-vue-next'
import { measuredValues } from '@/composables/useMeasuredValues.ts'

const props = defineProps({
  plant: { type: Object, required: true },
})

defineEmits(['updateActiveKey'])
</script>

<template>
  <div class="grid gap-4 grid-cols-2 sm:grid-cols-4">
    <Card
      @click="$emit('updateActiveKey', measuredValues.brightness)"
      class="bg-destructive text-destructive-foreground"
    >
      <CardHeader class="flex flex-row items-center justify-between space-y-0 pb-1">
        <CardTitle class="text-sm font-medium">Brightness</CardTitle>
        <Sun class="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div class="text-2xl font-bold">25</div>
        <p class="text-xs text-muted-foreground">+20.1% from yesterday</p>
      </CardContent>
    </Card>
    <Card
      @click="$emit('updateActiveKey', measuredValues.soilMoisture)"
      class="bg-primary text-primary-foreground"
    >
      <CardHeader class="flex flex-row items-center justify-between space-y-0 pb-1">
        <CardTitle class="text-sm font-medium"> Subscriptions</CardTitle>
        <Droplet class="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div class="text-2xl font-bold">30%</div>
        <p class="text-xs text-muted-foreground">5% from yesterday</p>
      </CardContent>
    </Card>
    <Card @click="$emit('updateActiveKey', measuredValues.temperature)">
      <CardHeader class="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle class="text-sm font-medium"> Temperature</CardTitle>
        <Thermometer class="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div class="text-2xl font-bold">23 °C</div>
        <p class="text-xs text-muted-foreground">+20.1% from yesterday</p>
      </CardContent>
    </Card>
    <Card @click="$emit('updateActiveKey', measuredValues.humidity)">
      <CardHeader class="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle class="text-sm font-medium">Humidity</CardTitle>
        <Sun class="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div class="text-2xl font-bold">60%</div>
        <p class="text-xs text-muted-foreground">+10.1% from yesterday</p>
      </CardContent>
    </Card>
  </div>
</template>
