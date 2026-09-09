<template>
  <span class="quantity-shell">
    <input
      class="quantity-input" style="box-sizing:border-box!important;width:48px!important;min-width:48px!important;max-width:48px!important;height:30px!important;min-height:30px!important;max-height:30px!important;margin:0!important;padding:3px 8px!important;border:1px solid var(--bio-nexus-color-border-strong)!important;border-radius:var(--bio-nexus-radius-md)!important;background:var(--bio-nexus-color-surface)!important;color:var(--bio-nexus-color-text)!important;font-family:var(--bio-nexus-font-family)!important;font-size:var(--bio-nexus-font-size-md)!important;font-weight:var(--bio-nexus-font-weight-medium)!important;line-height:1!important;text-align:center!important;box-shadow:none!important;appearance:textfield!important;-moz-appearance:textfield!important"
      :value="value"
      type="number"
      min="1"
      max="99"
      inputmode="numeric"
      aria-label="Cantidad del examen"
      title="Modificar cantidad"
      @click.stop
      @focus="$event.target.select()"
      @keydown.stop
      @change="change"
    />
  </span>
</template>
<script setup>
import { computed } from "vue";
const props=defineProps({params:{type:Object,required:true}});
const value=computed(()=>Math.max(1,Math.min(99,Number(props.params?.data?.amount)||1)));
function change(event){const next=Math.max(1,Math.min(99,Number(event.target.value)||1));event.target.value=String(next);props.params?.onChange?.(props.params.data,next)}
</script>
<style scoped>
.quantity-shell {
  display: grid;
  width: 100%;
  height: 100%;
  place-items: center;
  margin: 0;
}
.quantity-input {
  box-sizing: border-box !important;
  width: 48px !important;
  min-width: 48px !important;
  max-width: 48px !important;
  height: 30px !important;
  min-height: 30px !important;
  max-height: 30px !important;
  margin: 0 !important;
  padding: 3px 8px !important;
  border: 1px solid var(--bio-nexus-color-border-strong) !important;
  border-radius: var(--bio-nexus-radius-md) !important;
  outline: 0 !important;
  background: var(--bio-nexus-color-surface) !important;
  color: var(--bio-nexus-color-text) !important;
  box-shadow: none !important;
  font-family: var(--bio-nexus-font-family) !important;
  font-size: var(--bio-nexus-font-size-md) !important;
  font-weight: var(--bio-nexus-font-weight-medium) !important;
  line-height: 1 !important;
  text-align: center !important;
  font-variant-numeric: tabular-nums;
  appearance: textfield;
  -moz-appearance: textfield;
  transition: border-color .15s ease, background-color .15s ease, box-shadow .15s ease;
}
.quantity-input:hover {
  border-color: var(--bio-nexus-color-primary) !important;
  background: var(--bio-nexus-color-info-soft) !important;
}
.quantity-input:focus {
  border-color: var(--bio-nexus-color-primary) !important;
  background: var(--bio-nexus-color-surface) !important;
  box-shadow: 0 0 0 3px var(--bio-nexus-color-info-soft) !important;
}
.quantity-input::-webkit-inner-spin-button,
.quantity-input::-webkit-outer-spin-button {
  display: none;
  margin: 0;
  -webkit-appearance: none;
}
</style>