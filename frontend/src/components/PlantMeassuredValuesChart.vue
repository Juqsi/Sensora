<script lang="ts" setup>
import { LineChart } from '@/components/ui/chart-line'
import CustomChartTooltip from '@/components/ui/chart-line/CustomChartTooltip.vue'
import { useI18n } from 'vue-i18n'
import { computed, type PropType } from 'vue'
import { ilk } from '@/api'

const { locale, t } = useI18n()

const props = defineProps({
  data: {
    type: Object as PropType<{
      values: { timestamp: number; targetValue: number ;[key: string]: number }[]
      ilk: ilk
      unit: string
    }>,
    required: true,
  },
})

const categories = computed<string[]>(()=>{
  if (props.data.values[0]  === undefined|| props.data.values[0].targetValue === -1 ){
    return [props.data.ilk]
  }
  return [props.data.ilk, 'targetValue']
})

// Formatierung der Y-Achse
const yFormatter = (tick: number | Date) => {
  return typeof tick === 'number' ? tick.toFixed(1) + ' ' + (props.data.unit || '') : ''
}

// Formatierung der X-Achse für Zeit
const xFormatter = (tick: number | Date) => {
  if (typeof tick === 'number') {
    return new Date(tick).toLocaleTimeString(locale.value, {
      hour: '2-digit',
      minute: '2-digit',
    })
  }
  return ''
}

// Hilfsfunktion zum Runden auf die nächste oder vorherige Viertelstunde
const roundToQuarterHour = (timestamp: number, direction: 'up' | 'down'): number => {
  const date = new Date(timestamp)
  const minutes = date.getMinutes()
  const remainder = minutes % 15
  if (remainder === 0) return timestamp

  if (direction === 'up') {
    date.setMinutes(minutes + (15 - remainder), 0, 0)
  } else {
    date.setMinutes(minutes - remainder, 0, 0)
  }

  return date.getTime()
}

// Berechnet dynamisch die Tick-Werte für die X-Achse basierend auf der Bildschirmgröße
const calculateXTicks = (data: { timestamp: number }[]): number[] => {
  if (!data.length) return []

  const timestamps = data.map((d) => d.timestamp)
  const minTime = Math.min(...timestamps)
  const maxTime = Math.max(...timestamps)

  const roundedMin = roundToQuarterHour(minTime, 'down')
  const roundedMax = roundToQuarterHour(maxTime, 'up')

  const screenWidth = window.innerWidth
  const numTicks = screenWidth <= 768 ? 4 : 7

  const ticks: number[] = []
  for (let i = 0; i < numTicks; i++) {
    const fraction = i / (numTicks - 1)
    const tickTime = roundedMin + fraction * (roundedMax - roundedMin)
    ticks.push(roundToQuarterHour(tickTime, 'up')) // Immer auf die nächste Viertelstunde runden
  }

  return [...new Set(ticks)] // Duplikate entfernen
}

const tickValuesX = computed(() => calculateXTicks(props.data.values))
</script>

<template>
  <LineChart
    :categories="categories"
    :custom-tooltip="CustomChartTooltip"
    :data="props.data.values"
    :tick-values-x="tickValuesX"
    :x-formatter="xFormatter"
    :y-formatter="yFormatter"
    index="timestamp"
  />
</template>
