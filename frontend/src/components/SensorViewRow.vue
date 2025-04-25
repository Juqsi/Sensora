<script lang="ts" setup>
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu'
import { Button } from '@/components/ui/button'
import { TableCell, TableRow } from '@/components/ui/table'
import { MoreHorizontal } from 'lucide-vue-next'
import { Badge } from '@/components/ui/badge'
import { computed, type PropType } from 'vue'
import type { Group, Plant, Room } from '@/api'
import { useI18n } from 'vue-i18n'
import { useDeviceStore, useUserStore } from '@/stores'
import { getActiveController } from '@/composables/useActiveController.ts'

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
  room: { type: Object as PropType<Room>, required: true }
})
defineEmits(['delete'])

const getStatus = computed(() => {
  if (currentlyAssignedControllers.value.length === 0) {
    return status.inactive;
  }

  const hasError = currentlyAssignedControllers.value.some(controller =>
    controller.sensors.some(sensor => sensor.status === 'error')
  );

  return hasError ? status.error : status.active;
});

const currentlyAssignedControllers = computed(() => {
  return getActiveController(props.plant.controllers)
})

const firstAssignedController = computed(() => currentlyAssignedControllers.value[0] ?? null)

const isExternal = computed(() => {
  const did = firstAssignedController.value?.did
  if (!did) return false
  const device = useDeviceStore().devices.find((dev) => dev.did === did)
  return device?.owner.username !== useUserStore().user?.username
})

const sensorLink = computed(() => {
  if (firstAssignedController.value && !isExternal.value) {
    return `/sensor/${firstAssignedController.value.did}`
  }
  return '#'
})
</script>

<template>
  <TableRow>
    <TableCell class="overflow-hidden font-medium">
      <RouterLink :to="`/plant/${plant.plantId}`">
        {{ plant.name }}
      </RouterLink>
    </TableCell>
    <TableCell>
      <RouterLink :to="sensorLink">
        <Badge :variant="getStatus.value" class="w-full justify-center">
          {{ getStatus.label }} {{ isExternal ? `| ${t('plant.external')}` : '' }}
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
      <RouterLink :to="sensorLink">
        {{ firstAssignedController?.did ?? '--' }}
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
          <DropdownMenuItem @click="$emit('delete', plant.plantId)"
            >{{ t('SensorViewRow.Delete') }}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </TableCell>
  </TableRow>
</template>

<style scoped></style>
