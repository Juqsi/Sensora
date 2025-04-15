<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'
import { Lock, Languages, SunMoon, SquareUser } from 'lucide-vue-next'

const { t } = useI18n()
const router = useRouter()
</script>

<template>
  <div class="grid gap-2 px-8 pb-8">
    <div
      class="-mx-2 flex cursor-pointer items-center space-x-4 rounded-md p-2 hover:bg-accent hover:text-accent-foreground transition"
      @click="router.push('/settings/account')"
    >
      <Lock class="h-5 w-5" />
      <div>
        <p class="text-md font-medium">{{ t('Settings.AccountData') }}</p>
        <p class="text-sm text-muted-foreground">{{ t('Settings.AccountDataDescription') }}</p>
      </div>
    </div>
    <div
      class="-mx-2 flex cursor-pointer items-center space-x-4 rounded-md p-2 hover:bg-accent hover:text-accent-foreground transition"
      @click="router.push('/settings/picture')"
    >
      <SquareUser class="h-5 w-5" />
      <div>
        <p class="text-md font-medium">{{ t('Settings.Picture') }}</p>
        <p class="text-sm text-muted-foreground">{{ t('Settings.PictureDescription') }}</p>
      </div>
    </div>

    <div
      class="-mx-2 flex cursor-pointer items-center space-x-4 rounded-md p-2 hover:bg-accent hover:text-accent-foreground transition"
      @click="router.push('/settings/language')"
    >
      <Languages class="h-5 w-5" />
      <div>
        <p class="text-md font-medium">{{ t('Settings.Language') }}</p>
        <p class="text-sm text-muted-foreground">{{ t('Settings.LanguageDescription') }}</p>
      </div>
    </div>

    <div
      class="-mx-2 flex cursor-pointer items-center space-x-4 rounded-md p-2 hover:bg-accent hover:text-accent-foreground transition"
      @click="router.push('/settings/appearance')"
    >
      <SunMoon class="h-5 w-5" />
      <div>
        <p class="text-md font-medium">{{ t('Settings.Appearance') }}</p>
        <p class="text-sm text-muted-foreground">{{ t('Settings.AppearanceDescription') }}</p>
      </div>
    </div>
  </div>
</template>
