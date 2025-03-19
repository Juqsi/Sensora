<script lang="ts" setup>
import type { DrawerDescriptionProps } from 'vaul-vue'
import { DrawerDescription } from 'vaul-vue'
import { cn } from '@/lib/utils'
import { computed, type HtmlHTMLAttributes } from 'vue'

const props = defineProps<DrawerDescriptionProps & { class?: HtmlHTMLAttributes['class'] }>()

const delegatedProps = computed(() => {
  const { class: _, ...delegated } = props

  return delegated
})
</script>

<template>
  <DrawerDescription
    :class="cn('text-sm text-muted-foreground', props.class)"
    v-bind="delegatedProps"
  >
    <slot />
  </DrawerDescription>
</template>
