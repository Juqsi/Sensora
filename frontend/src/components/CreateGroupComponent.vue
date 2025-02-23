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
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'
import {
  TagsInput,
  TagsInputInput,
  TagsInputItem,
  TagsInputItemDelete,
  TagsInputItemText,
} from '@/components/ui/tags-input'
import { CirclePlus } from 'lucide-vue-next'
import type { createGroupBody, Group } from '@/api'
import { useGroupStore, useRoomStore, useUserStore } from '@/stores'

const groupStore = useGroupStore()
const roomStore = useRoomStore()
const userStore = useUserStore()

const [UseTemplate, GridForm] = createReusableTemplate()
const isDesktop = useMediaQuery('(min-width: 768px)')

const { t } = useI18n()
const isOpen = ref(false)

const groupName = ref<string>('')
const rooms = ref<Array<string>>([t('group.create.RoomEntity')])

const createGroupSubmit = async () => {
  let group: Group
  try {
    let newGroup: createGroupBody = { name: groupName.value, members: [userStore.user!] }
    group = await groupStore.createGroup(newGroup)
    groupName.value = ''
    for (const room in rooms) {
      await roomStore.createRoom({ groupId: group.gid, name: room })
    }
    rooms.value = [t('group.create.RoomEntity')]
  } catch (error) {
    console.log(error)
  } finally {
    isOpen.value = false
  }
}
</script>

<template>
  <UseTemplate>
    <form @submit.prevent="createGroupSubmit" class="grid items-start gap-4 px-4">
      <div class="grid gap-2">
        <Label html-for="groupName">{{ t('group.create.groupName') }}</Label>
        <Input id="name" v-model="groupName" :placeholder="t('group.create.namePlaceholder')" />
      </div>
      <div>
        <Label html-for="rooms">{{ t('group.create.groupName') }}</Label>
        <TagsInput id="rooms" v-model="rooms">
          <TagsInputItem v-for="item in rooms" :key="item" :value="item">
            <TagsInputItemText />
            <TagsInputItemDelete />
          </TagsInputItem>
          <TagsInputInput :placeholder="t('group.create.roomPlaceholder')" />
        </TagsInput>
      </div>
      <Button type="submit">{{ t('group.create.save') }}</Button>
    </form>
  </UseTemplate>

  <Dialog v-if="isDesktop" v-model:open="isOpen">
    <DialogTrigger as-child>
      <Button variant="default">{{ t('group.create.create') }}</Button>
    </DialogTrigger>
    <DialogContent class="sm:max-w-[425px]">
      <DialogHeader>
        <DialogTitle> {{ t('group.create.title') }}</DialogTitle>
        <DialogDescription>
          {{ t('group.create.description') }}
        </DialogDescription>
      </DialogHeader>
      <GridForm />
    </DialogContent>
  </Dialog>

  <Drawer v-else v-model:open="isOpen">
    <DrawerTrigger as-child>
      <Button :aria-label="t('group.create.create')" variant="outline" size="icon">
        <CirclePlus />
      </Button>
    </DrawerTrigger>
    <DrawerContent>
      <DrawerHeader class="text-left">
        <DrawerTitle>{{ t('group.create.title') }}</DrawerTitle>
        <DrawerDescription>
          {{ t('group.create.description') }}
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
