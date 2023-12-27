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
    component: () => import("@/layouts/default/Default.vue"),
    children: [
      {
        path: "",
        name: "Chat",
        component: () => import("@/views/TheChat.vue"),
      },
    ]
    ,
    beforeEnter: (to, from, next) => {
      const userStore = useUserStore(pinia);
      if (!userStore.isLoggedIn) {
        next({ name: "Login" });
      } else {
        next();
      }
    },
  },
  {
    path: "/register/",
    component: () => import("@/layouts/default/Default.vue"),
    children: [
      {
        path: "",
        name: "Register",
        component: () => import("@/views/TheRegister.vue"),
      },
    ],
    beforeEnter: (to, from, next) => {
      const userStore = useUserStore(pinia);
      if (userStore.isLoggedIn) {
        next({ name: "Chat" });
      } else {
        next();
      }
    },
  },
  {
    path: "/login/",
    component: () => import("@/layouts/default/Default.vue"),
    children: [
      {
        path: "",
        name: "Login",
        component: () => import("@/views/TheLogin.vue"),
      },
    ],
    beforeEnter: (to, from, next) => {
      const userStore = useUserStore(pinia);
      if (userStore.isLoggedIn) {
        next({ name: "Chat" });
      } else {
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
