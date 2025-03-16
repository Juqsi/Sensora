<script setup lang="ts">
import NavCard from '@/components/NavCard.vue'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useDeviceStore } from '@/stores'
import { Cpu, Droplet, Sun, Thermometer } from 'lucide-vue-next'

import { onMounted, ref } from 'vue'

import { useRoute } from 'vue-router'
import { type Controller } from '@/api'

const route = useRoute()

const deviceStore = useDeviceStore()

const controller = ref<Controller>()

onMounted(async () => {
  if (route.params.id !== undefined) {
    controller.value = await deviceStore.fetchDeviceDetails(route.params.id as string)
  }
})
</script>

<template>
  <NavCard :sub-title="controller?.model" :title="controller?.did ?? ''"> </NavCard>
  <Card>
    <CardHeader class="flex flex-row items-center justify-between space-y-0 pb-2">
      <CardTitle class="text-sm font-medium rounded-full bg-border p-2 border-2 border-foreground">
        <Cpu />
      </CardTitle>
    </CardHeader>
    <CardContent>
      <div class="text-2xl font-bold flex-row flex justify-between items-center">
        <div class="text-sm font-medium rounded-full p-1 border-2 border-foreground">
          <Thermometer />
        </div>
        <Droplet />
        <Sun />
        <Sun />
      </div>
    </CardContent>
  </Card>
</template>

<style scoped></style>
