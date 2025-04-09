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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table/index.ts'
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
import { computed, onMounted, ref } from 'vue'
import { useDeviceStore, useGroupStore, usePlantStore } from '@/stores'
import { usePullToRefresh } from '@/composables/usePullToRefresh.ts'
import EmtyState from '@/components/EmtyState.vue'
import { useI18n } from 'vue-i18n'
import PlantListView from './PlantListView.vue'
import type { Controller } from '@/api'

const { t } = useI18n()

const groupStore = useGroupStore()
const deviceStore = useDeviceStore()
const plantStore = usePlantStore()

const searchQuery = ref('')
const tab = ref<string>('plants')

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

const filteredPlantList = computed(() => {
  return flatPlantList.value.filter((item) => {
    const matchesStatus =
      item.plant.controllers.some((controller) =>
        controller.sensors.some((sensor) =>
          sensor.currently_assigned && values.items!.includes(sensor.status)
        )
      ) ||
      (item.plant.controllers.length === 0 && values.items!.includes('inactive'))

    const matchesSearch =
      searchQuery.value.trim() === '' ||
      item.plant.name.toLowerCase().includes(searchQuery.value.toLowerCase())

    return matchesStatus && matchesSearch
  })
})

const filteredControllerList = computed(() => {
  return deviceStore.devices.filter((controller) => {
    const matchesStatus = controller.sensors.some((sensor) => values.items!.includes(sensor.status ?? 'unknown'))

    const matchesSearch =
      searchQuery.value.trim() === '' ||
      controller.did.toLowerCase().includes(searchQuery.value.toLowerCase())

    return matchesStatus && matchesSearch
  })
})

const controllerMap = new Map(
  flatPlantList.value.flatMap(
    (obj) => obj.plant.controllers?.map((controller) => [controller.did, obj]) || [],
  ),
)

const filter = [
  {
    id: 'active',
    label: t('active'),
  },
  {
    id: 'error',
    label: t('error'),
  },

  {
    id: 'inactive',
    label: t('inactive'),
  },
  {
    id: 'unknown',
    label: t('unknown'),
  },
] as const

