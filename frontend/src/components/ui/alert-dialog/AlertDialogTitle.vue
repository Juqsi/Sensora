<script lang="ts" setup>
import { cn } from '@/lib/utils'
import { AlertDialogTitle, type AlertDialogTitleProps } from 'radix-vue'
import { computed, type HTMLAttributes } from 'vue'

const props = defineProps<AlertDialogTitleProps & { class?: HTMLAttributes['class'] }>()

const delegatedProps = computed(() => {
  const { class: _, ...delegated } = props

  return delegated
})
</script>

<template>
  <AlertDialogTitle :class="cn('text-lg font-semibold', props.class)" v-bind="delegatedProps">
    <slot />
  </AlertDialogTitle>
</template>
