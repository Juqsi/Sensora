<script lang="ts" setup>
import type { StepperTriggerProps } from 'radix-vue'
import { StepperTrigger, useForwardProps } from 'radix-vue'
import { cn } from '@/lib/utils'

import { computed, type HTMLAttributes } from 'vue'

const props = defineProps<StepperTriggerProps & { class?: HTMLAttributes['class'] }>()

const delegatedProps = computed(() => {
  const { class: _, ...delegated } = props

  return delegated
})

const forwarded = useForwardProps(delegatedProps)
</script>

<template>
  <StepperTrigger
    :class="cn('p-2 flex flex-col items-center text-center gap-2 rounded-md', props.class)"
    v-bind="forwarded"
  >
    <slot />
  </StepperTrigger>
</template>
