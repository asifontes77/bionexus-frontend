<template>
    <div>
        <v-card v-if="!format" color="gray" width="500" class="mx-auto mt-10">
            <v-card-title class="d-flex justify-center">EXAMEN SIN EDITAR</v-card-title>
            <v-card-subtitle class="d-flex justify-center">PROCEDA A SU EDICION</v-card-subtitle>
        </v-card>
        <v-card v-else elevation="2" style="height: 100%; width: 100%">
            <v-card-title class="sidebar">
                <div class="d-flex justify-space-between" style="width: 100%">
                    <div>DESCRIPCION</div>
                    <div>VALOR DE REFERENCIA</div>
                </div>
            </v-card-title>
            <v-card-text class="item-height mt-2" :class="closeCard ? 'close-item-height' : ''">
                <div
                    v-for="row in format.rowContainer"
                    :key="row.id"
                    :style="row.style"
                >
                    <div v-if="row.antibiograma">
                        <antibiograma :cultivo="cultivo" />
                    </div>
                    <div v-else class="d-flex align-center mb-2">
                        <div
                            v-for="col in row.content.stageColumns"
                            :key="col.id"
                            :style="col.style"
                        >
                            <div v-for="(content, index) in col.content" :key="index">
                                <div v-if="content.type==='label'" v-html="content.text"></div>
                                <div v-if="content.type==='description'" v-html="content.text"></div>
                                <div v-if="content.type==='variable'">
                                    <div v-if="content.numeric">
                                        <v-text-field
                                            v-model="content.text"
                                            type="number"
                                            outlined
                                            dense
                                            hide-details
                                            class="mr-1"
                                            @change="verifyFormula()"
                                            @keydown="preventComma"
                                        />
                                    </div>
                                    <div v-else-if="content.isFormula">
                                        <div class="style-formula mr-1">
                                            {{ content.text }}
                                        </div>
                                    </div>
                                    <v-text-field
                                        v-else-if="!content.autocompletion"
                                        v-model="content.text"
                                        outlined
                                        dense
                                        hide-details
                                        class="mr-1"
                                    />
                                    <v-autocomplete
                                        v-else-if="content.autocompletion"
                                        v-model="content.text"
                                        :items="autocompletionList(content.autocompletionList)"
                                        outlined
                                        dense
                                        hide-details
                                        class="mr-1"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
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
import pacientsMixin from '@/mixins/services/pacientsMixin'
import createNumberMask from 'text-mask-addons/dist/createNumberMask'
import Antibiograma from '@/components/modules/history/exams/Antibiograma.vue'

