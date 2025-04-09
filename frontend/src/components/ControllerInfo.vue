<script lang="ts" setup>
import { Cpu, Flower2, User, Users } from 'lucide-vue-next'
import { Card, CardContent } from '@/components/ui/card'
import type { Controller, Plant } from '@/api'
import {usePlantStore} from '@/stores'
import { latestSensorValue } from '@/composables/useLatestSensorValue.ts'
import {computed} from 'vue'

const plantStore = usePlantStore()
const props = defineProps<{
  controller: Controller
}>()

</script>

<template>
  <Card class="w-full mt-4">
    <CardContent class="flex items-start p-3">
      <div class="rounded-full p-2 border-4 border-background mx-2">
        <Cpu class="w-8 h-8" />
      </div>
      <div class="ml-2 w-full block">
        <h3 class="text-2xl font-medium">{{ controller.did.split('-')[0] }}</h3>

        <div class="flex items-center gap-2">
          <User class="w-5 h-5" />
          <p class="font-medium">{{ controller.owner?.username ?? '-' }}</p>
        </div>
      </div>
    </CardContent>
  </Card>
</template>
