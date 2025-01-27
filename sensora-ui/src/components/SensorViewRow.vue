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

const status = {
  active: { label: 'active', value: 'default' },
  inactive: { label: 'inactive', value: 'secondary' },
  unknown: { label: 'unknown', value: 'outline' },
  error: { label: 'error', value: 'destructive' },
} as const

type StatusKey = keyof typeof status

defineProps({
  name: { type: String, required: true },
  id: { type: String, required: true },
  url: { type: String, required: true },
  img: { type: String, required: false },
  badge: {
    type: Object as () => StatusKey,
    required: true,
  },
  group: { type: String, required: true },
  room: { type: String, required: true },
  sensor: { type: String, required: true },
})

defineEmits(['delete'])
</script>

<template>
  <TableRow>
    <TableCell class="hidden sm:table-cell">
      <router-link :to="url">
        <img
          alt="Product image"
          class="aspect-square rounded-md object-cover"
          height="64"
          src="https://www.svgrepo.com/show/508699/landscape-placeholder.svg"
          width="64"
        />
      </router-link>
    </TableCell>
    <TableCell class="overflow-hidden font-medium">
      <router-link :to="url">
        {{ name }}
      </router-link>
    </TableCell>
    <TableCell>
      <router-link :to="url">
        <Badge :variant="status[badge].value" class="w-full justify-center">
          {{ status[badge].label }}
        </Badge>
      </router-link>
    </TableCell>
    <TableCell class="hidden md:table-cell">
      <router-link :to="url">
        {{ group }}
      </router-link>
    </TableCell>
    <TableCell class="hidden md:table-cell">
      <router-link :to="url">
        {{ room }}
      </router-link>
    </TableCell>
    <TableCell class="hidden md:table-cell">
      <router-link :to="url">
        {{ sensor }}
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
          <router-link to="/plant/123/edit">
            <DropdownMenuItem>Edit</DropdownMenuItem>
          </router-link>
          <DropdownMenuItem @click="$emit('delete')"> Delete</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </TableCell>
  </TableRow>
</template>

<style scoped></style>
