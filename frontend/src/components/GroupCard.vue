<script lang="ts" setup>
import { ref } from 'vue'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { CircleX } from 'lucide-vue-next'
import { type Group, type User } from '@/api'
import { useGroupStore } from '@/stores'
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
import { STATICS_PATH } from '@/api/base.ts'

const { t } = useI18n()
const groupStore = useGroupStore()

const props = defineProps<{ group: Group }>()

const selectedMember = ref<User | null>(null)
const isDialogOpen = ref(false)

const confirmRemove = () => {
  if (selectedMember.value) {
    groupStore.removeUserFromGroup(props.group.gid, selectedMember.value.uid)
    isDialogOpen.value = false
  }
}
const openDialog = (member: User) => {
  selectedMember.value = member
  isDialogOpen.value = true
}
</script>

<template>
  <div class="space-y-8">
    <div v-for="member in group.members" :key="member.uid" class="w-full flex justify-between">
      <div class="flex">
        <Avatar class="h-9 w-9">
          <AvatarImage :src="STATICS_PATH(member.avatarRef)" alt="Avatar" />
          <AvatarFallback>{{ member.firstname.slice(0, 1) }}</AvatarFallback>
        </Avatar>
        <div class="ml-4 space-y-1">
          <p class="text-sm font-medium leading-none">
            {{ `${member.firstname}${member.lastname ? ' ' + member.lastname : ''}` }}
          </p>
          <p class="text-sm text-muted-foreground">{{ member.mail }}</p>
        </div>
      </div>
      <Button class="text-destructive" size="icon" variant="ghost" @click="openDialog(member)">
        <CircleX />
      </Button>
    </div>
  </div>

  <AlertDialog v-model:open="isDialogOpen">
    <AlertDialogContent v-if="selectedMember">
      <AlertDialogHeader>
        <AlertDialogTitle>{{ t('group.alert.title') }}</AlertDialogTitle>
        <AlertDialogDescription>
          {{
            t('group.alert.description', {
              groupName: selectedMember.firstname + ' ' + selectedMember.lastname,
            })
          }}
        </AlertDialogDescription>
      </AlertDialogHeader>
      <AlertDialogFooter>
        <AlertDialogCancel @click="isDialogOpen = false">
          {{ t('group.alert.cancel') }}
        </AlertDialogCancel>
        <AlertDialogAction variant="destructive" @click="confirmRemove">
          {{ t('group.alert.confirm') }}
        </AlertDialogAction>
      </AlertDialogFooter>
    </AlertDialogContent>
  </AlertDialog>
</template>
