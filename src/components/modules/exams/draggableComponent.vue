<template>
  <v-container fluid class="px-0 py-0">
    <div class="d-flex">
        <div class="all-screnn">
            <div v-if="selectedExam.format_vue" class="stageInner pb-10 mb-10">
                <div
                    v-for="row in selectedExam.format_vue.rowContainer" 
                    :key="row.id"
                    class="stageRow_row"
                    :class="{ 'active-row': activeRowClass }"
                    :style=" activeSelectedRow[row.id] ? 'border: 1px dashed var(--v-primary-base);' : ''"
                >
                    <row-component
                        :row="row"
                        :active-Row="activeRow"
                        :active-row-class="activeRowClass"
                        @content-active="contentActive"
                        @delete-row="deleteRow"
                        @handle-col-drop="handleColDrop"
                        @col-drag-end="colDragEnd()"
                        @up-move="upMove"
                        @down-move="downMove"
                        @clone-active="cloneActive"
                        @change-row-setting="changeRowSetting"
                    />
                    <drop
                        class="drop"
                        :class="{ 'over': row.hover }"
                        @drop="handleDrop(row, ...arguments)"
                        @dragover="row.hover = true"
                        @dragleave="row.hover = false"
                    >
                        <div>Arrástralo aquí</div>
                    </drop>
                </div>
                <div style="heigth: 20px">&nbsp;</div>
            </div>
        </div>
        <v-navigation-drawer
            v-model="rightDrawer"
            absolute
            right
            width="390"
            class="right-column"
        >
            <div class="contenido">
                <div class="overline">Seleccione presionando y arrastrando</div>
                <drag
                    v-for="(row, index) in newRow"
                    :key="index"
                    class="new_row"
                    :transfer-data="row"
                    @dragstart="activoRow()"
                    @dragend="colDragEnd()"
                >
                    <p class="row-title">{{ row.rowTitle }}</p>
                    <div
                        v-for="(col, indexC) in row.stageColumns"
                        :key="indexC"
                        :style="col.style"
                    ></div>
                </drag>
            </div>
        </v-navigation-drawer>
        <v-navigation-drawer
            v-model="rightDrawerSetting"
            absolute
            right
            width="380"
            color="background"
            class="right-column mt-10 pa-0"
            style="z-index: 20; height: calc(100vh - 170px)"
        >
            <v-app-bar color="lighcyan accent-4" dense>
                <div>{{ labelHead }}</div>
                <v-spacer></v-spacer>
                <v-btn v-if="rowSetting" icon color="primary" @click="cloneActive()">
                    <v-icon>mdi-text-box-multiple-outline</v-icon>
                </v-btn>
                <v-btn v-if="rowSetting" icon color="secondary" @click="deleteActive()">
                    <v-icon>mdi-delete</v-icon>
                </v-btn>
                <v-btn icon color="gray300" @click="closeSetting()">
                    <v-icon>mdi-close</v-icon>
                </v-btn>
            </v-app-bar>
            <row-component-setting :key="keyRowSetting" v-if="rowSetting" :row="selectedRow" />
            <content-setting
                :key="keyContentSetting"
                v-if="contentSetting"
                :content="selectedContent"
                @change-type="changeType"
            />
        </v-navigation-drawer>
    </div>
  </v-container>
</template>

