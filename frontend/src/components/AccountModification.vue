<script lang="ts" setup>
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs/index.ts'
import {useI18n} from 'vue-i18n'

const {t} = useI18n()
</script>

<template>
  <Tabs class="w-full" default-value="account">
    <TabsList class="grid w-full grid-cols-2">
      <TabsTrigger value="account">{{t('Account.Account')}}</TabsTrigger>
      <TabsTrigger value="password"> {{t('Account.Password')}}</TabsTrigger>
    </TabsList>
    <TabsContent value="account">
      <Card>
        <CardHeader>
          <CardTitle>{{t('Account.Account')}}</CardTitle>
          <CardDescription>
            {{t('Account.AccountDescription')}}
          </CardDescription>
        </CardHeader>
        <CardContent class="space-y-2">
          <div class="space-y-1">
            <Label for="name">{{t('Account.FistName')}}</Label>
            <Input id="name" default-value="Joe" />
          </div>
          <div class="space-y-1">
            <Label for="name">{{t('Account.SurName')}}</Label>
            <Input id="name" default-value="Doe" />
          </div>
          <div class="space-y-1">
            <Label for="username">{{t('Account.Username')}}</Label>
            <Input id="username" default-value="Username" />
          </div>
        </CardContent>
        <CardFooter>
          <Button>{{t('Account.SaveChanges')}}</Button>
        </CardFooter>
      </Card>
    </TabsContent>
    <TabsContent value="password">
      <Card>
        <CardHeader>
          <CardTitle>{{t('Account.Password')}}</CardTitle>
          <CardDescription>
            {{t('Account.PasswordDescription')}}
          </CardDescription>
        </CardHeader>
        <CardContent class="space-y-2">
          <div class="space-y-1">
            <Label for="current">{{t('Account.CurrentPassword')}}</Label>
            <Input id="current" type="password" />
          </div>
          <div class="space-y-1">
            <Label for="new">{{t('Account.NewPassword')}}</Label>
            <Input id="new" type="password" />
          </div>
        </CardContent>
        <CardFooter>
          <Button>{{t('Account.SavePassword')}}</Button>
        </CardFooter>
      </Card>
    </TabsContent>
  </Tabs>
</template>
