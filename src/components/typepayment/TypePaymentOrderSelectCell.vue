<template>
  <label class="type-payment-order-check" @click.stop @contextmenu.stop.prevent>
    <input type="checkbox" :checked="selected" aria-label="Seleccionar forma de pago para ordenar" @click.stop @change="change" @keydown.stop />
  </label>
</template>
<script setup>
import { computed } from "vue";
const props=defineProps({params:{type:Object,required:true}});
const selected=computed(()=>Boolean(props.params?.isSelected?.(props.params?.data)));
function change(event){props.params?.onSelect?.(props.params?.data,Boolean(event.target?.checked));event.target?.blur?.();}
</script>
<style>
.type-payment-order-check{display:flex;align-items:center;justify-content:center;width:100%;height:100%;margin:0;cursor:pointer}
.type-payment-order-check input{box-sizing:border-box;width:18px;height:18px;margin:0;accent-color:var(--bio-nexus-color-primary);cursor:pointer}
</style>
