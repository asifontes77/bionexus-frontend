<template><BioNexusDialog ref="dialog" size="standard" kicker="Detalle del plan" title="Plan comercial" :subtitle="plan?.name||''"><section v-if="plan" class="plan-detail"><BioNexusSectionPanel title="Información comercial" icon="workspace_premium" variant="accent"><dl><div><dt>Código</dt><dd>{{plan.code}}</dd></div><div><dt>Nombre</dt><dd>{{plan.name}}</dd></div><div><dt>Descripción</dt><dd>{{plan.description||'—'}}</dd></div><div><dt>Precio</dt><dd>{{formatPrice(plan.price,plan.currency)}}</dd></div><div><dt>Periodicidad</dt><dd>{{plan.billingInterval==='yearly'?'Anual':'Mensual'}}</dd></div><div><dt>Días de gracia</dt><dd>{{plan.gracePeriodDays}} días</dd></div><div><dt>Estado</dt><dd>{{plan.isActive===false?'Desactivado':'Activo'}}</dd></div></dl></BioNexusSectionPanel><BioNexusSectionPanel title="Límites y beneficios" icon="tune" variant="soft" compact><pre>{{JSON.stringify(plan.limitsBenefits??{},null,2)}}</pre></BioNexusSectionPanel></section><template #footer><BioNexusActionButton variant="secondary" icon="close" @click="dialog?.close()">Cerrar</BioNexusActionButton></template></BioNexusDialog></template>
<script setup>import{ref}from'vue';import BioNexusDialog from'@/components/ui/BioNexusDialog.vue';import BioNexusActionButton from'@/components/ui/BioNexusActionButton.vue';import BioNexusSectionPanel from'@/components/ui/BioNexusSectionPanel.vue';const dialog=ref(null),plan=ref(null);async function open(row){plan.value=row;await dialog.value?.open()}function formatPrice(price,currency){const value=Number(price);return Number.isFinite(value)?`${value.toLocaleString('es')} ${currency||''}`.trim():'—'}defineExpose({open})</script>
<style scoped>
.plan-detail {
  display:grid;
  gap:var(--bio-nexus-space-4);
  padding:var(--bio-nexus-space-4)
}
dl {
  display:grid;
  grid-template-columns:repeat(2,minmax(0,1fr));
  gap:var(--bio-nexus-space-3);
  margin:0
}
dl div {
  display:grid;
  gap:3px
}
dt {
  color:var(--bio-nexus-color-text-muted);
  font-size:var(--bio-nexus-font-size-sm)
}
dd {
  margin:0;
  color:var(--bio-nexus-color-text);
  font-size:var(--bio-nexus-font-size-md);
  font-weight:var(--bio-nexus-font-weight-medium);
  overflow-wrap:anywhere
}
pre {
  max-height:260px;
  margin:0;
  padding:var(--bio-nexus-space-3);
  overflow:auto;
  border-radius:var(--bio-nexus-radius-md);
  background:var(--bio-nexus-color-surface-muted);
  font-size:var(--bio-nexus-font-size-sm);
  white-space:pre-wrap
}
@media(max-width:600px) {
  dl {
    grid-template-columns:1fr
  }
}
</style>
