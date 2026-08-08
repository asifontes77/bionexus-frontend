<template>
    <section class="parasitic-page toro-page" aria-labelledby="parasitic-title">
        <header class="parasitic-header toro-page-header">
            <div>
                <p class="parasitic-eyebrow toro-page-eyebrow">Configuración</p>
                <h2 id="parasitic-title">Formas parasitarias</h2>
                <p>
                    Administra las descripciones disponibles y controla cuáles permanecen
                    visibles en los flujos operativos.
                </p>
            </div>

            <div class="parasitic-header-actions">
                <button v-if="canCreate" type="button" class="parasitic-action parasitic-action-secondary toro-action toro-action-secondary"
                    :disabled="loading || saving" @click="startCreation">
                    Nueva forma
                </button>

                <button type="button" class="parasitic-action parasitic-action-primary toro-action toro-action-primary" :disabled="loading || saving"
                    @click="loadParasiticforms">
                    {{ loading ? "Actualizando..." : "Actualizar" }}
                </button>
            </div>
        </header>

        <div v-if="loadError" class="parasitic-message parasitic-message-error toro-message toro-message-error" role="alert">
            <strong>No fue posible cargar las formas parasitarias.</strong>
            <span>{{ loadError }}</span>
        </div>

        <div v-if="loading && !loaded" class="parasitic-message toro-message" role="status">
            Cargando formas parasitarias...
        </div>

        <template v-else>
            <div class="parasitic-metrics toro-metrics">
                <article>
                    <span>Total</span>
                    <strong>{{ parasiticforms.length }}</strong>
                    <small>Registros administrativos</small>
                </article>

                <article>
                    <span>Visibles</span>
                    <strong>{{ visibleCount }}</strong>
                    <small>Disponibles en operaciones</small>
                </article>

                <article>
                    <span>Ocultas</span>
                    <strong>{{ annulledCount }}</strong>
                    <small>Con estado anulado</small>
                </article>

                <article>
                    <span>Selección</span>
                    <strong>
                        {{ creating ? "Nueva" : selectedParasiticform?.id || "Ninguna" }}
                    </strong>
                    <small>
                        {{
                            creating
                                ? "Registro sin guardar"
                                : selectedParasiticform?.description || "Seleccione un registro"
                        }}
                    </small>
                </article>
            </div>

            <div class="parasitic-grid">
                <article class="parasitic-panel toro-panel">
                    <div class="parasitic-panel-heading toro-panel-heading">
                        <div>
                            <p>Catálogo administrativo</p>
                            <h3>Registros</h3>
                        </div>

                        <span>{{ filteredParasiticforms.length }}</span>
                    </div>

                    <label class="parasitic-search">
                        <span>Buscar descripción</span>

                        <input v-model="searchText" type="search" autocomplete="off"
                            placeholder="Escriba parte de la descripción" :disabled="saving" />
                    </label>

                    <div v-if="filteredParasiticforms.length === 0" class="parasitic-empty toro-empty-state">
                        {{
                            parasiticforms.length === 0
                                ? "No existen formas parasitarias registradas."
                                : "No existen registros que coincidan con la búsqueda."
                        }}
                    </div>

                    <div v-else class="parasitic-list">
                        <button v-for="parasiticform in filteredParasiticforms" :key="parasiticform.id" type="button"
                            class="parasitic-list-item" :class="{
                                'parasitic-list-item-selected':
                                    !creating &&
                                    selectedParasiticform?.id === parasiticform.id,
                                'parasitic-list-item-annulled':
                                    parasiticform.annulled,
                            }" :disabled="saving" @click="selectParasiticform(parasiticform)">
                            <span class="parasitic-status-dot" :class="{
                                'parasitic-status-dot-annulled':
                                    parasiticform.annulled,
                            }"></span>

                            <span class="parasitic-list-copy toro-option-copy">
                                <strong>{{ parasiticform.description }}</strong>
                                <small>Identificador #{{ parasiticform.id }}</small>
                            </span>

                            <span class="parasitic-badge toro-badge" :class="{
                                'toro-badge-warning':
                                    parasiticform.annulled,
                            }">
                                {{ parasiticform.annulled ? "Oculta" : "Visible" }}
                            </span>
                        </button>
                    </div>
                </article>

                <article class="parasitic-panel toro-panel">
                    <div class="parasitic-panel-heading toro-panel-heading">
                        <div>
                            <p>{{ creating ? "Nuevo registro" : "Configuración" }}</p>
                            <h3>
                                {{
                                    creating
                                        ? "Crear forma parasitaria"
                                        : "Detalle seleccionado"
                                }}
                            </h3>
                        </div>

                        <span v-if="creating">Nuevo</span>
                        <span v-else-if="selectedParasiticform">
                            #{{ selectedParasiticform.id }}
                        </span>
                    </div>

                    <div v-if="!creating && !selectedParasiticform" class="parasitic-empty toro-empty-state">
                        Seleccione un registro para consultar o modificar sus datos.
                    </div>

                    <form v-else class="parasitic-form toro-form" @submit.prevent="saveChanges">
                        <label>
                            <span>Descripción</span>

                            <input v-model="draft.description" type="text" maxlength="50" autocomplete="off"
                                placeholder="Descripción de la forma parasitaria" :disabled="descriptionDisabled"
                                required />

                            <small>
                                {{ draft.description.length }} de 50 caracteres
                            </small>
                        </label>

                        <label v-if="!creating" class="parasitic-state-option" :class="{
                            'toro-option-disabled':
                                !canChangeStatus || saving,
                        }">
                            <input v-model="draft.annulled" type="checkbox" :disabled="!canChangeStatus || saving" />

                            <span>
                                <strong>Ocultar en los flujos operativos</strong>
                                <small>
                                    {{
                                        canChangeStatus
                                            ? "El registro seguirá visible en esta pantalla administrativa."
                                            : "La cuenta actual no puede cambiar el estado."
                                    }}
                                </small>
                            </span>
                        </label>

                        <div v-if="!creating && !canUpdateDescription" class="parasitic-permission-note toro-warning">
                            La cuenta actual puede consultar la descripción, pero no
                            modificarla.
                        </div>

                        <div v-if="saveError" class="parasitic-message parasitic-message-error toro-message toro-message-error" role="alert">
                            {{ saveError }}
                        </div>

                        <div v-if="saveMessage" class="parasitic-message parasitic-message-success toro-message toro-message-success" role="status">
                            {{ saveMessage }}
                        </div>

                        <dl v-if="!creating" class="parasitic-detail toro-detail">
                            <div>
                                <dt>Identificador</dt>
                                <dd>{{ selectedParasiticform.id }}</dd>
                            </div>

                            <div>
                                <dt>Estado guardado</dt>
                                <dd>
                                    {{
                                        selectedParasiticform.annulled
                                            ? "Oculta"
                                            : "Visible"
                                    }}
                                </dd>
                            </div>
                        </dl>

                        <div class="parasitic-form-status">
                            <span>
                                {{
                                    hasChanges
                                        ? "Existen cambios pendientes."
                                        : "Los datos están sincronizados."
                                }}
                            </span>
                        </div>

                        <div class="parasitic-form-actions toro-form-actions">
                            <button type="button" class="parasitic-action parasitic-action-secondary toro-action toro-action-secondary"
                                :disabled="!hasChanges || saving" @click="discardChanges">
                                {{ creating ? "Limpiar" : "Descartar" }}
                            </button>

                            <button type="submit" class="parasitic-action parasitic-action-primary toro-action toro-action-primary"
                                :disabled="!canSubmit">
                                {{
                                    saving
                                        ? "Guardando..."
                                        : creating
                                            ? "Crear registro"
                                            : "Guardar cambios"
                                }}
                            </button>
                        </div>
                    </form>

                    <p class="parasitic-note toro-note">
                        Los cambios se guardan únicamente para el registro seleccionado.
                        No se realizan actualizaciones masivas.
                    </p>
                </article>
            </div>
        </template>
    </section>
