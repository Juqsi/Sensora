<script setup lang="ts">
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import {
  CloudHail,
  Droplet,
  SquareActivity,
  Sun,
  Thermometer,
  Siren,
  Wrench,
  TriangleAlert,
  WifiOff,
} from 'lucide-vue-next'

defineProps({
  error: boolean,
})
</script>

<template>
  <Card>
    <CardHeader class="text-lg py-4">Pflanze Berta</CardHeader>
    <CardContent>
      <div class="grid gap-4 grid-cols-2">
        <div class="grid gap-2 iconWithLabel">
          <Thermometer id="temperature" />
          <Label for="temperature"> 20</Label>
        </div>
        <div class="grid gap-2 iconWithLabel">
          <CloudHail id="humidity" />
          <Label for="humidity">50 </Label>
        </div>
        <div class="grid gap-2 iconWithLabel">
          <Sun id="light" />
          <Label for="light">100</Label>
        </div>
        <div class="grid gap-2 iconWithLabel">
          <Droplet id="water" />
          <Label for="light">10</Label>
        </div>
      </div>
      <div v-if="error" class="grid gap-4 grid-cols-2">
        <Badge variant="destructive"> <WifiOff /></Badge>
        <Badge variant="destructive"> <TriangleAlert /></Badge>
        <Badge variant="destructive"> <Siren /></Badge>
        <Badge variant="destructive"><Wrench /></Badge>
      </div>
    </CardContent>
  </Card>
</template>

<style scoped>
.iconWithLabel {
  @apply flex items-center justify-center;
}
</style>
