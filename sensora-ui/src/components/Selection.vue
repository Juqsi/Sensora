<script lang="ts" setup>
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
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
} from '@/components/ui/dialog/index.ts'

import { CheckIcon, ChevronDown, PlusCircle } from 'lucide-vue-next'

import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover/index.ts'

import { useI18n } from 'vue-i18n'

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

import { cn } from '@/lib/utils'

import { ref } from 'vue'

const { t } = useI18n()

//Prefix for reuse als Parameter späte rübergeben mit selection options
const prefix = 'prefix'

const groups = [
  {
    label: 'Gruppe 1',
    value: 'uuid-1 der Gruppe',
    rooms: [
      {
        label: 'Raum 1',
        value: 'uuid-1 des Raums',
      },
    ],
  },
  {
    label: 'Gruppe 2',
    value: 'uuid-2 der Gruppe',
    rooms: [
      {
        label: 'Raum 1',
        value: 'uuid-2 des Raums',
      },
      {
        label: 'Raum 2',
        value: 'uuid-3 des Raums',
      },
    ],
  },
]

type Team = (typeof groups)[number]['rooms'][number]

const open = ref(false)
const showNewTeamDialog = ref(false)
const selectedTeam = ref<Team>(groups[0].rooms[0])
</script>

<template>
  <Dialog v-model:open="showNewTeamDialog">
    <Popover v-model:open="open">
      <PopoverTrigger as-child>
        <Button
          :class="cn('justify-between', $attrs.class ?? '')"
          aria-expanded="true"
          aria-label="Select a team"
          role="combobox"
          variant="outline"
        >
          <Avatar class="mr-2 h-5 w-5">
            <AvatarImage
              :alt="selectedTeam.label"
              :src="`https://avatar.vercel.sh/${selectedTeam.value}.png`"
            />
            <AvatarFallback>R</AvatarFallback>
          </Avatar>
          {{ selectedTeam.label }}
          <ChevronDown class="ml-auto h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent class="p-0 min-w-full">
        <Command>
          <CommandInput :placeholder="t(prefix + '.selection.Search')" />
          <CommandEmpty>No xxxx found.</CommandEmpty>
          <CommandList>
            <CommandGroup v-for="group in groups" :key="group.label" :heading="group.label">
              <CommandItem
                v-for="team in group.rooms"
                :key="team.value"
                :value="team.label"
                class="text-sm"
                @select="
                  () => {
                    selectedTeam = team
                    open = false
                  }
                "
              >
                <Avatar class="mr-2 h-5 w-5">
                  <AvatarImage
                    :alt="team.label"
                    :src="`https://avatar.vercel.sh/${team.value}.png`"
                    class="grayscale"
                  />
                  <AvatarFallback>R</AvatarFallback>
                </Avatar>
                {{ team.label }}
                <CheckIcon
                  :class="
                    cn(
                      'ml-auto h-4 w-4',
                      selectedTeam.value === team.value ? 'opacity-100' : 'opacity-0',
                    )
                  "
                />
              </CommandItem>
            </CommandGroup>
          </CommandList>
          <CommandSeparator />
          <CommandList>
            <CommandGroup>
              <DialogTrigger as-child>
                <CommandItem
                  value="create-team"
                  @select="
                    () => {
                      open = false
                      showNewTeamDialog = true
                    }
                  "
                >
                  <PlusCircle class="mr-2 h-5 w-5" />
                  {{ t(prefix + '.selection.NewEntity') }}
                </CommandItem>
              </DialogTrigger>
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
    <DialogContent>
      <DialogHeader>
        <DialogTitle>{{ t(prefix + '.selection.NewEntityTitle') }}</DialogTitle>
        <DialogDescription> {{ t(prefix + '.selection.NewEntitySubtitle') }}</DialogDescription>
      </DialogHeader>
      <div>
        <div class="space-y-4 py-2 pb-4">
          <div class="space-y-2">
            <Label for="name"> {{ t(prefix + '.selection.Entity') }} </Label>
            <Input id="name" :placeholder="t(prefix + '.selection.EntityPlaceholder')" />
          </div>
          <div class="space-y-2">
            <Label for="plan"> {{ t(prefix + '.selection.NewEntitySelectionGroup') }} </Label>
            <Select>
              <SelectTrigger>
                <SelectValue
                  :placeholder="t(prefix + '.selection.NewEntitySelectionGroupPlaceholder')"
                />
              </SelectTrigger>
              <SelectContent>
                <SelectItem
                  v-for="group in groups"
                  :key="group.label"
                  :heading="group.label"
                  :value="group.value"
                >
                  <span class="font-medium">{{ group.label }}</span>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>
      <DialogFooter>
        <Button variant="outline" @click="showNewTeamDialog = false">
          {{ t(prefix + '.selection.NewEntityCancle') }}
        </Button>
        <Button type="submit"> {{ t(prefix + '.selection.NewEntityCreate') }}</Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
</template>
