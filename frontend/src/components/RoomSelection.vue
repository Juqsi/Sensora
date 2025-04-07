<script lang="ts" setup>
import { defineModel, ref } from 'vue'
import { Button } from '@/components/ui/button'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandList,
  CommandSeparator,
} from '@/components/ui/command'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { CheckIcon, ChevronDown, PlusCircle } from 'lucide-vue-next'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'
import { useI18n } from 'vue-i18n'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { useGroupStore, useRoomStore } from '@/stores'
import type { Room } from '@/api'

const { t } = useI18n()
const groupStore = useGroupStore()
const roomStore = useRoomStore()

const model = defineModel<Room | undefined>('room', { required: true })

const open = ref(false)
const showNewTeamDialog = ref(false)
const newTeamName = ref('')
const selectedGroup = ref('')

const selectEntity = (entity: Room) => {
  model.value = entity
  open.value = false
}

const onCreateNewTeam = (event: Event) => {
  event.preventDefault()
  try {
    roomStore.createRoom({ name: newTeamName.value, groupId: selectedGroup.value })
  } catch (e) {
    console.log(e)
  }
  showNewTeamDialog.value = false
  newTeamName.value = ''
  selectedGroup.value = ''
}
</script>

<template>
  <Dialog v-model:open="showNewTeamDialog">
    <Popover v-model:open="open">
      <PopoverTrigger as-child>
        <Button
          :class="cn('justify-between truncate', $attrs.class ?? '')"
          aria-expanded="true"
          aria-label="Select a team"
          role="combobox"
          variant="outline"
        >
          {{ model?.name ?? t('group.createRoom.SelectPlaceholder') }}
          <ChevronDown class="ml-auto h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>

      <PopoverContent class="p-0 w-[var(--radix-popper-anchor-width)]">
        <Command>
          <CommandEmpty>{{ t('group.createRoom.NoEntity') }}</CommandEmpty>
          <CommandList>
            <CommandGroup v-for="group in groupStore.groups" :key="group.gid" :heading="group.name">
              <CommandItem
                v-for="room in group.rooms"
                :key="room.rid"
                :value="room.rid"
                class="text-sm pl-6"
                @select="selectEntity(room)"
              >
                {{ room.name }}
                <CheckIcon
                  :class="
                    cn('ml-auto h-4 w-4', model?.rid === room.rid ? 'opacity-100' : 'opacity-0')
                  "
                />
              </CommandItem>
            </CommandGroup>
          </CommandList>

          <CommandSeparator />

          <CommandList>
            <CommandGroup>
              <DialogTrigger as-child>
                <CommandItem value="new" @select="showNewTeamDialog = true">
                  <PlusCircle class="mr-2 h-5 w-5" />
                  {{ t('group.createRoom.NewEntity') }}
                </CommandItem>
              </DialogTrigger>
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>

    <DialogContent class="max-w-full w-fit">
      <DialogHeader>
        <DialogTitle>{{ t('group.createRoom.NewEntityTitle') }}</DialogTitle>
        <DialogDescription>
          {{ t('group.createRoom.NewEntitySubtitle') }}
        </DialogDescription>
      </DialogHeader>

      <form @submit="onCreateNewTeam" class="max-w-full">
        <div class="space-y-4">
          <div>
            <Label for="name">{{ t('group.createRoom.Entity') }}</Label>
            <Input
              id="name"
              v-model="newTeamName"
              :placeholder="t('group.createRoom.EntityPlaceholder')"
              required
            />
          </div>

          <div>
            <Label for="group">{{ t('group.createRoom.NewEntitySelectionGroup') }}</Label>
            <Select v-model="selectedGroup" required>
              <SelectTrigger>
                <SelectValue
                  :placeholder="t('group.createRoom.NewEntitySelectionGroupPlaceholder')"
                />
              </SelectTrigger>
              <SelectContent>
                <SelectItem v-for="group in groupStore.groups" :key="group.gid" :value="group.gid">
                  {{ group.name }}
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <DialogFooter class="mt-6 flex justify-between">
          <Button variant="outline" @click="showNewTeamDialog = false">
            {{ t('group.createRoom.NewEntityCancel') }}
          </Button>
          <Button type="submit">
            {{ t('group.createRoom.NewEntityCreate') }}
          </Button>
        </DialogFooter>
      </form>
    </DialogContent>
  </Dialog>
</template>
