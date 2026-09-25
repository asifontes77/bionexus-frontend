<template>
  <label class="tariff-order-check ag-selection-checkbox" @click.stop @contextmenu.stop.prevent>
    <span class="ag-labeled ag-label-align-right ag-checkbox ag-input-field">
      <span class="ag-wrapper ag-input-wrapper ag-checkbox-input-wrapper" :class="{ 'ag-checked': selected }" role="presentation">
        <input class="ag-input-field-input ag-checkbox-input" type="checkbox" :checked="selected" aria-label="Seleccionar tarifa para ordenar" @click.stop @change="change" @keydown.stop />
      </span>
    </span>
  </label>
</template>
<script setup>
import { computed } from "vue";
const props=defineProps({params:{type:Object,required:true}});
const selected=computed(()=>Boolean(props.params?.isSelected?.(props.params?.data)));
function change(event){props.params?.onSelect?.(props.params?.data,Boolean(event.target?.checked));event.target?.blur?.();}
</script>
