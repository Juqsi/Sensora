<script lang="ts" setup>
import { LineChart } from '@/components/ui/chart-line'
import CustomChartTooltip from '@/components/ui/chart-line/CustomChartTooltip.vue'
import { useI18n } from 'vue-i18n'
import { ref, computed, type PropType } from 'vue'
import { ilk } from '@/api'

const { locale } = useI18n()

const props = defineProps({
  data: {
    type: Object as PropType<{
      values: { timestamp: number; [key: string]: number }[]
      ilk: ilk
      unit: string
    }>,
    required: true,
  },
})

// Formatierung der Y-Achse
const yFormatter = (tick: number | Date, i: number, ticks: (number | Date)[]) => {
  return typeof tick === 'number' ? tick.toFixed(1) + ' ' + (props.data.unit || '') : ''
}

// Formatierung der X-Achse für Zeit
const xFormatter = (tick: number | Date, i: number, ticks: (number | Date)[]) => {
  if (typeof tick === 'number') {
    return new Date(props.data.values[tick]?.timestamp).toLocaleTimeString(locale.value, {
      hour: '2-digit',
      minute: '2-digit',
    })
  }
  return ''
}
</script>

<template>
  <LineChart
    :categories="[props.data.ilk]"
    :custom-tooltip="CustomChartTooltip"
    :data="props.data.values"
    :y-formatter="yFormatter"
    index="timestamp"
    :x-formatter="xFormatter"
  />
</template>
