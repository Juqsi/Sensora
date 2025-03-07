<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { Button } from '@/components/ui/button'
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
  <router-link to="/">
    <Button variant="link"> Home </Button>
  </router-link>
</template>

<style scoped></style>