</template>

<script setup>
import { computed, onMounted, reactive, ref } from "vue";
import {
    createParasiticform,
    getParasiticformErrorMessage,
    getParasiticforms,
    updateParasiticform,
} from "@/services/parasiticformsService";
import { useAuthorizationStore } from "@/stores/authorization";

const authorizationStore = useAuthorizationStore();

const parasiticforms = ref([]);
const selectedParasiticform = ref(null);
const searchText = ref("");
const loading = ref(false);
const loaded = ref(false);
const loadError = ref("");
const saving = ref(false);
const saveError = ref("");
const saveMessage = ref("");
const creating = ref(false);

const draft = reactive({
    description: "",
    annulled: false,
});

const canCreate = computed(() =>
    authorizationStore.hasPermission(
        "parasiticforms.create",
    ),
);

const canUpdateDescription = computed(() =>
    authorizationStore.hasPermission(
        "parasiticforms.update",
    ),
);

const canChangeStatus = computed(() =>
    authorizationStore.hasPermission(
        "parasiticforms.change-status",
    ),
);

const visibleCount = computed(
    () =>
        parasiticforms.value.filter(
            (parasiticform) => !parasiticform.annulled,
        ).length,
);

const annulledCount = computed(
    () =>
        parasiticforms.value.filter(
            (parasiticform) => parasiticform.annulled,
        ).length,
);

