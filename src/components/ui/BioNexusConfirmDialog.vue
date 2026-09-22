<template>
  <BioNexusDialog ref="dialog" size="compact" dialog-class="bio-nexus-confirm-dialog" :kicker="options.kicker" :title="options.title" @close="resolve(false)">
    <section class="bio-nexus-confirm-dialog-body">
      <BioNexusActionIcon :action="options.icon" :size="28" />
      <div><p>{{ options.message }}</p><strong v-if="options.detail">{{ options.detail }}</strong></div>
    </section>
    <template #footer>
      <BioNexusActionButton variant="secondary" icon="cancel" @click="resolve(false)">{{ options.cancelText }}</BioNexusActionButton>
      <BioNexusActionButton :variant="options.variant" :icon="options.confirmIcon" @click="resolve(true)">{{ options.confirmText }}</BioNexusActionButton>
    </template>
  </BioNexusDialog>
</template>
<script setup>
import { reactive, ref } from "vue";
import BioNexusActionButton from "@/components/ui/BioNexusActionButton.vue";
import BioNexusActionIcon from "@/components/ui/BioNexusActionIcon.vue";
import BioNexusDialog from "@/components/ui/BioNexusDialog.vue";
const dialog=ref(null);let resolver=null;
const defaults={kicker:"Confirmación",title:"Confirmar acción",message:"",detail:"",icon:"warning",variant:"danger",confirmIcon:"check",confirmText:"Confirmar",cancelText:"Cancelar"};
const options=reactive({...defaults});
function ask(value={}){Object.assign(options,defaults,value);dialog.value?.open();return new Promise(resolve=>{resolver=resolve})}
function resolve(value){const current=resolver;resolver=null;if(dialog.value?.element?.open)dialog.value.close();current?.(Boolean(value))}
defineExpose({ask,close:()=>resolve(false)});
</script>