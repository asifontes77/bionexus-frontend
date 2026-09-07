<template></template>
<script setup>
import { onBeforeUnmount, onMounted, watch } from 'vue'
import { useRegionalSettingsStore } from '@/stores/regionalSettings'
import { useSessionStore } from '@/stores/session'
const session=useSessionStore(),regional=useRegionalSettingsStore()
let stopTokenWatch=null
function applyLocal(event){if(event?.detail)regional.apply(event.detail)}
async function sync(token,previous){if(!token){regional.clear();return}if(!previous||token!==previous){try{await regional.load({force:true})}catch{return}}}
onMounted(()=>{globalThis.addEventListener('bio-nexus:regional-settings-local',applyLocal);stopTokenWatch=watch(()=>session.token,sync,{immediate:true})})
onBeforeUnmount(()=>{globalThis.removeEventListener('bio-nexus:regional-settings-local',applyLocal);stopTokenWatch?.()})
</script>
