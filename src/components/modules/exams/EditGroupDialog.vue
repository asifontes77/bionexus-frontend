<template>
  <v-dialog
        v-model="show"
        transition="dialog-top-transition"
        persistent
        max-width="600"
    >
        <v-card>
            <v-toolbar color="sidebar">
                Grupo: {{ selectedGroup.description }}
            </v-toolbar>
            <v-card-text class="mt-6">
                <v-text-field
                    v-model="selectedGroup.description"
                    label="Descripción"
                    outlined
                    dense
                />
                <v-switch
                    v-model="selectedGroup.annulled"
                    :label="selectedGroup.annulled ? 'Anulado' : 'Activo'"
                    color="warning"
                    hide-details
                    class="mt-0"
                />
                <v-switch
                    v-model="selectedGroup.its_exam"
                    :label="selectedGroup.its_exam ? 'Es análisis clínico': 'No análisis clínico'"
                    color="primary"
                    hide-details
                    class="mt-0"
                />
            </v-card-text>
            <v-card-actions>
                <v-btn text @click="$emit('change-model',false)">Cancelar</v-btn>
                <v-btn text color="primary" @click="acceptEditGroup()">Aceptar</v-btn>
            </v-card-actions>
        </v-card>
    </v-dialog>
</template>

<script>
export default {
    name: 'EditGroupDialog',
    model: {
        prop: 'show',
        event: 'change-model',
    },
    props: {
        show: {
            type: Boolean,
            default: false,
        },
        selectedGroup: {
            type: Object,
            default: () => {},
        },
    },
    methods: {
        acceptEditGroup() {
            this.$emit('change-group', this.selectedGroup)
            this.$emit('change-model',false)
        },
    },
}
</script>
