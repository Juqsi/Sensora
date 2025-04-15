<script lang="ts" setup>
import { RouterView } from 'vue-router'
import BottomNavBar from '@/components/BottomNavBar.vue'
import { Toaster } from 'vue-sonner'
import { useColorMode } from '@vueuse/core'
import { App as CapacitorApp } from '@capacitor/app'
import { useAuthStore } from '@/stores'

const mode = useColorMode()

CapacitorApp.addListener('backButton', ({ canGoBack }) => {
  if (!canGoBack) {
    CapacitorApp.exitApp()
  } else {
    window.history.back()
  }
})
</script>

<template>
    <div class="xl:p-8 p-4 xl:max-w-6xl flex flex-col items-center mb-4 mx-auto">
      <router-view />
    </div>
    <bottom-nav-bar v-if="useAuthStore().isAuthenticated" />
    <Toaster :theme="mode === 'dark' ? 'dark' : 'light'" position="top-center" richColors />
</template>

<style scoped></style>
