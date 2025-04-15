<script lang="ts" setup>
import { buttonVariants } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { AlertDialogAction, type AlertDialogActionProps } from 'radix-vue'
import { computed, type HTMLAttributes } from 'vue'

const delegatedProps = computed(() => {
  const { class: _, ...delegated } = props

  return delegated
})

const props = defineProps<
  AlertDialogActionProps & {
    class?: HTMLAttributes['class']
    variant?: 'default' | 'destructive' | 'outline' | 'ghost'
  }
>()
</script>

<template>
  <AlertDialogAction
    :class="cn(buttonVariants({ variant: props.variant || 'default' }), props.class)"
    v-bind="delegatedProps"
  >
    <slot />
  </AlertDialogAction>
</template>
