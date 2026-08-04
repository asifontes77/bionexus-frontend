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
                <div class="d-flex justify-center align-center mb-2 p-0 font-weight-black">
                    HEMATOLOGIA COMPLETA
                </div>
                <div class="d-flex align-center mb-2 p-0">
                    <div class="p-0" style="width: 41.66%; background-color: white">
                        LEUCOCITOS
                    </div>
                    <div class="p-0" style="width: 16.66%; background-color: white">
                        <v-text-field
                            v-model="content.exam1"
                            v-mask="currencyMaskd"
                            outlined
                            dense
                            hide-details
                            class="mr-1"
                        />
                    </div>
                    <div class="p-0" style="width: 16.663%; background-color: white">
                        <p>x10<sup>3</sup>/mm<sup>3</sup></p>
                    </div>
                    <div class="p-0" style="width: 25.017%; background-color: white; text-align: center">
                        {{ vr.vr1 }}
                    </div>
                </div>
                <div class="d-flex align-center mb-2 p-0">
                    <div class="p-0" style="width: 41.66%; background-color: white">
                        HEMATIES
                    </div>
                    <div class="p-0" style="width: 16.66%; background-color: white">
                        <v-text-field
                            v-model="content.exam2"
                            v-mask="currencyMaskd"
                            outlined
                            dense
                            hide-details
                            class="mr-1"
                            @change="recalculateVcm()"
                        />
                    </div>
                    <div class="p-0" style="width: 16.663%; background-color: white">
                        <p>x10<sup>6</sup>/mm<sup>3</sup></p>
                    </div>
                    <div class="p-0" style="width: 25.017%; background-color: white; text-align: center">
                        {{ vr.vr2 }}
                    </div>
                </div>
                <div class="d-flex align-center mb-2 p-0">
                    <div class="p-0" style="width: 41.66%; background-color: white">
                        HEMOGLOBINA
                    </div>
                    <div class="p-0" style="width: 16.66%; background-color: white">
                        <v-text-field
                            v-model="content.exam3"
                            v-mask="currencyMaskd"
                            outlined
                            dense
                            hide-details
                            class="mr-1"
                            @change="recalculateVcm()"
                        />
                    </div>
                    <div class="p-0" style="width: 16.663%; background-color: white">
                        <p>g/dl</p>
                    </div>
                    <div class="p-0" style="width: 25.017%; background-color: white; text-align: center">
                        {{ vr.vr3 }}
                    </div>
                </div>
                <div class="d-flex align-center mb-2 p-0">
                    <div class="p-0" style="width: 41.66%; background-color: white">
                        HEMATOCRITO
                    </div>
                    <div class="p-0" style="width: 16.66%; background-color: white">
                        <v-text-field
                            v-model="content.exam4"
                            v-mask="currencyMaskd"
                            outlined
                            dense
                            hide-details
                            class="mr-1"
                            @change="recalculateVcm()"
                        />
                    </div>
                    <div class="p-0" style="width: 16.663%; background-color: white">
                        <p>%</p>
                    </div>
                    <div class="p-0" style="width: 25.017%; background-color: white; text-align: center">
                        {{ vr.vr4 }}
                    </div>
                </div>
                <div class="d-flex align-center mb-2 p-0">
                    <div class="p-0" style="width: 41.66%; background-color: white">
                        VCM
                    </div>
                    <div class="p-0" style="width: 16.66%; background-color: white">
                        <div class="style-formula">{{ content.exam5 }}</div>
                    </div>
                    <div class="p-0" style="width: 16.663%; background-color: white">
                        <p>fL</p>
                    </div>
                    <div class="p-0" style="width: 25.017%; background-color: white; text-align: center">
                        {{ vr.vr5 }}
                    </div>
                </div>
                <div class="d-flex align-center mb-2 p-0">
                    <div class="p-0" style="width: 41.66%; background-color: white">
                        CHCM
                    </div>
                    <div class="p-0" style="width: 16.66%; background-color: white">
                        <div class="style-formula">{{ content.exam6 }}</div>
                    </div>
                    <div class="p-0" style="width: 16.663%; background-color: white">
                        <p>%</p>
                    </div>
                    <div class="p-0" style="width: 25.017%; background-color: white; text-align: center">
                        {{ vr.vr6 }}
                    </div>
                </div>
                <div class="d-flex align-center mb-2 p-0">
                    <div class="p-0" style="width: 41.66%; background-color: white">
                        CONTAJE DE PLAQUETAS
                    </div>
                    <div class="p-0" style="width: 16.66%; background-color: white">
                        <v-text-field
                            v-model="content.exam7"
                            v-mask="currencyMask"
                            outlined
                            dense
                            hide-details
                            class="mr-1"
                        />
                    </div>
                    <div class="p-0" style="width: 16.663%; background-color: white">
                        <p>mm<sup>3</sup></p>
                    </div>
                    <div class="p-0" style="width: 25.017%; background-color: white; text-align: center">
                        {{ vr.vr7 }}
                    </div>
                </div>
                <div class="d-flex justify-center align-center mb-2 p-0 font-weight-black">
                    FORMULA LEUCOCITARIA (%)
                </div>
                <div class="d-flex align-center mb-2 p-0">
                    <div class="p-0" style="width: 33.333%; background-color: white">
                        Neutrófilos
                    </div>
                    <div class="p-0" style="width: 16.667%; background-color: white">
                        <v-text-field
                            v-model="content.FL1"
                            v-mask="currencyMask"
                            outlined
                            dense
                            hide-details
                            class="mr-1"
                        />
                    </div>
                    <div class="p-0" style="width: 33.333%; background-color: white">
                        Linfocitos
                    </div>
                    <div class="p-0" style="width: 16.667%; background-color: white">
                        <v-text-field
                            v-model="content.FL2"
                            v-mask="currencyMask"
                            outlined
                            dense
                            hide-details
                            class="mr-1"
                        />
                    </div>
                </div>
                <div class="d-flex align-center mb-2 p-0">
                    <div class="p-0" style="width: 33.333%; background-color: white">
                        Eosinófilos
                    </div>
                    <div class="p-0" style="width: 16.667%; background-color: white">
                        <v-text-field
                            v-model="content.FL3"
                            v-mask="currencyMask"
                            outlined
                            dense
                            hide-details
                            class="mr-1"
                        />
                    </div>
                    <div class="p-0" style="width: 33.333%; background-color: white">
                        Monocitos
                    </div>
                    <div class="p-0" style="width: 16.667%; background-color: white">
                        <v-text-field
                            v-model="content.FL4"
                            v-mask="currencyMask"
                            outlined
                            dense
                            hide-details
                            class="mr-1"
                        />
                    </div>
                </div>
                <div class="d-flex align-center mb-2 p-0">
                    <div class="p-0" style="width: 33.333%; background-color: white">
                        Basófilos
                    </div>
                    <div class="p-0" style="width: 16.667%; background-color: white">
                        <v-text-field
                            v-model="content.FL5"
                            v-mask="currencyMask"
                            outlined
                            dense
                            hide-details
                            class="mr-1"
                        />
                    </div>
                    <div class="p-0" style="width: 33.333%; background-color: white">
                        Mielocitos
                    </div>
                    <div class="p-0" style="width: 16.667%; background-color: white">
                        <v-text-field
                            v-model="content.FL6"
                            v-mask="currencyMask"
                            outlined
                            dense
                            hide-details
                            class="mr-1"
                        />
                    </div>
                </div>
                <div class="d-flex align-center mb-2 p-0">
                    <div class="p-0" style="width: 33.333%; background-color: white">
                        Cayados
                    </div>
                    <div class="p-0" style="width: 16.667%; background-color: white">
                        <v-text-field
                            v-model="content.FL7"
                            v-mask="currencyMask"
                            outlined
                            dense
                            hide-details
                            class="mr-1"
                        />
                    </div>
                    <div class="p-0" style="width: 33.333%; background-color: white">
                        Mt. Mielo
                    </div>
                    <div class="p-0" style="width: 16.667%; background-color: white">
                        <v-text-field
                            v-model="content.FL8"
                            v-mask="currencyMask"
                            outlined
                            dense
                            hide-details
                            class="mr-1"
                        />
                    </div>
                </div>
                <div class="d-flex align-center mb-2 p-0">
                    <div class="p-0" style="width: 33.333%; background-color: white">
                        <v-text-field
                            v-model="content.FLtext9"
                            outlined
                            dense
                            hide-details
                            class="mr-1"
                        />
                    </div>
                    <div class="p-0" style="width: 16.667%; background-color: white">
                        <v-text-field
                            v-model="content.FL9"
                            v-mask="currencyMask"
                            outlined
                            dense
                            hide-details
                            class="mr-1"
                        />
                    </div>
                    <div class="p-0" style="width: 33.333%; background-color: white">
                        <v-text-field
                            v-model="content.FLtext10"
                            outlined
                            dense
                            hide-details
                            class="mr-1"
                        />
                    </div>
                    <div class="p-0" style="width: 16.667%; background-color: white">
                        <v-text-field
                            v-model="content.FL10"
                            v-mask="currencyMask"
                            outlined
                            dense
                            hide-details
                            class="mr-1"
                        />
                    </div>
                </div>
                <div class="d-flex justify-center align-center mb-2 p-0 font-weight-black">
                    DESCRIPCION DEL FROTIS
                </div>
                <div class="d-flex align-center mb-2 p-0">
                    <div class="p-0" style="width: 25.001%; background-color: white">
                        SERIE ROJA
                    </div>
                    <div class="p-0" style="width: 74.999%; background-color: white">
                        <v-autocomplete
                            v-model="content.exam8"
                            :items="autocompleteList"
                            outlined
                            dense
                            hide-details
                            class="mr-1"
                        />
                    </div>
                </div>
                <div class="d-flex align-center mb-2 p-0">
                    <div class="p-0" style="width: 25.001%; background-color: white">
                        SERIE BLANCA
                    </div>
                    <div class="p-0" style="width: 74.999%; background-color: white">
                        <v-autocomplete
                            v-model="content.exam9"
                            :items="autocompleteList"
                            outlined
                            dense
                            hide-details
                            class="mr-1"
                        />
                    </div>
                </div>
                <div class="d-flex align-center mb-2 p-0">
                    <div class="p-0" style="width: 25.001%; background-color: white">
                        PLAQUETAS
                    </div>
                    <div class="p-0" style="width: 74.999%; background-color: white">
                        <v-autocomplete
                            v-model="content.exam10"
                            :items="autocompleteList"
                            outlined
                            dense
                            hide-details
                            class="mr-1"
                        />
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
import functionMixin from '@/mixins/util/functionMixin'
import createNumberMask from 'text-mask-addons/dist/createNumberMask'

