<template>
  <Teleport to="body">
    <div
      v-if="open"
      ref="menuElement"
      class="bio-nexus-context-menu"
      :style="menuStyle"
      role="menu"
      @contextmenu.prevent
    >
      <button
        v-for="item in visibleItems"
        :key="item.key"
        type="button"
        class="bio-nexus-context-menu-item"
        :class="{
          'bio-nexus-context-menu-danger': item.variant === 'danger',
        }"
        :disabled="item.disabled"
        role="menuitem"
        @click="selectItem(item)"
      >
        <svg
          v-if="resolveIcon(item)"
          class="bio-nexus-context-menu-icon"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="1.8"
          stroke-linecap="round"
          stroke-linejoin="round"
          aria-hidden="true"
        >
          <template v-if="resolveIcon(item) === 'edit'">
            <path d="M12 20h9" />
            <path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L8 18l-4 1 1-4Z" />
          </template>
          <template v-else-if="resolveIcon(item) === 'activate'">
            <path d="M12 3v4" />
            <path d="M7.5 5.8a8 8 0 1 0 9 0" />
            <path d="m9 13 2 2 4-4" />
          </template>
          <template v-else-if="resolveIcon(item) === 'deactivate'">
            <path d="M12 3v4" />
            <path d="M7.5 5.8a8 8 0 1 0 9 0" />
            <path d="m9 12 6 6" />
            <path d="m15 12-6 6" />
          </template>
          <template v-else-if="resolveIcon(item) === 'view'">
            <path d="M2.5 12s3.5-6 9.5-6 9.5 6 9.5 6-3.5 6-9.5 6-9.5-6-9.5-6Z" />
            <circle cx="12" cy="12" r="2.5" />
          </template>
          <template v-else-if="resolveIcon(item) === 'roles'">
            <circle cx="9" cy="8" r="3" />
            <path d="M3.5 19c.6-3.2 2.4-5 5.5-5s4.9 1.8 5.5 5" />
            <path d="M16 8h5" />
            <path d="M18.5 5.5v5" />
          </template>
          <template v-else-if="resolveIcon(item) === 'permissions'">
            <circle cx="8" cy="12" r="3" />
            <path d="M11 12h10" />
            <path d="M17 12v3" />
            <path d="M20 12v2" />
          </template>
          <template v-else>
            <circle cx="12" cy="12" r="8" />
            <path d="M12 8v4" />
            <path d="M12 16h.01" />
          </template>
        </svg>
        <span class="bio-nexus-context-menu-label">{{ item.label }}</span>
      </button>
    </div>
  </Teleport>
</template>

<script setup>
import {
  computed,
  nextTick,
  onBeforeUnmount,
  onMounted,
  ref,
} from "vue";

const props = defineProps({
  open: {
    type: Boolean,
    default: false,
  },
  x: {
    type: Number,
    default: 0,
  },
  y: {
    type: Number,
    default: 0,
  },
  items: {
    type: Array,
    default: () => [],
  },
});

const emit = defineEmits([
  "close",
  "select",
]);

const menuElement = ref(null);
const adjustedX = ref(0);
const adjustedY = ref(0);

const visibleItems = computed(
  () =>
    props.items.filter(
      (item) => item?.visible !== false,
    ),
);

const menuStyle = computed(() => ({
  left: `${adjustedX.value}px`,
  top: `${adjustedY.value}px`,
}));

function resolveIcon(item) {
  const explicitIcon = String(item?.icon ?? "").trim().toLowerCase();

  if (explicitIcon) return explicitIcon;

  const key = String(item?.key ?? "").trim().toLowerCase();
  const label = String(item?.label ?? "").trim().toLowerCase();

  if (key === "edit" || label === "editar") return "edit";
  if (key === "activate" || label === "activar") return "activate";
  if (key === "deactivate" || label === "inactivar") return "deactivate";

  return "";
}

async function positionMenu() {
  adjustedX.value = props.x;
  adjustedY.value = props.y;

  await nextTick();

  const menu = menuElement.value;

  if (!menu) return;

  const margin = 8;
  const rectangle = menu.getBoundingClientRect();

  adjustedX.value = Math.max(
    margin,
    Math.min(
      props.x,
      window.innerWidth - rectangle.width - margin,
    ),
  );

  adjustedY.value = Math.max(
    margin,
    Math.min(
      props.y,
      window.innerHeight - rectangle.height - margin,
    ),
  );
}

function selectItem(item) {
  if (item.disabled) return;

  emit("select", item);
  emit("close");
}

function closeOnEscape(event) {
  if (
    props.open &&
    event.key === "Escape"
  ) {
    emit("close");
  }
}

function closeOnOutsideClick(event) {
  if (
    props.open &&
    menuElement.value &&
    !menuElement.value.contains(event.target)
  ) {
    emit("close");
  }
}

function closeMenu() {
  if (props.open) {
    emit("close");
  }
}

onMounted(() => {
  document.addEventListener(
    "keydown",
    closeOnEscape,
  );

  document.addEventListener(
    "pointerdown",
    closeOnOutsideClick,
    true,
  );

  window.addEventListener(
    "scroll",
    closeMenu,
    true,
  );

  window.addEventListener(
    "resize",
    closeMenu,
  );
});

onBeforeUnmount(() => {
  document.removeEventListener(
    "keydown",
    closeOnEscape,
  );

  document.removeEventListener(
    "pointerdown",
    closeOnOutsideClick,
    true,
  );

  window.removeEventListener(
    "scroll",
    closeMenu,
    true,
  );

  window.removeEventListener(
    "resize",
    closeMenu,
  );
});

defineExpose({
  positionMenu,
});
</script>

<style scoped>
.bio-nexus-context-menu {
  position: fixed;
  z-index: 5000;
  display: grid;
  min-width: 195px;
  padding: 6px;
  border: 1px solid var(--toro-color-border);
  border-radius: var(--toro-radius-md);
  background: var(--toro-color-surface);
  box-shadow: 0 14px 36px rgb(15 23 42 / 20%);
}

.bio-nexus-context-menu-item {
  display: flex;
  align-items: center;
  gap: 9px;
  width: 100%;
  min-height: 36px;
  padding: 7px 10px;
  border: 0;
  border-radius: var(--toro-radius-sm);
  color: var(--toro-color-text);
  background: transparent;
  font: inherit;
  font-size: var(--toro-font-size-sm);
  font-weight: 500;
  letter-spacing: 0;
  text-align: start;
  cursor: pointer;
}

.bio-nexus-context-menu-icon {
  flex: 0 0 auto;
  width: 16px;
  height: 16px;
  color: currentColor;
}

.bio-nexus-context-menu-label {
  min-width: 0;
  line-height: 1.25;
}

.bio-nexus-context-menu-item:not(:disabled):hover,
.bio-nexus-context-menu-item:not(:disabled):focus-visible {
  color: var(--toro-color-primary-strong);
  background: var(--toro-color-info-soft);
  outline: none;
}

.bio-nexus-context-menu-item:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.bio-nexus-context-menu-danger {
  color: var(--toro-color-danger, #b42318);
}
</style>