const formSchema = toTypedSchema(
  z.object({
    items: z.array(z.string()).refine((value) => value.some((item) => item), {
      message: t('PlantList.ErrorFilter'),
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
}

const alertDialog = ref(false)
const deleteEntryId = ref<string>('')

const openDeleteEntryDialog = (id: string) => {
  deleteEntryId.value = id
  alertDialog.value = true
}
const deleteEntry = () => {
  alertDialog.value = false
  plantStore.deletePlant(deleteEntryId.value)
  deleteEntryId.value = ''
}
usePullToRefresh(async () => {
  if (tab.value === 'plants') {
    try {
      await groupStore.fetchGroups(true)
    } catch (e) {
      console.error(e)
    }
  } else if (tab.value === 'sensors') {
    try {
      await deviceStore.fetchDevices(true)
    } catch (e) {
      console.error(e)
    }
  }
})
onMounted(() => {
  try {
    deviceStore.fetchDevices()
  } catch (e) {
    console.error(e)
  }
  try {
    groupStore.fetchGroups()
  } catch (e) {
    console.error(e)
  }
  try {
    plantStore.fetchPlants()
  } catch (e) {
    console.error(e)
  }
})

const getLatestLastCall = (controller: Controller): string => {
  console.log('Controller beim Aufruf:', controller);
  return controller.sensors
    .sort((a, b) => {
      console.log('Vergleiche Sensor A:', a);
      console.log('Vergleiche Sensor B:', b);
      const dateA = new Date(a.lastCall!).getTime();
      const dateB = new Date(b.lastCall!).getTime();
      console.log('Datum A:', a.lastCall, dateA);
      console.log('Datum B:', b.lastCall, dateB);
      return dateB - dateA;
    })
    [0]?.lastCall ?? '--';
};

</script>

<template>
  <div class="flex flex-col sm:gap-4 sm:py-4 w-full">
    <header
      class="w-full top-0 z-30 h-14 items-center gap-4 border-b bg-background sm:static sm:h-auto sm:border-0 sm:bg-transparent sm:px-6"
    >
      <div class="relative w-full ml-auto flex-1 md:grow-0">
        <Search class="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          v-model="searchQuery"
          class="w-full rounded-lg bg-background pl-8"
          placeholder="Search..."
          type="search"
        />
      </div>
    </header>
    <main class="grid flex-1 items-start gap-4 sm:px-6 sm:py-0 md:gap-8">
      <AlertDialog :open="alertDialog">
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{{t('PlantList.DeletePlantWarningTitle')}}</AlertDialogTitle>
            <AlertDialogDescription>
              {{t('PlantList.DeletePlantWarningDescription')}}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel @click="((alertDialog = false), (deleteEntryId = ''))">
             {{t('PlantList.Cancel')}}
            </AlertDialogCancel>
            <AlertDialogAction variant="destructive" @click="deleteEntry">
              {{t('PlantList.Delete')}}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      <Tabs v-model:modelValue="tab" class="overflow-hidden">
        <div class="flex items-center w-full justify-between">
          <TabsList class="my-2">
            <TabsTrigger value="plants">{{t('PlantList.Plants')}}</TabsTrigger>
            <TabsTrigger value="sensors">{{t('PlantList.Sensors')}}</TabsTrigger>
          </TabsList>
          <div class="flex items-center gap-2">
            <DropdownMenu>
              <DropdownMenuTrigger as-child>
                <Button class="h-7 gap-1" size="sm" variant="outline">
                  <ListFilter class="h-3.5 w-3.5" />
                  <span class="sr-only sm:not-sr-only sm:whitespace-nowrap">{{t('PlantList.Filter')}}</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>{{t('PlantList.FilterBy')}}</DropdownMenuLabel>
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
            <router-link to="/newPlant">
              <Button class="h-7 gap-1" size="sm">
                <PlusCircle class="h-3.5 w-3.5" />
                <span class="sr-only sm:not-sr-only sm:whitespace-nowrap"> {{t('PlantList.AddPlant')}} </span>
              </Button>
            </router-link>
          </div>
        </div>
        <TabsContent value="plants">
          <Card>
            <CardHeader>
              <CardTitle>{{t('PlantList.Plants')}}</CardTitle>
              <CardDescription>{{t('PlantList.PlantsDescription')}}</CardDescription>
            </CardHeader>
            <CardContent class="p-3">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{{t('PlantList.Name')}}</TableHead>
                    <TableHead class="text-center max-w-fit">{{t('PlantList.Status')}}</TableHead>
                    <TableHead class="hidden md:table-cell">{{t('PlantList.Group')}}</TableHead>
                    <TableHead class="hidden md:table-cell">{{t('PlantList.Room')}}</TableHead>
                    <TableHead class="hidden md:table-cell">{{t('PlantList.Sensor')}}</TableHead>
                    <TableHead>
                      <span class="sr-only">Actions</span>
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <SensorViewRow
                    v-for="item in filteredPlantList"
                    :id="item.plant.plantId"
                    :group="item.group"
                    :plant="item.plant"
                    :room="item.room"
                    @delete="openDeleteEntryDialog(item.plant.plantId)"
                  />
                </TableBody>
              </Table>
            </CardContent>
            <CardFooter>
              <div class="text-xs text-muted-foreground">
                {{t('PlantList.Showing')}} <strong>{{ filteredPlantList.length }}</strong> {{t('PlantList.Plants')}}
              </div>
            </CardFooter>
          </Card>
          <EmtyState
            :condition="plantStore.plants.length === 0"
            :subtitle="t('plantList.emptyPlantSubtitle')"
            :title="t('plantList.emptyPlantTitle')"
            img-src="/svg/undraw_new-entries_xw4m.svg"
          />
        </TabsContent>

        <TabsContent value="sensors">
          <Card>
            <CardHeader>
              <CardTitle>{{t('PlantList.Sensors')}}</CardTitle>
              <CardDescription>{{t('PlantList.SensorsDescription')}}</CardDescription>
            </CardHeader>
            <CardContent class="p-3">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{{t('PlantList.ID')}}</TableHead>
                    <TableHead class=" max-w-fit">{{t('PlantList.Plant')}}</TableHead>
                    <TableHead class="hidden md:table-cell">{{t('PlantList.LastCall')}}</TableHead>
                    <TableHead class="hidden md:table-cell">{{t('PlantList.Model')}}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow v-for="sensor in filteredControllerList">
                    <TableCell class="overflow-hidden font-medium">
                      <router-link :to="`/sensor/${sensor.did}`">
                        {{ sensor.did }}
                      </router-link>
                    </TableCell>
                    <TableCell>
                      <router-link :to="`/plant/${sensor.did}`">
                        {{ controllerMap.get(sensor.did)?.plant.name ?? '' }}
                      </router-link>
                    </TableCell>
                    <TableCell class="hidden md:table-cell">
                      {{
                        getLatestLastCall(sensor)
                      }}
                    </TableCell>
                    <TableCell class="hidden md:table-cell">
                      {{ sensor.model }}
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </CardContent>
            <CardFooter>
              <div class="text-xs text-muted-foreground">
                {{t('PlantList.Showing')}} <strong>{{ filteredControllerList.length }}</strong> {{t('PlantList.Sensors')}}
              </div>
            </CardFooter>
          </Card>
          <EmtyState
            :condition="deviceStore.devices.length === 0"
            :subtitle="t('sensorList.emptySensorSubtitle')"
            :title="t('sensorList.emptySensorTitle')"
            img-src="/svg/undraw_new-entries_xw4m.svg"
          />
        </TabsContent>
      </Tabs>
    </main>
  </div>
</template>