const filteredParasiticforms = computed(() => {
    const filter = searchText.value
        .trim()
        .toLowerCase();

    if (filter === "") {
        return parasiticforms.value;
    }

    return parasiticforms.value.filter(
        (parasiticform) =>
            parasiticform.description
                .toLowerCase()
                .includes(filter),
    );
});

const descriptionChanged = computed(() => {
    if (creating.value) {
        return draft.description.trim() !== "";
    }

    if (!selectedParasiticform.value) {
        return false;
    }

    return (
        draft.description.trim() !==
        selectedParasiticform.value.description
    );
});

const statusChanged = computed(() => {
    if (
        creating.value ||
        !selectedParasiticform.value
    ) {
        return false;
    }

    return (
        draft.annulled !==
        selectedParasiticform.value.annulled
    );
});

const hasChanges = computed(
    () =>
        descriptionChanged.value ||
        statusChanged.value,
);

const descriptionDisabled = computed(() => {
    if (saving.value) {
        return true;
    }

    if (creating.value) {
        return !canCreate.value;
    }

    return !canUpdateDescription.value;
});

const canSubmit = computed(() => {
    if (saving.value || !hasChanges.value) {
        return false;
    }

    const description =
        draft.description.trim();

    if (
        description === "" ||
        description.length > 50
    ) {
        return false;
    }

    if (creating.value) {
        return canCreate.value;
    }

    if (
        descriptionChanged.value &&
        !canUpdateDescription.value
    ) {
        return false;
    }

    if (
        statusChanged.value &&
        !canChangeStatus.value
    ) {
        return false;
    }

    return true;
});

function clearMessages() {
    saveError.value = "";
    saveMessage.value = "";
}

function synchronizeDraft() {
    const selected = selectedParasiticform.value;

    draft.description =
        selected?.description ?? "";

    draft.annulled =
        selected?.annulled === true;

    clearMessages();
}

function startCreation() {
    if (!canCreate.value || saving.value) {
        return;
    }

    creating.value = true;
    selectedParasiticform.value = null;
    draft.description = "";
    draft.annulled = false;
    clearMessages();
}

function selectParasiticform(parasiticform) {
    if (saving.value) {
        return;
    }

    creating.value = false;
    selectedParasiticform.value =
        parasiticform;

    synchronizeDraft();
}

function discardChanges() {
    if (saving.value) {
        return;
    }

    if (creating.value) {
        draft.description = "";
        draft.annulled = false;
        clearMessages();
        return;
    }

    synchronizeDraft();
}

function sortParasiticforms(records) {
    return [...records].sort(
        (left, right) =>
            left.description.localeCompare(
                right.description,
            ),
    );
}

function replaceParasiticform(updated) {
    const index = parasiticforms.value.findIndex(
        (parasiticform) =>
            parasiticform.id === updated.id,
    );

    if (index < 0) {
        parasiticforms.value =
            sortParasiticforms([
                ...parasiticforms.value,
                updated,
            ]);

        return;
    }

    const nextRecords = [
        ...parasiticforms.value,
    ];

    nextRecords[index] = updated;

    parasiticforms.value =
        sortParasiticforms(nextRecords);
}

async function saveCreation() {
    const created = await createParasiticform(
        draft.description,
    );

    if (!created) {
        throw new Error(
            "El backend no devolvió un registro válido.",
        );
    }

    replaceParasiticform(created);

    creating.value = false;
    selectedParasiticform.value = created;
    synchronizeDraft();

    saveMessage.value =
        "La forma parasitaria fue creada correctamente.";
}

