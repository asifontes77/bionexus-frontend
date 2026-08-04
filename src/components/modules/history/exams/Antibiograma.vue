<template>
    <div>
        <div>
            <v-switch
                v-model="cultivo.negativo"
                label="Negativo a las 48 horas de incubación"
            />
        </div>
        <div v-if="!cultivo.negativo">
            <div class="font-weight-medium d-flex justify-center">ANTIBIOGRAMA</div>
            <div 
                v-for="(item, index) in cultivo.resultado"
                :key="index"
            >
                <v-divider class="mt-6 mb-2"></v-divider>
                <div class="d-flex justify-space-between">
                    <div class="text-h6 px-1 pt-1">{{ index+1 }}.-</div>     
                    <!-- <v-text-field
                        label="Organismo"
                        v-model="item.organismo"
                        placeholder="Escriba..."
                        outlined
                        dense
                        style="width: calc(100% - 24px);"
                    /> -->
                    <v-autocomplete
                        v-model="item.organismo"
                        label="Organismo"
                        :items="listGerms"
                        item-text="name"
                        item-value="name"
                        outlined
                        dense
                        placeholder="Escriba..."
                        style="width: calc(100% - 24px);"
                    />
                    <v-btn v-if="index!==0" icon color="warning" @click="eliminarOrganismo(index)">
                        <v-icon>mdi-minus-circle-outline</v-icon>
                    </v-btn>
                </div>
                <div class="d-flex justify-space-between">
                    <div class="font-weight-medium my-2 primary--text">SENSIBLE</div>
                    <div class="d-flex justify-center">
                        <v-btn icon color="primary" @click="agregar('sensible', index)">
                            <v-icon>mdi-plus-circle-outline</v-icon>
                        </v-btn>
                    </div>
                </div>
                <v-divider></v-divider>
                <div v-if="item.antibiograma.sensible.length !==0" class="row pt-2">
                    <v-col cols="9" class="pl-6 font-weight-medium">ANTIBIOTICO</v-col>
                    <v-col cols="2" class="font-weight-medium">mic (&#181;g/mL)</v-col>
                </div>
                <div 
                    v-for="(sensible, i) in item.antibiograma.sensible"
                    :key="sensible.antibiotic"
                    class="row"
                >
                    <v-col cols="9" class="pl-6">
                        <v-autocomplete
                            v-model="sensible.antibiotic"
                            :items="antibiotic"
                            outlined
                            dense
                            hide-details
                            item-text="description"
                            item-value="description"
                        />
                    </v-col>
                    <v-col cols="2">
                        <v-text-field
                            v-model="sensible.mic"
                            placeholder="Escriba..."
                            outlined
                            dense
                            hide-details
                        />
                    </v-col>
                    <v-col cols="1">
                        <v-btn icon color="warning" @click="eliminar('sensible', index, i)">
                            <v-icon>mdi-minus-circle-outline</v-icon>
                        </v-btn>
                    </v-col>
                </div>
                <div class="d-flex justify-space-between mt-4">
                    <div class="font-weight-medium my-2 primary--text">INTERMEDIO</div>
                    <div class="d-flex justify-center">
                        <v-btn icon color="primary" @click="agregar('intermedio', index)">
                            <v-icon>mdi-plus-circle-outline</v-icon>
                        </v-btn>
                    </div>
                </div>
                <v-divider></v-divider>
                <div v-if="item.antibiograma.intermedio.length !==0" class="row pt-2">
                    <v-col cols="9" class="pl-6 font-weight-medium">ANTIBIOTICO</v-col>
                    <v-col cols="2" class="font-weight-medium">mic (&#181;g/mL)</v-col>
                </div>
                <div 
                    v-for="(intermedio, ii) in item.antibiograma.intermedio"
                    :key="intermedio.antibiotic"
                    class="row"
                >
                    <v-col cols="9" class="pl-6">
                        <v-autocomplete
                            v-model="intermedio.antibiotic"
                            :items="antibiotic"
                            outlined
                            dense
                            hide-details
                            item-text="description"
                            item-value="description"
                        />
                    </v-col>
                    <v-col cols="2">
                        <v-text-field
                            v-model="intermedio.mic"
                            placeholder="Escriba..."
                            outlined
                            dense
                            hide-details
                        />
                    </v-col>
                    <v-col cols="1">
                        <v-btn icon color="warning" @click="eliminar('intermedio', index, ii)">
                            <v-icon>mdi-minus-circle-outline</v-icon>
                        </v-btn>
                    </v-col>
                </div>
                <div class="d-flex justify-space-between mt-4">
                    <div class="font-weight-medium my-2 primary--text">RESISTENTE</div>
                    <div class="d-flex justify-center">
                        <v-btn icon color="primary" @click="agregar('resistente', index)">
                            <v-icon>mdi-plus-circle-outline</v-icon>
                        </v-btn>
                    </div>
                </div>
                <v-divider></v-divider>
                <div v-if="item.antibiograma.resistente.length !==0" class="row pt-2">
                    <v-col cols="9" class="pl-6 font-weight-medium">ANTIBIOTICO</v-col>
                    <v-col cols="2" class="font-weight-medium">mic (&#181;g/mL)</v-col>
                </div>
                <div 
                    v-for="(resistente, iii) in item.antibiograma.resistente"
                    :key="resistente.antibiotic"
                    class="row"
                >
                    <v-col cols="9" class="pl-6">
                        <v-autocomplete
                            v-model="resistente.antibiotic"
                            :items="antibiotic"
                            outlined
                            dense
                            hide-details
                            item-text="description"
                            item-value="description"
                        />
                    </v-col>
                    <v-col cols="2">
                        <v-text-field
                            v-model="resistente.mic"
                            placeholder="Escriba..."
                            outlined
                            dense
                            hide-details
                        />                        
                    </v-col>
                    <v-col cols="1">
                        <v-btn icon color="warning" @click="eliminar('resistente', index, iii)">
                            <v-icon>mdi-minus-circle-outline</v-icon>
                        </v-btn>
                    </v-col>
                </div>
            </div>
            
            <v-btn outlined color="primary" class="mt-10" @click="agregarOrganismo()">
                <v-icon left>mdi-plus-circle-outline</v-icon>
                agregar organismo
            </v-btn>
        </div>
    </div>
</template>

<script>
import antibioticMixin from '@/mixins/services/antibioticMixin.js'

export default {
    name: 'Antibiograma',
    mixins: [antibioticMixin],
    props: {
        cultivo: {
            type: Object,
            default: () => ({})
        },
    },
    data() {
        return {
            antibiotic: null,
            listGerms: [],
        }
    },
    async mounted() {
        const result = await this.getAntibioticListsOrder()
        if (result) {
            this.antibiotic = result
        }
        const resultG = await this.getListGermsOrder()
        if (resultG) {
            this.listGerms = resultG.map(objeto => ({ name: objeto.germen.trim() }))
        }
    },
    methods: {
        agregar(type, index) {
            const newItem = {
                antibiotic: '',
                mic: '',
            }
            if (type === 'sensible') {
                this.cultivo.resultado[index].antibiograma.sensible.push(newItem)
            } else if (type === 'intermedio') {
                this.cultivo.resultado[index].antibiograma.intermedio.push(newItem)
            } else if (type === 'resistente') {
                this.cultivo.resultado[index].antibiograma.resistente.push(newItem)
            }
        },
        eliminar(type, index, i) {
            if (type === 'sensible') {
                this.cultivo.resultado[index].antibiograma.sensible.splice(i, 1)
            } else if (type === 'intermedio') {
                this.cultivo.resultado[index].antibiograma.intermedio.splice(i, 1)
            } else if (type === 'resistente') {
                this.cultivo.resultado[index].antibiograma.resistente.splice(i, 1)
            }
        },
        agregarOrganismo() {
            const newItem = {
                organismo: '',
                antibiograma: {
                    sensible: [],
                    intermedio: [],
                    resistente: [],
                },
            }
            this.cultivo.resultado.push(newItem)
        },
        eliminarOrganismo(index) {
            this.cultivo.resultado.splice(index, 1)
        },
    },
}
</script>
