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
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'

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
  img: { type: String, required: false },
  badge: {
    type: Object as () => StatusKey,
    required: true,
  },
  group: { type: String, required: true },
  room: { type: String, required: true },
  sensor: { type: String, required: true },
})
</script>

<template>
  <TableRow>
    <TableCell class="hidden sm:table-cell">
      <img
        alt="Product image"
        class="aspect-square rounded-md object-cover"
        height="64"
        src="https://www.svgrepo.com/show/508699/landscape-placeholder.svg"
        width="64"
      />
    </TableCell>
    <TableCell class="font-medium"> {{ name }}</TableCell>
    <TableCell>
      <Badge :variant="status[badge].value"> {{ status[badge].label }}</Badge>
    </TableCell>
    <TableCell class="hidden md:table-cell"> {{ group }}</TableCell>
    <TableCell class="hidden md:table-cell"> {{ room }}</TableCell>
    <TableCell class="hidden md:table-cell"> {{ sensor }}</TableCell>
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
          <AlertDialog>
            <AlertDialogTrigger as-child>
              <DropdownMenuItem> Delete</DropdownMenuItem>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                <AlertDialogDescription>
                  This action cannot be undone. This will permanently delete your Plant and remove
                  all data from our servers.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>
                  <Button variant="outline"> Cancel</Button>
                </AlertDialogCancel>
                <AlertDialogAction>
                  <Button variant="destructive">Delete</Button>
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </DropdownMenuContent>
      </DropdownMenu>
    </TableCell>
  </TableRow>
</template>

<style scoped></style>
