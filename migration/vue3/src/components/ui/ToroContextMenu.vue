<template>
  <Teleport to="body">
    <div
      v-if="open"
      ref="menuElement"
      class="toro-context-menu"
      :style="menuStyle"
      role="menu"
      @contextmenu.prevent
    >
      <button
        v-for="item in visibleItems"
        :key="item.key"
        type="button"
        class="toro-context-menu-item"
        :class="{
          'toro-context-menu-danger': item.variant === 'danger',
        }"
        :disabled="item.disabled"
        role="menuitem"
        @click="selectItem(item)"
      >
        {{ item.label }}
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
.toro-context-menu {
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

.toro-context-menu-item {
  display: flex;
  align-items: center;
  width: 100%;
  min-height: 36px;
  padding: 7px 10px;
  border: 0;
  border-radius: var(--toro-radius-sm);
  color: var(--toro-color-text);
  background: transparent;
  font: inherit;
  font-size: var(--toro-font-size-sm);
  font-weight: var(--toro-font-weight-bold);
  text-align: start;
  cursor: pointer;
}

.toro-context-menu-item:not(:disabled):hover,
.toro-context-menu-item:not(:disabled):focus-visible {
  color: var(--toro-color-primary-strong);
  background: var(--toro-color-info-soft);
  outline: none;
}

.toro-context-menu-item:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.toro-context-menu-danger {
  color: var(--toro-color-danger, #b42318);
}
</style>
