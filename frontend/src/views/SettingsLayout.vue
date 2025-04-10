<script setup lang="ts">
import { useRoute, useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import {computed} from 'vue'
import NavCard from '@/components/NavCard.vue'

const { t } = useI18n()
const route = useRoute()

const currentTitle = computed(() => {
  switch (route.name) {
    case 'SettingsAccount':
      return t('settings.views.ACCOUNT')
    case 'SettingsLanguage':
      return t('settings.views.LANGUAGE')
    case 'SettingsAppearance':
      return t('settings.views.APPEARANCE')
    case 'SettingsPicture':
      return t('settings.views.PICTURE')
    default:
      return t('settings.views.MAIN')
  }
})
</script>

<template>
  <NavCard :title="currentTitle">
    <RouterView />
  </NavCard>


</template>
