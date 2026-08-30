<template>
    <BioNexusDialog ref="dialog" size="wide" kicker="Detalle administrativo" :title="authorization?.user?.name || 'Usuario'">
    <section class="user-detail-body">
        <div v-if="loading" class="bio-nexus-empty-state">Consultando autorización...</div>
        <div v-else-if="errorMessage" class="bio-nexus-message bio-nexus-message-error" role="alert">{{ errorMessage }}</div>
        <div v-else-if="authorization" class="user-detail-content">
          <section class="user-detail-heading">
            <div class="user-avatar-large">{{ getUserInitials(authorization.user) }}</div>
            <div>
              <span class="user-detail-username">@{{ authorization.user.userName || "sin-usuario" }}</span>
              <h4>{{ authorization.user.name || "Sin nombre" }}</h4>
              <p>{{ authorization.user.position || "Sin cargo registrado" }}</p>
            </div>
            <span class="bio-nexus-badge" :class="authorization.user.hidden ? 'bio-nexus-badge-warning' : 'bio-nexus-badge-success'">
              {{ authorization.user.hidden ? "Inactivo" : "Activo" }}
            </span>
          </section>

          <dl class="user-detail-grid">
            <div><dt>Correo</dt><dd>{{ authorization.user.email || "Sin correo" }}</dd></div>
            <div><dt>Teléfono</dt><dd>{{ authorization.user.telephone || "Sin teléfono" }}</dd></div>
            <div><dt>Colegio</dt><dd>{{ authorization.user.collegeNumber || "Sin registro" }}</dd></div>
            <div><dt>Roles asignados</dt><dd>{{ authorization.assignedRoles.length }}</dd></div>
            <div><dt>Permisos heredados</dt><dd>{{ authorization.inheritedPermissions.length }}</dd></div>
            <div><dt>Excepciones</dt><dd>{{ authorization.permissionOverrides.length }}</dd></div>
          </dl>

          <section class="effective-context-card">
            <header><div><span>Resultado efectivo</span><h4>Contexto de autorización</h4></div></header>
            <div v-if="authorization.context" class="effective-summary">
              <article><span>Roles efectivos</span><strong>{{ authorization.context.roles.length }}</strong></article>
              <article><span>Permisos efectivos</span><strong>{{ authorization.context.permissions.length }}</strong></article>
              <article><span>Denegados</span><strong>{{ authorization.context.deniedPermissions.length }}</strong></article>
            </div>
            <p v-else class="bio-nexus-empty-state">El usuario no dispone de un contexto efectivo activo.</p>
          </section>

          <section class="user-detail-media" aria-label="Imagenes del usuario">
          <article>
            <span>Fotografia</span>
            <div class="user-detail-image user-detail-photo">
              <img v-if="authorization.user.photo" :src="assetUrl(authorization.user.photo)" alt="Fotografia del usuario" />
              <BioNexusIcon v-else name="person" :size="42" />
            </div>
          </article>
          <article>
            <span>Firma digital</span>
            <div class="user-detail-image">
              <img v-if="authorization.user.signature" :src="assetUrl(authorization.user.signature)" alt="Firma digital del usuario" />
              <BioNexusIcon v-else name="draw" :size="42" />
            </div>
          </article>
        </section>
        </div>
          </section>
    <template #footer>
        <button type="button" class="bio-nexus-action bio-nexus-action-secondary" @click="close">
          <BioNexusActionIcon action="close" />Cerrar
        </button>
          </template>
  </BioNexusDialog>
</template>

<script setup>
import { ref } from "vue";
import BioNexusActionIcon from "@/components/ui/BioNexusActionIcon.vue";
import BioNexusDialog from "@/components/ui/BioNexusDialog.vue";

defineProps({
  authorization: { type: Object, default: null },
  loading: { type: Boolean, default: false },
  errorMessage: { type: String, default: "" },
});

const dialog = ref(null);

function getUserInitials(user) {
  const source = user?.name?.trim() || user?.userName?.trim() || "U";
  return source.split(/\s+/).filter((part) => part !== "").slice(0, 2).map((part) => part.charAt(0).toUpperCase()).join("");
}

function open() {
  dialog.value?.open();
}
function close() {
  dialog.value?.close();
}

defineExpose({ open, close });
function assetUrl(value) { if (!value) return ""; const normalized = value.includes("/") ? value : `images/${value}`; return `/api/public/${normalized.split("/").filter(Boolean).map(encodeURIComponent).join("/")}`; }
</script>

