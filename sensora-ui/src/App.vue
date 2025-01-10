<script lang="ts" setup>
import { RouterView } from 'vue-router'
import BottomNavBar from '@/components/BottomNavBar.vue'
</script>

<template>
  <RouterView />
  <bottom-nav-bar v-if="$route.path !== '/signup' && $route.path !== '/signin'" />
</template>

<style scoped></style>
