<template>
  <label class="tariff-order-check" @click.stop @contextmenu.stop.prevent>
    <input type="checkbox" :checked="selected" aria-label="Seleccionar tarifa para ordenar" @click.stop @change="change" @keydown.stop />
  </label>
</template>
<script setup>
import { computed } from "vue";
const props=defineProps({params:{type:Object,required:true}});
const selected=computed(()=>Boolean(props.params?.isSelected?.(props.params?.data)));
function change(event){props.params?.onSelect?.(props.params?.data,Boolean(event.target?.checked));event.target?.blur?.();}
</script>
