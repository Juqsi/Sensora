<script lang="ts" setup>
import { ref } from 'vue'
import { LineChart } from '@/components/ui/chart-line'
import CustomChartTooltip from '@/components/ui/chart-line/CustomChartTooltip.vue'

const data = [
  {
    Stunde: 10,
    Temperatur: 22.5,
    Luftfeuchtigkeit: 45,
    Bodenfeuchtigkeit: 25,
    Helligkeit: 1200,
  },
  {
    Stunde: 11,
    Temperatur: 23.8,
    Luftfeuchtigkeit: 50,
    Bodenfeuchtigkeit: 28,
    Helligkeit: 1500,
  },
  {
    Stunde: 12,
    Temperatur: 25.1,
    Luftfeuchtigkeit: 55,
    Bodenfeuchtigkeit: 30,
    Helligkeit: 1800,
  },
  {
    Stunde: 13,
    Temperatur: 26.3,
    Luftfeuchtigkeit: 52,
    Bodenfeuchtigkeit: 27,
    Helligkeit: 1700,
  },
  {
    Stunde: 14,
    Temperatur: 24.7,
    Luftfeuchtigkeit: 49,
    Bodenfeuchtigkeit: 26,
    Helligkeit: 1600,
  },
]
</script>

<template>
  <LineChart
    :categories="['Temperatur', 'Luftfeuchtigkeit', 'Bodenfeuchtigkeit', 'Helligkeit']"
    :colors="['#2B82F6', '#F59E0B', '#34D399', '#FBBF24']"
    :custom-tooltip="CustomChartTooltip"
    :data="data"
    :show-y-axis="true"
    :y-formatter="
      (tick, i) => {
        if (typeof tick === 'number') {
          if (i === 0) {
            return `${tick}°C` // Temperatur
          } else if (i === 1) {
            return `${tick}%` // Luftfeuchtigkeit
          } else if (i === 2) {
            return `${tick}%` // Bodenfeuchtigkeit
          } else if (i === 3) {
            return `${tick} Lumen` // Helligkeit
          }
        }
        return ''
      }
    "
    index="Stunde"
  />
</template>
