<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import EmtyState from '@/components/EmtyState.vue'

const { t } = useI18n()
</script>

<template>
  <EmtyState
    :title="t('404view.title')"
    :condition="true"
    :subtitle="t('404view.subtitle')"
    img-src="/svg/undraw_page-not-found_6wni.svg"
  />
</template>

<style scoped></style>
