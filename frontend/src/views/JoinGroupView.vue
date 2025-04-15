<script setup lang="ts">
import {useRoute, useRouter} from 'vue-router'
import { useGroupStore } from '@/stores'

const route = useRoute()
const router = useRouter()

const groupStore = useGroupStore()

if (route.query.inviteToken){
  groupStore.joinGroup(route.query.inviteToken as string)
  router.push("/groups")
}
</script>

<template>

</template>

<style scoped>

</style>
