<script generic="T extends Record<string, any>" lang="ts" setup>
import type { BaseChartProps } from '.'
import { ChartCrosshair, ChartLegend, defaultColors } from '@/components/ui/chart'
import { cn } from '@/lib/utils'
import { Axis, type BulletLegendItemInterface, CurveType, Line } from '@unovis/ts'
import { VisAxis, VisLine, VisXYContainer } from '@unovis/vue'
import { useMounted } from '@vueuse/core'
import { type Component, computed, onBeforeUnmount, onMounted, ref } from 'vue'
import {useI18n} from 'vue-i18n'

const {t} = useI18n()

const props = withDefaults(
  defineProps<
    BaseChartProps<T> & {
      /**
       * Render custom tooltip component.
       */
      customTooltip?: Component
      /**
       * Type of curve
       */
      curveType?: CurveType
      tickValuesX?: Array<number>
    }
  >(),
  {
    curveType: CurveType.MonotoneX,
    filterOpacity: 0.2,
    margin: () => ({ top: 0, bottom: 0, left: 0, right: 0 }),
    showXAxis: true,
    showYAxis: true,
    showTooltip: true,
    showLegend: true,
    showGridLine: true,
  },
)

const emits = defineEmits<{
  legendItemClick: [d: BulletLegendItemInterface, i: number]
}>()

type KeyOfT = Extract<keyof T, string>
type Data = (typeof props.data)[number]

const index = computed(() => props.index as KeyOfT)
const colors = computed(() =>
  props.colors?.length ? props.colors : defaultColors(props.categories.length),
)

const legendItems = computed<BulletLegendItemInterface[]>(() => {
  return props.categories.map((category, i) => ({
    name: t(category),
    color: colors.value[i],
    inactive: false,
  }))
})

const isMounted = useMounted()
const chartContainer = ref<HTMLElement | null>(null)

function handleLegendItemClick(d: BulletLegendItemInterface, i: number) {
  emits('legendItemClick', d, i)
}

// Touch-Unterstützung für Tooltip
const handleTouchMove = (event: TouchEvent | PointerEvent) => {
  if (!chartContainer.value) return

  const rect = chartContainer.value.getBoundingClientRect()
  const xPos = 'touches' in event ? event.touches[0].clientX : event.clientX
  const yPos = 'touches' in event ? event.touches[0].clientY : event.clientY

  // Prüfen, ob Touch innerhalb des Diagramms ist
  if (xPos >= rect.left && xPos <= rect.right && yPos >= rect.top && yPos <= rect.bottom) {
    event.preventDefault() // Verhindert unerwünschtes Scrollen
  }
}

onMounted(() => {
  if (chartContainer.value) {
    chartContainer.value.addEventListener('pointermove', handleTouchMove, { passive: false })
    chartContainer.value.addEventListener('touchmove', handleTouchMove, { passive: false })
  }
})

onBeforeUnmount(() => {
  if (chartContainer.value) {
    chartContainer.value.removeEventListener('pointermove', handleTouchMove)
    chartContainer.value.removeEventListener('touchmove', handleTouchMove)
  }
})
</script>

<template>
  <div
    ref="chartContainer"
    :class="cn('w-full h-[400px] flex flex-col items-end', $attrs.class ?? '')"
    style="touch-action: none"
  >
    <ChartLegend
      v-if="showLegend"
      v-model:items="legendItems"
      @legend-item-click="handleLegendItemClick"
    />

    <VisXYContainer
      :data="data"
      :margin="{ left: 20, right: 20 }"
      :style="{ height: isMounted ? '100%' : 'auto' }"
    >
      <ChartCrosshair
        v-if="showTooltip"
        :colors="colors"
        :custom-tooltip="customTooltip"
        :index="index"
        :items="legendItems"
        :x-formatter="xFormatter"
        :y-formatter="yFormatter"
      />

      <template v-for="(category, i) in categories" :key="category">
        <VisLine
          :attributes="{
            [Line.selectors.line]: {
              opacity: legendItems.find((item) => item.name === category)?.inactive
                ? filterOpacity
                : 1,
            },
          }"
          :color="colors[i]"
          :curve-type="curveType"
          :x="(d) => d?.[props.index]"
          :y="(d) => d[category]"
        />
      </template>

      <VisAxis
        v-if="showXAxis"
        :grid-line="false"
        :tick-format="xFormatter ?? ((v: number) => data[v]?.[index])"
        :tick-line="false"
        :tickValues="props.tickValuesX"
        tick-text-color="hsl(var(--vis-text-color))"
        type="x"
      />
      <VisAxis
        v-if="showYAxis"
        :attributes="{ [Axis.selectors.grid]: { class: 'text-muted' } }"
        :domain-line="false"
        :grid-line="showGridLine"
        :tick-format="yFormatter"
        :tick-line="false"
        tick-text-color="hsl(var(--vis-text-color))"
        type="y"
      />

      <slot />
    </VisXYContainer>
  </div>
</template>
