<script setup lang="ts">
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { Info } from 'lucide-vue-next'
import { ref, onMounted, onBeforeUnmount } from 'vue'

defineProps<{
  message: string
  side?: 'top' | 'bottom' | 'left' | 'right'
}>()

const open = ref(false)
const buttonRef = ref<HTMLButtonElement | null>(null)

const handleClickOutside = (event: MouseEvent) => {
  if (open.value && buttonRef.value && !buttonRef.value.contains(event.target as Node)) {
    open.value = false
  }
}

onMounted(() => {
  document.addEventListener('click', handleClickOutside)
})

onBeforeUnmount(() => {
  document.removeEventListener('click', handleClickOutside)
})
</script>

<template>
  <TooltipProvider>
    <Tooltip :open="open" @update:open="open = $event">
      <TooltipTrigger as-child>
        <button
          ref="buttonRef"
          type="button"
          class="p-0 m-0 bg-transparent border-none"
          @click.stop="open = !open"
        >
          <Info class="h-4 w-4 text-muted-foreground cursor-pointer" />
        </button>
      </TooltipTrigger>
      <TooltipContent :side="side ?? 'top'" class="max-w-xs">
        <p class="text-sm text-muted-foreground">
          {{ message }}
        </p>
      </TooltipContent>
    </Tooltip>
  </TooltipProvider>
</template>
