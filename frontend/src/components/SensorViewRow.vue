<script lang="ts" setup>
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Button } from '@/components/ui/button'
import { TableCell, TableRow } from '@/components/ui/table'
import { MoreHorizontal } from 'lucide-vue-next'
import { Badge } from '@/components/ui/badge'
import { computed, type PropType } from 'vue'
import type { Group, Plant, Room } from '@/api'

const status = {
  active: { label: 'active', value: 'default' },
  inactive: { label: 'inactive', value: 'secondary' },
  unknown: { label: 'unknown', value: 'outline' },
  error: { label: 'error', value: 'destructive' },
} as const

type StatusKey = keyof typeof status

const props = defineProps({
  plant: { type: Object as PropType<Plant>, required: true },
  group: { type: Object as PropType<Group>, required: true },
  room: { type: Object as PropType<Room>, required: true },
})
defineEmits(['delete'])

const getStatus = computed(() => {
  if (props.plant.controllers.length !== 0) {
    props.plant.controllers.filter((controller) => {
      const matchesStatus = controller.sensors.some((sensor) => ['error'].includes(sensor.status))
      if (matchesStatus) {
        return status.error
      }
    })
    return status.active
  }
  if (props.plant.controllers.length === 0) {
    return status.inactive
  }
  return status.unknown
})

const badgeVariant = getStatus.value.value
const badgeLabel = getStatus.value.label
</script>

<template>
  <TableRow>
    <TableCell class="overflow-hidden font-medium">
      <router-link :to="`/plant/${plant.plantId}`">
        {{ plant.name }}
      </router-link>
    </TableCell>
    <TableCell>
      <router-link :to="plant.controllers[0] ? `/sensor/${plant.controllers[0].did}` : '#'">
        <Badge :variant="badgeVariant" class="w-full justify-center">
          {{ badgeLabel }}
        </Badge>
      </router-link>
    </TableCell>
    <TableCell class="hidden md:table-cell">
      <router-link :to="`/groups#${group.gid}`">
        {{ group.name }}
      </router-link>
    </TableCell>

    <TableCell class="hidden md:table-cell">
      <router-link :to="`/groups#${room.rid}`">
        {{ room.name }}
      </router-link>
    </TableCell>
    <TableCell class="hidden md:table-cell">
      <router-link :to="plant.controllers[0] ? `/sensor/${plant.controllers[0].did}` : '#'">
        {{ plant.controllers[0]?.did ?? '--' }}
      </router-link>
    </TableCell>
    <TableCell>
      <DropdownMenu>
        <DropdownMenuTrigger as-child>
          <Button aria-haspopup="true" size="icon" variant="ghost">
            <MoreHorizontal class="h-4 w-4" />
            <span class="sr-only">Toggle menu</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuLabel>Actions</DropdownMenuLabel>
          <router-link :to="`/plant/${plant.plantId}/edit`">
            <DropdownMenuItem>Edit</DropdownMenuItem>
          </router-link>
          <DropdownMenuItem @click="$emit('delete', plant.plantId)">Delete</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </TableCell>
  </TableRow>
</template>

<style scoped></style>
