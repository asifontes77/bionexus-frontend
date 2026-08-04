<template>
  <div>
    <v-card elevation="2" style="height: 100%; width: 100%">
        <v-card-title class="sidebar">
            <div class="d-flex justify-space-between" style="width: 100%">
                <div>DESCRIPCION</div>
                <div>VALOR DE REFERENCIA</div>
            </div>
        </v-card-title>
        <v-card-text class="item-height mt-2" :class="closeCard ? 'close-item-height' : ''">
            <div class="d-flex justify-center mb-2 p-0 font-weight-black">
                EXAMEN DE HECES
            </div>
            <v-tabs v-model="tab" align-with-title>
                <v-tab
                    v-for="(tipo, index) in hesesList"
                    :key="index"
                >
                    {{ tipo }}
                </v-tab>
                <v-tab-item class="pt-2" style="border-top: 1px solid var(--v-primary-base)">
                    <div class="d-flex align-center mb-2 p-0">
                        <div class="p-0" style="width: 40%; background-color: white">
                            Aspecto:
                        </div>
                        <div class="p-0" style="width: 60%; background-color: white">
                            <v-autocomplete
                                v-model="content.exam1"
                                :items="autocompleteAspecto"
                                outlined
                                dense
                                hide-details
                                class="mr-1"
                            />
                        </div>
                    </div>
                    <div class="d-flex align-center mb-2 p-0">
                        <div class="p-0" style="width: 40%; background-color: white">
                            Reacción:
                        </div>
                        <div class="p-0" style="width: 60%; background-color: white">
                            <v-autocomplete
                                v-model="content.exam2"
                                :items="autocompleteReaccion"
                                outlined
                                dense
                                hide-details
                                class="mr-1"
                            />
                        </div>
                    </div>
                    <div class="d-flex align-center mb-2 p-0">
                        <div class="p-0" style="width: 40%; background-color: white">
                            Color:
                        </div>
                        <div class="p-0" style="width: 60%; background-color: white">
                            <v-autocomplete
                                v-model="content.exam3"
                                :items="autocompleteColor"
                                outlined
                                dense
                                hide-details
                                class="mr-1"
                            />
                        </div>
                    </div>
                    <div class="d-flex align-center mb-2 p-0">
                        <div class="p-0" style="width: 40%; background-color: white">
                            Sangre:
                        </div>
                        <div class="p-0" style="width: 60%; background-color: white">
                            <v-autocomplete
                                v-model="content.exam4"
                                :items="autocompletePresente"
                                outlined
                                dense
                                hide-details
                                class="mr-1"
                            />
                        </div>
                    </div>
                    <div class="d-flex align-center mb-2 p-0">
                        <div class="p-0" style="width: 40%; background-color: white">
                            Olor:
                        </div>
                        <div class="p-0" style="width: 60%; background-color: white">
                            <v-autocomplete
                                v-model="content.exam5"
                                :items="autocompleteOlor"
                                outlined
                                dense
                                hide-details
                                class="mr-1"
                            />
                        </div>
                    </div>
                    <div class="d-flex align-center mb-2 p-0">
                        <div class="p-0" style="width: 40%; background-color: white">
                            Moco:
                        </div>
                        <div class="p-0" style="width: 60%; background-color: white">
                            <v-autocomplete
                                v-model="content.exam6"
                                :items="autocompletePresente"
                                outlined
                                dense
                                hide-details
                                class="mr-1"
                            />
                        </div>
                    </div>
                    <div class="d-flex align-center mb-2 p-0">
                        <div class="p-0" style="width: 40%; background-color: white">
                            Consistencia:
                        </div>
                        <div class="p-0" style="width: 60%; background-color: white">
                            <v-autocomplete
                                v-model="content.exam7"
                                :items="autocompleteConsistencia"
                                outlined
                                dense
                                hide-details
                                class="mr-1"
                            />
                        </div>
                    </div>
                    <div class="d-flex align-center mb-2 p-0">
                        <div class="p-0" style="width: 40%; background-color: white">
                            Rest. Alimenticios:
                        </div>
                        <div class="p-0" style="width: 60%; background-color: white">
                            <v-autocomplete
                                v-model="content.exam8"
                                :items="autocompletePresente"
                                outlined
                                dense
                                hide-details
                                class="mr-1"
                            />
                        </div>
                    </div>
                </v-tab-item>
                <v-tab-item class="pt-2" style="border-top: 1px solid var(--v-primary-base)">
                    <div class="d-flex align-center mb-2 p-0">
                        <div class="p-0" style="width: 40%; background-color: white">
                            Leucocitos:
                        </div>
                        <div class="p-0" style="width: 50%; background-color: white">
                            <v-text-field
                                v-model="content.exam9"
                                outlined
                                dense
                                hide-details
                                class="mr-1"
                            />
                        </div>
                        <div class="p-0" style="width: 10%; background-color: white">
                            x C
                        </div>
                    </div>
                    <div class="d-flex align-center mb-2 p-0">
                        <div class="p-0" style="width: 40%; background-color: white">
                            Hematíes:
                        </div>
                        <div class="p-0" style="width: 50%; background-color: white">
                            <v-text-field
                                v-model="content.exam10"
                                outlined
                                dense
                                hide-details
                                class="mr-1"
                            />
                        </div>
                        <div class="p-0" style="width: 10%; background-color: white">
                            x C
                        </div>
                    </div>
                    <div class="d-flex align-center mb-2 p-0">
                        <div class="p-0" style="width: 40%; background-color: white">
                            Flora Bacteriana:
                        </div>
                        <div class="p-0" style="width: 50%; background-color: white">
                            <v-autocomplete
                                v-model="content.exam11"
                                :items="autocompletePresente"
                                outlined
                                dense
                                hide-details
                                class="mr-1"
                            />
                        </div>
                    </div>
                    <div class="d-flex align-center mb-2 p-0">
                        <div class="p-0" style="width: 40%; background-color: white">
                            Levaduras:
                        </div>
                        <div class="p-0" style="width: 50%; background-color: white">
                            <v-autocomplete
                                v-model="content.exam12"
                                :items="autocompletePresente"
                                outlined
                                dense
                                hide-details
                                class="mr-1"
                            />
                        </div>
                    </div>
                    <div class="d-flex align-center p-0">
                        <div class="p-0" style="width: 100%; background-color: white">
                            <v-radio-group v-model="content.checkPresent" row hide-details class="mb-1" @change="activateFP">
                                <v-radio label="No se observo..." value="no" />
                                <v-radio label="Se observo..." value="si" />
                            </v-radio-group>
                        </div>
                    </div>
                    <v-card v-if="content.checkPresent === 'si'" outlined class="mb-1">
                        <v-card-text>
                            Seleccione las formas parasitarias
                            <v-list flat>
                                <v-list-item-group
                                    v-model="resultBacterias"
                                    multiple
                                    active-class=""
                                    class="row-bacterias"
                                    @change="changeRB()"
                                >
                                    <v-list-item
                                        v-for="item in formasparasitarias"
                                        :key="item.id"
                                        style="min-height: 0px"
                                    >
                                        <template v-slot:default="{ active }">
                                            <v-list-item-action class="my-1">
                                                <v-checkbox :input-value="active"></v-checkbox>
                                            </v-list-item-action>
                                            <v-list-item-content class="py-1">
                                                <v-list-item-subtitle>{{ item.description }}</v-list-item-subtitle>
                                            </v-list-item-content>
                                        </template>
                                    </v-list-item>
                                </v-list-item-group>
                            </v-list>
                        </v-card-text>
                    </v-card>
                    <div class="d-flex align-center mb-2 p-0">
                        <v-textarea
                            v-model="content.bacterias"
                            auto-grow
                            outlined
                            hide-details
                            rows="3"
                            row-height="15"
                        />
                    </div>
                    <div class="d-flex align-center mb-2 p-0">
                        <div class="p-0" style="width: 40%; background-color: white">
                            Métodos:
                        </div>
                        <div class="p-0" style="width: 60%; background-color: white">
                            <v-text-field
                                v-model="content.metodo1"
                                outlined
                                dense
                                hide-details
                                class="mr-1"
                            />
                        </div>
                    </div>
                    <div class="d-flex align-center mb-2 p-0">
                        <div class="p-0" style="width: 40%; background-color: white">
                            &nbsp; 
                        </div>
                        <div class="p-0" style="width: 60%; background-color: white">
                            <v-text-field
                                v-model="content.metodo2"
                                outlined
                                dense
                                hide-details
                                class="mr-1"
                            />
                        </div>
                    </div>
                </v-tab-item>
            </v-tabs>
        </v-card-text>
        <v-card-actions style="border-top: 2px solid #E8E8E8;">
            <v-btn
                color="primary"
                @click="toRegister()"
            >
                Registrar
            </v-btn>
        </v-card-actions>
    </v-card>
  </div>
