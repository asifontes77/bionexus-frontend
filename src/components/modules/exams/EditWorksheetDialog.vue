<template>
  <div>
    <v-container>
        <div class="tamano">
            <vue-editor
                id="editor"
                v-model="selectedExam.work_sheet"
                :editor-toolbar="customToolbar"
            />
        </div>
    </v-container>
  </div>
</template>

<script>
import { VueEditor } from "vue2-editor"

export default {
    name: 'EditWorksheetDialog',
    components: { VueEditor },
    props: {
        selectedExam: {
            type: Object,
            default: () => {},
        },
    },
    data() {
        return {
            customToolbar: [
                [{ size: ["small", false, "large", "huge"] }],
                ["bold", "italic", "underline"],
                [
                    { align: "" },
                    { align: "center" },
                    { align: "right" },
                    { align: "justify" }
                ],
                [{ list: "ordered" }, { list: "bullet" }, { list: "check" }],
                [{ script: "sub" }, { script: "super" }],
                [{ indent: "-1" }, { indent: "+1" }],
                [{ color: [] }]
            ],
            editorOptions: {
                classes: {
                    'ql-font': true
                }
            },
        }
    },
    mounted() {
        const contenedor = document.getElementById('editor');
        if (contenedor) {
            const primerDivHijo = contenedor.querySelector('div:first-child');
            if (primerDivHijo) {
                primerDivHijo.classList.add('ql-font');
            }
        }
    }
}
</script>
<style scoped>
@import '~vue2-editor/dist/vue2-editor.css';
.quillWrapper {
    height: calc(100vh - 203px);
    min-height: calc(100vh - 203px);
}
.ql-font{
    font-family: 'Courier New' !important;
}
.tamano {
    width: 965px;
    margin-left: auto;
    margin-right: auto;
}
</style>
