<template>
    <v-dialog
        v-model="show"
        transition="dialog-top-transition"
        persistent
        max-width="600"
    >
        <v-card>
            <v-toolbar color="sidebar">
                Cambio de precios automático
            </v-toolbar>
            <v-card-text class="mt-4">
                <v-row v-for="item in costList" :key="item.value" class="align-center">
                    <v-col cols="3">
                        <v-checkbox 
                            v-model="item.active"
                            color="primary"
                            :label="item.name"
                            hide-details
                            class="mt-0 pt-0"
                        />
                    </v-col>
                    <v-col cols="4">
                        <v-text-field
                            type="number"
                            min="0"
                            max="100"
                            step="5"
                            v-model="item.increment"
                            label="Incremento"
                            suffix="%"
                            outlined
                            dense
                            hide-details
                        />
                    </v-col>
                    <v-col cols="5">
                        <v-select
                            v-model="item.aboutWho"
                            :items="colList"
                            item-text="name"
                            item-value="value"
                            label="Incremento sobre quien"
                            outlined
                            dense
                            hide-details
                        />
                    </v-col>
                </v-row>
            </v-card-text>
            <v-card-text class="mt-4">
                <v-checkbox
                    v-model="onlyThisGroup"
                    label="Solo este grupo de exámenes"
                ></v-checkbox>
            </v-card-text>
            <v-card-actions>
                <v-btn text @click="$emit('change-model',false)">Cancelar</v-btn>
                <v-btn text color="primary" @click="changePrice()">Aceptar</v-btn>
            </v-card-actions>
        </v-card>
    </v-dialog>
</template>

<script>
export default {
    name: 'PriceChangeDialog',
    model: {
        prop: 'show',
        event: 'change-model',
    },
    props: {
        show: {
            type: Boolean,
            default: false,
        }
    },
    data() {
        return {
            colList: [
                {name: 'Costo 1', value: 'cost1'},
                {name: 'Costo 2', value: 'cost2'},
                {name: 'Costo 3', value: 'cost3'},
                {name: 'Costo 4', value: 'cost4'},
                {name: 'Costo 5', value: 'cost5'},
                {name: 'Costo 6', value: 'cost6'}
            ],
            costList: null,
            onlyThisGroup: false,
        }
    },
    mounted() {
        this.costList = [
            {
                active: false,
                name: 'Costo 1',
                value: 'cost1',
                increment: 0,
                aboutWho: null,
            },
            {
                active: false,
                name: 'Costo 2',
                value: 'cost2',
                increment: 0,
                aboutWho: null,
            },
            {
                active: false,
                name: 'Costo 3',
                value: 'cost3',
                increment: 0,
                aboutWho: null,
            },
            {
                active: false,
                name: 'Costo 4',
                value: 'cost4',
                increment: 0,
                aboutWho: null,
            },
            {
                active: false,
                name: 'Costo 5',
                value: 'cost5',
                increment: 0,
                aboutWho: null,
            },
            {
                active: false,
                name: 'Costo 6',
                value: 'cost6',
                increment: 0,
                aboutWho: null,
            }
        ]
    },
    methods: {
        changePrice() {
            this.$emit('change-prices', this.costList, this.onlyThisGroup)
            this.$emit('change-model',false)
        },
    },
}
</script>
