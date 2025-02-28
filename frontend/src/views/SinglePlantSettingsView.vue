<script lang="ts" setup>
import { CardContent, CardFooter } from '@/components/ui/card'
import { Label } from '@/components/ui/label/index.ts'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input/index.ts'
import { Textarea } from '@/components/ui/textarea/index.ts'
import { useI18n } from 'vue-i18n'
import RoomSelection from '@/components/RoomSelection.vue'
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import NavCard from '@/components/NavCard.vue'
import {useDeviceStore, usePlantStore} from "@/stores";
import {Select, SelectTrigger, SelectValue, SelectItem, SelectContent, SelectGroup, SelectLabel} from '@/components/ui/select'
import {plantAvatars} from '@/components/plant3d/plantAvatars'
import {type Controller, type createPlantBody, type Room} from "@/api"
import {toast} from "vue-sonner";
const router = useRouter()
const { t } = useI18n()

const deviceStore = useDeviceStore()
const plantStore = usePlantStore()

const name = ref<string>("")
const selectedRoom = ref<Room | null>(null)
const selectedSensor = ref<Controller | null>(null)
const plantType = ref<string>("")
const selectedAvatar = ref< {label:string, value:string} | null>(null)
const note = ref<string>("")

const createPlant = ()=>{
  if (!selectedRoom.value) {
    toast.warning(t("Please enter a valid room"))
  }
  const newPlant : createPlantBody = {
    name: name.value,
    room : selectedRoom.value!.rid,
  }
  try {
    plantStore.createPlant(newPlant)
  }
  catch (error) {
    console.log(error)
  }
}
</script>

<template>
  <NavCard :sub-title="t('plant.settings.SubTitle')" :title="t('plant.settings.Title')">
    <CardContent class="grid gap-6">

      <div class="grid gap-2">
        <Label for="subject">{{ t('plant.settings.NameOfPlant') }}</Label>
        <Input v-model="name" id="subject" :placeholder="t('plant.settings.NamePlaceholder')" />
      </div>

      <div class="grid gap-4">
        <div class="grid gap-2">
          <Label for="room">{{ t('plant.settings.Room') }}</Label>
          <RoomSelection id="room" v-model="selectedRoom" />
        </div>
        <div class="grid gap-2">
          <Label for="sensor">{{ t('plant.settings.SelectSensor') }}</Label>
          <Select v-model="selectedSensor" id="sensor">
            <SelectTrigger>
              <SelectValue :placeholder="t('plant.settings.SelectSensorPlaceholder')" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectLabel>{{t('plant.settings.sensors')}}</SelectLabel>
                <SelectItem v-for="device in deviceStore.devices" :value="device.did">
                  {{device.did}}
                </SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div class="grid gap-2">
        <Label for="plantType">{{ t('plant.settings.PlantType') }}</Label>
        <Input id="plantType" v-model:value="plantType" :placeholder="t('plant.settings.PlantTypePlaceholder')" />
      </div>

      <div class="grid gap-2">
        <Label for="avatar">{{ t('plant.settings.Avatar') }}</Label>
        <Select id="avatar">
          <SelectTrigger>
            <SelectValue v-model:value="selectedAvatar" :placeholder="t('plant.settings.AvatarPlaceholder')" />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectLabel>{{t('plant.settings.avatar')}}</SelectLabel>
              <SelectItem v-for="avatar in plantAvatars" :value="avatar.value">
                {{avatar.label}}
              </SelectItem>
            </SelectGroup>
          </SelectContent>
        </Select>
      </div>

      <div class="grid gap-2">
        <Label for="description">{{ t('plant.settings.Description') }}</Label>
        <Textarea v-model:value="note" id="description" :placeholder="t('plant.settings.DescriptionPlaceholder')" />
      </div>
    </CardContent>
    <CardFooter class="justify-between space-x-2">
      <Button variant="ghost" @click="router.back()">{{ t('plant.settings.Cancel') }}</Button>
      <Button @click="createPlant">{{ t('plant.settings.Submit') }}</Button>
    </CardFooter>
  </NavCard>
</template>

<style scoped></style>
