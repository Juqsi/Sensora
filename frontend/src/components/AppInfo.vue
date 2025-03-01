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
  alert('Daten gelöscht')
}
</script>

<template>
  <p class="w-full text-muted-foreground mt-2 mb-1">{{ t('profile.Sensora') }}</p>
  <Card class="w-full">
    <CardContent class="grid gap-1 px-6 py-2">
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
    </CardContent>
  </Card>

  <p class="w-full text-muted-foreground mt-2 mb-1">{{ t('profile.Support') }}</p>
  <Card class="w-full">
    <CardContent class="grid gap-1 py-2 px-6">
      <div
        class="-mx-2 flex items-enter space-x-4 rounded-md p-2 transition-all hover:bg-accent hover:text-accent-foreground"
      >
        <MessageCircleQuestion class="mt-px h-5 w-5" />
        <div class="space-y-1">
          <p class="text-md leading-none">{{ t('profile.FAQ') }}</p>
        </div>
      </div>
      <div
        class="-mx-2 flex items-center space-x-4 rounded-md p-2 transition-all hover:bg-accent hover:text-accent-foreground"
      >
        <Info class="mt-px h-5 w-5" />
        <div class="space-y-1">
          <p class="text-md leading-none">{{ t('profile.AboutUs') }}</p>
        </div>
      </div>
      <div
        class="-mx-2 flex items-center space-x-4 rounded-md p-2 transition-all hover:bg-accent hover:text-accent-foreground"
      >
        <ShieldHalf class="mt-px h-5 w-5" />
        <div class="space-y-1">
          <p class="text-md leading-none">{{ t('profile.Privacy') }}</p>
        </div>
      </div>
    </CardContent>
  </Card>
  <p class="w-full text-muted-foreground mt-2 mb-1">{{ t('profile.Logout') }}</p>
  <Card class="w-full">
    <CardContent class="grid gap-1 py-2 px-6">
      <div
        @click="authStore.logout()"
        class="-mx-2 flex items-center space-x-4 rounded-md p-2 transition-all hover:bg-accent hover:text-accent-foreground"
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
          <p class="text-md leading-none">Cache Daten löschen</p>
        </div>
      </div>
    </CardContent>
  </Card>
</template>

<style scoped></style>