async function saveUpdate() {
    const selected = selectedParasiticform.value;

    if (!selected) {
        return;
    }

    const changes = {};

    if (descriptionChanged.value) {
        changes.description =
            draft.description;
    }

    if (statusChanged.value) {
        changes.annulled =
            draft.annulled;
    }

    const updated =
        await updateParasiticform(
            selected.id,
            changes,
        );

    if (!updated) {
        throw new Error(
            "El backend no devolvió un registro válido.",
        );
    }

    replaceParasiticform(updated);
    selectedParasiticform.value = updated;
    synchronizeDraft();

    saveMessage.value =
        "La forma parasitaria fue actualizada correctamente.";
}

async function saveChanges() {
    if (!canSubmit.value) {
        return;
    }

    saving.value = true;
    clearMessages();

    try {
        if (creating.value) {
            await saveCreation();
        } else {
            await saveUpdate();
        }
    } catch (error) {
        saveError.value =
            getParasiticformErrorMessage(
                error,
                creating.value
                    ? "No fue posible crear la forma parasitaria."
                    : "No fue posible actualizar la forma parasitaria.",
            );
    } finally {
        saving.value = false;
    }
}

async function loadParasiticforms() {
    if (loading.value || saving.value) {
        return;
    }

    const selectedId =
        selectedParasiticform.value?.id ?? null;

    loading.value = true;
    loadError.value = "";

    try {
        const loadedParasiticforms =
            await getParasiticforms();

        parasiticforms.value =
            loadedParasiticforms;

        if (!creating.value) {
            selectedParasiticform.value =
                loadedParasiticforms.find(
                    (parasiticform) =>
                        parasiticform.id === selectedId,
                ) ??
                loadedParasiticforms[0] ??
                null;

            synchronizeDraft();
        }

        loaded.value = true;
    } catch (error) {
        loadError.value =
            getParasiticformErrorMessage(
                error,
                "No fue posible cargar las formas parasitarias.",
            );

        if (!loaded.value) {
            parasiticforms.value = [];
            selectedParasiticform.value = null;
        }
    } finally {
        loading.value = false;
    }
}

onMounted(loadParasiticforms);
</script>

<style scoped>
.parasitic-page {
    display: grid;
    gap: var(--toro-space-4);
}

.parasitic-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: var(--toro-space-5);
    padding: var(--toro-space-5);
    border: 1px solid var(--toro-color-border);
    border-radius: var(--toro-radius-lg);
    background: var(--toro-color-surface);
    box-shadow: var(--toro-shadow-sm);
}

.parasitic-header h2,
.parasitic-header p {
    margin: 0;
}

.parasitic-header h2 {
    color: var(--toro-color-primary-strong);
    font-size: var(--toro-font-size-display);
}

.parasitic-header p:not(.parasitic-eyebrow) {
    max-width: 720px;
    margin-top: var(--toro-space-2);
    color: var(--toro-color-text-secondary);
    line-height: 1.5;
}

.parasitic-eyebrow {
    margin-bottom: var(--toro-space-1) !important;
    color: var(--toro-color-accent);
    font-size: var(--toro-font-size-xs);
    font-weight: var(--toro-font-weight-heavy);
    letter-spacing: 0.1em;
    text-transform: uppercase;
}

.parasitic-header-actions {
    display: flex;
    flex: 0 0 auto;
    gap: var(--toro-space-2);
}

.parasitic-action {
    min-height: var(--toro-control-height);
    padding: 0 var(--toro-space-4);
    border-radius: var(--toro-radius-md);
    cursor: pointer;
    font-weight: var(--toro-font-weight-bold);
}

.parasitic-action:disabled {
    cursor: not-allowed;
    opacity: 0.55;
}

.parasitic-action-primary {
    border: 1px solid var(--toro-color-primary);
    color: var(--toro-color-text-inverse);
    background: var(--toro-color-primary);
}

.parasitic-action-secondary {
    border: 1px solid var(--toro-color-border-strong);
    color: var(--toro-color-primary-strong);
    background: var(--toro-color-surface);
}

.parasitic-message {
    display: grid;
    gap: var(--toro-space-1);
    padding: var(--toro-space-3);
    border: 1px solid var(--toro-color-border);
    border-radius: var(--toro-radius-md);
    color: var(--toro-color-text-secondary);
    background: var(--toro-color-surface);
}

.parasitic-message-error {
    border-color: var(--toro-color-danger-border);
    color: var(--toro-color-danger);
    background: var(--toro-color-danger-soft);
}

