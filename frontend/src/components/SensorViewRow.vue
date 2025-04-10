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
import { useI18n } from 'vue-i18n'
import { useDeviceStore, useUserStore } from '@/stores'

const { t } = useI18n()

const status = {
  active: { label: t('active'), value: 'default' },
  inactive: { label: t('inactive'), value: 'secondary' },
  unknown: { label: t('unknown'), value: 'outline' },
  error: { label: t('error'), value: 'destructive' },
} as const

const props = defineProps({
  plant: { type: Object as PropType<Plant>, required: true },
  group: { type: Object as PropType<Group>, required: true },
  room: { type: Object as PropType<Room>, required: true },
})
defineEmits(['delete'])

const getStatus = computed(() => {
  if (currentlyAssignedControllers.value.length !== 0) {
    currentlyAssignedControllers.value.filter((controller) => {
      const matchesStatus = controller.sensors.some((sensor) => ['error'].includes(sensor.status))
      if (matchesStatus) {
        return status.error
      }
    })
    return status.active
  }
  return status.inactive
})

const currentlyAssignedControllers = computed(() => {
  return (
    props.plant.controllers?.filter((controller) =>
      controller.sensors?.some((sensor) => sensor.currently_assigned),
    ) ?? []
  )
})

const isExtern = (did: string): boolean => {
  if (!did) {
    return false
  }
  return useDeviceStore().devices.find(
    (dev) => dev.did === did
  )?.owner.username !== useUserStore().user?.username
}
</script>

<template>
  <TableRow>
    <TableCell class="overflow-hidden font-medium">
      <RouterLink :to="`/plant/${plant.plantId}`">
        {{ plant.name }}
      </RouterLink>
    </TableCell>
    <TableCell>
      <RouterLink :to="currentlyAssignedControllers[0] && !isExtern(currentlyAssignedControllers[0]?.did) ? `/sensor/${plant.controllers[0].did}` : '#'">
        <Badge :variant="getStatus.value" class="w-full justify-center">
          {{ getStatus.label }}
        </Badge>
      </RouterLink>
    </TableCell>
    <TableCell class="hidden md:table-cell">
      <RouterLink :to="`/groups#${group.gid}`">
        {{ group.name }}
      </RouterLink>
    </TableCell>

    <TableCell class="hidden md:table-cell">
      <RouterLink :to="`/groups#${room.rid}`">
        {{ room.name }}
      </RouterLink>
    </TableCell>
    <TableCell class="hidden md:table-cell">
      <RouterLink :to="currentlyAssignedControllers[0] && !isExtern(currentlyAssignedControllers[0]?.did) ? `/sensor/${plant.controllers[0].did}` : '#'">
        {{ currentlyAssignedControllers[0]?.did ?? '--' }} {{isExtern(currentlyAssignedControllers[0]?.did) ? `(${t('ext')})` : ''}}
      </RouterLink>
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
          <DropdownMenuLabel>{{ t('SensorViewRow.Actions') }}</DropdownMenuLabel>
          <RouterLink :to="`/plant/${plant.plantId}/edit`">
            <DropdownMenuItem>{{ t('SensorViewRow.Edit') }}</DropdownMenuItem>
          </RouterLink>
          <DropdownMenuItem @click="$emit('delete', plant.plantId)">{{
            t('SensorViewRow.Delete')
          }}</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </TableCell>
  </TableRow>
</template>

<style scoped></style>
