<script setup lang="ts">
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { CircleX } from 'lucide-vue-next'
import { type Group } from '@/api'
import { useGroupStore } from '@/stores'

const groupStore = useGroupStore()

defineProps<{ group: Group }>()
</script>

<template>
  <div class="space-y-8" v-for="member in group.members">
    <div class="w-full flex justify-between" :id="member.uid">
      <div class="flex">
        <Avatar class="h-9 w-9">
          <AvatarImage src="/avatars/01.png" alt="Avatar" />
          <AvatarFallback>OM</AvatarFallback>
        </Avatar>
        <div class="ml-4 space-y-1">
          <p class="text-sm font-medium leading-none">
            {{ member.firstname + ' ' + member.lastname }}
          </p>
          <p class="text-sm text-muted-foreground">olivia.martin@email.com</p>
        </div>
      </div>
      <Button
        @click="groupStore.removeUserFromGroup(group.gid, member.uid)"
        class="text-destructive"
        variant="ghost"
        size="icon"
      >
        <CircleX />
      </Button>
    </div>
  </div>
</template>
