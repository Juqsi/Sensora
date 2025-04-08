<script lang="ts" setup>
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from '@/components/ui/drawer'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { createReusableTemplate, useMediaQuery } from '@vueuse/core'
import { type PropType, ref, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import {
  TagsInput,
  TagsInputInput,
  TagsInputItem,
  TagsInputItemDelete,
  TagsInputItemText,
} from '@/components/ui/tags-input'
import { CirclePlus } from 'lucide-vue-next'
import type { createGroupBody, Group, GroupPatchBody, Room } from '@/api'
import { useGroupStore, useRoomStore } from '@/stores'

const groupStore = useGroupStore()
const roomStore = useRoomStore()

const props = defineProps({
  group: { type: Object as PropType<Group>, required: false, default: undefined },
})

const [UseTemplate, GridForm] = createReusableTemplate()
const isDesktop = useMediaQuery('(min-width: 768px)')

const { t } = useI18n()
const isOpen = ref(false)

const groupName = ref<string>(props.group?.name ?? '')
const rooms = ref<Array<string>>(
  props.group?.rooms?.map((room: Room) => room.name) ?? [t('group.create.RoomEntity') as string],
)

const createGroup = async () => {
  let group: Group
  try {
    let newGroup: createGroupBody = { name: groupName.value, members: [] }
    group = await groupStore.createGroup(newGroup)
    groupName.value = ''
    for (const room of rooms.value) {
      await roomStore.createRoom({ groupId: group.gid, name: room })
    }
    rooms.value = [t('group.create.RoomEntity') as string]
  } catch (error) {
    console.log(error)
  } finally {
    isOpen.value = false
  }
}

const updateGroup = async () => {
  let group: Group
  try {
    let newGroup: GroupPatchBody = { name: groupName.value }
    group = await groupStore.updateGroup(props.group!.gid, newGroup)

    const originalRooms = props.group?.rooms || []

    // 1. Finde neue Räume (Räume, die in `rooms.value` sind, aber nicht in `originalRooms`)
    const newRooms = rooms.value.filter(
      (room) => !originalRooms.some((originalRoom) => originalRoom.name === room),
    )

    // 2. Finde entfernte Räume (Räume, die in `originalRooms` sind, aber nicht in `rooms.value`)
    const removedRooms = originalRooms.filter(
      (originalRoom) => !rooms.value.includes(originalRoom.name),
    )

    // 3. Erstelle neue Räume
    for (const room of newRooms) {
      await roomStore.createRoom({ groupId: group.gid, name: room })
    }

    // 4. Lösche entfernte Räume
    for (const room of removedRooms) {
      try {
        await roomStore.deleteRoom(room.rid, group.gid)
      } catch (error) {
        console.log(error)
      }
    }
  } catch (error) {
    console.log(error)
  } finally {
    isOpen.value = false
  }
}

const submit = async () => {
  if (props.group !== undefined) {
    await updateGroup()
  } else {
    await createGroup()
  }
}
</script>

<template>
  <UseTemplate>
    <form class="grid items-start gap-4 px-4" @submit.prevent="submit">
      <div class="grid gap-2">
        <Label for="groupName">{{ t('group.create.groupName') }}</Label>
        <Input id="groupName" v-model="groupName" :placeholder="t('group.create.namePlaceholder')" />
      </div>
      <div>
        <Label for="rooms">
          {{ t('group.create.roomName') }}
        </Label>
        <TagsInput id="rooms" v-model="rooms">
          <TagsInputItem v-for="item in rooms" :key="item" :value="item">
            <TagsInputItemText />
            <TagsInputItemDelete />
          </TagsInputItem>
          <TagsInputInput :placeholder="t('group.create.roomPlaceholder')" />
        </TagsInput>
      </div>
      <Button type="submit"
        >{{ props.group ? t('group.update.save') : t('group.create.save') }}
      </Button>
    </form>
  </UseTemplate>

  <Dialog v-if="isDesktop" v-model:open="isOpen">
    <DialogTrigger as-child>
      <slot v-if="$slots.desktop" name="desktop"></slot>
      <Button v-else variant="default"
        >{{ props.group ? t('group.update.create') : t('group.create.create') }}
      </Button>
    </DialogTrigger>
    <DialogContent class="sm:max-w-[425px]">
      <DialogHeader>
        <DialogTitle>
          {{ props.group ? t('group.update.title') : t('group.create.title') }}
        </DialogTitle>
        <DialogDescription>
          {{ props.group ? t('group.update.description') : t('group.create.description') }}
        </DialogDescription>
      </DialogHeader>
      <GridForm />
    </DialogContent>
  </Dialog>

  <Drawer v-else v-model:open="isOpen">
    <DrawerTrigger as-child>
      <slot v-if="$slots.mobile" name="mobile"></slot>
      <Button
        v-else
        :aria-label="props.group ? t('group.update.create') : t('group.create.create')"
        size="icon"
        variant="outline"
      >
        <CirclePlus />
      </Button>
    </DrawerTrigger>
    <DrawerContent>
      <DrawerHeader class="text-left">
        <DrawerTitle
          >{{ props.group ? t('group.update.title') : t('group.create.title') }}
        </DrawerTitle>
        <DrawerDescription>
          {{ props.group ? t('group.update.description') : t('group.create.description') }}
        </DrawerDescription>
      </DrawerHeader>
      <GridForm />
      <DrawerFooter class="pt-2">
        <DrawerClose as-child>
          <Button variant="outline"> {{ t('group.create.cancel') }}</Button>
        </DrawerClose>
      </DrawerFooter>
    </DrawerContent>
  </Drawer>
</template>
