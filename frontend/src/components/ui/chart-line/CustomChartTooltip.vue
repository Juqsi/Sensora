<script lang="ts" setup>
import { Card, CardContent } from '@/components/ui/card'

defineProps<{
  title?: string
  data: {
    groupName: string
    color: string
    value: any
  }[]
}>()
</script>

<template>
  <Card class="text-sm">
    <CardContent class="p-3 min-w-[180px] flex flex-col gap-2">
      <div v-for="(item, key) in data" :key="key" class="flex justify-between items-center">
        <div class="flex items-center">
          <span :style="{ background: item.color }" class="w-1 h-7 mr-4 rounded-full" />
          <span>{{ title }}</span>
        </div>
        <span class="font-semibold ml-4">{{ item.value }}</span>
      </div>
    </CardContent>
  </Card>
</template>
