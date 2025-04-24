import { createRouter, createWebHistory } from 'vue-router'

const routes = [
  {
    path: '/',
    redirect: '/departure'
  },
  {
    path: '/departure',
    name: 'FlightsDeparture',
    component: () => import('../views/FlightsDeparture.vue'),
  },
  {
    path: '/arrival',
    name: 'FlightsArrival',
    component: () => import('../views/FlightsArrival.vue'),
  },
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router