<script lang="ts" setup>
import HomeCard from '@/components/HomeCard.vue'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { CirclePlus } from 'lucide-vue-next'
</script>

<template>
  <div class="w-full flex justify-between">
    <div>
      <h1 class="font-bold text-2xl">Hello Justus 👋</h1>
      <p class="text-sm text-muted-foreground">Overview of all rooms</p>
    </div>
    <Avatar>
      <AvatarImage
        alt="Justus Siegert"
        src="https://avatars.githubusercontent.com/u/91261422?v=4&size=64"
      />
      <AvatarFallback>JS</AvatarFallback>
    </Avatar>
  </div>
  <div class="w-full mt-2">
    <div class="flex justify-between items-center">
      <h3 class="text-lg my-2">Zimmer 1</h3>
      <Button aria-label="Zimmer Hinzufügen" variant="default" size="icon"><CirclePlus /></Button>
    </div>
    <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-4">
      <HomeCard v-for="x in 10"></HomeCard>
    </div>
  </div>
</template>
