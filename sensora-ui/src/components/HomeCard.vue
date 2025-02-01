<script setup lang="ts">
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import {
  CloudHail,
  Droplet,
  Siren,
  SquareActivity,
  Stethoscope,
  Sun,
  Thermometer,
  TriangleAlert,
  WifiOff,
  Wrench,
} from 'lucide-vue-next'
</script>

<template>
  <Card>
    <CardHeader class="text-md">Pflanze Berta</CardHeader>
    <CardContent>
      <div class="grid gap-4 grid-cols-4">
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
          <Label for="light">1000</Label>
        </div>
      </div>
    </CardContent>
    <card-footer>
      <Badge variant="destructive"> <WifiOff /></Badge>
      <Badge variant="destructive"> <TriangleAlert /></Badge>
      <Badge variant="destructive"> <Stethoscope /></Badge>
      <Badge variant="destructive"> <Siren /></Badge>
      <Badge variant="destructive"><Wrench /></Badge>
      <Badge variant="outline"><SquareActivity /></Badge>
    </card-footer>
  </Card>
</template>

<style scoped>
.iconWithLabel {
  @apply flex items-center justify-center;
}
</style>
