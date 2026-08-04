<template>
  <div>
    <div class="pt-10 px-6">
        <v-select
            v-model="content.type"
            :items="typeItems"
            item-text="text"
            item-value="value"
            label="Tipo"
            dense
            outlined
            @change="$emit('change-type')"
        />
        <vue-editor
            v-model="content.text"
            :editor-toolbar="customToolbar"
        />
        <v-text-field
            v-model="content.value"
            label="Etiqueta"
            placeholder="Escriba etiqueta..."
            outlined
            class="mt-6"
        />
        <div v-if="content.type === 'variable'">
            <div>
                <div>Tipo de variable</div>
                <v-radio-group
                    v-model="variableType"
                    column
                >
                    <v-radio value="text" class="mr-2">                    
                        <template v-slot:label>
                            <div class="caption">Texto</div>
                        </template>
                    </v-radio>
                    <v-radio value="numeric" class="mr-2">                    
                        <template v-slot:label>
                            <div class="caption">Numérico</div>
                        </template>
                    </v-radio>
                    <v-radio value="formula" class="mr-2">                    
                        <template v-slot:label>
                            <div class="caption">Formula</div>
                        </template>
                    </v-radio>
                    <v-radio value="autocompletion" class="mr-1">                    
                        <template v-slot:label>
                            <div class="caption">Autocompletación</div>
                        </template>
                    </v-radio>
                </v-radio-group>
            </div>
            <div v-if="content.isFormula">
                <v-textarea
                    v-model="content.formula"
                    label="Escriba la formula"
                    placeholder="Escriba..."
                    hide-details
                    auto-grow
                    outlined
                    rows="2"
                    row-height="15"
                />
                <v-checkbox
                    v-model="content.allowDecimal"
                    hide-details
                    label="Tiene decimales"
                />
                <v-text-field
                    v-model.number="content.decimalLimit"
                    hide-details
                    type="number"
                    label="Número de decimales"
                    :disabled="content.allowDecimal ? false : true"
                    placeholder="Escriba número de decimales"
                    outlined
                    class="mt-6"
                    @change="seeDecimals()"
                />
            </div>
            <div v-if="content.numeric">
                <v-checkbox
                    v-model="content.allowDecimal"
                    hide-details
                    label="Tiene decimales"
                />
                <v-text-field
                    v-model.number="content.decimalLimit"
                    hide-details
                    type="number"
                    label="Número de decimales"
                    :disabled="content.allowDecimal ? false : true"
                    placeholder="Escriba número de decimales"
                    outlined
                    class="mt-6"
                    @change="seeDecimals()"
                />
            </div>
            <div v-if="content.autocompletion">
                <autocompletion-list-dialog
                    :key="autocompletionKey"
                    :autocompletion="content.autocompletionList"
                    @edit-autocompletion-item="editAutocompletionItem"
                    @delete-autocompletion-item="deleteAutocompletionItem"
                />
                <div v-if="activeAutocompletion">
                    <div
                        class="d-flex justify-space-between align-center background100 px-2 py-1 mb-1"
                    >
                        <div style="width: auto">
                            <v-text-field
                                v-model="selectAutocompletion"
                                dense
                                hide-details
                                outlined
                            />
                        </div>
                        <div class="d-flex">
                            <v-btn
                                icon 
                                color="secondary"
                                @click="acceptAutocompletionItem()"
                            >
                                <v-icon>mdi-check-circle-outline</v-icon>
                            </v-btn>
                            <v-btn
                                icon 
                                color="primary"
                                @click="cancelAutocompletionItem()"
                            >
                                <v-icon>mdi-close-circle</v-icon>
                            </v-btn>
                        </div>
                    </div>
                </div>                
                <v-btn
                    v-if="content.autocompletion"
                    text
                    color="primary"
                    @click="addAutocompletionItem()"
                >
                    <v-icon left>mdi-plus-circle-outline</v-icon>
                    Agregar
                </v-btn>
            </div>            
        </div>
    </div>
  </div>
</template>

<script>
import { VueEditor } from "vue2-editor"
import AutocompletionListDialog from '@/components/modules/exams/setting/autocompletionListDialog.vue'

export default {
    name: 'ContentSetting',
    components: { VueEditor, AutocompletionListDialog },
    props: {
        content: {
            type: Object,
            default: () => ({})
        },
        variableId: {
            type: Number,
            default: 1,
        },

    },
    data() {
        return {
            typeItems: [
                {value: 'label', text: 'Título'},
                {value: 'description', text: 'Descripción'},
                {value: 'variable', text: 'Variable'},
                {value: 'units', text: 'Unidades'},
                {value: 'vr', text: 'VR'}
            ],
            customToolbar: [
                [{ size: ["small", false, "large", "huge"] }],
                ["bold", "italic", "underline"],
                [{ script: "sub" }, { script: "super" }],
            ],
            variableType: '',
            selectAutocompletion: null,
            activeAutocompletion: false,
            indexAutocompletion: -1,
            autocompletionKey: 0,
        }
    },
    watch: {
        'content.numeric': {
            handler(value) {
                if (!value) {
                    this.content.allowDecimal = false
                    this.content.decimalLimit = 0
                }
            },
        },
        'content.isFormula': {
            handler(value) {
                if (!value) {
                    this.content.allowDecimal = false
                    this.content.decimalLimit = 0
                }
            },
        },
        'variableType': {
            handler(value) {
                this.content.numeric = false
                this.content.autocompletion = false
                this.content.isFormula = false
                if (value === 'numeric') {
                    this.content.numeric = true
                } else if (value === 'autocompletion') {
                    this.content.autocompletion = true
                } else if (value === 'formula') {
                    this.content.isFormula = true
                }
            },
        },
    },
    mounted() {
        console.log('contenido: ', this.content)
        if (!('autocompletion' in this.content)) {
            this.content.autocompletion = false
            this.content.autocompletionList = []
        }
        if (this.content.numeric) {
            this.variableType = 'numeric'
        } else if (this.content.autocompletion) {
            this.variableType = 'autocompletion'
        } else if (this.content.isFormula) {
            this.variableType = 'formula'
        } else {
            this.variableType = 'text'
        }
    },
    methods: {
        seeDecimals() {
            if (this.content.decimalLimit === '') {
                this.content.decimalLimit = 0
            }
        },
        addAutocompletionItem() {
            const newItem = {text: 'Nueva autocompletación'}
            this.content.autocompletionList.push(newItem)
            this.autocompletionKey += 1
        },
        deleteAutocompletionItem(index) {
            this.content.autocompletionList.splice(index, 1)
            this.selectAutocompletion = null
            this.autocompletionKey += 1
        },
        ver() {
            console.log('lista: ', this.content.autocompletionList)
        },
        editAutocompletionItem(index) {
            this.selectAutocompletion = JSON.parse(JSON.stringify(this.content.autocompletionList[index].text))
            this.indexAutocompletion = index
            this.activeAutocompletion = true
        },
        acceptAutocompletionItem() {
            this.content.autocompletionList[this.indexAutocompletion].text = this.selectAutocompletion
            this.activeAutocompletion = false
            this.selectAutocompletion = null
            this.autocompletionKey += 1
        },
        cancelAutocompletionItem() {
            this.activeAutocompletion = false
            this.selectAutocompletion = null
        },
    },
}
</script>
