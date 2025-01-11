<script lang="ts" setup>
import { Settings } from 'lucide-vue-next'
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Avatar } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button/index.ts'
</script>
<template>
  <Card class="w-full">
    <CardHeader>
      <div class="flex items-center justify-between w-full">
        <div class="flex items-center space-x-4">
          <Avatar>
            <AvatarImage src="https://avatars.githubusercontent.com/u/91261422?v=4&size=64" />
            <AvatarFallback>JS</AvatarFallback>
          </Avatar>
          <div>
            <CardTitle>Justus Siegert</CardTitle>
            <CardDescription> Seit X Tagen dabei</CardDescription>
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
