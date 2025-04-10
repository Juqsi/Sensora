<script lang="ts" setup>
import NavCard from '@/components/NavCard.vue'
import { useDeviceStore } from '@/stores'
import { nextTick,onMounted, ref } from 'vue'
import { useRoute } from 'vue-router'
import { type Controller } from '@/api'
import SensorGroups from '@/components/SensorGroups.vue'
import ControllerInfo from '@/components/ControllerInfo.vue'
import router from '@/router'

const route = useRoute()
const deviceStore = useDeviceStore()
const controller = ref<Controller>()

onMounted(async () => {
  if (route.params.id !== undefined) {
    try {
      controller.value = await deviceStore.fetchDeviceDetails(route.params.id as string)
    }catch (e){
      await nextTick(() => {
        router.push('/plants');
      });
    }
  }
})
</script>

<template>
  <NavCard
    :sub-title="controller?.did ?? ''"
    :title="controller?.model ?? 'Fullcontroller 4+1'"
  />

  <ControllerInfo v-if="controller" :controller="controller" />

  <SensorGroups :sensors="controller?.sensors ?? []" />
</template>
