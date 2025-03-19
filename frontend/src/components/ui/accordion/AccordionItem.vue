<script lang="ts" setup>
import { cn } from '@/lib/utils'
import { AccordionItem, type AccordionItemProps, useForwardProps } from 'radix-vue'
import { computed, type HTMLAttributes } from 'vue'

const props = defineProps<AccordionItemProps & { class?: HTMLAttributes['class'] }>()

const delegatedProps = computed(() => {
  const { class: _, ...delegated } = props

  return delegated
})

const forwardedProps = useForwardProps(delegatedProps)
</script>

<template>
  <AccordionItem :class="cn('border-b', props.class)" v-bind="forwardedProps">
    <slot />
  </AccordionItem>
</template>