</template>

<script>
import parasiticMixin from '@/mixins/services/parasiticMixin'
import pacientsMixin from '@/mixins/services/pacientsMixin'

export default {
    name: 'Exam348',
    mixins: [parasiticMixin, pacientsMixin],
    props: {
        exam: {
            type: Object,
            default: () => {},
        },        
        closeCard: {
            type: Boolean,
            default: false,
        },
    },
    data() {
        return {
            tab: null,
            hesesList: ['EXAMEN MACROSCOPIO', 'EXAMEN MICROSCOPIO'],
            content: {
                exam1: '',
                exam2: '',
                exam3: '',
                exam4: '',
                exam5: '',
                exam6: '',
                exam7: '',
                exam8: '',
                exam9: '',
                exam10: '',
                exam11: '',
                exam12: '',
                metodo1: '',
                metodo2: '',
                checkPresent: null,
                bacterias: '',
            },
            resultBacterias: [],
            formasparasitarias: null,
            autocompleteAspecto: [
                'Homogeneo',
                'Heterogeneo',
            ],
            autocompleteReaccion: [
                'Acida',
                'Alcalina',
                'Neutra',
            ],
            autocompleteColor: [
                'Marrón',
                'Amarillo',
                'Rojizo',
                'Verdoso',
                'Negro',
                'Pardo',
            ],
            autocompletePresente: [
                'Ausente',
                'Escasa',
                'Escaso',
                'Moderado',
                'Moderada',
                'Abundante',
                'Presente',
            ],
            autocompleteOlor: [
                'Fecal',
                'Fétida',
            ],
            autocompleteConsistencia: [
                'Pastosa',
                'Blanda',
                'Diarreica',
                'Líquida',
                'Dura',
            ],
        }
    },
    mounted() {
        this.listFP()
    },
    methods: {
        async listFP() {
            const result = await this.getParasiticListsOrder()
            if (result) this.formasparasitarias = result
        },
        activateFP() {
            if (this.content.checkPresent === 'no') {
                this.content.bacterias = 'En la muestra analizada no se observaron formas parasitarias'
            } else {
                this.content.bacterias = 'En la muestra analizada se observaron: '
                if (this.resultBacterias.length !== 0) this.changeRB()
            }
        },
        changeRB() {
            let texto = 'En la muestra analizada se observaron: '
            this.resultBacterias.forEach((bact) => {
                texto += this.formasparasitarias[bact].description + ', '
            })
            this.content.bacterias = texto.slice(0, -2)
            console.log('resultBacterias: ', this.resultBacterias)
        },
        async toRegister() {
            var textHtml = `
            <div style='display: flex; align-items: center; padding-top:0; padding-left:0; padding-right:0; padding-bottom:0; '>
                <div style='width:100%; border:0 solid white; text-align:center; padding-top:0; padding-left:0; padding-right:0; padding-bottom:0; background-color:white; '>
                    <div>
                        <strong>EXAMEN DE HECES</strong>
                    </div>
                </div>
            </div>
            <div style='display: flex; align-items: center; padding-top:0; padding-left:0; padding-right:0; padding-bottom:0; '>
                <strong>EXAMEN MACROSCOPIO</strong>
            </div>
            <div style='display: flex; align-items: center; padding-top:0; padding-left:0; padding-right:0; padding-bottom:0; '>
                <div style='width:40%; border:0 solid white; text-align:left; padding-top:0; padding-left:0; padding-right:0; padding-bottom:0; background-color:white; '>
		            <div>ASPECTO:</div>
	            </div>
                <div style='width:60%; border:0 solid white; text-align:left; padding-top:0; padding-left:0; padding-right:0; padding-bottom:0; background-color:white; '>
		            <div style='margin-right: 4px !important;'>${this.content.exam1}</div>
	            </div>
            </div>
            <div style='display: flex; align-items: center; padding-top:0; padding-left:0; padding-right:0; padding-bottom:0; '>
                <div style='width:40%; border:0 solid white; text-align:left; padding-top:0; padding-left:0; padding-right:0; padding-bottom:0; background-color:white; '>
		            <div>REACCION:</div>
	            </div>
                <div style='width:60%; border:0 solid white; text-align:left; padding-top:0; padding-left:0; padding-right:0; padding-bottom:0; background-color:white; '>
		            <div style='margin-right: 4px !important;'>${this.content.exam2}</div>
	            </div>
            </div>
            <div style='display: flex; align-items: center; padding-top:0; padding-left:0; padding-right:0; padding-bottom:0; '>
                <div style='width:40%; border:0 solid white; text-align:left; padding-top:0; padding-left:0; padding-right:0; padding-bottom:0; background-color:white; '>
		            <div>COLOR:</div>
	            </div>
                <div style='width:60%; border:0 solid white; text-align:left; padding-top:0; padding-left:0; padding-right:0; padding-bottom:0; background-color:white; '>
		            <div style='margin-right: 4px !important;'>${this.content.exam3}</div>
	            </div>
            </div>
            <div style='display: flex; align-items: center; padding-top:0; padding-left:0; padding-right:0; padding-bottom:0; '>
                <div style='width:40%; border:0 solid white; text-align:left; padding-top:0; padding-left:0; padding-right:0; padding-bottom:0; background-color:white; '>
		            <div>SANGRE:</div>
	            </div>
                <div style='width:60%; border:0 solid white; text-align:left; padding-top:0; padding-left:0; padding-right:0; padding-bottom:0; background-color:white; '>
		            <div style='margin-right: 4px !important;'>${this.content.exam4}</div>
	            </div>
            </div>
            <div style='display: flex; align-items: center; padding-top:0; padding-left:0; padding-right:0; padding-bottom:0; '>
                <div style='width:40%; border:0 solid white; text-align:left; padding-top:0; padding-left:0; padding-right:0; padding-bottom:0; background-color:white; '>
		            <div>OLOR:</div>
	            </div>
                <div style='width:60%; border:0 solid white; text-align:left; padding-top:0; padding-left:0; padding-right:0; padding-bottom:0; background-color:white; '>
		            <div style='margin-right: 4px !important;'>${this.content.exam5}</div>
	            </div>
            </div>
            <div style='display: flex; align-items: center; padding-top:0; padding-left:0; padding-right:0; padding-bottom:0; '>
                <div style='width:40%; border:0 solid white; text-align:left; padding-top:0; padding-left:0; padding-right:0; padding-bottom:0; background-color:white; '>
		            <div>MOCO:</div>
	            </div>
                <div style='width:60%; border:0 solid white; text-align:left; padding-top:0; padding-left:0; padding-right:0; padding-bottom:0; background-color:white; '>
		            <div style='margin-right: 4px !important;'>${this.content.exam6}</div>
	            </div>
            </div>
            <div style='display: flex; align-items: center; padding-top:0; padding-left:0; padding-right:0; padding-bottom:0; '>
                <div style='width:40%; border:0 solid white; text-align:left; padding-top:0; padding-left:0; padding-right:0; padding-bottom:0; background-color:white; '>
		            <div>CONSISTENCIA:</div>
	            </div>
                <div style='width:60%; border:0 solid white; text-align:left; padding-top:0; padding-left:0; padding-right:0; padding-bottom:0; background-color:white; '>
		            <div style='margin-right: 4px !important;'>${this.content.exam7}</div>
	            </div>
            </div>
            <div style='display: flex; align-items: center; padding-top:0; padding-left:0; padding-right:0; padding-bottom:0; '>
                <div style='width:40%; border:0 solid white; text-align:left; padding-top:0; padding-left:0; padding-right:0; padding-bottom:0; background-color:white; '>
		            <div>REST. ALIMENTICIOS:</div>
	            </div>
                <div style='width:60%; border:0 solid white; text-align:left; padding-top:0; padding-left:0; padding-right:0; padding-bottom:0; background-color:white; '>
		            <div style='margin-right: 4px !important;'>${this.content.exam8}</div>
	            </div>
            </div>
            <div style='display: flex; align-items: center; padding-top:0; padding-left:0; padding-right:0; padding-bottom:0; '>
                <strong>EXAMEN MICROSCOPIO</strong>
            </div>
            <div style='display: flex; align-items: center; padding-top:0; padding-left:0; padding-right:0; padding-bottom:0; '>
                <div style='width:40%; border:0 solid white; text-align:left; padding-top:0; padding-left:0; padding-right:0; padding-bottom:0; background-color:white; '>
		            <div>LEUCOCITOS:</div>
	            </div>
                <div style='width:50%; border:0 solid white; text-align:left; padding-top:0; padding-left:0; padding-right:0; padding-bottom:0; background-color:white; '>
		            <div style='margin-right: 4px !important;'>${this.content.exam9}</div>
	            </div>
                <div style='width:10%; border:0 solid white; text-align:left; padding-top:0; padding-left:0; padding-right:0; padding-bottom:0; background-color:white; '>
                    x C
                </div>
            </div>
            <div style='display: flex; align-items: center; padding-top:0; padding-left:0; padding-right:0; padding-bottom:0; '>
                <div style='width:40%; border:0 solid white; text-align:left; padding-top:0; padding-left:0; padding-right:0; padding-bottom:0; background-color:white; '>
		            <div>HEMATIES:</div>
	            </div>
                <div style='width:50%; border:0 solid white; text-align:left; padding-top:0; padding-left:0; padding-right:0; padding-bottom:0; background-color:white; '>
		            <div style='margin-right: 4px !important;'>${this.content.exam10}</div>
	            </div>
                <div style='width:10%; border:0 solid white; text-align:left; padding-top:0; padding-left:0; padding-right:0; padding-bottom:0; background-color:white; '>
                    x C
                </div>
            </div>
            <div style='display: flex; align-items: center; padding-top:0; padding-left:0; padding-right:0; padding-bottom:0; '>
                <div style='width:40%; border:0 solid white; text-align:left; padding-top:0; padding-left:0; padding-right:0; padding-bottom:0; background-color:white; '>
		            <div>FLORA BACTERIANA:</div>
	            </div>
                <div style='width:50%; border:0 solid white; text-align:left; padding-top:0; padding-left:0; padding-right:0; padding-bottom:0; background-color:white; '>
		            <div style='margin-right: 4px !important;'>${this.content.exam11}</div>
	            </div>
            </div>
            <div style='display: flex; align-items: center; padding-top:0; padding-left:0; padding-right:0; padding-bottom:0; '>
                <div style='width:40%; border:0 solid white; text-align:left; padding-top:0; padding-left:0; padding-right:0; padding-bottom:0; background-color:white; '>
		            <div>LEVADURA:</div>
	            </div>
                <div style='width:50%; border:0 solid white; text-align:left; padding-top:0; padding-left:0; padding-right:0; padding-bottom:0; background-color:white; '>
		            <div style='margin-right: 4px !important;'>${this.content.exam12}</div>
	            </div>
            </div>
            <div style='display: flex; align-items: center; padding-top:5px; padding-left:0; padding-right:0; padding-bottom:0; '>
                <div style='width:100%; border:0 solid white; text-align:left; padding-top:0; padding-left:0; padding-right:0; padding-bottom:0; background-color:white; '>
		            <div style='margin-right: 4px !important;'>${this.content.bacterias}</div>
	            </div>
            </div>
            <div style='display: flex; align-items: center; padding-top:5px; padding-left:0; padding-right:0; padding-bottom:0; '>
                <div style='width:40%; border:0 solid white; text-align:left; padding-top:0; padding-left:0; padding-right:0; padding-bottom:0; background-color:white; '>
		            <div>METODO:</div>
	            </div>
                <div style='width:60%; border:0 solid white; text-align:left; padding-top:0; padding-left:0; padding-right:0; padding-bottom:0; background-color:white; '>
		            <div style='margin-right: 4px !important;'>${this.content.metodo1}</div>
	            </div>
            </div>
            <div style='display: flex; align-items: center; padding-top:0; padding-left:0; padding-right:0; padding-bottom:0; '>
                <div style='width:40%; border:0 solid white; text-align:left; padding-top:0; padding-left:0; padding-right:0; padding-bottom:0; background-color:white; '>
		            <div>&nbsp; </div>
	            </div>
                <div style='width:60%; border:0 solid white; text-align:left; padding-top:0; padding-left:0; padding-right:0; padding-bottom:0; background-color:white; '>
		            <div style='margin-right: 4px !important;'>${this.content.metodo2}</div>
	            </div>
            </div>
            `
            const envio = {
                status: 1,
                result: textHtml,
                size: 18,
                processed_id: localStorage.clientId,
            }
            const result = await this.setUpdateExam(this.exam.id, envio)
            if (result) {
                this.exam.status = 1
                this.exam.processed_id = localStorage.clientId
                this.exam.process_name = localStorage.username
                this.exam.result = textHtml
            }
        },
    },
}
</script>
<style scoped>
.item-height {
    max-height: calc(100vh - 350px);
    min-height: calc(100vh - 350px);
    overflow-x: hidden;
    overflow-y: auto;
}
.close-item-height {    
    max-height: calc(100vh - 280px) !important;
    min-height: calc(100vh - 280px) !important;
}
.row-bacterias {
    height: 300px;
    overflow-y: auto;
}
</style>