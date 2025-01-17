<script lang="ts" setup>
import { ref } from 'vue'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ChevronLeft, Languages, Lock, SunMoon } from 'lucide-vue-next'
import AccountModification from '@/components/AccountModification.vue'
import Appearance from '@/components/AppearanceForm.vue'
import LanguageForm from '@/components/LanguageForm.vue'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Separator } from '@/components/ui/separator'
import SinglePlantView from '@/views/SinglePlantView.vue'

enum Views {
  MAIN = 'main',
  ACCOUNT = 'AccountModification',
  LANGUAGE = 'LanguageModification',
  APPEARANCE = 'AppearanceModification',
}

// Lokaler Zustand für die aktive Ansicht
const activeView = ref<Views>(Views.MAIN)

const ViewTitles: Record<Views, string> = {
  [Views.MAIN]: 'Settings',
  [Views.ACCOUNT]: 'Account Settings',
  [Views.LANGUAGE]: 'Language Settings',
  [Views.APPEARANCE]: 'Appearance',
}

// Methode zum Wechseln der Ansicht
const switchView = (view: Views) => {
  activeView.value = view
}
</script>

<template>
  <Card class="w-full">
    <CardHeader class="w-full flex flex-row space-x-4">
      <!-- Zurück-Button nur, wenn nicht in der Hauptansicht -->
      <Button
        v-if="activeView !== Views.MAIN"
        class="text-muted-foreground hover:text-primary flex items-center space-x-2"
        size="icon"
        variant="ghost"
        @click="switchView(Views.MAIN)"
      >
        <ChevronLeft />
      </Button>

      <CardTitle>{{ ViewTitles[activeView] }}</CardTitle>
    </CardHeader>

    <CardContent class="grid gap-1">
      <!-- Hauptansicht -->
      <template v-if="activeView === 'main'">
        <router-link to="plants">
          <div
            class="-mx-2 flex cursor-pointer items-start space-x-4 rounded-md p-2 transition-all hover:bg-accent hover:text-accent-foreground"
          >
            <Avatar class="mt-px h-10 w-10">
              <AvatarFallback>P1</AvatarFallback>
            </Avatar>
            <div class="space-y-1">
              <p class="text-sm font-medium leading-none">Pflanze Bernd</p>
              <p class="text-sm text-muted-foreground">Hallo 123</p>
              <Badge class="m-1">Badge</Badge>
              <Badge class="m-1">Badge</Badge>
            </div>
          </div>
        </router-link>

        <separator></separator>
        <div
          class="-mx-2 flex cursor-pointer items-start space-x-4 rounded-md p-2 transition-all hover:bg-accent hover:text-accent-foreground"
          @click="switchView(Views.ACCOUNT)"
        >
          <Avatar class="mt-px h-10 w-10">
            <AvatarFallback>P1</AvatarFallback>
          </Avatar>
          <div class="space-y-1">
            <p class="text-sm font-medium leading-none">Pflanze Bernd</p>
            <p class="text-sm text-muted-foreground">Hallo 123</p>
            <Badge class="m-1">Badge</Badge>
            <Badge class="m-1">Badge</Badge>
          </div>
        </div>
        <separator></separator>
        <div
          class="-mx-2 flex cursor-pointer items-start space-x-4 rounded-md p-2 transition-all hover:bg-accent hover:text-accent-foreground"
          @click="switchView(Views.ACCOUNT)"
        >
          <Avatar class="mt-px h-10 w-10">
            <AvatarFallback>P1</AvatarFallback>
          </Avatar>
          <div class="space-y-1">
            <p class="text-sm font-medium leading-none">Pflanze Bernd</p>
            <p class="text-sm text-muted-foreground">Hallo 123</p>
            <Badge class="m-1">Badge</Badge>
            <Badge class="m-1">Badge</Badge>
          </div>
        </div>
      </template>
      <template v-if="activeView !== 'main'">
        <SinglePlantView v-if="activeView === Views.ACCOUNT" />
        <Appearance v-else-if="activeView === Views.APPEARANCE" />
        <LanguageForm v-else-if="activeView === Views.LANGUAGE" />
        <button class="text-primary hover:underline" @click="switchView(Views.MAIN)">
          Back to Settings
        </button>
      </template>
    </CardContent>
  </Card>
</template>
