<template>
    <div>
        <div class="pt-10 px-6">
            <div>Márgenes</div>
            <div class="d-flex mt-4">
                <increment-value 
                    :value="paddingLeft"
                    label="Izquierdo"
                    @increment-value="changeIncrement"
                />
                <increment-value
                    :value="paddingRight"
                    label="Derecha"
                    class="ml-4"
                    @increment-value="changeIncrement"
                />
            </div>
            <div class="d-flex mt-2">
                <increment-value
                    :value="paddingTop"
                    label="Arriba"
                    @increment-value="changeIncrement"
                />
                <increment-value
                    :value="paddingBottom"
                    label="Abajo"
                    class="ml-4"
                    @increment-value="changeIncrement"
                />
            </div>
            <v-switch
                v-model="row.antibiograma"
                label="Tiene antibiograma"
            />
        </div>
        <v-divider class="my-4"></v-divider>
        <div v-if="!row.antibiograma">
            <div class="px-6">
                <div>Columnas</div>
            </div>
            <div
                class="mt-6 px-2 d-flex justify-space-between"
                style="flex-grow: 1; width: 100%"
            >
                <div
                    v-for="(col, index) in row.content.stageColumns"
                    :key="col.id"
                    class="d-flex flex-column"
                    :style="index < row.content.stageColumns.length - 1 ? `width: calc(${col.style.width} + 24px)` : `width: ${col.style.width}`"
                >
                    <div class="d-flex">
                        <div
                            class="panelWrapper"
                            :class="{'active': col.activeColumn}"
                            @click="activeCol(col)"
                        >
                            <div>{{ index + 1 }}</div>
                        </div>
                        <div class="divider-pre">
                            <div v-if="index < row.content.stageColumns.length - 1" class="divider">
                                <v-icon small color="gray300" class="icon" @click="moveCol(col, index,'left')">mdi-chevron-left</v-icon>
                                <v-icon small color="gray300" class="icon" @click="moveCol(col, index,'right')">mdi-chevron-right</v-icon>
                            </div>
                        </div>
                    </div>
                    <div class="text-center" style="width: calc(100% - 24px)">
                        <v-icon :color="col.activeColumn ? 'gray300' : 'background'">mdi-triangle</v-icon>
                    </div>
                    <div style="margin-top: -3px; border-bottom: 2px solid var(--v-gray300-base)"></div>
                </div>
            </div>
            <div v-if="selectCol" class="px-6">
                <div style="width: 100%; text-align: right">
                    <v-btn text color="gray300" class="caption py-0" @click="deleteCol()">
                        Eliminar
                    </v-btn>
                </div>
                <div>Márgenes</div>
                <div class="d-flex mt-4">
                    <increment-value 
                        :value="paddingLeftCol"
                        label="Izquierdo"
                        @increment-value="changeIncrementCol"
                    />
                    <increment-value
                        :value="paddingRightCol"
                        label="Derecha"
                        class="ml-4"
                        @increment-value="changeIncrementCol"
                    />
                </div>
                <div class="d-flex mt-2">
                    <increment-value
                        :value="paddingTopCol"
                        label="Arriba"
                        @increment-value="changeIncrementCol"
                    />
                    <increment-value
                        :value="paddingBottomCol"
                        label="Abajo"
                        class="ml-4"
                        @increment-value="changeIncrementCol"
                    />
                </div>
                <div class="d-flex justify-space-between align-center mt-6">
                    <div>Ordenar: </div>
                    <div class="d-flex">
                        <v-btn-toggle
                            v-model="toggleOrder"
                            mandatory
                            dense
                        >
                            <v-btn>
                                <v-icon>mdi-format-align-left</v-icon>
                            </v-btn>
                            <v-btn>
                                <v-icon>mdi-format-align-center</v-icon>
                            </v-btn>
                            <v-btn>
                                <v-icon>mdi-format-align-right</v-icon>
                            </v-btn>
                        </v-btn-toggle>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
