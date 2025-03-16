<script setup lang="ts">
import type { BulletLegendItemInterface } from '@unovis/ts'
import { omit } from '@unovis/ts'
import { VisCrosshair, VisTooltip } from '@unovis/vue'
import { type Component, createApp } from 'vue'
import { ChartTooltip } from '.'

const props = withDefaults(
  defineProps<{
    colors: string[]
    index: string
    items: BulletLegendItemInterface[]
    customTooltip?: Component
    xFormatter?: (tick: number | Date, i: number, ticks: number[] | Date[]) => string
    yFormatter?: (tick: number | Date, i: number, ticks: number[] | Date[]) => string
  }>(),
  {
    colors: () => [],
  },
)

// Use weakmap to store reference to each datapoint for Tooltip
const wm = new WeakMap()
function template(d: any) {
  if (wm.has(d)) {
    return wm.get(d)
  } else {
    const componentDiv = document.createElement('div')
    const omittedData = Object.entries(omit(d, [props.index])).map(([key, value]) => {
      const legendReference = props.items.find((i) => i.name === key)
      return {
        ...legendReference,
        value: props.yFormatter ? props.yFormatter(value, 0, []) : value,
      }
    })
    const TooltipComponent = props.customTooltip ?? ChartTooltip
    const formattedXValue = props.xFormatter
      ? props.xFormatter(d[props.index], 0, [])
      : d[props.index]
    createApp(TooltipComponent, { title: formattedXValue.toString(), data: omittedData }).mount(
      componentDiv,
    )
    wm.set(d, componentDiv.innerHTML)
    return componentDiv.innerHTML
  }
}

function color(d: unknown, i: number) {
  return props.colors[i] ?? 'transparent'
}
</script>

<template>
  <VisTooltip :horizontal-shift="20" :vertical-shift="20" />
  <VisCrosshair :template="template" :color="color" />
</template>