export default {
  components: { Antibiograma },
    name: 'ExamEdit',
    mixins: [pacientsMixin],
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
            format: null,
            contRow: 0,
            currencyMask: createNumberMask({
                prefix: "",
                suffix: '',
                includeThousandsSeparator: true,
                allowDecimal: false,
                allowNegative: false,
                thousandsSeparatorSymbol: "",
                decimalLimit: 0,
            }),
            currencyMaskd: createNumberMask({
                prefix: "",
                suffix: '',
                includeThousandsSeparator: true,
                allowDecimal: true,                
                integerLimit: 15,
                decimalLimit: 1,
                allowNegative: false,
                thousandsSeparatorSymbol: "",
                decimalSymbol: '.',
            }),
            currencyMaskdd: createNumberMask({
                prefix: "",
                suffix: '',
                includeThousandsSeparator: true,
                allowDecimal: true,                
                integerLimit: 15,
                decimalLimit: 2,
                allowNegative: false,
                thousandsSeparatorSymbol: "",
                decimalSymbol: '.',
            }),
            cultivo: {
                negativo: false,
                resultado: [
                    {
                        organismo: '',
                        antibiograma: {
                            sensible: [],
                            intermedio: [],
                            resistente: [],
                        },
                    },
                ],
            },
        }
    },
    async mounted() {
        await this.getFormat()        
    },
    methods: {
        async getFormat() {
            const result = await this.getExamFormat(this.exam.examlistsId)
            this.format = result.format_vue
            this.contRow = result.size
            if (this.format !== null && this.format !== '') {
                this.format.rowContainer.forEach((row) => {
                    row.content.stageColumns.forEach((col) => {
                        col.content.forEach((content) => {
                            if (content.type === 'variable') {
                                content.text = ''
                            }
                        })
                    })
                })
            } else {
                this.format = null
            }
        },
        editDecimal(content, decimalLimit) {
            if (!content.includes(',')) {
                if (decimalLimit===1) content = content + ',0' 
                if (decimalLimit===2) content = content + ',00' 
            }
        },
        async verifyFormula() {
            let verificar = await JSON.parse(JSON.stringify(this.format.rowContainer))
            verificar.forEach((row, irow) => {
                row.content.stageColumns.forEach((col, icol) => {
                    col.content.forEach(async (content, icontent) => {
                        if (content.isFormula) {
                            const result = await this.editFormula(content)
                            if (typeof result !== 'undefined') {
                                await this.changeContent(result, irow, icol, icontent, content)
                            }
                        }
                    })
                })
            })
        },
        changeContent(result, irow, icol, icontent, content) {
            if (content.allowDecimal) {
                result = this.crearDecimales(content.decimalLimit, parseFloat(result))
            } else {
                result = this.crearDecimales(0, parseFloat(result))
            }
            this.format.rowContainer[irow].content.stageColumns[icol].content[icontent].text = result 
        },
        editFormula(content) { 
            let template = content.formula
            let expresion = template.replace(/[{}]/g, '')
            let variables = template.match(/{{(.*?)}}/g)
            variables = variables.map(v => ({
                variable: v.replace(/{{|}}/g, ''), // Remueve las llaves dobles y deja solo el nombre de la variable
                value: null
            }))
            variables.forEach((variable) => {
                this.format.rowContainer.forEach((row) => {
                    row.content.stageColumns.forEach((col) => {
                        col.content.forEach((content) => {
                            if (content.type === 'variable') {
                                const valor = content.value.replace(/[{}]/g, '')
                                if (variable.variable === valor) {
                                    variable.value = content.text
                                }
                            }
                        })
                    })
                })
            })
            let isNumeric = true
            variables.forEach(item => {
                if (item.value.length === 0) {
                    isNumeric = false
                }
            })
            if (isNumeric) {
                variables.forEach(item => {
                    if (!isNaN(item.value)) {
                        expresion = expresion.replace(item.variable, item.value)
                    } else {

                    }
                })
                let resultado = eval(expresion)
                return resultado.toString()
            }
        },
        preventComma(event) {
            if (event.key === ',') {
                event.preventDefault()
            }
        },
        formatNumber() {
            this.format.rowContainer.forEach((row) => {
                row.content.stageColumns.forEach((col) => {
                    col.content.forEach((content) => {
                        if (content.numeric || content.isFormula) {
                            var decimalLimit = content.decimalLimit
                            var value = content.text
                            value = value.replace(/,/g, '.')
                            content.text = this.crearDecimales(decimalLimit, parseFloat(value))
                        }
                    })
                })
            })
        },
        async toRegister() {
            await this.formatNumber()
            var textHtml = ''
            this.format.rowContainer.forEach((row) => {
                textHtml += `<div style='display: flex; align-items: center; ${this.styleConvert(row.style)}'>`
                if (!row.antibiograma) {
                    row.content.stageColumns.forEach((col) => {
                        textHtml += `<div style='${this.styleConvert(col.style)}'>`
                        col.content.forEach((content) => {
                            if (content.type==='variable') {
                                textHtml += `<div style='margin-right: 4px !important;'>${content.text}</div>`
                            } else {
                                textHtml += `<div>${content.text}</div>`                      
                                textHtml = textHtml.replace('<p>', '')
                                textHtml = textHtml.replace('</p>', '')
                            }
                        })
                        textHtml += `</div>`
                    })
                } else {
                    if (this.cultivo.negativo) {
                        textHtml += `<div style='width:100%; border:0 solid white; text-align:left; padding-top:0; padding-left:0; padding-right:0; padding-bottom:0; background-color:white;'>
                            Negativo a las 48 horas de incubación
                        </div>`
                    } else {
                        textHtml += `<div style='width:100%; border:0 solid white; text-align:left; padding-top:0; padding-left:0; padding-right:0; padding-bottom:0; background-color:white; display: flex; flex-direction: column;'>`
                        this.cultivo.resultado.forEach((organismo, index) => {
                            textHtml += `<div style='width:100%; border:0 solid white; text-align:left; padding-top:0; padding-left:0; padding-right:0; padding-bottom:0; background-color:white;'>
                                <strong>${index + 1}.- ${organismo.organismo}</strong>
                            </div>
                            <div style='width:100%; border:0 solid white; text-align:center; padding-top:0; padding-left:0; padding-right:0; padding-bottom:0; background-color:white;'>
                                <strong>ANTIBIOGRAMA</strong>
                            </div>
                            <div style='padding-left: 20px;'>
                                <div  style='width:100%; border-bottom: 1px solid rgba(0, 0, 0, 0.6); text-align:left; padding-top:0; padding-left:0; padding-right:0; padding-bottom:0; background-color:white;'>
                                    <strong>SENSIBLES</strong>
                                </div>
                                <div style='padding-left: 20px;'>
                                <div style="display: flex; align-items: center; padding-top:0; padding-left:0; padding-right:0; padding-bottom:0; ">
                                    <div  style='width:80%; border:0 solid white; text-align:left; padding-top:0; padding-left:0; padding-right:0; padding-bottom:0; background-color:white;'>
                                        <strong>ANTIBIOTICO</strong>
                                    </div>
                                    <div  style='width:20%; border:0 solid white; text-align:center; padding-top:0; padding-left:0; padding-right:0; padding-bottom:0; background-color:white;'>
                                        <strong>mic (µg/mL)</strong>
                                    </div>
                                </div>`
                            organismo.antibiograma.sensible.forEach((sensible) => {
                                textHtml += `<div style="display: flex; align-items: center; padding-top:0; padding-left:0; padding-right:0; padding-bottom:0; ">
                                    <div  style='width:80%; border:0 solid white; text-align:left; padding-top:0; padding-left:0; padding-right:0; padding-bottom:0; background-color:white;'>
                                        ${sensible.antibiotic}
                                    </div>
                                    <div  style='width:20%; border:0 solid white; text-align:center; padding-top:0; padding-left:0; padding-right:0; padding-bottom:0; background-color:white;'>
                                        ${sensible.mic}
                                    </div>
                                </div>`
                            })
                            textHtml += `</div></div>
                            <div style='padding-left: 20px;'>
                                <div  style='width:100%; border-bottom: 1px solid rgba(0, 0, 0, 0.6); text-align:left; padding-top:0; padding-left:0; padding-right:0; padding-bottom:0; background-color:white;'>
                                    <strong>INTERMEDIOS</strong>
                                </div>
                                <div style='padding-left: 20px;'>
                                <div style="display: flex; align-items: center; padding-top:0; padding-left:0; padding-right:0; padding-bottom:0; ">
                                    <div  style='width:80%; border:0 solid white; text-align:left; padding-top:0; padding-left:0; padding-right:0; padding-bottom:0; background-color:white;'>
                                        <strong>ANTIBIOTICO</strong>
                                    </div>
                                    <div  style='width:20%; border:0 solid white; text-align:center; padding-top:0; padding-left:0; padding-right:0; padding-bottom:0; background-color:white;'>
                                        <strong>mic (µg/mL)</strong>
                                    </div>
                                </div>`
                            organismo.antibiograma.intermedio.forEach((intermedio) => {
                                textHtml += `<div style="display: flex; align-items: center; padding-top:0; padding-left:0; padding-right:0; padding-bottom:0; ">
                                    <div  style='width:80%; border:0 solid white; text-align:left; padding-top:0; padding-left:0; padding-right:0; padding-bottom:0; background-color:white;'>
                                        ${intermedio.antibiotic}
                                    </div>
                                    <div  style='width:20%; border:0 solid white; text-align:center; padding-top:0; padding-left:0; padding-right:0; padding-bottom:0; background-color:white;'>
                                        ${intermedio.mic}
                                    </div>
                                </div>`
                            })
                            textHtml += `</div></div>
                            <div style='padding-left: 20px;'>
                                <div  style='width:100%; border-bottom: 1px solid rgba(0, 0, 0, 0.6); padding-top:0; padding-left:0; padding-right:0; padding-bottom:0; background-color:white;'>
                                    <strong>RESISTENTES</strong>
                                </div>
                                <div style='padding-left: 20px;'>
                                <div style="display: flex; align-items: center; padding-top:0; padding-left:0; padding-right:0; padding-bottom:0; ">
                                    <div  style='width:80%; border:0 solid white; text-align:left; padding-top:0; padding-left:0; padding-right:0; padding-bottom:0; background-color:white;'>
                                        <strong>ANTIBIOTICO</strong>
                                    </div>
                                    <div  style='width:20%; border:0 solid white; text-align:center; padding-top:0; padding-left:0; padding-right:0; padding-bottom:0; background-color:white;'>
                                        <strong>mic (µg/mL)</strong>
                                    </div>
                                </div>`
                            organismo.antibiograma.resistente.forEach((resistente) => {
                                textHtml += `<div style="display: flex; align-items: center; padding-top:0; padding-left:0; padding-right:0; padding-bottom:0; ">
                                    <div  style='width:80%; border:0 solid white; text-align:left; padding-top:0; padding-left:0; padding-right:0; padding-bottom:0; background-color:white;'>
                                        ${resistente.antibiotic}
                                    </div>
                                    <div  style='width:20%; border:0 solid white; text-align:center; padding-top:0; padding-left:0; padding-right:0; padding-bottom:0; background-color:white;'>
                                        ${resistente.mic}
                                    </div>
                                </div>`
                            })
                            textHtml += `</div></div>`
                        })
                        textHtml += `</div>`
                    }
                }
                textHtml += `</div>`
            })
            const envio = {
                status: 1,
                result: textHtml,
                processed_id: localStorage.clientId,
                size: this.contRow,
            }
            const result = await this.setUpdateExam(this.exam.id, envio)
            if (result) {
                this.exam.status = 1
                this.exam.processed_id = localStorage.clientId
                this.exam.process_name = localStorage.username
                this.exam.result = textHtml
            }
        },
        styleConvert(style) {
            var txtStyle = ''
            for (let propiedad in style) {
                var txtPropiedad = ''
                for (let i = 0; i < propiedad.length; i++) {
                    if (propiedad[i] === propiedad[i].toUpperCase()) {
                        txtPropiedad += '-' + propiedad[i].toLowerCase()
                    } else {
                        txtPropiedad += propiedad[i]  
                    }
                }
                txtPropiedad += `:${style[propiedad]}`
                txtStyle += txtPropiedad + '; '

            }
            return txtStyle
        },
        autocompletionList(autocompletionList) {
            const newList = []
            autocompletionList.forEach((item) => {
                newList.push(item.text)
            })
            return newList
        },        
        async asyncForEach(array, callback) {
            for (let index = 0; index < array.length; index++) {
                await callback(array[index], index, array);
            }
        },
        crearDecimales(nDecimales, numero) {
            let numeroFormateado = numero
            if (nDecimales === 0) {
                numeroFormateado = Math.floor(numero)
            } else {
                numeroFormateado = parseFloat(numero.toFixed(nDecimales))
            }
            numeroFormateado = new Intl.NumberFormat('es-ES', {
                minimumFractionDigits: nDecimales,
                maximumFractionDigits: nDecimales
            }).format(numeroFormateado)    
            return numeroFormateado;
        }
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
.style-formula {
    color: rgba(0, 0, 0, 0.87);
    border-radius: 4px;
    border: 1px solid #9E9E9E;
    font-size: 16px;
    font-weight: 400;
    letter-spacing: normal;
    max-width: 100%;
    text-align: left;
    height: 40px;
    display: flex;
    align-items: center;
    padding: 0 8px;
}
</style>