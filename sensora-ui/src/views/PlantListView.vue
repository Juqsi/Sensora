<script lang="ts" setup>
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ChevronLeft } from 'lucide-vue-next'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Separator } from '@/components/ui/separator'
import { useI18n } from 'vue-i18n'
import { Button } from '@/components/ui/button'

const { t } = useI18n()
</script>

<template>
  <Card class="w-full">
    <CardHeader class="w-full flex flex-row space-x-4">
      <!-- Zurück-Button nur, wenn nicht in der Hauptansicht -->
      <Button
        class="text-muted-foreground hover:text-primary flex items-center space-x-2"
        size="icon"
        variant="ghost"
      >
        <ChevronLeft />
      </Button>

      <CardTitle>{{ t('plants.Title') }}</CardTitle>
    </CardHeader>

    <CardContent class="grid gap-1">
      <router-link to="plants">
        <div
          class="-mx-2 flex cursor-pointer items-start space-x-4 rounded-md p-2 transition-all hover:bg-accent hover:text-accent-foreground"
        >
          <Avatar class="mt-px h-10 w-10">
            <AvatarFallback>P1</AvatarFallback>
          </Avatar>
          <div class="space-y-1">
            <p class="text-sm font-medium leading-none">Pflanze Bernd</p>
            <p class="text-sm text-muted-foreground">Hallo 123</p>
            <Badge class="m-1">Badge</Badge>
            <Badge class="m-1">Badge</Badge>
          </div>
        </div>
      </router-link>

      <separator />
      <router-link v-for="x in 100" :to="'/plant/' + x">
        <div
          class="-mx-2 flex cursor-pointer items-start space-x-4 rounded-md p-2 transition-all hover:bg-accent hover:text-accent-foreground"
        >
          <Avatar class="mt-px h-10 w-10">
            <AvatarFallback>P1</AvatarFallback>
          </Avatar>
          <div class="space-y-1">
            <p class="text-sm font-medium leading-none">Pflanze Bernd</p>
            <p class="text-sm text-muted-foreground">Hallo 123</p>
            <Badge class="m-1">Badge</Badge>
            <Badge class="m-1">Badge</Badge>
          </div>
        </div>
      </router-link>
      <separator></separator>
      <router-link to="/plant/123">
        <div
          class="-mx-2 flex cursor-pointer items-start space-x-4 rounded-md p-2 transition-all hover:bg-accent hover:text-accent-foreground"
        >
          <Avatar class="mt-px h-10 w-10">
            <AvatarFallback>P1</AvatarFallback>
          </Avatar>
          <div class="space-y-1">
            <p class="text-sm font-medium leading-none">Pflanze Bernd</p>
            <p class="text-sm text-muted-foreground">Hallo 123</p>
            <Badge class="m-1">Badge</Badge>
            <Badge class="m-1">Badge</Badge>
          </div>
        </div>
      </router-link>
    </CardContent>
  </Card>
</template>
