<script lang="ts" setup>
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'
import { ChevronLeft } from 'lucide-vue-next'

const router = useRouter()

defineProps({
  title: { type: String, required: true },
  subTitle: String,
})

const { t } = useI18n()
</script>

<template>
  <Card class="w-full">
    <CardHeader>
      <div class="flex justify-between w-full">
        <div class="flex items-center justify-start space-x-4">
          <Button
            class="text-muted-foreground hover:text-primary flex items-center space-x-2"
            size="icon"
            variant="ghost"
            @click="router.back()"
          >
            <chevron-left />
          </Button>
          <div>
            <CardTitle>{{ title }}</CardTitle>
            <CardDescription>{{ subTitle }}</CardDescription>
          </div>
        </div>
        <div class="flex items-center">
          <slot name="TitleRight" />
        </div>
      </div>
    </CardHeader>
    <slot />
  </Card>
</template>

<style scoped></style>
