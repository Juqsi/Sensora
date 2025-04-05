<script lang="ts" setup>
import { cn } from '@/lib/utils'
import { TagsInputInput, type TagsInputInputProps, useForwardProps } from 'reka-ui'
import { computed, type HTMLAttributes } from 'vue'

const props = defineProps<TagsInputInputProps & { class?: HTMLAttributes['class'] }>()

const delegatedProps = computed(() => {
  const { class: _, ...delegated } = props

  return delegated
})

const forwardedProps = useForwardProps(delegatedProps)
</script>

<template>
  <TagsInputInput
    :class="cn('text-sm min-h-6 focus:outline-hidden flex-1 bg-transparent px-1', props.class)"
    v-bind="forwardedProps"
  />
</template>
