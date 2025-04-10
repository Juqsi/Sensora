<script lang="ts" setup>
import { Card, CardContent } from '@/components/ui/card'
import {
  CirclePlus,
  FileX2,
  Info,
  LogOut,
  MessageCircleQuestion,
  ShieldHalf,
  Users,
  Github,
  Bug
} from 'lucide-vue-next'
import { useI18n } from 'vue-i18n'
import {
  useAuthStore,
  useDeviceStore,
  useGroupStore,
  usePlantStore,
  useRoomStore,
  useUserStore,
} from '@/stores'
import { toast } from 'vue-sonner'
import { RouterLink } from 'vue-router'

const authStore = useAuthStore()
const { t } = useI18n()

const delteData = () => {
  const userStore = useUserStore()
  const deviceStore = useDeviceStore()
  const plantStore = usePlantStore()
  const roomStore = useRoomStore()
  const groupStore = useGroupStore()
  userStore.clearData()
  deviceStore.clearData()
  plantStore.clearData()
  roomStore.clearData()
  groupStore.clearData()
  toast.success('Cache gelöscht')
}
</script>

<template>
  <p class="w-full text-muted-foreground mt-2 mb-1">{{ t('profile.Sensora') }}</p>
  <Card class="w-full">
    <CardContent class="grid gap-1 px-6 py-2">
      <RouterLink to="/addDevice">
        <div
          class="-mx-2 flex items-center space-x-4 rounded-md p-2 transition-all hover:bg-accent hover:text-accent-foreground"
        >
          <CirclePlus class="mt-px h-5 w-5" />
          <div class="space-y-1">
            <p class="text-md text-center leading-none">
              {{ t('profile.AddDevice') }}
            </p>
          </div>
        </div>
      </RouterLink>
      <RouterLink to="/groups">
      <div
        class="-mx-2 flex items-center space-x-4 rounded-md p-2 transition-all hover:bg-accent hover:text-accent-foreground"
      >
        <Users class="mt-px h-5 w-5" />
        <div class="space-y-1">
          <p class="text-md text-center leading-none">
            {{ t('profile.Group') }}
          </p>
        </div>
      </div>
      </RouterLink>
    </CardContent>
  </Card>

  <p class="w-full text-muted-foreground mt-2 mb-1">{{ t('profile.Support') }}</p>
  <Card class="w-full">
    <CardContent class="grid gap-1 py-2 px-6">
      <RouterLink to="/faq">
      <div
        class="-mx-2 flex items-enter space-x-4 rounded-md p-2 transition-all hover:bg-accent hover:text-accent-foreground"
      >
        <MessageCircleQuestion class="mt-px h-5 w-5" />
        <div class="space-y-1">
          <p class="text-md leading-none">{{ t('profile.FAQ') }}</p>
        </div>
      </div>
      </RouterLink>
      <RouterLink to="/aboutus">
        <div
          class="-mx-2 flex items-center space-x-4 rounded-md p-2 transition-all hover:bg-accent hover:text-accent-foreground"
        >
          <Info class="mt-px h-5 w-5" />
          <div class="space-y-1">
            <p class="text-md leading-none">{{ t('profile.AboutUs') }}</p>
          </div>
        </div>
      </RouterLink>
      <RouterLink to="/privacyPolicy">
      <div
        class="-mx-2 flex items-center space-x-4 rounded-md p-2 transition-all hover:bg-accent hover:text-accent-foreground"
      >
        <ShieldHalf class="mt-px h-5 w-5" />
        <div class="space-y-1">
          <p class="text-md leading-none">{{ t('profile.Privacy') }}</p>
        </div>
      </div>
      </RouterLink>
      <a href="https://github.com/juqsi/sensora">
        <div
          class="-mx-2 flex items-center space-x-4 rounded-md p-2 transition-all hover:bg-accent hover:text-accent-foreground"
        >
          <Github class="mt-px h-5 w-5" />
          <div class="space-y-1">
            <p class="text-md leading-none">{{ t('profile.project') }}</p>
          </div>
        </div>
      </a>
      <a href="https://github.com/juqsi/sensora/issues">
        <div
          class="-mx-2 flex items-center space-x-4 rounded-md p-2 transition-all hover:bg-accent hover:text-accent-foreground"
        >
          <Bug class="mt-px h-5 w-5" />
          <div class="space-y-1">
            <p class="text-md leading-none">{{ t('profile.reportError') }}</p>
          </div>
        </div>
      </a>
    </CardContent>
  </Card>
  <p class="w-full text-muted-foreground mt-2 mb-1">{{ t('profile.Logout') }}</p>
  <Card class="w-full">
    <CardContent class="grid gap-1 py-2 px-6">
      <div
        class="-mx-2 flex items-center space-x-4 rounded-md p-2 transition-all hover:bg-accent hover:text-accent-foreground"
        @click="authStore.logout()"
      >
        <LogOut class="mt-px h-5 w-5" />
        <div class="space-y-1">
          <p class="text-md leading-none">{{ t('profile.Logout') }}</p>
        </div>
      </div>
      <div
        class="-mx-2 flex items-center space-x-4 rounded-md p-2 transition-all hover:bg-accent hover:text-accent-foreground"
      >
        <FileX2 class="mt-px h-5 w-5" />
        <div class="space-y-1" @click="delteData()">
          <p class="text-md leading-none">{{ t('profile.ClearCache') }}</p>
        </div>
      </div>
    </CardContent>
  </Card>
  <div class="mt-6 text-center text-sm text-muted-foreground">
    Made with
    <span class="text-red-500 animate-pulse">❤️</span>
    in <span class="font-semibold text-primary">Mannheim</span>
  </div>
</template>

<style scoped></style>
