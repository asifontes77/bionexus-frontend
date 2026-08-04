<template>
  <div class="gradient-background">
    <v-container class="gradient-background-container" fluid style="position: relative;overflow-y: auto;">
      <div class="d-flex justify-space-between">
        <div class="text-h5 primary--text d-flex align-center">
          <v-card color="white" class="pa-2 mr-6">
            <v-img
                :lazy-src="`${basePath}/images/${imgLab}`"
                max-height="100"
                max-width="100"
                :src="`${basePath}/images/${imgLab}`"
            />
          </v-card>
          {{ laboratoryName }}
        </div>
        <div>
          <div v-if="dollarValue" class="d-flex align-center">
            <v-btn
              text
              color="primary"
              class="px-0 mr-2"
              style="min-width: 0;"
              @click="newDollar = !newDollar"
            >
              <v-icon>mdi-loupe</v-icon>
            </v-btn>
            <div class="caption secondary--text">
              <div>Valor del dolar ({{ dollarValue.date }})</div>
              <div>$ {{ formatNumber(dollarValue.value) }}</div>
            </div>
          </div>
        </div>
      </div>
      
      
      <div class="my-6" style="width: 100%;">
        <div class="row-grid" v-if="roleUser.length !==0" no-gutters>
          <div
            class="item-grid"
            v-for="(item, index) in items"
            :key="index"
          >
            <v-card
              color="cardhome"
              dark
              width="300"
              height="165"
              elevation="11"
              class="d-flex flex-column justify-space-between"
              :disabled="!(item.role.some(element => roleUser.includes(element)))"
            >
              <v-card-title class="text-h6">
                {{ item.title }}
              </v-card-title>
              <v-card-text class="d-flex align-center justify-space-between">
                <div>
                  <v-card-actions>
                    <v-btn
                      outlined
                      rounded
                      :disabled="!(item.role.some(element => roleUser.includes(element)))"                    
                      @click="$router.push(item.link)"
                      text
                    >
                      ir
                      <v-icon right>mdi-arrow-right-circle-outline</v-icon>
                    </v-btn>
                  </v-card-actions>
                </div>
                <div>
                  <v-icon dark x-large>
                    {{ item.icon }}
                  </v-icon>
                </div>
              </v-card-text>
            </v-card>
          </div>
        </div>
      </div>  
      <div class="mt-6">
        <div class="mt-6">
          <div class="text-h6">Total pacientes</div>
          <div class="d-flex">
            <div class="mr-4">
              <div class="text-h5">{{ totalMes }}</div>
              <div class="caption">En el mes</div>
            </div>
            <div class="mr-4">
              <div class="text-h5">{{ totalDia }}</div>
              <div class="caption">En el día</div>
            </div>
          </div>
        </div>
      </div>
      <div class="mt-6">
        <div class="row-group">
          <div
              v-for="item in groupHT"
              :key="item.id"
              class="item-group"
            >
            <v-card
              elevation="2">
              <div class="d-flex justify-space-between align-center">
                <div>
                  <v-card-title>{{ item.description }}</v-card-title>
                  <v-card-text>
                    <div class="primary--text">
                      <v-icon small left color="primary" >mdi-flask-empty-outline</v-icon>
                      Total exámenes: <strong>{{ item.total }}</strong></div>
                    <div class="primary--text">
                      <v-icon small left color="primary" >mdi-flask-plus-outline</v-icon>
                      Total registrados: <strong>{{ item.total_recorded }}</strong></div>
                  </v-card-text>
                </div>
                <div>
                  <v-card-text>
                    <v-progress-circular
                      :size="50"
                      :value="item.total !== 0 ? Math.round(item.total_recorded * 100 / item.total, 10) : 0"
                      color="deep-orange lighten-2"
                    >
                      {{ item.total !== 0 ? Math.round(item.total_recorded * 100 / item.total, 10) : 0 }}%
                    </v-progress-circular>
                  </v-card-text>
                </div>
              </div>
            </v-card>
          </div>
        </div>
      </div>
    </v-container>    
    <new-dollar-dialog 
      v-model="newDollar"
      @set-newdolar="activeNewDollar"
    />
  </div>