import IncrementValue from '@/components/modules/exams/setting/IncrementValue.vue'
export default {
  components: { IncrementValue },
    name: 'RowComponentSetting',
    props: {
        row: {
            type: Object,
            default: () => ({})
        },
    },
    data() {
        return {
            paddingLeft: 0,
            paddingRight: 0,
            paddingBottom: 0,
            paddingTop: 0,
            paddingLeftCol: 0,
            paddingRightCol: 0,
            paddingBottomCol: 0,
            paddingTopCol: 0,
            selectCol: null,
            toggleOrder: 0,
            antibiograma: false,
        }
    },
    async mounted() {
        this.paddingTop = parseInt(this.row.style.paddingTop.replace('px', ''))
        this.paddingRight = parseInt(this.row.style.paddingRight.replace('px', ''))
        this.paddingBottom = parseInt(this.row.style.paddingBottom.replace('px', ''))
        this.paddingLeft = parseInt(this.row.style.paddingLeft.replace('px', ''))
    },
    watch: {
        toggleOrder: {
            handler(value) {
                if (value === 0 ) this.selectCol.style.textAlign = 'left'
                if (value === 1) this.selectCol.style.textAlign = 'center'
                if (value === 2) this.selectCol.style.textAlign = 'right'
            },
        },
    },
    methods: {
        changeIncrementCol(type, label) {
            if (type === 'menos') {
                if (label === 'Izquierdo') {
                    this.paddingLeftCol -= 1
                }
                if (label === 'Derecha') {
                    this.paddingRightCol -= 1
                }
                if (label === 'Arriba') {
                    this.paddingTopCol -= 1
                }
                if (label === 'Abajo') {
                    this.paddingBottomCol -= 1
                }
            }
            if (type === 'mas') {
                if (label === 'Izquierdo') {
                    this.paddingLeftCol += 1
                }
                if (label === 'Derecha') {
                    this.paddingRighCol += 1
                }
                if (label === 'Arriba') {
                    this.paddingTopCol += 1
                }
                if (label === 'Abajo') {
                    this.paddingBottomCol += 1
                }
            }
            this.selectCol.style.paddingTop = this.paddingTopCol + 'px'
            this.selectCol.style.paddingRight = this.paddingRightCol + 'px'
            this.selectCol.style.paddingBottom = this.paddingBottomCol + 'px'
            this.selectCol.style.paddingLeft = this.paddingLeftCol + 'px'
        },
        changeIncrement(type, label) {
            if (type === 'menos') {
                if (label === 'Izquierdo') {
                    this.paddingLeft -= 1
                }
                if (label === 'Derecha') {
                    this.paddingRight -= 1
                }
                if (label === 'Arriba') {
                    this.paddingTop -= 1
                }
                if (label === 'Abajo') {
                    this.paddingBottom -= 1
                }
            }
            if (type === 'mas') {
                if (label === 'Izquierdo') {
                    this.paddingLeft += 1
                }
                if (label === 'Derecha') {
                    this.paddingRight += 1
                }
                if (label === 'Arriba') {
                    this.paddingTop += 1
                }
                if (label === 'Abajo') {
                    this.paddingBottom += 1
                }
            }
            this.row.style.paddingTop = this.paddingTop + 'px'
            this.row.style.paddingRight = this.paddingRight + 'px'
            this.row.style.paddingBottom = this.paddingBottom + 'px'
            this.row.style.paddingLeft = this.paddingLeft + 'px'
        },
        activeCol(col) {
            this.disableAll()
            col.activeColumn = true
            this.selectCol = col
            this.paddingTopCol = parseInt(this.selectCol.style.paddingTop.replace('px',''))
            this.paddingRightCol = parseInt(this.selectCol.style.paddingRight.replace('px',''))
            this.paddingBottomCol = parseInt(this.selectCol.style.paddingBottom.replace('px', ''))
            this.paddingLeftCol = parseInt(this.selectCol.style.paddingLeft.replace('px',''))
            if (this.selectCol.style.textAlign === 'left') this.toggleOrder = 0
            if (this.selectCol.style.textAlign === 'center') this.toggleOrder = 1
            if (this.selectCol.style.textAlign === 'right') this.toggleOrder = 2
        },
        disableAll() {
            this.row.content.stageColumns.forEach((col) => {
                col.activeColumn = false
            })
        },
        deleteCol() {
            if (this.row.content.stageColumns.length > 1) {
                let index = 0
                const id = this.selectCol.id
                this.row.content.stageColumns.forEach((col, ii) => {
                    if (col.id === id) {
                        index = ii
                    }
                })
                const colNew = Number(this.selectCol.col)
                const widthNew = parseFloat(this.selectCol.style.width.replace('%', ''))
                if (index !== 0) {
                    this.row.content.stageColumns[index -1].col = parseInt(this.row.content.stageColumns[index -1].col) + colNew
                    this.row.content.stageColumns[index -1].style.width = (parseFloat(this.row.content.stageColumns[index -1].style.width.replace('%', '')) + widthNew).toString() + '%'
                } else {
                    this.row.content.stageColumns[index +1].col = parseInt(this.row.content.stageColumns[index +1].col) + colNew
                    this.row.content.stageColumns[index +1].style.width = (parseFloat(this.row.content.stageColumns[index +1].style.width.replace('%', '')) + widthNew).toString() + '%'
                }
                this.row.content.stageColumns.splice(index, 1);
            }
        },
        moveCol(col, index, type) {
            const wCol = 8.333
            if (type === 'left') {
                if (col.col !== '1') {
                    col.col = (parseInt(col.col) - 1).toString()
                    col.style.width = (parseFloat(col.style.width.replace('%', '')) - wCol).toString() + '%'
                    const colR = this.row.content.stageColumns[index + 1]
                    colR.col = (parseInt(colR.col) + 1).toString()
                    colR.style.width = (parseFloat(colR.style.width.replace('%', '')) + wCol).toString() + '%'
                }
            } else {
                if (col.col !== '12') {
                    col.col = (parseInt(col.col) + 1).toString()
                    col.style.width = (parseFloat(col.style.width.replace('%', '')) + wCol).toString() + '%'
                    const colR = this.row.content.stageColumns[index + 1]
                    colR.col = (parseInt(colR.col) - 1).toString()
                    colR.style.width = (parseFloat(colR.style.width.replace('%', '')) - wCol).toString() + '%'

                }
            }
        },
    },
}
</script>
<style scoped>
.panelWrapper {
    flex-grow: 1;
    flex-shrink: 1;
    border-radius: 5px;
    display: flex;
    position: relative;
    border: 2px solid var(--v-gray300-base);
}
.panelWrapper div {
    background-color: white;
    cursor: pointer;
    flex-grow: 1;
    text-align: center;
    line-height: 60px;
    border-radius: 4px;
}
.panelWrapper:hover, .active {
    border: 2px solid var(--v-primary-base);
}
.panelWrapper:hover div, .panelWrapper.active div {
    background-color: rgba(233, 216, 166, 0.2);
}
.divider-pre {
    display: flex;
    align-items: center;
}
.divider {
    width: 16px;
    min-width: 16px;
    max-width: 16px;
    height: 16px;
    min-height: 16px;
    display: flex;
    justify-content: center;
}
.divider .icon {
    width: 8px;
    cursor: pointer;
}
.divider .icon:hover {
    color: black !important;
}
</style>
