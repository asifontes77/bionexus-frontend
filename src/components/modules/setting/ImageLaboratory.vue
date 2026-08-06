<template>
    <div v-if="dataLaboratory" class="d-flex">
        <v-card
            outlined
            height="200"
            width="200"
        >
            <v-card-text class="d-flex justify-center align-center">
                <v-img
                    :lazy-src="`${imgLab}`"
                    :max-height="dataLaboratory.max_height_logo"
                    :max-width="dataLaboratory.max_width_logo"
                    :src="`${imgLab}`"
                />
            </v-card-text>
        </v-card>
        <div class="ml-4" style="width: 500px">
            <v-slider
                v-model="dataLaboratory.max_height_logo"
                step="5"
                thumb-label
                ticks
                color="primary"
                class="mt-2"
                label="Max altura"
                max="200"
            >
                <template v-slot:append>
                    <div class="caption primary--text">
                        {{ dataLaboratory.max_height_logo }}
                    </div>
                </template>
            </v-slider>
            <v-slider
                v-model="dataLaboratory.max_width_logo"
                step="5"
                thumb-label
                ticks
                color="primary"
                class="mt-2"
                label="Max ancho"
                max="200"
            >
                <template v-slot:append>
                    <div class="caption primary--text">
                        {{ dataLaboratory.max_width_logo }}
                    </div>
                </template>
            </v-slider>
            <v-btn outlined color="primary" @click="changeImg()">
                <v-icon left>
                    mdi-circle-edit-outline
                </v-icon>
                Buscar imagen
            </v-btn>
        </div>
        <input ref="fileInput" class="d-none" type="file" @change="onFileChange" />
    </div>
</template>

<script>
import laboratoryMixin from '@/mixins/services/laboratoryMixin'
import { basePath } from '@/config';

export default {
    name: 'ImageLaboratory',
    mixins: [laboratoryMixin],
    props: {
        dataLaboratory: {
            type: Object,
            default: () => ({})
        },
    },
    data() {
        return {
            basePath,
            imgLab: 'null',            
            selectedFile: '',
        }
    },
    mounted() {
        this.imgLab = `${this.basePath}/images/` + JSON.parse(JSON.stringify(this.dataLaboratory.logo))
    },
    methods: {        
        changeImg() {
            this.$refs.fileInput.click()
            this.formData = new FormData();
            this.formData.append("file", this.selectedFile);
        },
        async onFileChange(e) {
            this.selectedFile = e.target.files[0];
            if (this.selectedFile) {
                const formData = new FormData()
                formData.append("file", this.selectedFile)
                const result = await this.sendImageFile(formData)
                if (result) {
                    
                    this.imgLab = `${this.basePath}/images/${result.logo}`
                }
            }
        },
    },
}
</script>