<style scoped>
.user-detail-body { flex: 1 1 auto; min-height: 0; padding: var(--bio-nexus-space-4); overflow: auto; scrollbar-gutter: stable; }
.dialog-footer { display: flex; flex: 0 0 auto; align-items: center; justify-content: flex-end; gap: var(--bio-nexus-space-2); padding: var(--bio-nexus-space-3) var(--bio-nexus-space-4); border-top: 1px solid var(--bio-nexus-color-border); background: var(--bio-nexus-color-surface-soft); }
.user-detail-content { display: grid; gap: var(--bio-nexus-space-4); }
.user-detail-heading { display: grid; grid-template-columns: 56px minmax(0, 1fr) auto; align-items: center; gap: var(--bio-nexus-space-3); padding-bottom: var(--bio-nexus-space-3); border-bottom: 1px solid var(--bio-nexus-color-border); }
.user-avatar-large { display: grid; width: 56px; height: 56px; place-items: center; border-radius: var(--bio-nexus-radius-md); background: var(--bio-nexus-color-info-soft); color: var(--bio-nexus-color-primary-strong); font-weight: var(--bio-nexus-font-weight-heavy); }
.user-detail-heading h4, .user-detail-heading p { margin: 0; }
.user-detail-heading p, .user-detail-username { color: var(--bio-nexus-color-text-muted); font-size: var(--bio-nexus-font-size-sm); }
.user-detail-grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: var(--bio-nexus-space-3); margin: 0; }
.user-detail-grid > div, .effective-context-card { padding: var(--bio-nexus-space-3); border: 1px solid var(--bio-nexus-color-border); border-radius: var(--bio-nexus-radius-md); background: var(--bio-nexus-color-surface-soft); }
.user-detail-grid dt, .effective-context-card header span { color: var(--bio-nexus-color-text-muted); font-size: var(--bio-nexus-font-size-xs); font-weight: var(--bio-nexus-font-weight-bold); text-transform: uppercase; letter-spacing: 0.04em; }
.user-detail-grid dd { margin: var(--bio-nexus-space-1) 0 0; font-weight: var(--bio-nexus-font-weight-bold); overflow-wrap: anywhere; }
.effective-context-card { display: grid; gap: var(--bio-nexus-space-3); }
.effective-context-card h4 { margin: var(--bio-nexus-space-1) 0 0; }
.effective-summary { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: var(--bio-nexus-space-2); }
.effective-summary article { display: grid; gap: var(--bio-nexus-space-1); padding: var(--bio-nexus-space-3); border: 1px solid var(--bio-nexus-color-border); border-radius: var(--bio-nexus-radius-md); background: var(--bio-nexus-color-surface-soft); }
.effective-summary span { color: var(--bio-nexus-color-text-muted); font-size: var(--bio-nexus-font-size-xs); }
.effective-summary strong { color: var(--bio-nexus-color-primary-strong); font-size: 18px; }
@media (max-width: 720px) { .user-detail-grid, .effective-summary { grid-template-columns: 1fr; } .user-detail-heading { grid-template-columns: 48px minmax(0, 1fr); } .user-detail-heading > .bio-nexus-badge { grid-column: 2; justify-self: start; } }


</style>
<style>
.user-detail-media { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: var(--bio-nexus-space-3); }
.user-detail-media article { display: grid; gap: var(--bio-nexus-space-2); }
.user-detail-media article > span { color: var(--bio-nexus-color-text-muted); font-size: var(--bio-nexus-font-size-xs); font-weight: var(--bio-nexus-font-weight-bold); text-transform: uppercase; }
.user-detail-image { display: grid; min-height: 132px; place-items: center; overflow: hidden; border: 1px solid var(--bio-nexus-color-border); border-radius: var(--bio-nexus-radius-md); background: var(--bio-nexus-color-surface-soft); color: var(--bio-nexus-color-text-muted); }
.user-detail-image img { display: block; max-width: 100%; max-height: 150px; object-fit: contain; }
.user-detail-photo img { width: 124px; height: 124px; border-radius: 50%; object-fit: cover; }
@media (max-width: 640px) { .user-detail-media { grid-template-columns: 1fr; } }
</style>
<style>
/* BIO NEXUS USER DETAIL WIDTH GLOBAL START */
dialog.bio-nexus-dialog.bio-nexus-dialog-size-wide:has(.user-detail-body) {
  width: min(860px, calc(100vw - 32px)) !important;
  max-width: 860px !important;
}

@media (max-width: 720px) {
  dialog.bio-nexus-dialog.bio-nexus-dialog-size-wide:has(.user-detail-body) {
    width: calc(100vw - 16px) !important;
    max-width: none !important;
  }
}
/* BIO NEXUS USER DETAIL WIDTH GLOBAL END */
</style>
