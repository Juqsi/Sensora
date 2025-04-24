<script lang="ts" setup>
import HomeCard from '@/components/HomeCard.vue'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useI18n } from 'vue-i18n'
import { useDeviceStore, useGroupStore, usePlantStore, useRoomStore, useUserStore } from '@/stores'
import { usePullToRefresh } from '@/composables/usePullToRefresh.ts'
import EmtyState from '@/components/EmtyState.vue'
import { onMounted } from 'vue'
import { STATICS_PATH } from '@/api/base.ts'
import { RouterLink } from 'vue-router'

const { t } = useI18n()

const roomStore = useRoomStore()
const userStore = useUserStore()
const plantStore = usePlantStore()
const deviceStore = useDeviceStore()
const groupStore = useGroupStore()

interface Hint {
  id: string
  title: string
  description: string
  url: string
  condition: boolean
}

const hints: Hint[] = [
  {
    id: '1',
    title: t('hints.createGroupTitle'),
    description: t('hints.createGroupDescription'),
    url: '/groups',
    condition: groupStore.groups.length === 0,
  },
  {
    id: '2',
    title: t('hints.createPlantTitle'),
    description: t('hints.createPlantDescription'),
    url: '/newPlant',
    condition: plantStore.plants.length === 0,
  },
  {
    id: '3',
    title: t('hints.addSensorTitle'),
    description: t('hints.addSensorDescription'),
    url: '/addDevice',
    condition: deviceStore.devices.length === 0,
  },
  {
    id: '4',
    title: t('hints.starProjectTitle'),
    description: t('hints.starProjectDescription'),
    url: 'https://github.com/juqsi/sensora',
    condition: true,
  },
  {
    id: '5',
    title: t('hints.reportBugTitle'),
    description: t('hints.reportBugDescription'),
    url: 'https://github.com/juqsi/sensora/issues',
    condition: true,
  },
]
usePullToRefresh(async () => {
  await roomStore.fetchRooms(true)
  await plantStore.fetchPlants(true)
})
onMounted(() => {
  plantStore.fetchPlants(true)
  roomStore.fetchRooms(true)
  deviceStore.fetchDevices(true)
  groupStore.fetchGroups()
})
</script>

<template>
  <div class="w-full flex justify-between items-stretch my-4">
    <div>
      <h1 class="font-bold text-3xl">
        {{ t('home.welcome', { name: userStore.user?.firstname as string }) }} 👋
      </h1>
      <p class="text-sm text-muted-foreground">{{ t('home.subtitle') }}</p>
    </div>
    <RouterLink to="profile">
      <Avatar>
        <AvatarImage alt="profile Picture" :src="STATICS_PATH(userStore.user?.avatarRef)" />
        <AvatarFallback>{{ userStore.user?.firstname[0] ?? '' }}</AvatarFallback>
      </Avatar>
    </RouterLink>
  </div>

  <div class="w-full mb-2" v-if="hints.some((hint) => hint.condition === true)">
    <h2 class="text-xl my-2 font-medium">{{ t('Home.Hints') }}</h2>
    <ScrollArea class="w-screen ml-[calc(-50vw+50%)] xl:w-full xl:ml-0">
      <div class="flex p-4 space-x-4 w-max">
        <template v-for="tip in hints">
          <div v-if="tip.condition" :key="tip.id" class="w-[80vw] shrink-1 xl:max-w-4xl">
            <component
              :is="tip.url.startsWith('http') ? 'a' : RouterLink"
              :href="tip.url.startsWith('http') ? tip.url : undefined"
              :to="!tip.url.startsWith('http') ? tip.url : undefined"
              target="_blank"
              rel="noopener"
              class="block"
            >
              <Card class="w-full border bg-muted hover:bg-muted/80 transition">
                <CardHeader>
                  <CardTitle>{{ tip.title }}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p class="text-foreground">{{ tip.description }}</p>
                </CardContent>
              </Card>
            </component>
          </div>
        </template>

      </div>
      <ScrollBar orientation="horizontal" />
    </ScrollArea>
  </div>

  <template v-for="room in roomStore.rooms" :key="room.rid">
    <div v-if="room.plants.length !== 0" class="w-full mt-2">
      <div class="flex justify-between items-center">
        <h3 class="text-xl my-2 font-medium">{{ room.name }}</h3>
      </div>
      <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
        <RouterLink v-for="plant in room.plants" :to="`/plant/${plant.plantId}`">
          <HomeCard :plant="plant"></HomeCard>
        </RouterLink>
      </div>
    </div>
  </template>
  <EmtyState
    :condition="roomStore.rooms.length === 0"
    :subtitle="t('home.emptyRoomsSubtitle')"
    :title="t('home.emptyRoomsTitle')"
    img-src="/svg/undraw_complete-design_pzh6.svg"
  />
  <EmtyState
    :condition="plantStore.plants.length === 0 && !(roomStore.rooms.length === 0)"
    :subtitle="t('plantList.emptyPlantSubtitle')"
    :title="t('plantList.emptyPlantTitle')"
    img-src="/svg/undraw_new-entries_xw4m.svg"
  />
</template>
