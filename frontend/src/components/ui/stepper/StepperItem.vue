<script lang="ts" setup>
import type { StepperItemProps } from 'radix-vue'
import { StepperItem, useForwardProps } from 'radix-vue'
import { cn } from '@/lib/utils'

import { computed, type HTMLAttributes } from 'vue'

const props = defineProps<StepperItemProps & { class?: HTMLAttributes['class'] }>()

const delegatedProps = computed(() => {
  const { class: _, ...delegated } = props

  return delegated
})

const forwarded = useForwardProps(delegatedProps)
</script>

<template>
  <StepperItem
    v-slot="slotProps"
    :class="cn('flex items-center gap-2 group data-disabled:pointer-events-none', props.class)"
    v-bind="forwarded"
  >
    <slot v-bind="slotProps" />
  </StepperItem>
</template>
