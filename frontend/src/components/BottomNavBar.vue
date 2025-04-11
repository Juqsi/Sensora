<script lang="ts" setup>
import { Flower2, HomeIcon, Users } from 'lucide-vue-next'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { onBeforeUnmount, onMounted, ref } from 'vue'
import { useUserStore } from '@/stores'
import { STATICS_PATH } from '@/api/base.ts'

const userStore = useUserStore()
const isKeyboardOpen = ref(false)
let initialHeight = window.innerHeight

const checkKeyboard = () => {
  isKeyboardOpen.value = window.innerHeight < initialHeight * 0.75
}

onMounted(() => {
  initialHeight = window.innerHeight
  window.addEventListener('resize', checkKeyboard)
})

onBeforeUnmount(() => {
  window.removeEventListener('resize', checkKeyboard)
})
</script>

<template>
    <div class="h-10 flex-col justify-between bg-background z-9999999999">
      <div
        :class="{ hidden: isKeyboardOpen }"
        class="fixed bottom-0 left-0 right-0 border-muted-background border-t-2 mx-auto w-full bg-background shadow-lg p-3"
      >
        <div class="grid grid-cols-4 gap-4">
          <RouterLink
            :class="{ 'text-primary': $route.path === '/' }"
            class="flex flex-col items-center"
            to="/"
          >
            <HomeIcon class="w-6 h-6" />
          </RouterLink>

          <RouterLink
            :class="{ 'text-primary': $route.path === '/plants' }"
            class="flex flex-col items-center"
            to="/plants"
          >
            <Flower2 class="w-6 h-6" />
          </RouterLink>

          <RouterLink
            :class="{ 'text-primary': $route.path === '/groups' }"
            class="flex flex-col items-center"
            to="/groups"
          >
            <Users class="w-6 h-6" />
          </RouterLink>

          <RouterLink class="flex flex-col items-center" to="/profile">
            <Avatar
              :class="{
                'border-primary': $route.path === '/profile',
                'border-foreground': $route.path !== '/profile',
              }"
              class="w-6 h-6 border-solid border-2"
            >
              <AvatarImage
                :alt="userStore.user?.firstname + ' ' + userStore.user?.lastname"
                :src="STATICS_PATH(userStore.user?.avatarRef)"
              />
              <AvatarFallback>{{ userStore.user?.firstname[0] ?? '' }}</AvatarFallback>
            </Avatar>
          </RouterLink>
        </div>
      </div>
    </div>
</template>

<style scoped></style>