export default {
    name: 'Exam125',
    mixins: [pacientsMixin, functionMixin],
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
            currencyMask: createNumberMask({
                prefix: "",
                suffix: '',
                includeThousandsSeparator: true,
                allowDecimal: false,
                allowNegative: false,
                thousandsSeparatorSymbol: ".",
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
                thousandsSeparatorSymbol: ".",
                decimalSymbol: ',',
            }),
            currencyMaskdd: createNumberMask({
                prefix: "",
                suffix: '',
                includeThousandsSeparator: true,
                allowDecimal: true,                
                integerLimit: 15,
                decimalLimit: 2,
                allowNegative: false,
                thousandsSeparatorSymbol: ".",
                decimalSymbol: ',',
            }),
            content: {
                exam1: '',
                exam2: '',
                exam3: '',
                exam4: '',
                exam5: '',
                exam6: '',
                exam7: '',
                FL1: '',
                FL2: '',
                FL3: '',
                FL4: '',
                FL5: '',
                FL6: '',
                FL7: '',
                FL8: '',
                FL9: '',
                FL10: '',
                FLtext9: '',
                FLtext10: '',
                exam8: '',
                exam9: '',
                exam10: '',
            },
            vr: {
                vr1: '( 5,0 - 10,0 )',
                vr2: '( 4,2 - 5,8 )',
                vr3: '( 12,0 - 16,0 )',
                vr4: '( 36,0 - 48,0 )',
                vr5: '( 82,0 - 92,0 )',
                vr6: '( 32,0 - 34,0 )',
                vr7: '( 150.000 - 450.000 )',
            },
            autocompleteList: ['Hipersecmentación Nuclear', 'Normocrónica', 'Morfologicamente Normales'],
        }
    },
    methods: {
        recalculateVcm() {
            if (this.content.exam2 !== '' && this.content.exam4 !== '') {
                const hematies = parseFloat(this.content.exam2.replace(/\./g, '').replace(',', '.'))
                const hematocrito = parseFloat(this.content.exam4.replace(/\./g, '').replace(',', '.'))
                const vcm = ((hematocrito/(hematies/100000)*100)/1000000).toFixed(1)
                const vcmTxt = vcm.replace(".", ",")
                this.content.exam5 = vcmTxt
            }
            if (this.content.exam3 !== '' && this.content.exam4 !== '') {
                const hemoglobina = parseFloat(this.content.exam3.replace(/\./g, '').replace(',', '.'))
                const hematocrito = parseFloat(this.content.exam4.replace(/\./g, '').replace(',', '.'))
                const chcm = ((hemoglobina/hematocrito)*100).toFixed(1)
                const chcmTxt = chcm.replace(".", ",")
                this.content.exam6 = chcmTxt
            }
        },
        async toRegister() {
            var textHtml = `
<div style='display: flex; align-items: center; padding-top:0; padding-left:0; padding-right:0; padding-bottom:0; '>
	<div style='width:100%; border:0 solid white; text-align:center; padding-top:0; padding-left:0; padding-right:0; padding-bottom:0; background-color:white; '>
		<div>
			<strong>HEMATOLOGIA COMPLETA</strong>
		</div>
	</div>
</div>
<div style='display: flex; align-items: center; padding-top:0; padding-left:0; padding-right:0; padding-bottom:0; '>
    <div style='width:41.66%; border:0 solid white; text-align:left; padding-top:0; padding-left:0; padding-right:0; padding-bottom:0; background-color:white; '>
		<div>LEUCOCITOS</div>
	</div>
    <div style='width:16.66%; border:0 solid white; text-align:right; padding-top:0; padding-left:0; padding-right:0; padding-bottom:0; background-color:white; '>
		<div style='margin-right: 4px !important;'>${this.content.exam1}</div>
	</div>
    <div style='width:16.663%; border:0 solid white; text-align:left; padding-top:0; padding-left:0; padding-right:0; padding-bottom:0; background-color:white; '>
		<div>x10<sup>3</sup>/mm<sup>3</sup></div>
	</div>
	<div style='width:25.017000000000003%; border:0 solid white; text-align:center; padding-top:0; padding-left:0; padding-right:0; padding-bottom:0; background-color:white; '>
		<div>${this.vr.vr1}</div>
	</div>
</div>
<div style='display: flex; align-items: center; padding-top:0; padding-left:0; padding-right:0; padding-bottom:0; '>
	<div style='width:41.66%; border:0 solid white; text-align:left; padding-top:0; padding-left:0; padding-right:0; padding-bottom:0; background-color:white; '>
		<div>HEMATIES</div>
	</div>
	<div style='width:16.66%; border:0 solid white; text-align:right; padding-top:0; padding-left:0; padding-right:0; padding-bottom:0; background-color:white; '>
		<div style='margin-right: 4px !important;'>${this.content.exam2}</div>
	</div>
	<div style='width:16.663%; border:0 solid white; text-align:left; padding-top:0; padding-left:0; padding-right:0; padding-bottom:0; background-color:white; '>
		<div>x10<sup>6</sup>/mm<sup>3</sup></div>
	</div>
	<div style='width:25.017000000000003%; border:0 solid white; text-align:center; padding-top:0; padding-left:0; padding-right:0; padding-bottom:0; background-color:white; '>
		<div>${this.vr.vr2}</div>
	</div>
</div>
<div style='display: flex; align-items: center; padding-top:0; padding-left:0; padding-right:0; padding-bottom:0; '>
	<div style='width:41.66%; border:0 solid white; text-align:left; padding-top:0; padding-left:0; padding-right:0; padding-bottom:0; background-color:white; '>
		<div>HEMOGLOBINA</div>
	</div>
	<div style='width:16.66%; border:0 solid white; text-align:right; padding-top:0; padding-left:0; padding-right:0; padding-bottom:0; background-color:white; '>
		<div style='margin-right: 4px !important;'>${this.content.exam3}</div>
	</div>
	<div style='width:16.663%; border:0 solid white; text-align:left; padding-top:0; padding-left:0; padding-right:0; padding-bottom:0; background-color:white; '>
		<div>g/dl</div>
	</div>
	<div style='width:25.017000000000003%; border:0 solid white; text-align:center; padding-top:0; padding-left:0; padding-right:0; padding-bottom:0; background-color:white; '>
		<div>${this.vr.vr3}</div>
	</div>
</div>
<div style='display: flex; align-items: center; padding-top:0; padding-left:0; padding-right:0; padding-bottom:0; '>
	<div style='width:41.66%; border:0 solid white; text-align:left; padding-top:0; padding-left:0; padding-right:0; padding-bottom:0; background-color:white; '>
		<div>HEMATOCRITO</div>
	</div>
	<div style='width:16.66%; border:0 solid white; text-align:right; padding-top:0; padding-left:0; padding-right:0; padding-bottom:0; background-color:white; '>
		<div style='margin-right: 4px !important;'>${this.content.exam4}</div>
	</div>
	<div style='width:16.663%; border:0 solid white; text-align:left; padding-top:0; padding-left:0; padding-right:0; padding-bottom:0; background-color:white; '>
		<div>%</div>
	</div>
	<div style='width:25.017000000000003%; border:0 solid white; text-align:center; padding-top:0; padding-left:0; padding-right:0; padding-bottom:0; background-color:white; '>
		<div>${this.vr.vr4}</div>
	</div>
</div>
<div style='display: flex; align-items: center; padding-top:0; padding-left:0; padding-right:0; padding-bottom:0; '>
	<div style='width:41.66%; border:0 solid white; text-align:left; padding-top:0; padding-left:0; padding-right:0; padding-bottom:0; background-color:white; '>
		<div>VCM</div>
	</div>
	<div style='width:16.66%; border:0 solid white; text-align:right; padding-top:0; padding-left:0; padding-right:0; padding-bottom:0; background-color:white; '>
		<div style='margin-right: 4px !important;'>${this.content.exam5}</div>
	</div>
	<div style='width:16.663%; border:0 solid white; text-align:left; padding-top:0; padding-left:0; padding-right:0; padding-bottom:0; background-color:white; '>
		<div>fL</div>
	</div>
	<div style='width:25.017000000000003%; border:0 solid white; text-align:center; padding-top:0; padding-left:0; padding-right:0; padding-bottom:0; background-color:white; '>
		<div>${this.vr.vr5}</div>
	</div>
</div>
<div style='display: flex; align-items: center; padding-top:0; padding-left:0; padding-right:0; padding-bottom:0; '>
	<div style='width:41.66%; border:0 solid white; text-align:left; padding-top:0; padding-left:0; padding-right:0; padding-bottom:0; background-color:white; '>
		<div>CHCM</div>
	</div>
	<div style='width:16.66%; border:0 solid white; text-align:right; padding-top:0; padding-left:0; padding-right:0; padding-bottom:0; background-color:white; '>
		<div style='margin-right: 4px !important;'>${this.content.exam6}</div>
	</div>
	<div style='width:16.663%; border:0 solid white; text-align:left; padding-top:0; padding-left:0; padding-right:0; padding-bottom:0; background-color:white; '>
		<div>%</div>
	</div>
	<div style='width:25.017000000000003%; border:0 solid white; text-align:center; padding-top:0; padding-left:0; padding-right:0; padding-bottom:0; background-color:white; '>
		<div>${this.vr.vr6}</div>
	</div>
</div>
<div style='display: flex; align-items: center; padding-top:0; padding-left:0; padding-right:0; padding-bottom:0; '>
	<div style='width:41.66%; border:0 solid white; text-align:left; padding-top:0; padding-left:0; padding-right:0; padding-bottom:0; background-color:white; '>
		<div>CONTAJE DE PLAQUETAS</div>
	</div>
	<div style='width:16.66%; border:0 solid white; text-align:right; padding-top:0; padding-left:0; padding-right:0; padding-bottom:0; background-color:white; '>
		<div style='margin-right: 4px !important;'>${this.content.exam7}</div>
	</div>
	<div style='width:16.663%; border:0 solid white; text-align:left; padding-top:0; padding-left:0; padding-right:0; padding-bottom:0; background-color:white; '>
		<div>mm<sup>3</sup></div>
	</div>
	<div style='width:25.017000000000003%; border:0 solid white; text-align:center; padding-top:0; padding-left:0; padding-right:0; padding-bottom:0; background-color:white; '>
		<div>${this.vr.vr7}</div>
	</div>
</div>
<div style='display: flex; align-items: center; padding-top:0; padding-left:0; padding-right:0; padding-bottom:0; '>
	<div style='width:100%; border:0 solid white; text-align:center; padding-top:0; padding-left:0; padding-right:0; padding-bottom:0; background-color:white; '>
		<div><strong>FORMULA LEUCOCITARIA (%)</strong></div>
	</div>
</div>
<div style='display: flex; align-items: center; padding-top:0; padding-left:0; padding-right:0; padding-bottom:0; '>
	<div style='width:33.333%; border:0 solid white; text-align:left; padding-top:0; padding-left:0; padding-right:0; padding-bottom:0; background-color:white; '>
		<div>Neutrófilos</div>
	</div>
	<div style='width:16.667%; border:0 solid white; text-align:left; padding-top:0; padding-left:0; padding-right:0; padding-bottom:0; background-color:white; '>
		<div style='margin-right: 4px !important;'>${this.content.FL1!=='' ? this.content.FL1 : '--'}</div>
	</div>
	<div style='width:33.333%; border:0 solid white; text-align:left; padding-top:0; padding-left:0; padding-right:0; padding-bottom:0; background-color:white; '>
		<div>Linfocitos</div>
	</div>
	<div style='width:16.667%; border:0 solid white; text-align:left; padding-top:0; padding-left:0; padding-right:0; padding-bottom:0; background-color:white; '>
		<div style='margin-right: 4px !important;'>${this.content.FL2!=='' ? this.content.FL2 : '--'}</div>
	</div>
</div>
<div style='display: flex; align-items: center; padding-top:0; padding-left:0; padding-right:0; padding-bottom:0; '>
	<div style='width:33.333%; border:0 solid white; text-align:left; padding-top:0; padding-left:0; padding-right:0; padding-bottom:0; background-color:white; '>
		<div>Eosinófilos</div>
	</div>
	<div style='width:16.667%; border:0 solid white; text-align:left; padding-top:0; padding-left:0; padding-right:0; padding-bottom:0; background-color:white; '>
		<div style='margin-right: 4px !important;'>${this.content.FL3!=='' ? this.content.FL3 : '--'}</div>
	</div>
	<div style='width:33.333%; border:0 solid white; text-align:left; padding-top:0; padding-left:0; padding-right:0; padding-bottom:0; background-color:white; '>
		<div>Monocitos</div>
	</div>
	<div style='width:16.667%; border:0 solid white; text-align:left; padding-top:0; padding-left:0; padding-right:0; padding-bottom:0; background-color:white; '>
		<div style='margin-right: 4px !important;'>${this.content.FL4!=='' ? this.content.FL4 : '--'}</div>
	</div>
</div>
<div style='display: flex; align-items: center; padding-top:0; padding-left:0; padding-right:0; padding-bottom:0; '>
	<div style='width:33.333%; border:0 solid white; text-align:left; padding-top:0; padding-left:0; padding-right:0; padding-bottom:0; background-color:white; '>
		<div>Basófilos</div>
	</div>
	<div style='width:16.667%; border:0 solid white; text-align:left; padding-top:0; padding-left:0; padding-right:0; padding-bottom:0; background-color:white; '>
		<div style='margin-right: 4px !important;'>${this.content.FL5!=='' ? this.content.FL5 : '--'}</div>
	</div>
	<div style='width:33.333%; border:0 solid white; text-align:left; padding-top:0; padding-left:0; padding-right:0; padding-bottom:0; background-color:white; '>
		<div>Mielocitos</div>
	</div>
	<div style='width:16.667%; border:0 solid white; text-align:left; padding-top:0; padding-left:0; padding-right:0; padding-bottom:0; background-color:white; '>
		<div style='margin-right: 4px !important;'>${this.content.FL6!=='' ? this.content.FL6 : '--'}</div>
	</div>
</div>
<div style='display: flex; align-items: center; padding-top:0; padding-left:0; padding-right:0; padding-bottom:0; '>
	<div style='width:33.333%; border:0 solid white; text-align:left; padding-top:0; padding-left:0; padding-right:0; padding-bottom:0; background-color:white; '>
		<div>Cayados</div>
	</div>
	<div style='width:16.667%; border:0 solid white; text-align:left; padding-top:0; padding-left:0; padding-right:0; padding-bottom:0; background-color:white; '>
		<div style='margin-right: 4px !important;'>${this.content.FL7!=='' ? this.content.FL7 : '--'}</div>
	</div>
	<div style='width:33.333%; border:0 solid white; text-align:left; padding-top:0; padding-left:0; padding-right:0; padding-bottom:0; background-color:white; '>
		<div>Mt. Mielo</div>
	</div>
	<div style='width:16.667%; border:0 solid white; text-align:left; padding-top:0; padding-left:0; padding-right:0; padding-bottom:0; background-color:white; '>
		<div style='margin-right: 4px !important;'>${this.content.FL8!=='' ? this.content.FL8 : '--'}</div>
	</div>
</div>
<div style='display: flex; align-items: center; padding-top:0; padding-left:0; padding-right:0; padding-bottom:0; '>`
            if (this.content.FLtext9 !== '') {
                textHtml += `
                <div style='width:33.333%; border:0 solid white; text-align:left; padding-top:0; padding-left:0; padding-right:0; padding-bottom:0; background-color:white; '>
                    <div style='margin-right: 4px !important;'>${this.content.FLtext9}</div>
                </div>
                <div style='width:16.667%; border:0 solid white; text-align:left; padding-top:0; padding-left:0; padding-right:0; padding-bottom:0; background-color:white; '>
                    <div style='margin-right: 4px !important;'>${this.content.FL9!=='' ? this.content.FL9 : '--'}</div>
                </div>`
            }
            if (this.content.FLtext10 !== '') {
                textHtml += `
                <div style='width:33.333%; border:0 solid white; text-align:left; padding-top:0; padding-left:0; padding-right:0; padding-bottom:0; background-color:white; '>
                    <div style='margin-right: 4px !important;'>${this.content.FLtext10}</div>
                </div>
                <div style='width:16.667%; border:0 solid white; text-align:left; padding-top:0; padding-left:0; padding-right:0; padding-bottom:0; background-color:white; '>
                    <div style='margin-right: 4px !important;'>${this.content.FL10!=='' ? this.content.FL10 : '--'}</div>
                </div>`
            }
            textHtml += `
</div>
<div style='display: flex; align-items: center; padding-top:0; padding-left:0; padding-right:0; padding-bottom:0; '>
	<div style='width:100%; border:0 solid white; text-align:center; padding-top:0; padding-left:0; padding-right:0; padding-bottom:0; background-color:white; '>
		<div><strong>DESCRIPCION DEL FROTIS</strong></div>
	</div>
</div>
<div style='display: flex; align-items: center; padding-top:0; padding-left:0; padding-right:0; padding-bottom:0; '>
	<div style='width:25.001000000000005%; border:0 solid white; text-align:left; padding-top:0; padding-left:0; padding-right:0; padding-bottom:0; background-color:white; '>
		<div>SERIE ROJA</div>
	</div>
	<div style='width:74.999%; border:0 solid white; text-align:left; padding-top:0; padding-left:0; padding-right:0; padding-bottom:0; background-color:white; '>
		<div style='margin-right: 4px !important;'>${this.content.exam8}</div>
	</div>
</div>
<div style='display: flex; align-items: center; padding-top:0; padding-left:0; padding-right:0; padding-bottom:0; '>
	<div style='width:25.001000000000005%; border:0 solid white; text-align:left; padding-top:0; padding-left:0; padding-right:0; padding-bottom:0; background-color:white; '>
		<div>SERIE BLANCA</div>
	</div>
	<div style='width:74.999%; border:0 solid white; text-align:left; padding-top:0; padding-left:0; padding-right:0; padding-bottom:0; background-color:white; '>
		<div style='margin-right: 4px !important;'>${this.content.exam9}</div>
	</div>
</div>
<div style='display: flex; align-items: center; padding-top:0; padding-left:0; padding-right:0; padding-bottom:0; '>
	<div style='width:25.001000000000005%; border:0 solid white; text-align:left; padding-top:0; padding-left:0; padding-right:0; padding-bottom:0; background-color:white; '>
		<div>PLAQUETAS</div>
	</div>
	<div style='width:74.999%; border:0 solid white; text-align:left; padding-top:0; padding-left:0; padding-right:0; padding-bottom:0; background-color:white; '>
		<div style='margin-right: 4px !important;'>${this.content.exam10}</div>
	</div>
</div>`
            const envio = {
                status: 1,
                result: textHtml,
                size: 17,
                processed_id: localStorage.clientId,
            }
            const result = await this.setUpdateExam(this.exam.id, envio)
            if (result) {
                this.exam.status = 1
                this.exam.processed_id = localStorage.clientId
                this.exam.process_name = localStorage.username
                this.exam.result = textHtml
            }
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
    margin-right: 4px;
    border: 1px solid #9E9E9E;
    border-radius: 4px;
    align-items: flex-start;
    display: flex;
    align-items: center;
    flex: 1 1 auto;
    font-size: 16px;
    letter-spacing: normal;
    max-width: 100%;
    text-align: left;
    min-height: 40px;
    padding: 0 12px;
}
</style>
