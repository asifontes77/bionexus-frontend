<template>
    <div>
        <v-card v-if="examItem.length!==0" elevation="2" style="height: 100%; width: 100%">
            <v-card-title class="sidebar">
                <div class="d-flex justify-space-between" style="width: 100%">
                    <div>DESCRIPCION</div>
                    <div>VALOR DE REFERENCIA</div>
                </div>
            </v-card-title>
            <v-card-text v-if="examItem.length!==0" class="item-height mt-2" :class="closeCard ? 'close-item-height' : ''">
                <div v-for="(exam, index) in examItem" :key="index">
                    <div v-html="exam.result"></div>
                </div>
            </v-card-text>
        </v-card>
    </div>
</template>

<script>
import pacientsMixin from '@/mixins/services/pacientsMixin'

export default {
    name: 'ExamViewList',
    mixins: [pacientsMixin],
    props: {
        exam: {
            type: Array,
            default: () => [],
        },
        closeCard: {
            type: Boolean,
            default: false,
        },
    },
    data() {
        return {
            examItem: [],
        }
    },
    async mounted() {
        await this.geExamNew()        
    },
    methods: {
        async geExamNew() {
            if (this.exam) {
                this.examItem = this.exam
            }
        },
    },
}
</script>
<style scoped>
.item-height {
    max-height: calc(100vh - 300px);
    min-height: calc(100vh - 300px);
    overflow-x: hidden;
    overflow-y: auto;
}
.close-item-height {    
    max-height: calc(100vh - 230px) !important;
    min-height: calc(100vh - 230px) !important;
}
</style>