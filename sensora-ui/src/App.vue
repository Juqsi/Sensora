<script lang="ts" setup>
import { RouterView } from 'vue-router'
import BottomNavBar from '@/components/BottomNavBar.vue'
import { Toaster } from 'vue-sonner'
</script>

<template>
  <RouterView />
  <bottom-nav-bar v-if="$route.path !== '/signup' && $route.path !== '/signin'" />
  <Toaster />
</template>

<style scoped></style>
