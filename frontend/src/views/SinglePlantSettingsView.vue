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
import {useDeviceStore} from "@/stores";
import {Select, SelectTrigger, SelectValue, SelectItem, SelectContent, SelectGroup, SelectLabel} from '@/components/ui/select'
import {plantAvatars} from '@/components/plant3d/plantAvatars'
import type {Room} from "@/api";
const router = useRouter()
const { t } = useI18n()

const deviceStore = useDeviceStore()

const selectedEntity = ref<Room | null>(null)
</script>

<template>
  <NavCard :sub-title="t('plant.settings.SubTitle')" :title="t('plant.settings.Title')">
    <CardContent class="grid gap-6">
      <div class="grid gap-2">
        <Label for="subject">{{ t('plant.settings.NameOfPlant') }}</Label>
        <Input id="subject" :placeholder="t('plant.settings.NamePlaceholder')" />
      </div>
      <div class="grid gap-4">
        <div class="grid gap-2">
          <Label for="room">{{ t('plant.settings.Room') }}</Label>
          <RoomSelection id="room" v-model="selectedEntity" />
        </div>
        <div class="grid gap-2">
          <Label for="sensor">{{ t('plant.settings.SelectSensor') }}</Label>
          <Select id="sensor">
            <SelectTrigger>
              <SelectValue placeholder="Select a sensor" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectLabel>Sensors</SelectLabel>
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
        <Input id="plantType" :placeholder="t('plant.settings.PlantTypePlaceholder')" />
      </div>

      <div class="grid gap-2">
        <Label for="avatar">{{ t('plant.settings.Avatar') }}</Label>
        <Select id="avatar">
          <SelectTrigger>
            <SelectValue placeholder="Select a fruit" />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectLabel>Fruits</SelectLabel>
              <SelectItem v-for="avatar in plantAvatars" :value="avatar.value">
                {{avatar.label}}
              </SelectItem>
            </SelectGroup>
          </SelectContent>
        </Select>
      </div>

      <div class="grid gap-2">
        <Label for="description">{{ t('plant.settings.Description') }}</Label>
        <Textarea id="description" :placeholder="t('plant.settings.DescriptionPlaceholder')" />
      </div>
    </CardContent>
    <CardFooter class="justify-between space-x-2">
      <Button variant="ghost" @click="router.back()">{{ t('plant.settings.Cancel') }}</Button>
      <Button>{{ t('plant.settings.Submit') }}</Button>
    </CardFooter>
  </NavCard>
</template>

<style scoped></style>
