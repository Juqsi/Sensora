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
import { useDeviceStore, usePlantStore, useRoomStore, useUserStore } from '@/stores'
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { plantAvatars } from '@/components/plant3d/plantAvatars'
import { type createPlantBody, ilk, type Room, type updatePlantBody } from '@/api'
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
import { Sparkles } from 'lucide-vue-next'
import InfoTooltip from '@/components/InfoTooltip.vue'
import { getActiveController } from '@/composables/useActiveController.ts'
import {Label} from '@/components/ui/label'

const router = useRouter()
const route = useRoute()

const { t } = useI18n()

const deviceStore = useDeviceStore()
const roomStore = useRoomStore()
const plantStore = usePlantStore()

const name = ref<string>('')
const selectedRoom = ref<Room | undefined>(undefined)
const selectedSensor = ref<string>('')
const plantType = ref<string>('')
const selectedAvatar = ref<string>('')
const note = ref<string>('')

const targetValuesTemperature = ref<number>(24)
let targetValuesTemperatureTid = uuid()
const targetValuesSoilMoisture = ref<number>(30)
let targetValuesSoilMoistureTid = uuid()
const targetValuesHumidity = ref<number>(50)
let targetValuesHumidityTid = uuid()
const targetValuesBrightness = ref<number>(10)
let targetValuesBrightnessTid = uuid()

const isControllerOwner = ref<boolean>(true)

const activateTargetValues = ref<boolean>(false)
const activateSensor = ref<boolean>(false)

const loadPlantDetails = async () => {
  try {
    const editPlant = await plantStore.getPlantDetails(route.params.id as string)

    if (editPlant) {
      name.value = editPlant?.name ?? ''
      const activeController = getActiveController(editPlant?.controllers)
      isControllerOwner.value = activeController.length === 0 ? true : activeController[0]?.owner.username === useUserStore().user?.username
      selectedRoom.value = (await roomStore.getRoomDetails(editPlant?.room as string)) ?? undefined
      selectedSensor.value = activeController[0]?.did ?? ''
      activateSensor.value = selectedSensor.value.trim().length !== 0
      plantType.value = editPlant?.plantType ?? ''

      const avatar = plantAvatars.find((avatar) => avatar.value === (editPlant?.avatarId ?? ''))
      selectedAvatar.value = avatar?.value ? avatar!.value : selectedAvatar.value

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
  } else {
    const query = route.query
    if (query.commonName) {
      name.value = query.commonName as string
    }
    if (query.scientificName) {
      plantType.value = query.scientificName as string
    }
    if (query.note) {
      note.value = query.note as string
    }
    if (query.targetValuesTemperature) {
      activateTargetValues.value = true
      targetValuesTemperature.value = Number(query.targetValuesTemperature)
    }
    if (query.targetValuesSoilMoisture) {
      activateTargetValues.value = true
      targetValuesSoilMoisture.value = Number(query.targetValuesSoilMoisture)
    }
    if (query.targetValuesHumidity) {
      activateTargetValues.value = true
      targetValuesHumidity.value = Number(query.targetValuesHumidity)
    }
    if (query.targetValuesBrightness) {
      activateTargetValues.value = true
      targetValuesBrightness.value = Number(query.targetValuesBrightness)
    }
  }
})

