import { createRouter, createWebHistory } from "vue-router";
import { useAuthorizationStore } from "@/stores/authorization";
import { useSessionStore } from "@/stores/session";
import AuthenticatedLayout from "@/layouts/AuthenticatedLayout.vue";
import LoginView from "@/views/LoginView.vue";
import MigrationHomeView from "@/views/MigrationHomeView.vue";
import NotFoundView from "@/views/NotFoundView.vue";

const routes = [
  {
    path: "/login",
    name: "login",
    component: LoginView,
    meta: {
      public: true,
      title: "Iniciar sesion",
    },
  },
  {
    path: "/",
    component: AuthenticatedLayout,
    meta: {
      requiresAuth: true,
    },
    children: [
      {
        path: "",
        redirect: {
          name: "dashboard",
        },
      },
      {
        path: "dashboard",
        name: "dashboard",
        component: MigrationHomeView,
        meta: {
          requiresAuth: true,
          title: "Inicio",
        },
      },
    ],
  },
  {
    path: "/:pathMatch(.*)*",
    name: "not-found",
    component: NotFoundView,
    meta: {
      public: true,
      title: "TORO 404",
    },
  },
];

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
});

router.beforeEach(async (to) => {
  const sessionStore = useSessionStore();
  const authorizationStore = useAuthorizationStore();

  if (to.meta.requiresAuth && !sessionStore.isAuthenticated) {
    authorizationStore.clear();

    return {
      name: "login",
      query: {
        redirect: to.fullPath,
      },
    };
  }

  if (to.name === "login" && sessionStore.isAuthenticated) {
    return {
      name: "dashboard",
    };
  }

  const requiredPermissions = Array.isArray(to.meta.permissions)
    ? to.meta.permissions
    : [];

  if (requiredPermissions.length === 0) {
    return true;
  }

  if (!authorizationStore.loaded) {
    try {
      await authorizationStore.loadContext();
    } catch {
      authorizationStore.clear();

      return {
        name: "dashboard",
      };
    }
  }

  if (!authorizationStore.hasAllPermissions(requiredPermissions)) {
    return {
      name: "dashboard",
    };
  }

  return true;
});

router.afterEach((to) => {
  document.title =
    typeof to.meta.title === "string" ? `${to.meta.title} | TORO` : "TORO";
});

export default router;
