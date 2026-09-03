import { createRouter, createWebHistory } from "vue-router";
import { useAuthorizationStore } from "@/stores/authorization";
import { useSessionStore } from "@/stores/session";
import AuthenticatedLayout from "@/layouts/AuthenticatedLayout.vue";
import ExamOrderingView from "@/views/ExamOrderingView.vue";
const LoginView=()=>import("@/views/LoginView.vue");
const MigrationHomeView=()=>import("@/views/MigrationHomeView.vue");
const PatientResultsEmailView=()=>import("@/views/PatientResultsEmailView.vue");
const NotFoundView=()=>import("@/views/NotFoundView.vue");
const RolesPermissionsView=()=>import("@/views/RolesPermissionsView.vue");
const UserAuthorizationView=()=>import("@/views/UserAuthorizationView.vue");
const ParasiticformsView=()=>import("@/views/ParasiticformsView.vue");
const TypePaymentView=()=>import("@/views/TypePaymentView.vue");
const ExamCatalogView=()=>import("@/views/ExamCatalogView.vue");
const LaboratoryView=()=>import("@/views/LaboratoryView.vue");
const LaboratoryIdentityView=()=>import("@/views/LaboratoryIdentityView.vue");
const TaxesView=()=>import("@/views/TaxesView.vue");
const ApplicationSettingsView=()=>import("@/views/ApplicationSettingsView.vue");
const ConfigurationModuleView=()=>import("@/views/ConfigurationModuleView.vue");
const RoutinesView=()=>import("@/views/RoutinesView.vue");
const SampleTypesView=()=>import("@/views/SampleTypesView.vue");
const applicationViewLoaders=[MigrationHomeView,PatientResultsEmailView,RolesPermissionsView,UserAuthorizationView,ExamCatalogView,ParasiticformsView,TypePaymentView,LaboratoryView,TaxesView,ApplicationSettingsView,ConfigurationModuleView,LaboratoryIdentityView,RoutinesView];
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
          breadcrumb: ["Configuración","Seguridad","Roles y permisos"],
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
          breadcrumb: ["Configuración","Seguridad","Usuarios y autorización"],
        },
      },
      {
        path: "daily/results-email",
        name: "patient-results-email",
        component: PatientResultsEmailView,
        meta: {
          requiresAuth: true,
          permissions: ["patient-results-email.read"],
          title: "Entrega de resultados por correo",
          description: "Consulta pacientes aprobados y realiza entregas electr\u00f3nicas controladas.",
          breadcrumb: ["Rutina diaria", "Entrega de resultados por correo"],
        },
      },
      {
        path: "configuration/exams",
        name: "configuration-exams",
        component: ExamCatalogView,
        meta: {
          requiresAuth: true,
          permissions: ["exam-catalog.read"],
          title: "Lista de exámenes",
          description: "Administra grupos, exámenes, tarifas, impuestos y disponibilidad del catálogo.",
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
                    description: "Administra las descripciónes disponibles y controla cuales permanecen activas en los flujos operativos.",
        },
            },
      { path: "configuration/sample-types", name: "configuration-sample-types", component: SampleTypesView, meta: { requiresAuth: true, permissions: ["sample-types.read"], title: "Tipos de muestra", description: "Administra el cat\u00e1logo de tipos de muestra disponible en los procesos del laboratorio.", breadcrumb: ["Configuraci\u00f3n", "Cat\u00e1logos", "Tipos de muestra"] } },
      { path: "configuration/routines", name: "configuration-routines", component: RoutinesView, meta: { requiresAuth: true, permissions: ["routines.read"], title: "Rutinas de exámenes", description: "Administra agrupaciones frecuentes y el orden de sus exámenes.", breadcrumb: ["Configuración", "Catálogos", "Rutinas de exámenes"] } },
      { path: "configuration/germs", name: "configuration-germs", component: GermsView, meta: { requiresAuth: true, permissions: ["germs.read"], title: "Gérmenes", description: "Administra el catálogo de microorganismos para antibiogramas.", breadcrumb: ["Configuración", "Catálogos", "Gérmenes"] } },
      { path: "configuration/antibiotics", name: "configuration-antibiotics", component: AntibioticsView, meta: { requiresAuth: true, permissions: ["antibiotic.read"], title: "Antibióticos", description: "Administra el catálogo disponible para antibiogramas.", breadcrumb: ["Configuración", "Catálogos", "Antibióticos"] } },
      { path: "configuration/exams-order", name: "configuration-exams-order", component: ExamOrderingView, meta: { requiresAuth: true, permissions: ["exam-catalog.read"], title: "Ordenar exámenes", description: "Define el orden de grupos y exámenes.", breadcrumb: ["Configuración", "Catálogos", "Ordenar exámenes"] } },
      {
        path: "configuration/catalogs",
        name: "configuration-catalogs",
        component: ConfigurationModuleView,
        meta: { requiresAuth: true, title: "Catálogos", description: "Organiza los catálogos y parámetros reutilizados por los procesos del laboratorio.", breadcrumb: ["Configuración", "Catálogos"], sections: [
          { title: "Lista de exámenes", description: "Grupos, exámenes, tarifas y disponibilidad.", routeName: "configuration-exams", permission: "exam-catalog.read", status: "available" },
          { title: "Ordenar exámenes", description: "Orden de presentación del catálogo.", routeName: "configuration-exams-order", permission: "exam-catalog.read", status: "available" },
          { title: "Rutinas de exámenes", description: "Agrupaciones frecuentes de exámenes.", routeName: "configuration-routines", permission: "routines.read", status: "available" },
          { title: "Antibióticos", description: "Catálogo para antibiogramas.", routeName: "configuration-antibiotics", permission: "antibiotic.read", status: "available" },
          { title: "Gérmenes", description: "Catálogo de microorganismos.", routeName: "configuration-germs", permission: "germs.read", status: "available" },
          { title: "Formas parasitarias", description: "Descripciones parasitológicas disponibles.", routeName: "configuration-parasiticforms", permission: "parasiticforms.read", status: "available" },
          { title: "Tipos de muestra", description: "Cat\u00e1logo de muestras utilizadas por el laboratorio.", routeName: "configuration-sample-types", permission: "sample-types.read", status: "available" },
          { title: "Grupos de hojas de trabajo", description: "Organizacion de hojas de trabajo.", status: "pending" },
          { title: "Pruebas especiales", description: "Laboratorios y pruebas de referencia.", status: "pending" },
          { title: "Formas de pago", description: "Disponibilidad por moneda y estado.", routeName: "type-payments", permission: "typepayment.read", status: "available" }
        ] },
      },
      {
        path: "configuration/laboratory-module", name: "configuration-laboratory-module", component: ConfigurationModuleView,
        meta: { requiresAuth: true, permissions: ["laboratory.read"], title: "Laboratorio", description: "Identidad institucional, comunicaciones y licencia del laboratorio.", breadcrumb: ["Configuración", "Laboratorio"], sections: [
          { title: "Identidad", description: "Logo, razón social, RIF, domicilio, teléfonos y datos de contacto.", routeName: "configuration-laboratory", status: "available" },
          { title: "Comunicaciones", description: "Correo saliente y entrega electrónica de resultados.", routeName: "configuration-laboratory-communications", status: "available" },
          { title: "Licencia", description: "Activacion, vigencia y módulos habilitados.", status: "last" }
        ] },
      },
      {
        path: "configuration/patient-care", name: "configuration-patient-care", component: ConfigurationModuleView,
        meta: { requiresAuth: true, title: "Atención al paciente", description: "Configuración de documentos y preferencias propias de la admision.", breadcrumb: ["Configuración", "Atención al paciente"], sections: [
          { title: "Comprobante del paciente", description: "Emision, correlativo, filas y plantilla independiente de la factura.", status: "pending" }
        ] },
      },
      {
        path: "configuration/sampling", name: "configuration-sampling", component: ConfigurationModuleView,
        meta: { requiresAuth: true, title: "Toma de muestras", description: "Etiquetado, impresora térmica y plantilla de identificación de muestras.", breadcrumb: ["Configuración", "Toma de muestras"], sections: [
          { title: "Etiquetado", description: "Emision automatica, correlativo y cantidad de copias.", status: "pending" },
          { title: "Impresora de etiquetas", description: "Conexion, tamano, orientacion y prueba de impresión.", status: "pending" },
          { title: "Plantilla de etiqueta", description: "Paciente, muestra, exámenes y códigos.", status: "pending" }
        ] },
      },
      {
        path: "configuration/billing-module", name: "configuration-billing-module", component: ConfigurationModuleView,
        meta: { requiresAuth: true, title: "Facturación", description: "Emision fiscal, impuestos, plantillas e impresión calibrada.", breadcrumb: ["Configuración", "Facturación"], sections: [
          { title: "General", description: "Activación, numeración y reglas generales de emisión.", routeName: "configuration-billing-general", permission: "laboratory.read", status: "available" },
          { title: "Impuestos", description: "Porcentajes y reglas fiscales aplicadas a los exámenes.", routeName: "configuration-taxes", permission: "tax.read", status: "available" },
          { title: "Plantillas de factura", description: "Factura completa y formulario preimpreso.", status: "pending" },
          { title: "Impresion y calibración", description: "Papel, margenes, desplazamientos y perfiles de impresora.", status: "pending" }
        ] },
      },
      {
        path: "configuration/documents", name: "configuration-documents", component: ConfigurationModuleView,
        meta: { requiresAuth: true, title: "Documentos y plantillas", description: "Catalogo central de formatos editables del laboratorio.", breadcrumb: ["Configuración", "Documentos y plantillas"], sections: [
          { title: "Comprobante", description: "Plantilla del comprobante del paciente.", status: "pending" },
          { title: "Factura", description: "Plantilla fiscal completa o preimpresa.", status: "pending" },
          { title: "Etiqueta de muestra", description: "Plantilla para tubos y muestras.", status: "pending" },
          { title: "Informe de resultados", description: "Formato de entrega de resultados.", status: "future" }
        ] },
      },
      {
        path: "configuration/system-module", name: "configuration-system-module", component: ConfigurationModuleView,
        meta: { requiresAuth: true, permissions: ["application-settings.read"], title: "Sistema", description: "Sesión, formatos regionales y preferencias técnicas.", breadcrumb: ["Configuración", "Sistema"], sections: [
          { title: "Sesión y seguridad", description: "Duracion renovable, inactividad y cuenta regresiva.", routeName: "configuration-application-settings", query: { tab: "session" }, status: "available" },
          { title: "Formatos regionales", description: "Fecha, hora, moneda y separadores.", status: "pending" },
          { title: "Preferencias técnicas", description: "Parametros generales no asociados a un proceso funcional.", status: "pending" }
        ] },
      },
      {
        path: "configuration/security-module", name: "configuration-security-module", component: ConfigurationModuleView,
        meta: { requiresAuth: true, permissions: ["security.roles.read", "security.permissions.read", "security.users.read"], title: "Seguridad", description: "Roles, permisos, usuarios y autorización efectiva.", breadcrumb: ["Configuración", "Seguridad"], sections: [
          { title: "Roles y permisos", description: "Catalogo de roles y permisos asignados.", routeName: "security-roles", permission: "security.roles.read", status: "available" },
          { title: "Usuarios y autorización", description: "Usuarios, roles y excepciones individuales.", routeName: "security-users", permission: "security.users.read", status: "available" }
        ] },
      },
      {
        path: "configuration/application-settings",
        name: "configuration-application-settings",
        component: ApplicationSettingsView,
        meta: { requiresAuth: true, permissions: ["application-settings.read"], title: "Configuración de la aplicación", description: "Administra formatos, reportes y parámetros globales de impresión." },
      },      {
        path: "configuration/laboratory",
        name: "configuration-laboratory",
        component: LaboratoryIdentityView,
        meta: {
          requiresAuth: true,
          permissions: ["laboratory.read"],
          title: "Identidad del laboratorio",
          description: "Administra la imagen y los datos institucionales visibles en documentos y comunicaciones.",
          breadcrumb: ["Configuración", "Laboratorio", "Identidad"],
        },
      },
      {
        path: "configuration/laboratory/communications",
        name: "configuration-laboratory-communications",
        component: LaboratoryView,
        meta: { requiresAuth: true, permissions: ["laboratory.read"], title: "Comunicaciones", description: "Administra el correo saliente y la entrega electrónica de resultados.", initialTab: "email", breadcrumb: ["Configuración", "Laboratorio", "Comunicaciones"] },
      },
      {
        path: "configuration/billing/general",
        name: "configuration-billing-general",
        component: LaboratoryView,
        meta: { requiresAuth: true, permissions: ["laboratory.read"], title: "Facturación general", description: "Administra las reglas generales de facturación y toma de muestras.", initialTab: "billing", breadcrumb: ["Configuración", "Facturación", "General"] },
      },
      {
        path: "configuration/taxes",
        name: "configuration-taxes",
        component: TaxesView,
        meta: { requiresAuth: true, permissions: ["tax.read"], title: "Impuestos", description: "Administra los porcentajes y reglas de aplicación de impuestos." },
      },      {
        path: "configuration/type-payments",
        name: "type-payments",
        component: TypePaymentView,
        meta: {
          requiresAuth: true,
          permission: "typepayment.read",
          title: "Formas de pago",
          description: "Administra las descripciónes, disponibilidad por moneda y estado de los formas de pago.",
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

import AntibioticsView from "@/views/AntibioticsView.vue";
import GermsView from "@/views/GermsView.vue";

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
