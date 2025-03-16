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
  console.log(typeof tick)
  console.log(
    new Date(tick).toLocaleTimeString('de-DE', {
      hour: '2-digit',
      minute: '2-digit',
    }),
  )
  console.log(tick)
  if (typeof tick === 'number') {
    return new Date(tick).toLocaleTimeString('de-DE', {
      hour: '2-digit',
      minute: '2-digit',
    })
  }
  return ''
}

// Berechnung der Y-Achsen-Skala (die den maximalen und minimalen Wert abdeckt)
const yDomain = computed(() => {
  const allValues = props.data.values.flatMap((item) => Object.values(item).filter((value) => true))
  const minValue = Math.min(...allValues)
  const maxValue = Math.max(...allValues)
  return [minValue - (maxValue - minValue) * 0.05, maxValue + (maxValue - minValue) * 0.05]
})
</script>

<template>
  <LineChart
    :categories="[props.data.ilk]"
    :custom-tooltip="CustomChartTooltip"
    :data="props.data.values"
    :y-formatter="yFormatter"
    index="timestamp"
    :y-domain="yDomain"
    :x-formatter="xFormatter"
  />
</template>
