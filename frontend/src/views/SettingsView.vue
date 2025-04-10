<script lang="ts" setup>
import { ref } from 'vue'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ChevronLeft, Languages, Lock, SunMoon } from 'lucide-vue-next'
import AccountModification from '@/components/AccountModification.vue'
import Appearance from '@/components/AppearanceForm.vue'
import LanguageForm from '@/components/LanguageForm.vue'
import {useI18n} from 'vue-i18n'
import router from '@/router'

const { t } = useI18n()

enum Views {
  MAIN = 'main',
  ACCOUNT = 'AccountModification',
  LANGUAGE = 'LanguageModification',
  APPEARANCE = 'AppearanceModification',
}

// Lokaler Zustand für die aktive Ansicht
const activeView = ref<Views>(Views.MAIN)

const ViewTitles: Record<Views, string> = {
  [Views.MAIN]: t('settings.views.MAIN'),
  [Views.ACCOUNT]: t('settings.views.ACCOUNT'),
  [Views.LANGUAGE]: t('settings.views.LANGUAGE'),
  [Views.APPEARANCE]: t('settings.views.APPEARANCE'),
}

// Methode zum Wechseln der Ansicht
const switchView = (view: Views) => {
  activeView.value = view
}
</script>

<template>
  <Card class="w-full mb-6">
    <CardHeader class="w-full flex flex-row space-x-4">
      <!-- Zurück-Button nur, wenn nicht in der Hauptansicht -->
      <Button
        class="text-muted-foreground hover:text-primary flex items-center space-x-2"
        size="icon"
        variant="ghost"
        @click="activeView !== Views.MAIN ? switchView(Views.MAIN) : router.back()"
      >
        <ChevronLeft />
      </Button>

      <CardTitle>{{ ViewTitles[activeView] }}</CardTitle>
    </CardHeader>

    <!-- Hauptansicht -->
    <CardContent v-if="activeView === 'main'" class="grid gap-1">
        <div
          class="-mx-2 flex cursor-pointer items-center space-x-4 rounded-md p-2 transition-all hover:bg-accent hover:text-accent-foreground"
          @click="switchView(Views.ACCOUNT)"
        >
          <Lock class="mt-px h-5 w-5" />
          <div class="space-y-1">
            <p class="text-md font-medium leading-none">{{t('Settings.Account')}}</p>
            <p class="text-sm text-muted-foreground">{{t('Settings.AccountDescription')}}</p>
          </div>
        </div>
        <div
          class="-mx-2 flex items-center space-x-4 rounded-md p-2 hover:bg-accent hover:text-accent-foreground transition-all"
          @click="switchView(Views.LANGUAGE)"
        >
          <Languages class="mt-px h-5 w-5" />
          <div class="space-y-1">
            <p class="text-md font-medium leading-none">{{t('Settings.Language')}}</p>
            <p class="text-sm text-muted-foreground">{{t('Settings.LanguageDescription')}}</p>
          </div>
        </div>
        <div
          class="-mx-2 flex items-center space-x-4 rounded-md p-2 transition-all hover:bg-accent hover:text-accent-foreground"
          @click="switchView(Views.APPEARANCE)"
        >
          <SunMoon class="mt-px h-5 w-5" />
          <div class="space-y-1">
            <p class="text-md font-medium leading-none">{{t('Settings.Appearance')}}</p>
            <p class="text-sm text-muted-foreground">{{t('Settings.AppearanceDescription')}}</p>
          </div>
        </div>
    </CardContent>
  </Card>
  <template v-if="activeView !== 'main'">
    <AccountModification v-if="activeView === Views.ACCOUNT" class="max-w-full" />
    <Appearance v-else-if="activeView === Views.APPEARANCE" />
    <LanguageForm v-else-if="activeView === Views.LANGUAGE" />
    <button class="text-primary hover:underline" @click="switchView(Views.MAIN)">
      {{t('settings.back')}}
    </button>
  </template>
</template>
