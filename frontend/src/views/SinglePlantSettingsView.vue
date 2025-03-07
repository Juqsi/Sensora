<script lang="ts" setup>
import { CardContent, CardFooter } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input/index.ts'
import { Textarea } from '@/components/ui/textarea/index.ts'
import { useI18n } from 'vue-i18n'
import RoomSelection from '@/components/RoomSelection.vue'
import { onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import NavCard from '@/components/NavCard.vue'
import { useDeviceStore, usePlantStore, useRoomStore } from '@/stores'
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { plantAvatars } from '@/components/plant3d/plantAvatars'
import { type Controller, type createPlantBody, type Room, type updatePlantBody } from '@/api'
import { toast } from 'vue-sonner'

const router = useRouter()
const route = useRoute()

const { t } = useI18n()

const deviceStore = useDeviceStore()
const roomStore = useRoomStore()
const plantStore = usePlantStore()

const name = ref<string>('')
const selectedRoom = ref<Room | undefined>(undefined)
const selectedSensor = ref<Controller | null>(null)
const plantType = ref<string>('')
const selectedAvatar = ref<{ label: string; value: string } | null>(null)
const note = ref<string>('')

const loadPlantDetails = async () => {
  try {
    const editPlant = await plantStore.getPlantDetails(route.params.id as string)

    if (editPlant) {
      name.value = editPlant?.name ?? ''
      selectedRoom.value = (await roomStore.getRoomDetails(editPlant?.room as string)) ?? undefined
      selectedSensor.value = editPlant?.controllers[0] ?? null
      plantType.value = editPlant?.plantType ?? ''

      const avatar = plantAvatars.find((avatar) => avatar.value === (editPlant?.avatarId ?? ''))
      selectedAvatar.value =
        avatar && avatar.label !== '' && avatar.value !== ''
          ? { label: avatar.label, value: avatar.value }
          : null

      note.value = editPlant?.note ?? ''
    }
  } catch (error) {
    console.error('Fehler beim Laden der Pflanzendetails:', error)
  }
}

onMounted(() => {
  if (route.params.id !== undefined) {
    loadPlantDetails()
  }
})

const createPlant = async () => {
  if (selectedRoom.value === undefined || selectedRoom.value.rid === undefined) {
    toast.warning(t('HIer Please enter a valid room'))
  }
  if (route.params.id === undefined) {
    const newPlant: createPlantBody = {
      name: name.value,
      room: selectedRoom.value!.rid,
      controllers: selectedSensor.value ? [selectedSensor.value as Controller] : [],
      plantType: plantType.value,
      avatarId: selectedAvatar.value?.value,
      note: note.value,
    }
    try {
      await plantStore.createPlant(newPlant)
      router.back()
    } catch (error) {
      console.log(error)
    }
  } else {
    const editPlant: updatePlantBody = {
      name: name.value,
      room: selectedRoom.value!.rid,
      controllers: selectedSensor.value ? [selectedSensor.value as Controller] : [],
      plantType: plantType.value,
      avatarId: selectedAvatar.value?.value,
      note: note.value,
    }
    try {
      await plantStore.updatePlant(route.params.id as string, editPlant)
      router.back()
    } catch (error) {
      console.log(error)
    }
  }
}
</script>

<template>
  <NavCard :sub-title="t('plant.settings.SubTitle')" :title="t('plant.settings.Title')">
    <CardContent class="grid gap-6">
      <div class="grid gap-2">
        <Label for="subject">{{ t('plant.settings.NameOfPlant') }}</Label>
        <Input id="subject" v-model="name" :placeholder="t('plant.settings.NamePlaceholder')" />
      </div>

      <div class="grid gap-4">
        <div class="grid gap-2">
          <Label for="room">{{ t('plant.settings.Room') }}</Label>
          <RoomSelection id="room" v-model:room="selectedRoom" />
        </div>
        <div class="grid gap-2">
          <Label for="sensor">{{ t('plant.settings.SelectSensor') }}</Label>
          <Select id="sensor" v-model:value="selectedSensor">
            <SelectTrigger>
              <SelectValue :placeholder="t('plant.settings.SelectSensorPlaceholder')" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectLabel>{{ t('plant.settings.sensors') }}</SelectLabel>
                <SelectItem v-for="device in deviceStore.devices" v-model:value="device.did">
                  {{ device.did }}
                </SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div class="grid gap-2">
        <Label for="plantType">{{ t('plant.settings.PlantType') }}</Label>
        <Input
          id="plantType"
          v-model:value="plantType"
          :placeholder="t('plant.settings.PlantTypePlaceholder')"
        />
      </div>

      <div class="grid gap-2">
        <Label for="avatar">{{ t('plant.settings.Avatar') }}</Label>
        <Select id="avatar">
          <SelectTrigger>
            <SelectValue
              v-model:value="selectedAvatar"
              :placeholder="t('plant.settings.AvatarPlaceholder')"
            />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectLabel>{{ t('plant.settings.avatar') }}</SelectLabel>
              <SelectItem v-for="avatar in plantAvatars" v-model:value="avatar.value">
                {{ avatar.label }}
              </SelectItem>
            </SelectGroup>
          </SelectContent>
        </Select>
      </div>

      <div class="grid gap-2">
        <Label for="description">{{ t('plant.settings.Description') }}</Label>
        <Textarea
          id="description"
          v-model:value="note"
          :placeholder="t('plant.settings.DescriptionPlaceholder')"
        />
      </div>
    </CardContent>
    <CardFooter class="justify-between space-x-2">
      <Button variant="ghost" @click="router.back()">{{ t('plant.settings.Cancel') }}</Button>
      <Button @click="createPlant">{{ t('plant.settings.Submit') }}</Button>
    </CardFooter>
  </NavCard>
</template>

<style scoped></style>
