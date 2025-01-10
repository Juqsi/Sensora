<script lang="ts" setup>
// Importiere die Lucide-Icons
import { HeartIcon, HomeIcon, SearchIcon, UserIcon } from 'lucide-vue-next'
</script>

<template>
  <div class="h-screen flex flex-col justify-between bg-background">
    <div
      class="fixed bottom-0 left-0 right-0 border-muted-background border-t-2 mx-auto w-full bg-background rounded-lg shadow-lg p-4"
    >
      <div class="grid grid-cols-4 gap-4">
        <router-link
          :class="{ 'text-primary': $route.path === '/' }"
          class="flex flex-col items-center"
          to="/"
        >
          <HomeIcon class="w-6 h-6" />
        </router-link>

        <router-link
          :class="{ 'text-primary': $route.path === '/search' }"
          class="flex flex-col items-center"
          to="/search"
        >
          <SearchIcon class="w-6 h-6" />
        </router-link>

        <router-link
          :class="{ 'text-primary': $route.path === '/favorites' }"
          class="flex flex-col items-center"
          to="/favorites"
        >
          <HeartIcon class="w-6 h-6" />
        </router-link>

        <router-link
          :class="{ 'text-primary': $route.path === '/profile' }"
          class="flex flex-col items-center"
          to="/profile"
        >
          <UserIcon class="w-6 h-6" />
        </router-link>
      </div>
    </div>
  </div>
</template>

<style scoped></style>
