import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView,
    },
    {
      path: '/signin',
      name: 'login',
      component: () => import('../views/LoginView.vue'),
    },
    {
      path: '/signup',
      name: 'register',
      component: () => import('../views/RegisterView.vue'),
    },
    {
      path: '/profile',
      name: 'profile',
      component: () => import('../views/ProfileView.vue'),
    },
    {
      path: '/settings',
      name: 'settings',
      component: () => import('../views/SettingsView.vue'),
    },
    {
      path: '/plant/:id',
      name: 'plantX',
      component: () => import('../views/SinglePlantView.vue'),
      meta: { transition: 'slide-left' },
    },
    {
      path: '/plant/:id/settings',
      name: 'plantXSettings',
      component: () => import('../views/SinglePlantSettingsView.vue'),
      meta: { transition: 'slide-left' },
    },
    {
      path: '/plants',
      name: 'plants',
      component: () => import('../views/PlantListView.vue'),
    },
  ],
})

export default router