<script>
import { Drag, Drop } from 'vue-drag-drop'
import RowComponent from '@/components/modules/exams/RowComponent.vue'
import RowComponentSetting from '@/components/modules/exams/setting/RowComponentSetting.vue'
import ContentSetting from './setting/ContentSetting.vue'
export default {
    name: 'draggableComponent',
    components: {
        drag: Drag,
        drop: Drop,
        RowComponent,
        RowComponentSetting,
        ContentSetting,
    },
    props: {
        selectedExam: {
            type: Object,
            default: () => {},
        },
    },
    data() {
        return {
            rightDrawer: true,
            labelHead: '',
            rightDrawerSetting: false,
            contentBlockSetting: false,
            rowSetting: false,
            contentSetting: false,
            keyRowSetting: 0,
            keyContentSetting: 0,
            contentList: [
                {value: 'label', text: 'Título'},
                {value: 'description', text: 'Descripción'},
                {value: 'variable', text: 'Variable'},
                {value: 'units', text: 'Unidades'},
                {value: 'vr', text: 'VR'}
            ],
            contentType: {label: 'Título', description: 'Descripción', variable: 'Variable', units: 'Unidades', vr: 'VR'},
            selectedContent: null,
            activeRowClass: false,
            activeRow: false,
            activeCol: false,
            rowId: 1,
            variableId: 0,
            changesMade: false,
            selectedRow: null,
            selectedCol: null,
            activeSelectedRow: {},
            newRow: [
                {
                    rowTitle: '',
                    cols: 1,
                    stageColumns: [
                        {
                            id: 1,
                            style: {
                                width: '100%',
                                backgroundColor: 'white',
                                border: '0 solid white',
                                paddingTop: '0',
                                paddingRight: '0',
                                paddingBottom: '0',
                                paddingLeft: '0',
                                textAlign: 'center',
                            },
                            col: '12',
                            activeColumn: false,
                            over: false,
                            content: [{
                                active: false,
                                type: 'label',
                                value: 'Aquí va el título',
                                text: '<p>Aquí va el título</p>',
                            },],
                        },
                    ]
                },
                {
                    rowTitle: '',
                    cols: 2,
                    stageColumns: [
                        {
                            id: 1,
                            style: {
                                width: '50%',
                                backgroundColor: 'white',
                                border: '0 solid white',
                                paddingTop: '0',
                                paddingRight: '0',
                                paddingBottom: '0',
                                paddingLeft: '0',
                                textAlign: 'center',
                            },
                            col: '6',
                            activeColumn: false,
                            over: false,
                            content: [{
                                active: false,
                                type: 'label',
                                value: 'Aquí va el título',
                                text: '<p>Aquí va el título</p>',
                            },],
                        },
                        {
                            id: 2,
                            style: {
                                width: '50%',
                                backgroundColor: 'white',
                                border: '0 solid white',
                                paddingTop: '0',
                                paddingRight: '0',
                                paddingBottom: '0',
                                paddingLeft: '0',
                                textAlign: 'center',
                            },
                            col: '6',
                            activeColumn: false,
                            over: false,
                            content: [{
                                active: false,
                                type: 'label',
                                value: 'Aquí va el título',
                                text: '<p>Aquí va el título</p>',
                            },],
                        },
                    ]
                },
                {
                    rowTitle: '',
                    cols: 4,
                    stageColumns: [
                        {
                            id: 1,
                            style: {
                                width: '41.66%',
                                backgroundColor: 'white',
                                border: '0 solid white',
                                paddingTop: '0',
                                paddingRight: '0',
                                paddingBottom: '0',
                                paddingLeft: '0',
                                textAlign: 'left',
                            },
                            col: '5',
                            activeColumn: false,
                            over: false,
                            content: [{
                                active: false,
                                type: 'label',
                                value: 'Aquí va la descripción',
                                text: '<p>Aquí va la descripción</p>',
                            },],
                        },
                        {
                            id: 2,
                            style: {
                                width: '16.66%',
                                backgroundColor: 'white',
                                border: '0 solid white',
                                paddingTop: '0',
                                paddingRight: '0',
                                paddingBottom: '0',
                                paddingLeft: '0',
                                textAlign: 'right',
                            },
                            col: '2',
                            activeColumn: false,
                            over: false,
                            content: [{
                                active: false,
                                type: 'variable',
                                value: '{{variable_1}}',
                                text: '<p>{{variable_1}}</p>',
                                numeric: true,
                                allowDecimal: false,
                                decimalLimit: 0,
                                autocompletion: false,
                                autocompletionList: [],
                            },],
                        },
                        {
                            id: 3,
                            style: {
                                width: '8.33%',
                                backgroundColor: 'white',
                                border: '0 solid white',
                                paddingTop: '0',
                                paddingRight: '0',
                                paddingBottom: '0',
                                paddingLeft: '0',
                                textAlign: 'left',
                            },
                            col: '1',
                            activeColumn: false,
                            over: false,
                            content: [{
                                active: false,
                                type: 'label',
                                value: 'Unidades',
                                text: '<p>Unidades</p>',
                            },],
                        },
                        {
                            id: 4,
                            style: {
                                width: '33.35%',
                                backgroundColor: 'white',
                                border: '0 solid white',
                                paddingTop: '0',
                                paddingRight: '0',
                                paddingBottom: '0',
                                paddingLeft: '0',
                                textAlign: 'center',
                            },
                            col: '4',
                            activeColumn: false,
                            over: false,
                            content: [{
                                active: false,
                                type: 'label',
                                value: 'VR',
                                text: '<p>VR</p>',
                            },],
                        },
                        
                    ],
                },
                {
                    rowTitle: 'SOLO VR',
                    cols: 4,
                    stageColumns: [
                        {
                            id: 1,
                            style: {
                                width: '41.66%',
                                backgroundColor: 'white',
                                border: '0 solid white',
                                paddingTop: '0',
                                paddingRight: '0',
                                paddingBottom: '0',
                                paddingLeft: '0',
                                textAlign: 'left',
                            },
                            col: '5',
                            activeColumn: false,
                            over: false,
                            content: [{
                                active: false,
                                type: 'label',
                                value: '',
                                text: '',
                            },],
                        },
                        {
                            id: 2,
                            style: {
                                width: '16.66%',
                                backgroundColor: 'white',
                                border: '0 solid white',
                                paddingTop: '0',
                                paddingRight: '0',
                                paddingBottom: '0',
                                paddingLeft: '0',
                                textAlign: 'right',
                            },
                            col: '2',
                            activeColumn: false,
                            over: false,
                            content: [{
                                active: false,
                                type: 'label',
                                value: '',
                                text: '',
                            },],
                        },
                        {
                            id: 3,
                            style: {
                                width: '8.33%',
                                backgroundColor: 'white',
                                border: '0 solid white',
                                paddingTop: '0',
                                paddingRight: '0',
                                paddingBottom: '0',
                                paddingLeft: '0',
                                textAlign: 'left',
                            },
                            col: '1',
                            activeColumn: false,
                            over: false,
                            content: [{
                                active: false,
                                type: 'label',
                                value: '',
                                text: '',
                            },],
                        },
                        {
                            id: 4,
                            style: {
                                width: '33.35%',
                                backgroundColor: 'white',
                                border: '0 solid white',
                                paddingTop: '0',
                                paddingRight: '0',
                                paddingBottom: '0',
                                paddingLeft: '0',
                                textAlign: 'center',
                            },
                            col: '4',
                            activeColumn: false,
                            over: false,
                            content: [{
                                active: false,
                                type: 'label',
                                value: 'VR',
                                text: '<p>VR</p>',
                            },],
                        },
                        
                    ],
                },
                {
                    rowTitle: 'SOLO TEXTO',
                    cols: 4,
                    stageColumns: [
                        {
                            id: 1,
                            style: {
                                width: '25%',
                                backgroundColor: 'white',
                                border: '0 solid white',
                                paddingTop: '0',
                                paddingRight: '0',
                                paddingBottom: '0',
                                paddingLeft: '0',
                                textAlign: 'center',
                            },
                            col: '3',
                            activeColumn: false,
                            over: false,
                            content: [{
                                active: false,
                                type: 'label',
                                value: 'Aquí va la descripción',
                                text: '<p>Aquí va la descripción</p>',
                            },],
                        },
                        {
                            id: 2,
                            style: {
                                width: '25%',
                                backgroundColor: 'white',
                                border: '0 solid white',
                                paddingTop: '0',
                                paddingRight: '0',
                                paddingBottom: '0',
                                paddingLeft: '0',
                                textAlign: 'center',
                            },
                            col: '3',
                            activeColumn: false,
                            over: false,
                            content: [{
                                active: false,
                                type: 'label',
                                value: 'Aquí va la descripción',
                                text: '<p>Aquí va la descripción</p>',
                            },],
                        },
                        {
                            id: 3,
                            style: {
                                width: '25%',
                                backgroundColor: 'white',
                                border: '0 solid white',
                                paddingTop: '0',
                                paddingRight: '0',
                                paddingBottom: '0',
                                paddingLeft: '0',
                                textAlign: 'center',
                            },
                            col: '3',
                            activeColumn: false,
                            over: false,
                            content: [{
                                active: false,
                                type: 'label',
                                value: 'Aquí va la descripción',
                                text: '<p>Aquí va la descripción</p>',
                            },],
                        },
                        {
                            id: 4,
                            style: {
                                width: '25%',
                                backgroundColor: 'white',
                                border: '0 solid white',
                                paddingTop: '0',
                                paddingRight: '0',
                                paddingBottom: '0',
                                paddingLeft: '0',
                                textAlign: 'center',
                            },
                            col: '3',
                            activeColumn: false,
                            over: false,
                            content: [{
                                active: false,
                                type: 'label',
                                value: 'Aquí va la descripción',
                                text: '<p>Aquí va la descripción</p>',
                            },],
                        },
                        
                    ],
                },
                {
                    rowTitle: '',
                    cols: 6,
                    stageColumns: [
                        {
                            id: 1,
                            style: {
                                width: '16.66%',
                                backgroundColor: 'white',
                                border: '0 solid white',
                                paddingTop: '0',
                                paddingRight: '0',
                                paddingBottom: '0',
                                paddingLeft: '0',
                                textAlign: 'left',
                            },
                            col: '2',
                            activeColumn: false,
                            over: false,
                            content: [{
                                active: false,
                                type: 'label',
                                value: 'Descripción',
                                text: '<p>Descripción</p>',
                            },],
                        },
                        {
                            id: 2,
                            style: {
                                width: '25.01%',
                                backgroundColor: 'white',
                                border: '0 solid white',
                                paddingTop: '0',
                                paddingRight: '0',
                                paddingBottom: '0',
                                paddingLeft: '0',
                                textAlign: 'left',
                            },
                            col: '2',
                            activeColumn: false,
                            over: false,
                            content: [{
                                active: false,
                                type: 'variable',
                                value: '{{variable_1}}',
                                text: '<p>{{variable_1}}</p>',
                                numeric: true,
                                allowDecimal: false,
                                decimalLimit: 0,
                                autocompletion: false,
                                autocompletionList: [],
                            },],
                        },
                        {
                            id: 3,
                            style: {
                                width: '8.33%',
                                backgroundColor: 'white',
                                border: '0 solid white',
                                paddingTop: '0',
                                paddingRight: '0',
                                paddingBottom: '0',
                                paddingLeft: '0',
                                textAlign: 'left',
                            },
                            col: '1',
                            activeColumn: false,
                            over: false,
                            content: [{
                                active: false,
                                type: 'label',
                                value: 'Uni',
                                text: '<p>Uni</p>',
                            },],
                        },
                        {
                            id: 4,
                            style: {
                                width: '16.66%',
                                backgroundColor: 'white',
                                border: '0 solid white',
                                paddingTop: '0',
                                paddingRight: '0',
                                paddingBottom: '0',
                                paddingLeft: '0',
                                textAlign: 'left',
                            },
                            col: '2',
                            activeColumn: false,
                            over: false,
                            content: [{
                                active: false,
                                type: 'label',
                                value: 'Descripción',
                                text: '<p>Descripción</p>',
                            },],
                        },
                        {
                            id: 5,
                            style: {
                                width: '25.01%',
                                backgroundColor: 'white',
                                border: '0 solid white',
                                paddingTop: '0',
                                paddingRight: '0',
                                paddingBottom: '0',
                                paddingLeft: '0',
                                textAlign: 'left',
                            },
                            col: '2',
                            activeColumn: false,
                            over: false,
                            content: [{
                                active: false,
                                type: 'variable',
                                value: '{{variable_2}}',
                                text: '<p>{{variable_2}}</p>',
                                numeric: true,
                                allowDecimal: false,
                                decimalLimit: 0,
                                autocompletion: false,
                                autocompletionList: [],
                            },],
                        },
                        {
                            id: 6,
                            style: {
                                width: '8.33%',
                                backgroundColor: 'white',
                                border: '0 solid white',
                                paddingTop: '0',
                                paddingRight: '0',
                                paddingBottom: '0',
                                paddingLeft: '0',
                                textAlign: 'left',
                            },
                            col: '1',
                            activeColumn: false,
                            over: false,
                            content: [{
                                active: false,
                                type: 'label',
                                value: 'Uni',
                                text: '<p>Uni</p>',
                            },],
                        },
                        
                    ],
                },
                {
                    rowTitle: 'Módulo antibiograma',
                    cols: 1,
                    stageColumns: [
                        {
                            id: 1,
                            style: {
                                width: '100%',
                                backgroundColor: 'white',
                                border: '0 solid white',
                                paddingTop: '0',
                                paddingRight: '0',
                                paddingBottom: '0',
                                paddingLeft: '0',
                                textAlign: 'center',
                            },
                            col: '12',
                            activeColumn: false,
                            over: false,
                            content: [{
                                active: false,
                                type: 'label',
                                value: 'Módulo antibiograma',
                                text: '<p>Módulo antibiograma</p>',
                            },],
                        },
                    ],
                    antibiograma: true
                },
            ],
            ingreso : {
                rowCount: 1,
                rowContainer: [
                    {
                        id: 1,
                        active: false,
                        hover: false,
                        style: {
                            paddingTop: '0',
                            paddingRight: '0',
                            paddingBottom: '0',
                            paddingLeft: '0',
                        },
                        content: {
                            cols: 4,
                            stageColumns: [
                                {
                                    id: 1,
                                    style: {
                                        width: '41.66%',
                                        border: '0 solid white',
                                        paddingTop: '0',
                                        paddingRight: '0',
                                        paddingBottom: '0',
                                        paddingLeft: '0',
                                        textAlign: 'left',
                                    },
                                    col: '5',
                                    activeColumn: false,
                                    over: false,
                                    content: [{
                                        active: false,
                                        type: 'description',
                                        value: 'ADRENALINA',
                                        text: '<p>ADRENALINA</p>',
                                    },],
                                },
                                {
                                    id: 2,
                                    style: {
                                        width: '16.66%',
                                        border: '0 solid white',
                                        paddingTop: '0',
                                        paddingRight: '0',
                                        paddingBottom: '0',
                                        paddingLeft: '0',
                                        textAlign: 'center',
                                    },
                                    col: '2',
                                    activeColumn: false,
                                    over: false,
                                    content: [{
                                        active: false,
                                        type: 'variable',
                                        value: 'variable_1',
                                        text: '<p>{{variable_1}}</p>',
                                        numeric: true,
                                        allowDecimal: false,
                                        decimalLimit: 0,
                                        autocompletion: false,
                                        autocompletionList: [],
                                    },],
                                },
                                {
                                    id: 3,
                                    style: {
                                        width: '8.33%',
                                        border: '0 solid white',
                                        paddingTop: '0',
                                        paddingRight: '0',
                                        paddingBottom: '0',
                                        paddingLeft: '0',
                                        textAlign: 'left',
                                    },
                                    col: '1',
                                    activeColumn: false,
                                    over: false,
                                    content: [{
                                        active: false,
                                        type: 'units',
                                        value: 'pg/ml',
                                        text: '<p>pg/ml</p>',
                                    },],
                                },
                                {
                                    id: 4,
                                    style: {
                                        width: '33.35%',
                                        border: '0 solid white',
                                        paddingTop: '0',
                                        paddingRight: '0',
                                        paddingBottom: '0',
                                        paddingLeft: '0',
                                        textAlign: 'center',
                                    },
                                    col: '4',
                                    activeColumn: false,
                                    over: false,
                                    content: [{
                                        active: false,
                                        type: 'vr',
                                        value: '( 0 - 140 )',
                                        text: '<p>( 0 - 140 )</p>',
                                    },],
                                },
                                    
                            ],
                        },
                    },
                ],
            },
        }
    },
    async mounted() {
        if (this.selectedExam.format_vue !== null) {
            console.log('contenido: ', this.selectedExam.format_vue)
            this.rowId = this.selectedExam.format_vue.rowCount
            let cantVariableId = 0
            this.selectedExam.format_vue.rowContainer.forEach((row) => {
                row.content.stageColumns.forEach((col) => {
                    col.content.forEach((content) => {
                        if (content.type === 'variable') cantVariableId += 1
                    })
                })
            })
            this.variableId = cantVariableId
        } else {
            const newRow = {
                rowCount: 1,
                rowContainer: [
                    {
                        id: 1,
                        active: false,
                        hover: false,
                        style: {
                            paddingTop: '0',
                            paddingRight: '0',
                            paddingBottom: '0',
                            paddingLeft: '0',
                        },
                        content: {
                            cols: 1,
                            stageColumns: [
                                {
                                    id: 1,
                                    style: {
                                        width: '100%',
                                        backgroundColor: 'white',
                                        border: '0 solid white',
                                        paddingTop: '0',
                                        paddingRight: '0',
                                        paddingBottom: '0',
                                        paddingLeft: '0',
                                        textAlign: 'center',
                                    },
                                    col: '12',
                                    activeColumn: false,
                                    over: false,
                                    content: [
                                        {
                                            active: false,
                                            type: 'label',
                                            value: 'Aquí va el título',
                                            text: '<p>Aquí va el título</p>',
                                        },
                                    ],
                                },
                            ]
                        },
                    },
                ],
            }
            this.selectedExam.format_vue = newRow
            this.rowId += 1
        }
        this.activeSelectedRow = {}
        this.selectedExam.format_vue.rowContainer.forEach((row) => {
            this.activeSelectedRow[row.id] = false
        })
        console.log('this.activeSelectedRow: ', this.activeSelectedRow)
    },
    methods: {
        clearCamposActive() {
            for (var campo in this.activeSelectedRow) {
                if (this.activeSelectedRow.hasOwnProperty(campo)) {
                    this.activeSelectedRow[campo] = false;
                }
            }
        },
        closeSetting() {
            this.rightDrawerSetting = false
            this.contentBlockSetting = false
            this.contentSetting = false
            this.labelHead = ''
            if (this.selectedContent) {
                this.selectedContent.active = false
            }
            this.rowSetting = false
        },
        rowActive(row) {
            console.log(row)
        },
        contentActive(item) {
            if (this.selectedContent) {
                this.selectedContent.active = false
            }
            this.closeSetting()
            this.selectedContent = item
            this.selectedContent.active = true
            this.labelHead = 'Configuración  de ' + this.contentType[item.type]
            this.rightDrawerSetting = true
            this.keyContentSetting += 1
            this.contentSetting = true
        },
        deleteRow(item) {
            console.log(item)
        },
        handleColDrop(row, col, data) {
            console.log(row, col, data)
        },
        colDragEnd() {
            this.activeCol = false
            this.activeRow = false
            this.activeRowClass = false
        },
        upMove(rowM) {
            if (rowM.id !== 1) {
                const newContainer = []
                let newIndex = 0
                let rowTMP = {}
                this.selectedExam.format_vue.rowContainer.forEach((row) => {
                    if (rowM.id - 1 === row.id) { 
                        newIndex += 1
                        rowTMP = JSON.parse(JSON.stringify(rowM))
                        rowTMP.id = newIndex
                        newContainer.push(rowTMP)
                        newIndex += 1
                        rowTMP = JSON.parse(JSON.stringify(row))
                        rowTMP.id = newIndex
                        newContainer.push(rowTMP)
                    } else if (rowM.id !== row.id) {
                        newIndex += 1
                        rowTMP = JSON.parse(JSON.stringify(row))
                        rowTMP.id = newIndex
                        newContainer.push(rowTMP)
                    }
                })
                this.selectedExam.format_vue.rowContainer = newContainer
            }
        },
        downMove(rowM) {
            if (rowM.id !== this.selectedExam.format_vue.rowContainer.length) {
                const newContainer = []
                let newIndex = 0
                let rowTMP = {}
                this.selectedExam.format_vue.rowContainer.forEach((row) => {
                    if (rowM.id + 1 === row.id) { 
                        console.log('downMove', row.id)
                        newIndex += 1
                        rowTMP = JSON.parse(JSON.stringify(row))
                        rowTMP.id = newIndex
                        newContainer.push(rowTMP)
                        newIndex += 1
                        rowTMP = JSON.parse(JSON.stringify(rowM))
                        rowTMP.id = newIndex
                        newContainer.push(rowTMP)
                    } else if (rowM.id !== row.id) {
                        newIndex += 1
                        rowTMP = JSON.parse(JSON.stringify(row))
                        rowTMP.id = newIndex
                        newContainer.push(rowTMP)
                    }
                })
                this.selectedExam.format_vue.rowContainer = newContainer
            }
        },
        cloneActive() {
            if (this.selectedRow) {
                const newRow = JSON.parse(JSON.stringify(this.selectedRow))
                if (this.selectedRow.id === this.selectedExam.format_vue.rowContainer.length) {
                    this.rowId += 1
                    newRow.id = this.rowId
                    this.selectedExam.format_vue.rowCount += 1
                    this.selectedExam.format_vue.rowContainer.push(newRow)
                    this.closeSetting()
                } else {
                    const newContainer = []
                    let newIndex = 0
                    let rowTMP = {}
                    this.selectedExam.format_vue.rowContainer.forEach((row) => {
                        if (newRow.id === row.id) {
                            newIndex += 1
                            rowTMP = JSON.parse(JSON.stringify(row))
                            rowTMP.id = newIndex
                            newContainer.push(rowTMP)
                            newIndex += 1
                            rowTMP = JSON.parse(JSON.stringify(newRow))
                            rowTMP.id = newIndex
                            newContainer.push(rowTMP)
                        } else {
                            newIndex += 1
                            rowTMP = JSON.parse(JSON.stringify(row))
                            rowTMP.id = newIndex
                            newContainer.push(rowTMP)
                        }
                    })
                    this.selectedExam.format_vue.rowContainer = newContainer
                }
            }
        },
        deleteActive() {
            if (this.selectedRow) {
                const index = this.getIndice(this.selectedRow.id)
                if (index !== -1) this.selectedExam.format_vue.rowContainer.splice(index, 1)
            }
            this.closeSetting()
        },
        getIndice(Id) {
            var index = -1;
            this.selectedExam.format_vue.rowContainer.filter((item, i) => {
                if (item.id === Id) {
                    index = i
                }
            })
            return index
        },
        activoRow() {
            this.activeRow = true
            this.activeCol = false
            this.activeRowClass = true
        },
        async handleDrop(row, data) {
            row.hover = false
            const index= this.selectedExam.format_vue.rowContainer.findIndex(
                (element) => element === row
            )
            const newRow = await this.newItemRow(data)
            console.log('newRow: ', newRow)
            if (index + 1 === this.selectedExam.format_vue.rowContainer.length) {
                this.selectedExam.format_vue.rowContainer.push(newRow)
            } else {
                const newRows = []
                this.selectedExam.format_vue.rowContainer.forEach((rowI, i) => {
                    newRows.push(rowI)
                    if (index === i) {
                        newRows.push(newRow)
                    }
                })
                this.selectedExam.format_vue.rowContainer = newRows
            }
            this.selectedExam.format_vue.rowCount += 1
            // this.selectedExam.format_vue.rowContainer[index + 1] = newRow
            console.log('modificado: ', this.selectedExam.format_vue)
            this.changesMade = true
        },
        newItemRow(row) {
            const rowTMP = JSON.parse(JSON.stringify(row))
            console.log('rowTMP: ', rowTMP)
            this.rowId += 1
            const newRow = {
                id: this.rowId,
                active: false,
                hover: false,
                style: {
                    paddingTop: '0',
                    paddingRight: '0',
                    paddingBottom: '0',
                    paddingLeft: '0',
                },
                content: {
                    cols: rowTMP.cols,
                    stageColumns: rowTMP.stageColumns,
                },
            }
            if (rowTMP.antibiograma) {
                newRow.antibiograma = true
            }
            return newRow
        },
        changeRowSetting(row) {
            if (this.selectedContent) {
                this.selectedContent.active = false
            }
            console.log('row inicio: ', row)
            this.closeSetting()
            this.selectedRow = row
            this.selectedCol = null
            this.rowSetting = true
            this.keyRowSetting += 1
            this.rightDrawerSetting = true
            this.labelHead = 'Configuración de fila'
            this.clearCamposActive()
            this.activeSelectedRow[row.id] = true
        },
        changeType() {
            if (this.selectedContent.type === 'variable') {
                this.variableId += 1
                this.selectedContent.value = `{{variable_${this.variableId}}}`
                this.selectedContent.text = `<p>{{variable_${this.variableId}}}</p>`
                this.selectedContent.numeric = true
                this.selectedContent.allowDecimal = false
                this.selectedContent.decimalLimit = 0
            } else {
                this.selectedContent.value = `Coloque el texto`
                this.selectedContent.text = `<p>Coloque el texto</p>`
                delete this.selectedContent['numeric']
                delete this.selectedContent['allowDecimal']
                delete this.selectedContent['decimalLimit']
            }
        },
    },
}
</script>
<style scoped>
.all-screnn {
    width: calc(100vw - 402px);
    height: calc(100vh - 128px);
    position: relative;
    overflow-y: auto;
    display: flex;
    justify-content: center;
}
.right-column {
    box-shadow: -11px 1px 19px -11px rgba(30, 30, 60, 0.25);
    height: calc(100vh - 128px);
    z-index: 10;
    overflow: hidden;
    padding: 10px;
}
.contenido {
    height: calc(100vh - 148px);
    max-height: calc(100vh - 148px);
    overflow: auto;
}
.row-title {
    position: absolute;
    top: 1px;
    left: 3px;
    color: var(--v-gray300-base);
    font-size: 0.75rem !important;
}
.new_row {
    position: relative;
    background: rgba(222, 242, 250, 0.85);
    border-radius: 3px;
    display: flex;
    min-height: 75px;
    margin-bottom: 10px;
    padding: 18px 15px 15px 15px;
    border: 1px solid #dddddd;
    -webkit-box-shadow: 0 1px 1px rgb(0 0 0 / 5%);
    box-shadow: 0 1px 1px rgb(0 0 0 / 5%);
    -webkit-transsition-duration: 0.15s;
    -o-transition-duration: 0.15s;
    transition-duration: 0.15s;
    -webkit-transition-property: -webkit-box-shadow;
    transition-property: box-shadow;
    -o-transition-property: box-shadow;
    transition-property:  box-shadow;
    transition-property: box-shadow, -webkit-box-shadow;
}
.new_row div {
    background: var(--v-lightcyan-base);
    margin: 0 5px;
    outline: 1px dashed var(--v-primary-base);
    border-radius: 3px;
}
.new_row:hover {
    cursor: -webkit-grad;
    cursor: grab;
    border: 1px solid var(--v-primary-base);
    -webkit-box-shadow: 0 0 14px -2px rgba(0, 0, 0, 0.61);
    box-shadow: 0 0 14px -2px rgba(0, 0, 0, 0.61);
}
.stageRow_row {
    border: 2px solid var(--v-gray-base);
    background-image: none;
    background-position: left top;
    background-repeat: no-repeat;
    text-align: center;
    outline: none;
    position: relative;
    padding-left: 15px;
    padding-right: 15px;
    -webkit-tap-highlight-color: rgba(0, 0, 0, 0);
    width: 100%;
    min-width: 100%;
}
.active-row {
    border: 1px dashed var(--v-gray300-base);
}
.drop {
    height: 5px;
    z-index: 100;
    position: relative;
}
.drop div {
    background-color: var(--v-primary-base);
    color: white;
    border-radius: 15px;
    padding: 2px 5px;
    display: none;
    width: 100px;
    position: absolute;
    top: -10px;
    left: calc((100% - 102px) / 2);
    font-size: 0.7rem !important;
    font-weight: 400;
}
.drop.over {
    background-color: var(--v-primary-base);
    height: 20px;
}
.drop.over div {
    display: block;
}
.stageInner {
    padding: 20px;
    display: inline-block;
    min-width: 100%;
}
</style>