</template>
  
  <script>
  import pacientsMixin from '@/mixins/services/pacientsMixin'
  import groupHTMixin from '@/mixins/services/groupHTMixin'
  import loginMixin from '@/mixins/services/loginMixin'
  import laboratoryMixin from '@/mixins/services/laboratoryMixin'
  import waypayMixin from '@/mixins/services/waypayMixin'
  import functionMixin from '@/mixins/util/functionMixin'
  import NewDollarDialog from '@/components/modules/admission/NewDollarDialog.vue'
  import { basePath } from '@/config';

  export default {
    name: 'Home',
    components: {NewDollarDialog},
    mixins: [
        pacientsMixin,
        groupHTMixin,
        loginMixin,
        laboratoryMixin,
        waypayMixin,
        functionMixin,
      ],
    data() {
      return {
        basePath,
        desde: this.getFirstDayOfMonth(),
        hasta: this.getLastDayOfMonth(),
        actual: this.getCurrentDate(),
        laboratoryName: '',
        imgLab: null,
        totalMes: 0,
        totalDia: 0,
        groupHT: [],
        intervalId: null,
        value: 0,
        interval: {},
        roleUser: [],
        dollarValue: null,
        newDollar: false,
        items: [
          {
            title: 'Historia',
            icon: 'mdi-clipboard-text-clock-outline',
            link: { name: 'PatientHistory' },
            role: ['user', 'admin']
          },
          {
            title: 'Ingreso de pacientes',
            icon: 'mdi-account-plus',
            link: { name: 'PatientAdmission' },
            role: ['user', 'admin'],
          },
          {
            title: 'Hoja de trabajo',
            icon: 'mdi-file-document-edit-outline',
            link: { name: 'Worksheet' },
            role: ['user', 'admin'],
          },
          {
            title: 'Aprobar resultados',
            icon: 'mdi-file-sign',
            link: { name: 'PatientApprove' },
            role: ['user', 'admin'],
          },
          {
            title: 'Entrega resultados por email',
            icon: 'mdi-send-check-outline',
            link: { name: 'ResultsByEmail' },
            role: ['user', 'admin'],
          }
        ],
      }
    },
    async created() {
      const id = localStorage.clientId
      const result = await this.getLoginToclientId(id)
      if (result) {
        this.roleUser = result.roles.split(',')
      }
      this.getLaboratory()
    },
    mounted() {
      this.updateTime()
      this.intervalId = setInterval(this.updateTime, 60000)
      this.getDollar()
    },
    beforeDestroy() {
      if (this.intervalId) {
        clearInterval(this.intervalId)
      }
    },
    methods: {
      async getLaboratory() {
        const result = await this.getLaboratorySetting()
        if (result) {
          this.laboratoryName = result.name
          this.imgLab = `${result.logo}`
        }
      },
      getFirstDayOfMonth() {
        const date = new Date()
        const year = date.getFullYear()
        const month = String(date.getMonth() + 1).padStart(2, '0')
        const day = '01'
        return `${year}-${month}-${day}`
      },
      getLastDayOfMonth() {
        const date = new Date()
        const year = date.getFullYear()
        const month = date.getMonth() + 1
        const lastDay = new Date(year, month, 0).getDate()
        const formattedMonth = String(month).padStart(2, '0')
        const formattedDay = String(lastDay).padStart(2, '0')
        return `${year}-${formattedMonth}-${formattedDay}`
      },
      getCurrentDate() {
        const date = new Date()
        const year = date.getFullYear()
        const month = String(date.getMonth() + 1).padStart(2, '0')
        const day = String(date.getDate()).padStart(2, '0')
        return `${year}-${month}-${day}`;
      },
      async calculateTotals(desde, hasta) {
        const newMonth = {
          firstDate: desde,
          lastDate: hasta,
        }
        const result = await this.getTotalPatientsMonth(newMonth)
        return result
      },
      async calculategroupHT() {
        this.groupHT= []
        var result = await this.getGroupHtListActive()
        if (result) {
          result = await result.map(item => ({
            ...item,
            grouphtitems: item.grouphtitems.map(group => ({
              examId: group.examId
            }))
          }))
        }
        await this.asyncForEach(result, async (group) => {
          const texto = []
          await this.asyncForEach(group.grouphtitems, async (exa) => {
            texto.push(parseInt(exa.examId, 10))
          })
          if (texto !== '') {
            const newQuery = {
              examIds: texto,
              firstDate: this.actual,
              lastDate: this.actual,
            }
            const resultEx = await this.getTotalExamWithGroup(newQuery)
            if (resultEx) {
              group.total = parseInt(resultEx.total, 10)
              group.total_recorded = parseInt(resultEx.total_recorded, 10)
            }
          }
        })
        this.groupHT = result
      },
      async updateTime() {
        try {
          this.totalMes = await this.calculateTotals(this.desde, this.hasta)
          this.totalDia = await this.calculateTotals(this.actual, this.actual)
          this.calculategroupHT()
        } catch (error) {
          console.error(error);
        }
      },
      async asyncForEach(array, callback) {
        for (let index = 0; index < array.length; index++) {
          await callback(array[index], index, array);
        }
      },
      async getDollar() {
        const result = await this.getDollarValue()
        if (result) {
          this.dollarValue = result
          const date = this.dollarValue.date
          this.dollarValue.date = date.split('T')[0]
        }
      },
      async activeNewDollar(dolar) {
        this.newDollar = false
        if (dolar !== '') {
          dolar = dolar.toString()
          dolar = dolar.replace('.', '')
          dolar = dolar.replace(',', '.')
          if (isNaN(dolar) === false) {
            const newValue = { value: dolar, }
            const result = await this.setNewDolar(newValue)
            if (result) {
                this.getDollar()
            }
          }
        }
      }, 
    },
  }
  </script>
  <style scoped>
  .gradient-background {
    background: linear-gradient(to bottom right, var(--v-sidebarlite-base),var(--v-sidebar-base));
    width: 100%;
  }
  .gradient-background-container {
    height: calc(100vh - 64px);
    padding: 50px;

  }
  .row-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, 300px);
    gap: 16px;
    justify-items: start;
  }
  .row-group {
    display: grid;
    grid-template-columns: repeat(auto-fill, 350px);
    gap: 16px;
    justify-items: start;
  }
  .item-grid {
    width: 300px;
    height: 165px;
  }
  .item-group {
    width: 350px;
    height: 124px;
  }
  </style>