.parasitic-message-success {
    border-color: var(--toro-color-success-border);
    color: var(--toro-color-success);
    background: var(--toro-color-success-soft);
}

.parasitic-metrics {
    display: grid;
    grid-template-columns: repeat(4, minmax(0, 1fr));
    gap: var(--toro-space-3);
}

.parasitic-metrics article {
    display: grid;
    gap: var(--toro-space-1);
    padding: var(--toro-panel-padding);
    border: 1px solid var(--toro-color-border);
    border-radius: var(--toro-radius-md);
    background: var(--toro-color-surface);
    box-shadow: var(--toro-shadow-sm);
}

.parasitic-metrics span,
.parasitic-metrics small {
    color: var(--toro-color-text-muted);
}

.parasitic-metrics span {
    font-size: var(--toro-font-size-xs);
    font-weight: var(--toro-font-weight-heavy);
    letter-spacing: 0.08em;
    text-transform: uppercase;
}

.parasitic-metrics strong {
    color: var(--toro-color-primary-strong);
    font-size: 20px;
}

.parasitic-grid {
    display: grid;
    grid-template-columns: minmax(320px, 0.8fr) minmax(420px, 1.2fr);
    gap: var(--toro-space-3);
    align-items: start;
}

.parasitic-panel {
    min-width: 0;
    padding: var(--toro-panel-padding);
    border: 1px solid var(--toro-color-border);
    border-radius: var(--toro-radius-md);
    background: var(--toro-color-surface);
    box-shadow: var(--toro-shadow-sm);
}

.parasitic-panel-heading {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: var(--toro-space-3);
    margin-bottom: var(--toro-space-4);
}

.parasitic-panel-heading h3,
.parasitic-panel-heading p {
    margin: 0;
}

.parasitic-panel-heading h3 {
    margin-top: var(--toro-space-1);
    color: var(--toro-color-primary-strong);
}

.parasitic-panel-heading p {
    color: var(--toro-color-accent);
    font-size: var(--toro-font-size-xs);
    font-weight: var(--toro-font-weight-heavy);
    letter-spacing: 0.08em;
    text-transform: uppercase;
}

.parasitic-panel-heading>span {
    padding: 5px 9px;
    border-radius: 999px;
    color: var(--toro-color-primary-strong);
    background: var(--toro-color-surface-soft);
    font-weight: var(--toro-font-weight-bold);
}

.parasitic-search,
.parasitic-form>label:not(.parasitic-state-option) {
    display: grid;
    gap: var(--toro-space-2);
}

.parasitic-search {
    margin-bottom: var(--toro-space-3);
}

.parasitic-search span,
.parasitic-form label>span:first-child {
    color: var(--toro-color-text-secondary);
    font-size: var(--toro-font-size-sm);
    font-weight: var(--toro-font-weight-bold);
}

.parasitic-search input,
.parasitic-form input[type="text"] {
    width: 100%;
    min-height: var(--toro-control-height);
    padding: 0 var(--toro-space-3);
    border: 1px solid var(--toro-color-border-strong);
    border-radius: var(--toro-radius-md);
    color: var(--toro-color-text);
    background: var(--toro-color-surface);
}

.parasitic-search input:focus,
.parasitic-form input[type="text"]:focus {
    border-color: var(--toro-color-primary);
    outline: var(--toro-focus-ring);
}

.parasitic-form small {
    color: var(--toro-color-text-muted);
    font-size: var(--toro-font-size-xs);
}

.parasitic-list {
    display: grid;
    max-height: 580px;
    gap: var(--toro-space-2);
    overflow-y: auto;
    padding-right: var(--toro-space-1);
}

.parasitic-list-item {
    display: flex;
    width: 100%;
    min-height: 62px;
    align-items: center;
    gap: var(--toro-space-3);
    padding: var(--toro-space-3);
    border: 1px solid var(--toro-color-border);
    border-radius: var(--toro-radius-md);
    color: var(--toro-color-text);
    background: var(--toro-color-surface);
    cursor: pointer;
    text-align: left;
}

.parasitic-list-item:hover,
.parasitic-list-item-selected {
    border-color: var(--toro-color-primary);
    background: var(--toro-color-surface-soft);
}

.parasitic-list-item-selected {
    box-shadow: inset 3px 0 0 var(--toro-color-accent);
}

