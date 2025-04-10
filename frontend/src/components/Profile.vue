<script lang="ts" setup>
import { Settings } from 'lucide-vue-next'
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button/index.ts'
import {useUserStore} from '@/stores'
import {useI18n} from 'vue-i18n'
import { STATICS_PATH } from '@/api/base.ts'

const {t} = useI18n()
const userStore = useUserStore()
</script>
<template>
  <Card class="w-full">
    <CardHeader>
      <div class="flex items-center justify-between w-full">
        <div class="flex items-center space-x-4">
          <Avatar shape="circle" size="sm">
            <AvatarImage
              :alt="t('Profile.ProfilePicture')"
              :src="STATICS_PATH(userStore.user?.avatarRef)"
            />
            <AvatarFallback>{{userStore.user?.firstname[0]??''}}</AvatarFallback>
          </Avatar>
          <div>
            <CardTitle>{{userStore.user?.firstname}} {{userStore.user?.lastname ?? ""}}</CardTitle>
            <CardDescription>{{userStore.user?.mail??''}}</CardDescription>
          </div>
        </div>
        <RouterLink to="/settings">
          <Button size="icon" variant="ghost">
            <Settings />
          </Button>
        </RouterLink>
      </div>
    </CardHeader>
  </Card>
</template>

<style scoped></style>
