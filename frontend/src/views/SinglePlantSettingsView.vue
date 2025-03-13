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
import {
  type Controller,
  type createPlantBody,
  ilk,
  type PlantTargetValues,
  type Room,
  type updatePlantBody,
  type Value,
} from '@/api'
import { toast } from 'vue-sonner'
import {
  NumberField,
  NumberFieldContent,
  NumberFieldDecrement,
  NumberFieldIncrement,
  NumberFieldInput,
} from '@/components/ui/number-field'
import { Switch } from '@/components/ui/switch'
import { v4 as uuid } from 'uuid'

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

const targetValuesTemperature = ref<number>(24)
var targetValuesTemperatureTid = uuid()
const targetValuesSoilMoisture = ref<number>(30)
var targetValuesSoilMoistureTid = uuid()
const targetValuesHumidity = ref<number>(50)
var targetValuesHumidityTid = uuid()
const targetValuesBrightness = ref<number>(10)
var targetValuesBrightnessTid = uuid()

const activateTargetValues = ref<Boolean>(false)

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
      if (editPlant?.targetValues !== undefined && editPlant?.targetValues.length !== 0) {
        for (let value of editPlant?.targetValues) {
          switch (value.ilk as ilk) {
            case ilk.temperature: {
              targetValuesTemperature.value = value.value
              targetValuesTemperatureTid = value.tid ?? uuid()
              break
            }
            case ilk.humidity: {
              targetValuesHumidity.value = value.value
              targetValuesHumidityTid = value.tid ?? uuid()
              break
            }
            case ilk.soilMoisture: {
              targetValuesSoilMoisture.value = value.value
              targetValuesSoilMoistureTid = value.tid ?? uuid()
              break
            }
            case ilk.brightness: {
              targetValuesBrightness.value = value.value
              targetValuesBrightnessTid = value.tid ?? uuid()
              break
            }
          }
          activateTargetValues.value = true
        }
      }
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
    toast.warning(t('Please enter a valid room'))
  }
  if (route.params.id === undefined) {
    const newPlant: createPlantBody = {
      name: name.value,
      room: selectedRoom.value!.rid,
      assignFullDevice: selectedSensor.value ? [selectedSensor.value.did] : [],
      plantType: plantType.value,
      avatarId: selectedAvatar.value?.value,
      note: note.value,
    }

    if (activateTargetValues.value === true) {
      newPlant.targetValues = [
        { value: targetValuesTemperature.value, ilk: ilk.temperature },
        { value: targetValuesHumidity.value, ilk: ilk.humidity },
        { value: targetValuesSoilMoisture.value, ilk: ilk.soilMoisture },
        { value: targetValuesBrightness.value, ilk: ilk.brightness },
      ]
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
      assignFullDevice: selectedSensor.value ? [selectedSensor.value.did] : [],
      plantType: plantType.value,
      avatarId: selectedAvatar.value?.value,
      note: note.value,
    }
    if (activateTargetValues.value === true) {
      editPlant.targetValues = [
        {
          value: targetValuesTemperature.value,
          ilk: ilk.temperature,
          tid: targetValuesTemperatureTid,
        },
        { value: targetValuesHumidity.value, ilk: ilk.humidity, tid: targetValuesHumidityTid },
        {
          value: targetValuesSoilMoisture.value,
          ilk: ilk.soilMoisture,
          tid: targetValuesSoilMoistureTid,
        },
        {
          value: targetValuesBrightness.value,
          ilk: ilk.brightness,
          tid: targetValuesBrightnessTid,
        },
      ]
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

      <div class="w-full">
        <div class="flex items-center justify-between w-full gap-5">
          <Label for="targetValues">{{ t('plant.settings.targetValues') }}</Label>
          <Switch v-model="activateTargetValues" id="temperaturSwitch" />
        </div>
        <div
          v-if="activateTargetValues"
          class="mx-2 grid gap-2 md:grid-cols-2 mt-2"
          id="targetValues"
        >
          <NumberField id="temperature" v-model="targetValuesTemperature" :min="0">
            <Label for="temperature">
              {{ t('values.temperature') }}
            </Label>
            <NumberFieldContent v-if="activateTargetValues">
              <NumberFieldDecrement />
              <NumberFieldInput />
              <NumberFieldIncrement />
            </NumberFieldContent>
          </NumberField>
          <NumberField id="soilMoisture" v-model="targetValuesSoilMoisture" :max="100" :min="0">
            <Label for="soilMoisture">{{ t('values.soilMoisture') }}</Label>
            <NumberFieldContent>
              <NumberFieldDecrement />
              <NumberFieldInput />
              <NumberFieldIncrement />
            </NumberFieldContent> </NumberField
          ><NumberField id="humidity" v-model="targetValuesHumidity" :max="100" :min="0">
            <Label for="humidity">{{ t('values.humidity') }}</Label>
            <NumberFieldContent>
              <NumberFieldDecrement />
              <NumberFieldInput />
              <NumberFieldIncrement />
            </NumberFieldContent>
          </NumberField>
          <NumberField id="brightness" v-model="targetValuesBrightness" :min="0">
            <Label for="brightness">{{ t('values.brightness') }}</Label>
            <NumberFieldContent>
              <NumberFieldDecrement />
              <NumberFieldInput />
              <NumberFieldIncrement />
            </NumberFieldContent>
          </NumberField>
        </div>
      </div>

      <div class="grid gap-2">
        <Label for="plantType">{{ t('plant.settings.PlantType') }}</Label>
        <Input
          id="plantType"
          v-model="plantType"
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
          v-model="note"
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
