<script lang="ts" setup>
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  TagsInput,
  TagsInputInput,
  TagsInputItem,
  TagsInputItemDelete,
  TagsInputItemText,
} from '@/components/ui/tags-input'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'
import type { createGroupBody, Group } from '@/api'
import { useGroupStore, useRoomStore } from '@/stores'
import { useAuthRedirect } from '@/composables/useAuthRedirect.ts'
import {toast} from 'vue-sonner'

const { redirectAfterLogin } = useAuthRedirect()

const groupStore = useGroupStore()
const roomStore = useRoomStore()

const { t } = useI18n()

const groupName = ref<string>('')
const rooms = ref<Array<string>>([t('group.create.RoomEntity') as string])

const createGroupSubmit = async () => {
  if (!groupName.value.trim()) {
    toast.warning(t('group.NameEmpty'))
    return
  }
  let group: Group
  try {
    let newGroup: createGroupBody = { name: groupName.value, members: [] }
    group = await groupStore.createGroup(newGroup)
    groupName.value = ''
    for (const room of rooms.value) {
      await roomStore.createRoom({ groupId: group.gid, name: room })
    }
    rooms.value = [t('group.create.RoomEntity') as string]
    redirectAfterLogin()
  } catch (error) {
    console.log(error)
  }
}
</script>

<template>
  <Card class="mx-auto w-full">
    <CardHeader>
      <CardTitle class="text-xl">{{t('account.CreateHome')}}</CardTitle>
    </CardHeader>
    <CardContent>
      <form class="grid items-start gap-4" @submit.prevent="createGroupSubmit">
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
    </CardContent>
  </Card>
</template>
