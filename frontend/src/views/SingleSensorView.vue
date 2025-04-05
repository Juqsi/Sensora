<script lang="ts" setup>
import NavCard from '@/components/NavCard.vue'
import { Card, CardContent } from '@/components/ui/card'
import { useDeviceStore, usePlantStore } from '@/stores'
import {
  Clock,
  CloudHail,
  Cpu,
  Droplet,
  Flower2,
  Sun,
  Thermometer,
  User,
  Users,
  Waves,
} from 'lucide-vue-next'
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
  <NavCard
    :sub-title="controller?.did ?? ''"
    :title="controller?.model ?? 'Fullcontroller 4+1'"
    class="max-w-md"
  >
  </NavCard>

  <Card class="w-full mt-4 max-w-md">
    <CardContent class="flex items-start p-3">
      <div class="rounded-full p-2 border-4 border-background mx-2">
        <Cpu class="w-8 h-8" />
      </div>
      <div class="ml-2 w-full block">
        <h3 class="text-2xl font-medium">{{ controller?.did.split('-')[0] }}</h3>
        <div class="flex items-center gap-2">
          <User class="w-5 h-5" />
          <p class="font-medium">{{ controller?.owner?.username ?? '-' }}</p>
        </div>
        <div class="flex items-center gap-2">
          <Flower2 class="w-5 h-5" />
          <p class="font-medium">
            {{

            }}
          </p>
        </div>
        <div class="flex items-center gap-2">
          <Users class="w-5 h-5" />
          <p class="font-medium">Gruppe 1</p>
        </div>
      </div>
    </CardContent>
  </Card>

  <Card class="w-full mt-4 max-w-md">
    <CardContent class="flex items-center p-3">
      <div class="rounded-full p-2 border-4 border-primary mx-2">
        <Thermometer class="w-8 h-8" />
      </div>
      <div class="ml-2 w-full block">
        <h3 class="text-2xl font-medium">Temperature</h3>
        <div class="flex items-center gap-2">
          <Clock class="w-5 h-5" />
          <p class="font-medium">16:15 18.03.2025</p>
        </div>
      </div>
    </CardContent>
  </Card>

  <Card class="w-full mt-4 max-w-md">
    <CardContent class="flex items-center p-3">
      <div class="rounded-full p-2 border-4 border-primary mx-2">
        <CloudHail class="w-8 h-8" />
      </div>
      <div class="ml-2 w-full block">
        <h3 class="text-2xl font-medium">Humidity</h3>
        <div class="flex items-center gap-2">
          <Clock class="w-5 h-5" />
          <p class="font-medium">16:15 18.03.2025</p>
        </div>
      </div>
    </CardContent>
  </Card>

  <Card class="w-full mt-4 max-w-md">
    <CardContent class="flex items-center p-3">
      <div class="rounded-full p-2 border-4 border-destructive mx-2">
        <Droplet class="w-8 h-8" />
      </div>
      <div class="ml-2 w-full block">
        <h3 class="text-2xl font-medium">Soil moisture</h3>
        <div class="flex items-center gap-2">
          <Clock class="w-5 h-5" />
          <p class="font-medium">16:15 18.03.2025</p>
        </div>
      </div>
    </CardContent>
  </Card>

  <Card class="w-full mt-4 max-w-md">
    <CardContent class="flex items-center p-3">
      <div class="rounded-full p-2 border-4 border-primary mx-2">
        <Sun class="w-8 h-8" />
      </div>
      <div class="ml-2 w-full block">
        <h3 class="text-2xl font-medium">Brightness</h3>
        <div class="flex items-center gap-2">
          <Clock class="w-5 h-5" />
          <p class="font-medium">16:15 18.03.2025</p>
        </div>
      </div>
    </CardContent>
  </Card>

  <Card class="w-full mt-4 max-w-md">
    <CardContent class="flex items-center p-3">
      <div class="rounded-full p-2 border-4 border-primary mx-2">
        <Waves class="w-8 h-8" />
      </div>
      <div class="ml-2 w-full block">
        <h3 class="text-2xl font-medium">Pump</h3>
        <div class="flex items-center gap-2">
          <Clock class="w-5 h-5" />
          <p class="font-medium">16:15 18.03.2025</p>
        </div>
      </div>
    </CardContent>
  </Card>
</template>

<style scoped></style>
