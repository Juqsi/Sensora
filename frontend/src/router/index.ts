import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import { useAuthStore } from '@/stores/auth'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView,
      meta: { requiresAuth: true },
    },
    {
      path: '/signin',
      name: 'login',
      component: () => import('../views/LoginView.vue'),
      meta: { requiresUnauth: true },
    },
    {
      path: '/signup',
      name: 'register',
      component: () => import('../views/RegisterView.vue'),
      meta: { requiresUnauth: true },
    },
    {
      path: '/profile',
      name: 'profile',
      component: () => import('../views/ProfileView.vue'),
      meta: { requiresAuth: true },
    },
    {
      path: '/settings',
      name: 'settings',
      component: () => import('../views/SettingsView.vue'),
      meta: { requiresAuth: true },
    },
    {
      path: '/plant/:id',
      name: 'plantX',
      component: () => import('../views/SinglePlantView.vue'),
      meta: { requiresAuth: true },
    },
    {
      path: '/plant/:id/edit',
      name: 'plantXSettings',
      component: () => import('../views/SinglePlantSettingsView.vue'),
      meta: { requiresAuth: true },
    },
    {
      path: '/plants',
      name: 'plants',
      component: () => import('../views/PlantListView.vue'),
      meta: { requiresAuth: true },
    },
    {
      path: '/sensors',
      name: 'sensors',
      component: () => import('../views/PlantListView.vue'),
      meta: { requiresAuth: true },
    },
    {
      path: '/setupAccount',
      name: 'Setup Account',
      component: () => import('../views/AccountCompletionView.vue'),
      meta: { requiresAuth: true },
    },
    {
      path: '/groups',
      name: 'Groups',
      component: () => import('../views/GroupView.vue'),
      meta: { requiresAuth: true },
    },
    {
      path: '/newplant',
      name: 'createPlant',
      component: () => import('../views/SinglePlantSettingsView.vue'),
      meta: { requiresAuth: true },
    },
    {
      path: '/:pathMatch(.*)*',
      name: 'NotFound',
      component: () => import('../views/404view.vue'), // Deine 404-Komponente
    },
  ],
})

router.beforeEach((to, from, next) => {
  const authStore = useAuthStore()
  if (to.meta.requiresAuth && !authStore.isAuthenticated) {
    next({ name: 'login' })
  } else if (to.meta.requiresUnauth && authStore.isAuthenticated) {
    next({ name: 'home' })
  } else {
    next()
  }
})

export default router
