import { createRouter, createWebHistory } from "vue-router";
import { useAuthorizationStore } from "@/stores/authorization";
import { useSessionStore } from "@/stores/session";
import AuthenticatedLayout from "@/layouts/AuthenticatedLayout.vue";
const LoginView=()=>import("@/views/LoginView.vue");
const MigrationHomeView=()=>import("@/views/MigrationHomeView.vue");
const NotFoundView=()=>import("@/views/NotFoundView.vue");
const RolesPermissionsView=()=>import("@/views/RolesPermissionsView.vue");
const UserAuthorizationView=()=>import("@/views/UserAuthorizationView.vue");
const ParasiticformsView=()=>import("@/views/ParasiticformsView.vue");
const TypePaymentView=()=>import("@/views/TypePaymentView.vue");
const ExamCatalogView=()=>import("@/views/ExamCatalogView.vue");
const applicationViewLoaders=[MigrationHomeView,RolesPermissionsView,UserAuthorizationView,ExamCatalogView,ParasiticformsView,TypePaymentView];
let applicationRoutesPrefetched=false;
function scheduleAuthorizedRoutePrefetch(){
  if(applicationRoutesPrefetched)return;
  const connection=globalThis.navigator?.connection;
  if(connection?.saveData||/2g/.test(connection?.effectiveType||""))return;
  applicationRoutesPrefetched=true;
  const preload=()=>Promise.allSettled(applicationViewLoaders.map(load=>load()));
  if(typeof globalThis.requestIdleCallback==="function")globalThis.requestIdleCallback(preload,{timeout:2500});
  else globalThis.setTimeout(preload,600);
}


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
      {
        path: "security/roles",
        name: "security-roles",
        component: RolesPermissionsView,
        meta: {
          requiresAuth: true,
          permissions: ["security.roles.read", "security.permissions.read"],
          title: "Roles y permisos",
          description: "Administra los roles del sistema y configura los permisos asignados a cada rol.",
        },
      },
      {
        path: "security/users",
        name: "security-users",
        component: UserAuthorizationView,
        meta: {
          requiresAuth: true,
          permissions: ["security.users.read"],
          title: "Usuarios y autorización",
          description: "Administra los usuarios, sus roles y las excepciones individuales de permisos.",
        },
      },
      {
        path: "configuration/exams",
        name: "configuration-exams",
        component: ExamCatalogView,
        meta: {
          requiresAuth: true,
          permissions: ["exam-catalog.read"],
          title: "Lista de examenes",
          description: "Administra grupos, examenes, tarifas, impuestos y disponibilidad del catalogo.",
        },
      },
      {
        path: "configuration/parasiticforms",
        name: "configuration-parasiticforms",
        component: ParasiticformsView,
        meta: {
          requiresAuth: true,
          permissions: ["parasiticforms.read"],
          title: "Formas parasitarias",
                    description: "Administra las descripciones disponibles y controla cuales permanecen activas en los flujos operativos.",
        },
            },
      {
        path: "configuration/type-payments",
        name: "type-payments",
        component: TypePaymentView,
        meta: {
          requiresAuth: true,
          permission: "typepayment.read",
          title: "Formas de pago",
          description: "Administra las descripciones, disponibilidad por moneda y estado de los formas de pago.",
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
      title: "Bio Nexus 404",
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
    typeof to.meta.title === "string" ? `${to.meta.title} | Bio Nexus` : "Bio Nexus";
});


router.afterEach((to)=>{if(to.path!=="/login")scheduleAuthorizedRoutePrefetch()});
export default router;
