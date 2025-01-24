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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Input } from '@/components/ui/input'
import { Table, TableBody, TableHead, TableHeader, TableRow } from '@/components/ui/table/index.ts'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { CircleUser, File, ListFilter, PlusCircle, Search } from 'lucide-vue-next'
import SensorViewRow from '@/components/SensorViewRow.vue'
</script>

<template>
  <div class="flex flex-col sm:gap-4 sm:py-4 sm:pl-14">
    <header
      class="sticky top-0 z-30 flex h-14 items-center gap-4 border-b bg-background px-4 sm:static sm:h-auto sm:border-0 sm:bg-transparent sm:px-6"
    >
      <div class="relative ml-auto flex-1 md:grow-0">
        <Search class="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          class="w-full rounded-lg bg-background pl-8 md:w-[200px] lg:w-[320px]"
          placeholder="Search..."
          type="search"
        />
      </div>
      <DropdownMenu>
        <DropdownMenuTrigger as-child>
          <Button class="rounded-full" size="icon" variant="secondary">
            <CircleUser class="h-5 w-5" />
            <span class="sr-only">Toggle user menu</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuLabel>My Account</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem>Settings</DropdownMenuItem>
          <DropdownMenuItem>Support</DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem>Logout</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </header>
    <main class="grid flex-1 items-start gap-4 p-4 sm:px-6 sm:py-0 md:gap-8">
      <Tabs default-value="all">
        <div class="flex items-center">
          <TabsList>
            <TabsTrigger value="all"> All</TabsTrigger>
            <TabsTrigger value="active"> Active</TabsTrigger>
            <TabsTrigger value="draft"> Draft</TabsTrigger>
            <TabsTrigger class="hidden sm:flex" value="archived"> Archived</TabsTrigger>
          </TabsList>
          <div class="ml-auto flex items-center gap-2">
            <DropdownMenu>
              <DropdownMenuTrigger as-child>
                <Button class="h-7 gap-1" size="sm" variant="outline">
                  <ListFilter class="h-3.5 w-3.5" />
                  <span class="sr-only sm:not-sr-only sm:whitespace-nowrap"> Filter </span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>Filter by</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem checked> Active</DropdownMenuItem>
                <DropdownMenuItem>Draft</DropdownMenuItem>
                <DropdownMenuItem> Archived</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <Button class="h-7 gap-1" size="sm" variant="outline">
              <File class="h-3.5 w-3.5" />
              <span class="sr-only sm:not-sr-only sm:whitespace-nowrap"> Export </span>
            </Button>
            <Button class="h-7 gap-1" size="sm">
              <PlusCircle class="h-3.5 w-3.5" />
              <span class="sr-only sm:not-sr-only sm:whitespace-nowrap"> Add Product </span>
            </Button>
          </div>
        </div>
        <Card>
          <CardHeader>
            <CardTitle>Plants</CardTitle>
            <CardDescription> Manage your Plants</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead class="hidden w-[100px] sm:table-cell">
                    <span class="sr-only">img</span>
                  </TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead class="hidden md:table-cell"> Group</TableHead>
                  <TableHead class="hidden md:table-cell"> Room</TableHead>
                  <TableHead class="hidden md:table-cell"> Sensor</TableHead>
                  <TableHead>
                    <span class="sr-only">Actions</span>
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <SensorViewRow
                  v-for="x in 100"
                  badge="error"
                  group="Group 1"
                  name="Sensor 1"
                  room="Room 1"
                  sensor="Sensor 1"
                />
                <SensorViewRow
                  badge="active"
                  group="Group 1"
                  name="Sensor 1"
                  room="Room 1"
                  sensor="Sensor 1"
                />
                <SensorViewRow
                  badge="inactive"
                  group="Group 1"
                  name="Sensor 1"
                  room="Room 1"
                  sensor="Sensor 1"
                />
                <SensorViewRow
                  badge="unknown"
                  group="Group 1"
                  name="Sensor 1"
                  room="Room 1"
                  sensor="Sensor 1"
                />
              </TableBody>
            </Table>
          </CardContent>
          <CardFooter>
            <div class="text-xs text-muted-foreground">Showing <strong>32</strong> Plants</div>
          </CardFooter>
        </Card>
      </Tabs>
    </main>
  </div>
</template>
