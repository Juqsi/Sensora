<script lang="ts" setup>
import type { DrawerTitleProps } from 'vaul-vue'
import { DrawerTitle } from 'vaul-vue'
import { cn } from '@/lib/utils'
import { computed, type HtmlHTMLAttributes } from 'vue'

const props = defineProps<DrawerTitleProps & { class?: HtmlHTMLAttributes['class'] }>()

const delegatedProps = computed(() => {
  const { class: _, ...delegated } = props

  return delegated
})
</script>

<template>
  <DrawerTitle
    :class="cn('text-lg font-semibold leading-none tracking-tight', props.class)"
    v-bind="delegatedProps"
  >
    <slot />
  </DrawerTitle>
</template>
