<script lang="ts" setup>
import HomeCard from '@/components/HomeCard.vue'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useI18n } from 'vue-i18n'
import { useRoomStore, useUserStore, usePlantStore } from '@/stores'
import { usePullToRefresh } from '@/composables/usePullToRefresh.ts'
import EmtyState from '@/components/EmtyState.vue'
import { onMounted } from 'vue'

const { t } = useI18n()

const roomStore = useRoomStore()
const userStore = useUserStore()
const plantStore = usePlantStore()

interface Hint {
  id: string
  title: string
  description: string
}

const hints: Hint[] = [
  {
    id: '1',
    title: 'Hint 1',
    description: 'This is the first tipThis is the first tippThis is the first tip',
  },
  { id: '2', title: 'Hint 2', description: 'Another useful tip for you' },
  { id: '3', title: 'Hint 3', description: 'Don’t forget this one!' },
]
usePullToRefresh(async () => {
  await roomStore.fetchRooms(true)
})
onMounted(() => {
  plantStore.fetchPlants()
  roomStore.fetchRooms()
})
</script>

<template>
  <div class="w-full flex justify-between mt-4">
    <div>
      <h1 class="font-bold text-3xl">
        {{ t('home.welcome', { name: userStore.user?.firstname as string }) }} 👋
      </h1>
      <p class="text-sm text-muted-foreground">{{ t('home.subtitle') }}</p>
    </div>
    <Avatar>
      <AvatarImage
        alt="profile Picture"
        src="https://avatars.githubusercontent.com/u/91261422?v=4&size=64"
      />
      <AvatarFallback>JS</AvatarFallback>
    </Avatar>
  </div>

  <div class="w-full my-2">
    <h2 class="text-xl my-2 font-medium">Tipps</h2>
    <ScrollArea class="w-screen ml-[calc(-50vw+50%)] xl:w-full xl:ml-0">
      <div class="flex p-4 space-x-4 w-max">
        <div v-for="tip in hints" :key="tip.id" class="w-[80vw] shrink-1 xl:max-w-4xl">
          <Card class="w-full border-none bg-secondary">
            <CardHeader>
              <CardTitle>{{ tip.title }}</CardTitle>
            </CardHeader>
            <CardContent>
              <p>{{ tip.description }}</p>
            </CardContent>
          </Card>
        </div>
      </div>
      <ScrollBar orientation="horizontal" />
    </ScrollArea>
  </div>

  <template v-for="room in roomStore.rooms" :key="room.rid">
    <div class="w-full mt-2" v-if="room.plants.length !== 0">
      <div class="flex justify-between items-center">
        <h3 class="text-xl my-2 font-medium">{{ room.name }}</h3>
      </div>
      <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
        <router-link v-for="plant in room.plants" :to="`/plant/${plant.plantId}`">
          <HomeCard :plant="plant"></HomeCard>
        </router-link>
      </div>
    </div>
  </template>
  <EmtyState
    :title="t('home.emptyRoomsTitle')"
    :condition="roomStore.rooms.length === 0"
    :subtitle="t('home.emptyRoomsSubtitle')"
    img-src="/svg/undraw_complete-design_pzh6.svg"
  />
  <EmtyState
    :title="t('plantList.emptyPlantTitle')"
    :condition="plantStore.plants.length === 0 && !(roomStore.rooms.length === 0)"
    :subtitle="t('plantList.emptyPlantSubtitle')"
    img-src="/svg/undraw_new-entries_xw4m.svg"
  />
</template>
