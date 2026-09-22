<template>

  <section

    class="bio-nexus-section-panel"

    :class="[

      `bio-nexus-section-panel-${variant}`,

      { 'bio-nexus-section-panel-compact': compact },

    ]"

    :aria-labelledby="titleId"

  >

    <header class="bio-nexus-section-panel-heading">

      <span v-if="icon" class="bio-nexus-section-panel-icon" aria-hidden="true">

        <BioNexusActionIcon :action="icon" :size="22" />

      </span>

      <div class="bio-nexus-section-panel-copy">

        <component :is="headingTag" :id="titleId" class="bio-nexus-section-panel-title">{{ title }}</component>

        <p v-if="description" class="bio-nexus-section-panel-description">{{ description }}</p>

      </div>

      <div v-if="$slots.actions" class="bio-nexus-section-panel-actions"><slot name="actions" /></div>

    </header>

    <div class="bio-nexus-section-panel-body"><slot /></div>

    <footer v-if="$slots.footer" class="bio-nexus-section-panel-footer"><slot name="footer" /></footer>

  </section>

</template>

<script setup>

import { computed, useId } from "vue";

import BioNexusActionIcon from "@/components/ui/BioNexusActionIcon.vue";

const props = defineProps({

  title: { type: String, required: true },

  icon: { type: String, default: "" },

  description: { type: String, default: "" },

  variant: { type: String, default: "default", validator: value => ["default", "accent", "soft"].includes(value) },

  compact: { type: Boolean, default: false },

  headingLevel: { type: Number, default: 3, validator: value => [2, 3, 4, 5, 6].includes(value) },

});

const uid = useId();

const titleId = computed(() => `bio-nexus-section-panel-${uid}`);

const headingTag = computed(() => `h${props.headingLevel}`);

</script>
