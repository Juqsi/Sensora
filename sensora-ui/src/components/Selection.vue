<script lang="ts" setup>
import { defineProps, ref } from 'vue'
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
import { cn } from '@/lib/utils.ts'
import { useI18n } from 'vue-i18n'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'

const { t } = useI18n()

const props = defineProps<{
  groups: { label: string; value: string; entity: { label: string; value: string }[] }[]
  selectedEntity: { label: string; value: string }
  prefix: string
}>()

const emit = defineEmits(['update:selectedEntity', 'createEntity'])

const open = ref(false)
const showNewTeamDialog = ref(false)
const newTeamName = ref('')
const selectedGroup = ref('')

const selectEntity = (entityId: { label: string; value: string }) => {
  emit('update:selectedEntity', entityId)
  open.value = false
}

const onCreateNewTeam = () => {
  //TODO glaube darunter ist Falsch das ist das ausgewählte und nciht die Felder des poUpForms
  emit('createEntity', { name: newTeamName.value, group: selectedGroup.value })
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
          :class="cn('justify-between', $attrs.class ?? '')"
          aria-expanded="true"
          aria-label="Select a team"
          role="combobox"
          variant="outline"
        >
          <Avatar class="mr-2 h-5 w-5">
            <AvatarImage
              :alt="props.selectedEntity.label"
              :src="`https://avatar.vercel.sh/${props.selectedEntity.value}.png`"
            />
            <AvatarFallback>R</AvatarFallback>
          </Avatar>
          {{ props.selectedEntity.label }}
          <ChevronDown class="ml-auto h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent class="p-0 w-[var(--radix-popper-anchor-width)]">
        <Command>
          <CommandInput :placeholder="t(props.prefix + '.selection.Search')" />
          <CommandEmpty>No xxxx found.</CommandEmpty>
          <CommandList>
            <CommandGroup v-for="group in props.groups" :key="group.label" :heading="group.label">
              <CommandItem
                v-for="entity in group.entity"
                :key="entity.value"
                :value="entity.label"
                class="text-sm"
                @select="selectEntity(entity)"
              >
                <Avatar class="mr-2 h-5 w-5">
                  <AvatarImage
                    :alt="entity.label"
                    :src="`https://avatar.vercel.sh/${entity.value}.png`"
                    class="grayscale"
                  />
                  <AvatarFallback>R</AvatarFallback>
                </Avatar>
                {{ entity.label }}
                <CheckIcon
                  :class="
                    cn(
                      'ml-auto h-4 w-4',
                      props.selectedEntity.value === entity.value ? 'opacity-100' : 'opacity-0',
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
                <CommandItem value="12" @select="showNewTeamDialog = true">
                  <PlusCircle class="mr-2 h-5 w-5" />
                  {{ t(props.prefix + '.selection.NewEntity') }}
                </CommandItem>
              </DialogTrigger>
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>

    <DialogContent class="w-screen">
      <DialogHeader>
        <DialogTitle>{{ t(props.prefix + '.selection.NewEntityTitle') }}</DialogTitle>
        <DialogDescription>
          {{ t(props.prefix + '.selection.NewEntitySubtitle') }}
        </DialogDescription>
      </DialogHeader>
      <div class="space-y-2">
        <div class="space-y-2">
          <Label for="name">{{ t(props.prefix + '.selection.Entity') }}</Label>
          <Input
            id="name"
            v-model="newTeamName"
            :placeholder="t(props.prefix + '.selection.EntityPlaceholder')"
          />
        </div>
        <div class="space-y-2">
          <Label for="group">{{ t(props.prefix + '.selection.NewEntitySelectionGroup') }}</Label>
          <Select v-model="selectedGroup">
            <SelectTrigger>
              <SelectValue
                :placeholder="t(props.prefix + '.selection.NewEntitySelectionGroupPlaceholder')"
              />
            </SelectTrigger>
            <SelectContent>
              <SelectItem v-for="group in props.groups" :key="group.value" :value="group.value">
                {{ group.label }}
              </SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      <DialogFooter class="flex justify-between gap-4">
        <Button variant="outline" @click="showNewTeamDialog = false">
          {{ t(props.prefix + '.selection.NewEntityCancel') }}
        </Button>
        <Button type="submit" @click="onCreateNewTeam">
          {{ t(props.prefix + '.selection.NewEntityCreate') }}
        </Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
</template>