.parasitic-list-item-annulled {
    opacity: 0.72;
}

.parasitic-list-item:disabled {
    cursor: wait;
}

.parasitic-status-dot {
    width: 10px;
    height: 10px;
    flex: 0 0 10px;
    border-radius: 999px;
    background: var(--toro-color-success);
}

.parasitic-status-dot-annulled {
    background: var(--toro-color-warning);
}

.parasitic-list-copy {
    display: grid;
    min-width: 0;
    flex: 1;
    gap: 2px;
}

.parasitic-list-copy strong,
.parasitic-list-copy small {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
}

.parasitic-list-copy small {
    color: var(--toro-color-text-muted);
}

.parasitic-badge {
    flex: 0 0 auto;
    padding: 5px 8px;
    border-radius: 999px;
    color: var(--toro-color-success);
    background: var(--toro-color-success-soft);
    font-size: var(--toro-font-size-xs);
    font-weight: var(--toro-font-weight-bold);
}

.parasitic-badge-annulled {
    color: var(--toro-color-warning);
    background: var(--toro-color-warning-soft);
}

.parasitic-form {
    display: grid;
    gap: var(--toro-space-3);
}

.parasitic-state-option {
    display: flex;
    align-items: flex-start;
    gap: var(--toro-space-3);
    padding: var(--toro-space-3);
    border: 1px solid var(--toro-color-border);
    border-radius: var(--toro-radius-md);
    background: var(--toro-color-surface-soft);
    cursor: pointer;
}

.parasitic-state-option input {
    width: 16px;
    height: 16px;
    flex: 0 0 16px;
    margin-top: 2px;
    accent-color: var(--toro-color-primary);
}

.parasitic-state-option>span {
    display: grid;
    gap: 3px;
}

.parasitic-state-option-disabled {
    cursor: not-allowed;
    opacity: 0.68;
}

.parasitic-permission-note {
    padding: var(--toro-space-3);
    border-left: 3px solid var(--toro-color-warning);
    color: var(--toro-color-warning);
    background: var(--toro-color-warning-soft);
}

.parasitic-detail {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: var(--toro-space-3);
    margin: 0;
}

.parasitic-detail div {
    padding: var(--toro-space-3);
    border: 1px solid var(--toro-color-border);
    border-radius: var(--toro-radius-md);
    background: var(--toro-color-surface-soft);
}

.parasitic-detail dt {
    color: var(--toro-color-text-muted);
    font-size: var(--toro-font-size-xs);
    font-weight: var(--toro-font-weight-heavy);
    text-transform: uppercase;
}

.parasitic-detail dd {
    margin: var(--toro-space-1) 0 0;
    font-weight: var(--toro-font-weight-medium);
}

.parasitic-form-status {
    padding-top: var(--toro-space-3);
    border-top: 1px solid var(--toro-color-border);
    color: var(--toro-color-text-muted);
}

.parasitic-form-actions {
    display: flex;
    justify-content: flex-end;
    gap: var(--toro-space-2);
}

.parasitic-empty {
    padding: var(--toro-space-6);
    border: 1px dashed var(--toro-color-border-strong);
    border-radius: var(--toro-radius-md);
    color: var(--toro-color-text-muted);
    text-align: center;
}

.parasitic-note {
    margin: var(--toro-space-4) 0 0;
    padding: var(--toro-space-3);
    border-left: 3px solid var(--toro-color-accent);
    color: var(--toro-color-text-secondary);
    background: var(--toro-color-accent-soft);
}

@media (max-width: 980px) {
    .parasitic-metrics {
        grid-template-columns: repeat(2, minmax(0, 1fr));
    }

    .parasitic-grid {
        grid-template-columns: 1fr;
    }

    .parasitic-list {
        max-height: 380px;
    }
}

@media (max-width: 620px) {
    .parasitic-header {
        align-items: flex-start;
        flex-direction: column;
    }

    .parasitic-header-actions {
        display: grid;
        width: 100%;
        grid-template-columns: 1fr;
    }

    .parasitic-action {
        width: 100%;
    }

    .parasitic-metrics,
    .parasitic-detail {
        grid-template-columns: 1fr;
    }

    .parasitic-list-item {
        align-items: flex-start;
    }

    .parasitic-form-actions {
        display: grid;
        grid-template-columns: 1fr 1fr;
    }
}
</style>