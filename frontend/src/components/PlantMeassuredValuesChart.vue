<script lang="ts" setup>
import { LineChart } from '@/components/ui/chart-line'
import CustomChartTooltip from '@/components/ui/chart-line/CustomChartTooltip.vue'
defineProps<{
  data: Record<string, any>[]
}>()
</script>

<template>
  <LineChart
    :categories="['Export Growth Rate', 'Import Growth Rate']"
    :colors="['#2B82F6', '#F59E0B']"
    :custom-tooltip="CustomChartTooltip"
    :data="data"
    :y-formatter="
      (tick, i) => {
        return typeof tick === 'number'
          ? `$ ${new Intl.NumberFormat('us').format(tick).toString()}`
          : ''
      }
    "
    index="year"
  />
</template>
