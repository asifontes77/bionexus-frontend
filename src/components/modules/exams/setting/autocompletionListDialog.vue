<template>
  <div>
    <div class="caption pl-2 gray300--text">Lista de opciones</div>
    <div
        v-for="(item, i) in autocompletion"
        :key="i"
        class="d-flex justify-space-between align-center sidebar px-2 py-1 mb-1"
    >
        <div class="primary--text" style="width: auto">
            {{ item.text }}
        </div>
        <div class="d-flex">
            <v-btn
                icon 
                color="primary"
                @click="$emit('edit-autocompletion-item', i)"
            >
                <v-icon>mdi-circle-edit-outline</v-icon>
            </v-btn>
            <v-btn
                icon 
                color="secondary"
                @click="$emit('delete-autocompletion-item', i)"
            >
                <v-icon>mdi-delete-circle-outline</v-icon>
            </v-btn>
        </div>
    </div>
  </div>
</template>

<script>
export default {
    name: 'autocompletionListDialog',
    props: {
        autocompletion: {
            type: Array,
            default: () => [],
        },
    },
}
</script>