const createPlant = async () => {
  if (selectedRoom.value === undefined || selectedRoom.value.rid === undefined) {
    toast.warning(t('SinglePlant.EnterValidRoom'))
    return
  }
  if (!name.value.trim()) {
    toast.warning(t('SinglePlant.EnterInvalidName'))
    return
  }
  if (route.params.id === undefined) {
    const newPlant: createPlantBody = {
      name: name.value,
      room: selectedRoom.value!.rid,
      assignFullDevice: activateSensor.value && selectedSensor.value ? [selectedSensor.value] : [],
      plantType: plantType.value,
      avatarId: selectedAvatar.value,
      note: note.value,
    }

    if (activateTargetValues.value) {
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
    let editPlant : updatePlantBody = {
        name: name.value,
        room: selectedRoom.value!.rid,
        assignFullDevice:
          activateSensor.value && selectedSensor.value ? [selectedSensor.value] : [],
        plantType: plantType.value,
        avatarId: selectedAvatar.value,
        note: note.value,
      }
    if (activateTargetValues.value && isControllerOwner.value) {
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
      router.push('/plants')
    } catch (error) {
      console.log(error)
    }
  }
}
</script>

<template>
  <NavCard :sub-title="t('plant.settings.SubTitle')" :title="t('plant.settings.Title')">
    <template #TitleRight>
      <RouterLink :to="{ name: 'PlantUpload' }">
        <Button variant="outline" size="icon" class="cursor-pointer">
          <Sparkles class="text-blue-400" />
        </Button>
      </RouterLink>
    </template>
    <template #default>
      <CardContent class="grid gap-6 max-w-full">
        <div class="grid gap-2">
          <Label for="subject">{{ t('plant.settings.NameOfPlant') }}</Label>
          <Input id="subject" v-model="name" :placeholder="t('plant.settings.NamePlaceholder')" />
        </div>

        <div class="grid gap-4">
          <div class="grid gap-2 max-w-full">
            <Label for="room">{{ t('plant.settings.Room') }}</Label>
            <RoomSelection id="room" v-model:room="selectedRoom" />
          </div>
          <div class="grid gap-2">
            <div class="flex items-center justify-between w-full gap-5">
              <Label for="sensor">{{ t('plant.settings.SelectSensor') }}</Label>
              <Switch id="sensorSwitch" v-model="activateSensor" />
            </div>
            <Select v-if="activateSensor" id="sensor" @update:modelValue="isControllerOwner = true" v-model="selectedSensor">
              <SelectTrigger>
                <SelectValue :placeholder="t('plant.settings.SelectSensorPlaceholder')" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectItem
                    v-for="device in deviceStore.devices"
                    :key="device.did"
                    :value="device.did"
                  >
                    {{ device.did }}
                  </SelectItem>
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>
        </div>
        <div class="w-full">
          <div class="flex items-center justify-between w-full gap-5">
            <div class="flex items-center space-x-1">
              <Label for="targetValues">{{ t('plant.settings.targetValues') }}</Label>
              <InfoTooltip :message="t('plant.settings.targetValuesInfo')" />
            </div>
            <Switch :disabled="!isControllerOwner" id="temperaturSwitch" v-model="activateTargetValues" />
          </div>
          <div
            v-if="activateTargetValues"
            id="targetValues"
            class="mx-2 grid gap-2 md:grid-cols-2 mt-2"
          >
            <NumberField :disabled="!isControllerOwner" id="temperature" v-model="targetValuesTemperature" :min="0">
              <Label for="temperature">
                {{ t('temperature') }}
              </Label>
              <NumberFieldContent v-if="activateTargetValues">
                <NumberFieldDecrement />
                <NumberFieldInput />
                <NumberFieldIncrement />
              </NumberFieldContent>
            </NumberField>
            <NumberField :disabled="!isControllerOwner" id="soilMoisture" v-model="targetValuesSoilMoisture" :max="100" :min="0">
              <Label for="soilMoisture">{{ t('soilMoisture') }}</Label>
              <NumberFieldContent>
                <NumberFieldDecrement />
                <NumberFieldInput />
                <NumberFieldIncrement />
              </NumberFieldContent>
            </NumberField>
            <NumberField :disabled="!isControllerOwner" id="humidity" v-model="targetValuesHumidity" :max="100" :min="0">
              <Label for="humidity">{{ t('humidity') }}</Label>
              <NumberFieldContent>
                <NumberFieldDecrement />
                <NumberFieldInput />
                <NumberFieldIncrement />
              </NumberFieldContent>
            </NumberField>
            <NumberField :disabled="!isControllerOwner" id="brightness" v-model="targetValuesBrightness" :min="0">
              <Label for="brightness">{{ t('brightness') }}</Label>
              <NumberFieldContent>
                <NumberFieldDecrement />
                <NumberFieldInput />
                <NumberFieldIncrement />
              </NumberFieldContent>
            </NumberField>
          </div>
        </div>

        <div class="grid gap-2">
          <div class="flex items-center space-x-1">
            <Label for="plantType">{{ t('plant.settings.PlantType') }}</Label>
            <InfoTooltip :message="t('plant.settings.PlantTypeInfo')" />
          </div>
          <Input
            id="plantType"
            v-model="plantType"
            :placeholder="t('plant.settings.PlantTypePlaceholder')"
          />
        </div>

        <div class="grid gap-2">
          <Label for="avatar">{{ t('plant.settings.Avatar') }}</Label>
          <Select id="avatar" v-model="selectedAvatar">
            <SelectTrigger>
              <SelectValue :placeholder="t('plant.settings.AvatarPlaceholder')" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectItem
                  v-for="avatar in plantAvatars"
                  :value="avatar.value"
                  :key="avatar.value"
                >
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
    </template>
  </NavCard>
</template>

<style scoped></style>
