<template>
  <div>
    <exam-edit v-if="global === 0" :exam="exam" :close-card="closeCard" />
    <exam-125 v-else-if="global === 125" :exam="exam" :close-card="closeCard" />
    <exam-122 v-else-if="global === 122" :exam="exam" :close-card="closeCard" />
  </div>
</template>

<script>
import ExamEdit from '@/components/modules/history/ExamEdit.vue'
import Exam125 from '@/components/modules/history/exams/Exam125.vue'
import Exam122 from '@/components/modules/history/exams/Exam122.vue'
import examsListMixin from '@/mixins/services/examsListMixin'

export default {
    name: 'ExamGlobal',
    components: { ExamEdit, Exam125, Exam122 },
    mixins: [examsListMixin],
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
            global: 0,
        }
    },
    async mounted() {
        await this.getTipo() 
    },
    methods: {
        async getTipo() {
            const result = await this.getExamById(this.exam.examlistsId)
            if (this.exam.examlistsId === 125 && result.format_vue === null) this.global = 125
            if (this.exam.examlistsId === 122 && result.format_vue === null) this.global = 122
        },
    },
}
</script>
