<script lang="ts" setup>
import { ref } from 'vue'
import { Button } from '@/components/ui/button'
import { CircleX } from 'lucide-vue-next'
import { type Group, type Room } from '@/api'
import { useRoomStore } from '@/stores'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()
const roomStore = useRoomStore()

const props = defineProps<{ group: Group }>()

const selectedRoom = ref<Room | null>(null)
const isDialogOpen = ref(false)

const confirmRemove = () => {
  if (selectedRoom.value) {
    roomStore.deleteRoom(selectedRoom.value.rid, props.group.gid)
    isDialogOpen.value = false
  }
}
const openDialog = (member: Room) => {
  selectedRoom.value = member
  isDialogOpen.value = true
}
</script>

<template>
  <div class="space-y-8">
    <div v-for="room in group.rooms" :key="room.rid" class="w-full flex justify-between">
      <div class="flex">
        <div class="ml-4 space-y-1">
          <p class="text-sm font-medium leading-none">
            {{ room.name }}
          </p>
          <p class="text-xs text-muted-foreground">{{ room.groupId }}</p>
        </div>
      </div>
      <Button class="text-destructive" size="icon" variant="ghost" @click="openDialog(room)">
        <CircleX />
      </Button>
    </div>
  </div>

  <AlertDialog v-model:open="isDialogOpen">
    <AlertDialogContent v-if="selectedRoom">
      <AlertDialogHeader>
        <AlertDialogTitle>{{ t('group.room.alert.title') }}</AlertDialogTitle>
        <AlertDialogDescription>
          {{
            t('group.room.alert.description', {
              groupName: selectedRoom.name,
            })
          }}
        </AlertDialogDescription>
      </AlertDialogHeader>
      <AlertDialogFooter>
        <AlertDialogCancel @click="isDialogOpen = false">
          {{ t('group.room.alert.cancel') }}
        </AlertDialogCancel>
        <AlertDialogAction variant="destructive" @click="confirmRemove">
          {{ t('group.room.alert.confirm') }}
        </AlertDialogAction>
      </AlertDialogFooter>
    </AlertDialogContent>
  </AlertDialog>
</template>
