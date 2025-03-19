<script lang="ts" setup>
import { Flower2, HomeIcon, Users } from 'lucide-vue-next'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { onBeforeUnmount, onMounted, ref } from 'vue'

const isKeyboardOpen = ref(false)
let initialHeight = window.innerHeight // Speichert die ursprüngliche Höhe

const checkKeyboard = () => {
  isKeyboardOpen.value = window.innerHeight < initialHeight * 0.75
}

onMounted(() => {
  initialHeight = window.innerHeight // Speichert die Höhe beim Start
  window.addEventListener('resize', checkKeyboard)
})

onBeforeUnmount(() => {
  window.removeEventListener('resize', checkKeyboard)
})
</script>

<template>
  <div class="h-10 flex-col justify-between bg-background z-[9999999999]">
    <div
      :class="{ hidden: isKeyboardOpen }"
      class="fixed bottom-0 left-0 right-0 border-muted-background border-t-2 mx-auto w-full bg-background shadow-lg p-3"
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
          :class="{ 'text-primary': $route.path === '/plants' }"
          class="flex flex-col items-center"
          to="/plants"
        >
          <Flower2 class="w-6 h-6" />
        </router-link>

        <router-link
          :class="{ 'text-primary': $route.path === '/groups' }"
          class="flex flex-col items-center"
          to="/groups"
        >
          <Users class="w-6 h-6" />
        </router-link>

        <router-link class="flex flex-col items-center" to="/profile">
          <Avatar
            :class="{ 'border-solid border-2 border-primary': $route.path === '/profile' }"
            class="w-6 h-6"
          >
            <AvatarImage
              alt="Justus Siegert"
              src="https://avatars.githubusercontent.com/u/91261422?v=4&size=64"
            />
            <AvatarFallback>JS</AvatarFallback>
          </Avatar>
        </router-link>
      </div>
    </div>
  </div>
</template>

<style scoped></style>
