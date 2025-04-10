import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import { useAuthStore } from '@/stores/auth'
import i18n from '@/i18n'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView,
      meta: { requiresAuth: true, title: 'title.home' },
    },
    {
      path: '/signin',
      name: 'login',
      component: () => import('../views/LoginView.vue'),
      meta: { requiresUnauth: true, title: 'title.login' },
    },
    {
      path: '/signup',
      name: 'register',
      component: () => import('../views/RegisterView.vue'),
      meta: { requiresUnauth: true, title: 'title.register' },
    },
    {
      path: '/profile',
      name: 'profile',
      component: () => import('../views/ProfileView.vue'),
      meta: { requiresAuth: true, title: 'title.profile' },
    },
    {
      path: '/settings',
      name: 'settings',
      component: () => import('../views/SettingsView.vue'),
      meta: { requiresAuth: true, title: 'title.settings' },
    },
    {
      path: '/plant/:id',
      name: 'plantX',
      component: () => import('../views/SinglePlantView.vue'),
      meta: { requiresAuth: true, title: 'title.plant' },
    },
    {
      path: '/plant/:id/edit',
      name: 'plantXSettings',
      component: () => import('../views/SinglePlantSettingsView.vue'),
      meta: { requiresAuth: true, title: 'title.plantSettings' },
    },
    {
      path: '/plants',
      name: 'plants',
      component: () => import('../views/PlantListView.vue'),
      meta: { requiresAuth: true, title: 'title.plants' },
    },
    {
      path: '/sensors',
      name: 'sensors',
      component: () => import('../views/PlantListView.vue'),
      meta: { requiresAuth: true, title: 'title.sensors' },
    },
    {
      path: '/sensor/:id',
      name: 'SingleSensor',
      component: () => import('../views/SingleSensorView.vue'),
      meta: { requiresAuth: true, title: 'title.sensor' },
    },
    {
      path: '/setupAccount',
      name: 'Setup Account',
      component: () => import('../views/AccountCompletionView.vue'),
      meta: { requiresAuth: true, title: 'title.setupAccount' },
    },
    {
      path: '/groups',
      name: 'Groups',
      component: () => import('../views/GroupView.vue'),
      meta: { requiresAuth: true, title: 'title.groups' },
    },
    {
      path: '/newplant',
      name: 'createPlant',
      component: () => import('../views/SinglePlantSettingsView.vue'),
      meta: { requiresAuth: true, title: 'title.createPlant' },
    },
    {
      path: '/plant-upload',
      name: 'PlantUpload',
      component: () => import('../views/UploadPhotoView.vue'),
      meta: { requiresAuth: true, title: 'title.createPlant' },
    },
    {
      path: '/aboutus',
      name: 'About us',
      component: () => import('../views/AboutUsView.vue'),
      meta: { requiresAuth: true, title: 'title.aboutUs' },
    },
    {
      path: '/addDevice',
      name: 'Add Device',
      component: () => import('../views/AddControllerView.vue'),
      meta: { requiresAuth: true, title: 'title.addDevice' },
    },
    {
      path: '/:pathMatch(.*)*',
      name: 'NotFound',
      component: () => import('../views/404view.vue'),
      meta: { requiresAuth: true, title: 'title.notFound' },
    },
  ],
})

router.beforeEach((to, from, next) => {
  const authStore = useAuthStore()
  if (to.meta.requiresAuth && !authStore.isAuthenticated) {
    next({ name: 'login', query: { redirect: to.fullPath.startsWith('/') ? to.fullPath : '/' } })
  } else if (to.meta.requiresUnauth && authStore.isAuthenticated) {
    next({ name: 'home' })
  } else {
    next()
  }
})

router.afterEach((to) => {
  const t = i18n.global?.t || ((key: string) => key)
  const defaultTitle = 'Sensora'

  const titleKey = to.meta.title
  const isValidKey = typeof titleKey === 'string'

  document.title = isValidKey ? `${t(titleKey)} | ${defaultTitle}` : defaultTitle
})

export default router
