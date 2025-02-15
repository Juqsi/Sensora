<script lang="ts" setup>
import { RouterView } from 'vue-router'
import BottomNavBar from '@/components/BottomNavBar.vue'
import { Toaster } from 'vue-sonner'
</script>

<template>
  <div class="app-container">
    <router-view />
  </div>
  <bottom-nav-bar v-if="$route.path !== '/signup' && $route.path !== '/signin'" />
  <Toaster richColors />
</template>

<style scoped>
.app-container {
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  align-items: center;
  padding: 16px;
  box-sizing: border-box;
}

@media (min-width: 768px) {
  .app-container {
    max-width: 900px;
    margin: 0 auto;
    padding: 32px;
  }
}

@media (min-width: 1024px) {
  .app-container {
    max-width: 1200px;
    padding: 40px;
  }
}
</style>
