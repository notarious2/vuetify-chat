// Composables
import { createRouter, createWebHistory } from 'vue-router'

const routes = [
  {
    path: '/',
    component: () => import('@/layouts/default/Default.vue'),
    children: [
      {
        path: '',
        name: 'Home',
        // route level code-splitting
        // this generates a separate chunk (about.[hash].js) for this route
        // which is lazy-loaded when the route is visited.
        component: () => import(/* webpackChunkName: "home" */ '@/views/Home.vue'),
      },
    ],
  },
  {path: '/chat/', component:  () => import("@/views/Chat.vue")},
  {path: '/chat2/', component:  () => import("@/views/Chat2.vue")},
  {path: '/chat3/', component:  () => import("@/views/Chat3.vue")},
  {path: '/register/', component:  () => import("@/views/TheRegister.vue")}

]

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes,
})

export default router