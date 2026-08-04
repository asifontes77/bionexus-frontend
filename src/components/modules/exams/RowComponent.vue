<template>
    <div style="position:relative">
        <div class="hover-row" :class="{ 'row-active': row.active }">
            <div class="overlay">
                <div class="btn-arrow">
                    <v-icon 
                        small
                        color="white"
                        class="arrow-up px-2"
                        @click="$emit('up-move', row)"
                    >
                        mdi-arrow-up-bold
                    </v-icon>
                </div>
                <div class="btn-arrow">
                    <v-icon 
                        small
                        color="white"
                        class="arrow-down px-2"
                        @click="$emit('down-move', row)"
                    >
                        mdi-arrow-down-bold
                    </v-icon>
                </div>
            </div>
            <div class="btn-setting">
                <v-icon color="white" @click="$emit('change-row-setting', row)">
                    mdi-cog-outline
                </v-icon>
            </div>
        </div>
        <div>
            <div v-if="row.antibiograma" style="background: transparent; padding: 5px 10px">
                <div :style="row.style">
                    <div class="antibiograma-style">
                        <p>Módulo antibiograma</p>
                    </div>
                </div>
            </div>
            <div v-else class="row-content">
                <div
                    v-for="(col, indexC) in row.content.stageColumns"
                    :key="indexC"
                    :style="col.style"
                    :class="{ 'active-row' : activeRowClass }"
                >
                    <div
                        v-for="(contentItem, indexCc) in col.content"
                        :key="indexCc"
                        style="position: relative; padding-left: 2px"
                    >
                        <col-content
                            :item-content="contentItem"
                            :index-col="indexCc"
                            :index-content="indexCc"
                            @content-active="contentSelect"
                        />
                    </div>
                    <drop
                        v-show="activeRow"
                        class="drop-col"
                        :class="{ 'over': col.over }"
                        @drop="$emit('handle-col-drop', row, col, ...arguments)"
                        @dragover="col.over = true"
                        @dragleave="col.over = false"
                        @dragend="$emit('col-drag-end')"
                    >
                        <div>Arrástralo aquí</div>
                    </drop>
                </div>
            </div>
            
        </div>
        <ul class="stageRow-actions pl-0" :style="row.active ? 'display:inline-block' : ''">
            <li>
                <v-icon
                    color="white"
                    style="vertical-align: middle"
                    @click="$emit('delete-row', row)"
                >
                    mdi-trash-can-outline
                </v-icon>
            </li>
            <li>
                <v-icon
                    color="white"
                    style="vertical-align: middle"
                    @click="$emit('clone-row', row)"
                >
                    mdi-text-box-multiple-outline
                </v-icon>
            </li>
        </ul>
    </div>
</template>

<script>
import { Drop } from 'vue-drag-drop'
import ColContent from '@/components/modules/exams/ColContent.vue'

export default {
    components: { drop: Drop, ColContent, },
    props: {
        row: {
            type: Object,
            default: () => ({})
        },
        activeRow: {
            type: Boolean,
            default: false,
        },
        activeRowClass: {
            type: Boolean,
            default: false,
        },
    },
    data() {
        return {
            overlay: false,
        }
    },
    methods: {
        changeCapital(text) {
            let txtReturn = ''
            for (let i = 0; i < text.length; i += 1) {
                const letra = text.charAt(i)
                txtReturn +=
                    letra.toUpperCase() === letra ? `-${letra.toLowerCase()}` : letra
            }
            return txtReturn
        },
        contentSelect(item) {
            this.$emit('content-active', item)
        },
    },
}
</script>
<style scoped>
.hover-row {
    position: absolute;
    width: 100%;
    height: 100%;
    top: 0;
    left: 0;
}
.overlay {
    display: none;
    position: absolute;
    left: 0;
}
.hover-row:hover {
    border: 2px solid var(--v-primary-base);
    background-color: rgba(230, 224, 233, 0.5);
    z-index: 100;
}
.hover-row:hover .overlay {
    display: flex;
}
.btn-setting {
    display: none;
    position: absolute;
    background: var(--v-primary-base);
    top: 0;
    right: 0;
    padding: 0 8px;
    z-index: 4;
    line-height: 30px;
}
.btn-setting:hover {
    background-color: #5db7ca;
}
.hover-row:hover .btn-setting {
    display: inline-block;
}
.row-label {
    display: none;
    align-items: center;
    -ms-flex-align: center;
    justify-content: center;
    -ms-flex-pack: center;
    position: absolute;
    top: -22px;
    right: 15px;
    padding: 3px 5px;
    width: 75px;
    color: #fff;
    font-size: 10px;
    text-align: center;
    -o-text-overflow: allipsis;
    text-overflow: allipsis;
    white-space: nowrap;
    border-radius: 1px 1px 0 0;
    background-color: var(--v-primary-base);
    pointer-events: none;
    z-index: 8;
}
.icon-move .arrow-up {
    padding: 0 10px;
    background-color: var(--v-secondary-base);
}
.btn-arrow {
    background-color: var(--v-primary-base);
    line-height: 30px;
}
.btn-arrow:hover {
    background-color: var(--v-secondary-base);
}
.row-active {
    border: 2px solid var(--v-primary-base);
    background-color: #e6e0e9 !important;
}
.row-content {
    position: relative;
    display: flex;
    align-items: center;
    background-color: white;
    width: 800px;
    margin-left: auto;
    margin-right: auto;
}
.presentation {
    height: 100%;
    position: relative;
    outline: none;
    z-index: 2;
    cursor: pointer;
}
.module-empty {
    text-align: center;
    background-color: var(--v-lightcyan-base);
    outline: 1px dashed var(--v-primary-base);
    outline-offset: -1px;
    min-height: 75px;
    word-break: break-word;
    position: relative;
    height: 100%;
    font-size: 13px;
    color: var(--v-primary-base);
    overflow: hidden;
    text-overflow: ellipsis;
    display: flex;
    flex-direction: column;
    justify-content: center;
}
.stageRow-actions {
    display: none;
    position: absolute;
    list-style: none;
    height: 30px;
    margin: 0;
    padding: 0;
    -webkit-box-shadow: 0 2px 6px rgb(0 0 0 / 30%);
    box-shadow: 0 2px 6px rgb(0 0 0 / 30%);
    background-color: var(--v-primary-base);
    right: 59px;
    top: 2px;
    z-index: 7;
}
.stageRow-actions li {
    display: inline-block;
    cursor: pointer;
    border-right: 1px solid #e8eaf6;
    background-color: var(--v-primary-base);
    padding: 0 8px;
    line-height: 30px;
}
.stageRow-actions li:hover {
    background-color: #5db7ca;
}
stageRow-actions li:last-child {
    border: none !important;
}
.drop-col {
    height: 8px;
    z-index: 100;
    position: relative;
    width: 100%;
}
.drop-col div {
    background-color: var(--v-primary-base);
    color: white;
    border-radius: 15px;
    padding: 2px 5px;
    margin-left: auto;
    margin-right: auto;
    width: 100px;
    display: none;
    position: absolute;
    top: -8px;
    left: calc(50% - 50px);
    font-size: 0.7rem !important;
    font-weight: 400;
}
.over {
    height: 8px;
}
.drop-col.over {
    background-color: var(--v-primary-base);
}
.drop-col.over div {
    display: block;
}
.active-row {
    border: 1px dashed var(--v-gray300-base) !important;
    margin-top: 8px;
}
.antibiograma-style {
    width: 800px;
    color: white;
    background-color: #6098A4;
    margin-left: auto;
    margin-right: auto;
    text-align: center;
    padding: 5px 10px;
}
</style>
