<script lang="ts" setup>
import { Button, buttonVariants } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Input } from '@/components/ui/input'
import { Table, TableBody, TableHead, TableHeader, TableRow } from '@/components/ui/table/index.ts'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ListFilter, PlusCircle, Search } from 'lucide-vue-next'
import SensorViewRow from '@/components/SensorViewRow.vue'
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Checkbox } from '@/components/ui/checkbox'
import { useForm } from 'vee-validate'
import { toTypedSchema } from '@vee-validate/zod'
import { z } from 'zod'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog/index.ts'
import {computed, ref} from 'vue'
import { useGroupStore } from '@/stores'

const groupStore = useGroupStore()

const flatPlantList = computed(() =>
  groupStore.groups.flatMap((group) =>
    group.rooms.flatMap((room) =>
      room.plants.map((plant) => ({
        group: group,
        room: room,
        plant: plant,
      })),
    ),
  ),
)


const filter = [
  {
    id: 'active',
    label: 'active',
  },
  {
    id: 'error',
    label: 'error',
  },

  {
    id: 'inactive',
    label: 'inactive',
  },
  {
    id: 'unknown',
    label: 'unknown',
  },
] as const

const formSchema = toTypedSchema(
  z.object({
    items: z.array(z.string()).refine((value) => value.some((item) => item), {
      message: 'You have to select at least one item.',
    }),
  }),
)
const { handleSubmit, values } = useForm({
  validationSchema: formSchema,
  initialValues: {
    items: ['error', 'active', 'inactive', 'unknown'],
  },
  keepValuesOnUnmount: true,
})

const handleCheckboxChange = () => {
  console.log(buttonVariants)
  console.log('Current selected items:', values.items)
}

const alertDialog = ref(false)
const deleteEntryId = ref<string>('')

const openDeleteEntryDialog = (id: string) => {
  deleteEntryId.value = id
  alertDialog.value = true
}
const deleteEntry = () => {
  alertDialog.value = false
  console.log('Deleting entry with id:', deleteEntryId.value)
  deleteEntryId.value = ''
  //TODO delete entry
}
</script>

<template>
  <div class="flex flex-col sm:gap-4 sm:py-4 sm:pl-14 w-full">
    <header
      class="w-full top-0 z-30 h-14 items-center gap-4 border-b bg-background sm:static sm:h-auto sm:border-0 sm:bg-transparent sm:px-6"
    >
      <div class="relative w-full ml-auto flex-1 md:grow-0">
        <Search class="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input class="w-full rounded-lg bg-background pl-8" placeholder="Search..." type="search" />
      </div>
    </header>
    <main class="grid flex-1 items-start gap-4 sm:px-6 sm:py-0 md:gap-8">
      <AlertDialog :open="alertDialog">
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete your plant and remove all
              related data from our servers.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel @click="((alertDialog = false), (deleteEntryId = ''))">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction variant="destructive" @click="deleteEntry">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      <Tabs class="overflow-hidden" default-value="plants">
        <div class="flex items-center w-full justify-between">
          <TabsList class="my-2">
            <TabsTrigger value="plants">Plants</TabsTrigger>
            <TabsTrigger value="sensors">Sensors</TabsTrigger>
          </TabsList>
          <div class="flex items-center gap-2">
            <DropdownMenu>
              <DropdownMenuTrigger as-child>
                <Button class="h-7 gap-1" size="sm" variant="outline">
                  <ListFilter class="h-3.5 w-3.5" />
                  <span class="sr-only sm:not-sr-only sm:whitespace-nowrap"> Filter </span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>Filter by</DropdownMenuLabel>
                <form class="px-2">
                  <FormField name="items">
                    <FormItem>
                      <FormField
                        v-for="item in filter"
                        :key="item.id"
                        v-slot="{ value, handleChange }"
                        :unchecked-value="false"
                        :value="item.id"
                        name="items"
                        type="checkbox"
                      >
                        <FormItem class="flex flex-row items-start space-x-3 space-y-0">
                          <FormControl>
                            <Checkbox
                              :checked="value.includes(item.id)"
                              @update:checked="
                                (checked) => {
                                  handleChange(checked)
                                  handleCheckboxChange()
                                }
                              "
                            />
                          </FormControl>
                          <FormLabel class="font-normal">
                            {{ item.label }}
                          </FormLabel>
                        </FormItem>
                      </FormField>
                      <FormMessage />
                    </FormItem>
                  </FormField>
                </form>
              </DropdownMenuContent>
            </DropdownMenu>

            <Button class="h-7 gap-1" size="sm">
              <PlusCircle class="h-3.5 w-3.5" />
              <span class="sr-only sm:not-sr-only sm:whitespace-nowrap"> Add Plant </span>
            </Button>
          </div>
        </div>
        <TabsContent value="plants">
          <Card>
            <CardHeader>
              <CardTitle>Plants</CardTitle>
              <CardDescription> Manage your Plants</CardDescription>
            </CardHeader>
            <CardContent class="p-3">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead class="text-center max-w-fit">Status</TableHead>
                    <TableHead class="hidden md:table-cell"> Group</TableHead>
                    <TableHead class="hidden md:table-cell"> Room</TableHead>
                    <TableHead class="hidden md:table-cell"> Sensor</TableHead>
                    <TableHead>
                      <span class="sr-only">Actions</span>
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <SensorViewRow
                    v-for="item in flatPlantList"
                    :id="item.plant.plantId"
                    :group="item.group"
                    :room="item.room"
                    :plant = "item.plant"
                    @delete="openDeleteEntryDialog(item.plant.plantId)"
                  />


                </TableBody>
              </Table>
            </CardContent>
            <CardFooter>
              <div class="text-xs text-muted-foreground">Showing <strong>32</strong> Plants</div>
            </CardFooter>
          </Card>
        </TabsContent>
        <TabsContent value="sensors">
          <Card>
            <CardHeader>
              <CardTitle>Plants</CardTitle>
              <CardDescription> Manage your Plants</CardDescription>
            </CardHeader>
            <CardContent class="p-3">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead class="hidden w-[100px] sm:table-cell">
                      <span class="sr-only">img</span>
                    </TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead class="text-center max-w-fit">Status</TableHead>
                    <TableHead class="hidden md:table-cell"> Group</TableHead>
                    <TableHead class="hidden md:table-cell"> Room</TableHead>
                    <TableHead class="hidden md:table-cell"> Sensor</TableHead>
                    <TableHead>
                      <span class="sr-only">Actions</span>
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody> </TableBody>
              </Table>
            </CardContent>
            <CardFooter>
              <div class="text-xs text-muted-foreground">Showing <strong>32</strong> Plants</div>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </main>
  </div>
</template>
