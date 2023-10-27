// Composables
import { createRouter, createWebHistory } from "vue-router";
import { useUserStore } from "@/store/userStore";

import pinia from "@/store";

const routes = [
  {
    path: "/",
    component: () => import("@/layouts/default/Default.vue"),
    children: [
      {
        path: "",
        name: "Home",
        // route level code-splitting
        // this generates a separate chunk (about.[hash].js) for this route
        // which is lazy-loaded when the route is visited.
        component: () =>
          import(/* webpackChunkName: "home" */ "@/views/Home.vue"),
      },
    ],
  },
  {
    path: "/chat/",
    name: "chat",
    component: () => import("@/views/TheChat.vue"),
    beforeEnter: (to, from, next) => {
      const userStore = useUserStore(pinia);
      if (!userStore.isLoggedIn) {
        next({ name: "login" });
      } else {
        next();
      }
    },
  },
  { path: "/register/", component: () => import("@/views/TheRegister.vue") },
  {
    path: "/login/",
    name: "login",
    component: () => import("@/views/TheLogin.vue"),
    beforeEnter: (to, from, next) => {
      const userStore = useUserStore(pinia);
      if (userStore.isLoggedIn) {
        next({ name: "chat" });
      } else {
        console.log("GOING", to);
        next();
      }
    },
  },
];

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes,
});

export default router;
