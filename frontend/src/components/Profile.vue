<script lang="ts" setup>
import { Settings } from 'lucide-vue-next'
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Avatar, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button/index.ts'
</script>
<template>
  <Card class="w-full">
    <CardHeader>
      <div class="flex items-center justify-between w-full">
        <div class="flex items-center space-x-4">
          <Avatar shape="circle" size="sm">
            <AvatarImage
              alt="Justus Siegert"
              class="ml-3"
              src="https://avatars.githubusercontent.com/u/91261422?v=4"
            />
            <AvatarFallback>JS</AvatarFallback>
          </Avatar>
          <div>
            <CardTitle>Justus Siegert</CardTitle>
            <CardDescription>kontakt@justus-siegert.de</CardDescription>
          </div>
        </div>
        <router-link to="/settings">
          <Button size="icon" variant="ghost">
            <Settings />
          </Button>
        </router-link>
      </div>
    </CardHeader>
  </Card>
</template>

<style scoped></style>
