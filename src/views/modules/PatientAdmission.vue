<template>
  <v-container pa-0 fluid fill-height class="align-start pa-10">
    <div class="text-h6 mb-4">INGRESO DE PACIENTES</div>
    <v-tabs v-model="tab" background-color="transparent" color="primary">
      <v-tab>
        <v-icon color="secondary" left>mdi-account-check-outline</v-icon>
        InformaciÃ³n del paciente
      </v-tab>
      <v-tab>
        <v-icon color="secondary" left>mdi-needle</v-icon>
        Seleccionar exÃ¡menes
      </v-tab>
      <v-tab :disabled="newPatient.client_id > 1">
        <v-icon color="secondary" left>mdi-credit-card-outline</v-icon>
        Forma de pago
      </v-tab>
      <v-tab>
        <v-icon color="secondary" left
          >mdi-checkbox-marked-circle-plus-outline</v-icon
        >
        Registrar
      </v-tab>
      <v-tab-item>
        <information-patiente
          v-if="newPatient"
          :new-patient="newPatient"
          :register="register"
          @change_tariff="changeTariff"
          @Print_invoice="activePrintInvoice"
        />
      </v-tab-item>
      <v-tab-item>
        <select-exams
          v-if="newExams"
          :new-exams="newExams"
          :tariff="tariff"
          :new-patient="newPatient"
          :dollar-value="dollarValue"
          @new-dollar="newDollar"
          @change_tariff="changeTariff"
          @delete_exams="deleteExamns()"
          @clear_way_pay="clearWayPay()"
        />
      </v-tab-item>
      <v-tab-item>
        <type-payment
          :new-patient="newPatient"
          :new-exams="newExams"
          :dollar-value="dollarValue"
          :way-pay="wayPay"
          :key="typePaymentKey"
          @delete-waypay="deleteWayPay"
        />
      </v-tab-item>
      <v-tab-item>
        <register-patient :new-patient="newPatient" :register="register" />
      </v-tab-item>
    </v-tabs>
    <div class="ml-6">
      <v-btn
        v-if="tab === 3"
        color="secondary"
        class="px-6"
        @click="toRegister()"
      >
        <v-icon left>mdi-arrow-collapse-down</v-icon>
        Registrar
      </v-btn>
      <v-alert
        v-show="valid"
        outlined
        text
        transition="scale-transition"
        color="secondary"
        class="mt-10"
      >
        <v-icon large>mdi-alert-circle-outline</v-icon>
        <div v-html="textAlert" class="ml-16 mt-n10"></div>
      </v-alert>
    </div>
    <end-admission-dialog
      v-if="newPatient"
      v-model="activeCerrarIngreso"
      :new-patient="newPatientEnd"
      @cerrar_ingreso="cerrarIngreso()"
    />
    <div
      id="printV"
      :style="voucherOculto ? 'display: none' : 'display: block'"
    ></div>
    <print-receipt
      v-if="patientIdR"
      :id="patientIdR"
      :can-dolares="canDolares"
      @close-print="patientIdR = null"
    />
  </v-container>
</template>

<script>
import InformationPatiente from "@/components/modules/admission/InformationPatiente.vue";
import SelectExams from "@/components/modules/admission/SelectExams.vue";
import examsListMixin from "@/mixins/services/examsListMixin";
import pacientsMixin from "@/mixins/services/pacientsMixin";
import accountsreceivableMixin from "@/mixins/services/accountsreceivableMixin";
import laboratoryMixin from "@/mixins/services/laboratoryMixin";
import functionMixin from "@/mixins/util/functionMixin";
import TypePayment from "@/components/modules/admission/TypePayment.vue";
import RegisterPatient from "@/components/modules/admission/RegisterPatient.vue";
import EndAdmissionDialog from "@/components/modules/admission/EndAdmissionDialog.vue";
import PrintReceipt from "@/components/modules/admission/PrintReceipt.vue";

export default {
  name: "PatientAdmission",
  mixins: [
    examsListMixin,
    pacientsMixin,
    laboratoryMixin,
    functionMixin,
    accountsreceivableMixin,
  ],
  components: {
    InformationPatiente,
    SelectExams,
    TypePayment,
    RegisterPatient,
    EndAdmissionDialog,
    PrintReceipt,
  },
  data() {
    return {
      typePaymentKey: 0,
      activeCerrarIngreso: false,
      newPatientEnd: "",
      printFactura: "",
      rowsVoucher: 15,
      totVoices: "",
      voucherOculto: true,
      tab: 0,
      users: null,
      valid: false,
      textAlert: "",
      patientIdR: null,
      newPatient: {
        name: "",
        document_number: "",
        verification_code: "V",
        admission_date: new Date(
          Date.now() - new Date().getTimezoneOffset() * 60000
        )
          .toISOString()
          .substr(0, 10),
        admission_time: `${new Date().getHours()}:${new Date().getMinutes()}:${new Date().getSeconds()}`,
        birth_date: new Date(
          Date.now() - new Date().getTimezoneOffset() * 60000
        )
          .toISOString()
          .substr(0, 10),
        age: 1,
        month_year: "AÃ±os",
        sex: 0,
        phone: "",
        sample_type: "* SANGRE TOTAL",
        sample: "Tomada aquÃ­",
        email_sent: 1,
        email: "",
        suggested: "",
        client_id: 1,
        observation: "",
        foot_payments: [],
        total: 0,
        way_pay_dollars: 0,
        total_dollars: 0,
        total_canceled: 0,
        dollar_price: 0,
        dollar_price_date: null,
        business_name: "",
        rif: "",
        address: "",
        user_id: localStorage.clientId,
      },
      newExams: [],
      listTax: null,
      noInvoice: 0,
      tariff: 1,
      dollarValue: null,
      wayPay: [],
      register: {},
      canDolares: false,
    };
  },
  async mounted() {
    await this.getDollar();
    const result = await this.getVoucherFormat(1);
    this.printFactura = result.voucher_format;
    this.rowsVoucher = result.rows_description_invoices;
    this.register.printInvoice = result.print_invoice ? true : false;
    this.register.printReceipt = result.print_receipt ? true : false;
    if (result.printer_interface) {
      console.log("paso");
      this.register.printVoucher = result.print_sample_take ? true : false;
      this.register.printerInterface = true;
    } else {
      this.register.printVoucher = false;
      this.register.printerInterface = false;
    }
    console.log("register: ", this.register);
  },
  methods: {
    clearWayPay() {
      if (this.wayPay.length !== 0) {
        this.wayPay = [];
        this.newPatient.total_canceled = 0;
        this.newPatient.way_pay_dollars = 0;
        this.newPatient.subtotal = 0;
        this.newPatient.dollar_price = 0;
        this.typePaymentKey += 1;
      }
    },
    activePrintInvoice(newPrintInvoice) {
      this.register.printInvoice = newPrintInvoice;
    },
    async getDollar() {
      const result = await this.getDollarValue();
      if (result) {
        this.dollarValue = result;
        const date = this.dollarValue.date;
        this.dollarValue.date = date.split("T")[0];
      }
    },
    changeTariff(newTariff) {
      this.tariff = newTariff;
    },
    deleteWayPay(item) {
      if (Object.keys(item).length === 0) {
        this.wayPay = [];
      } else {
        this.wayPay = this.wayPay.filter(
          (nodo) => nodo.id_type_payment !== item.id_type_payment
        );
      }
    },
    async newDollar(dolar) {
      this.newDollar = false;
      if (dolar !== "") {
        dolar = dolar.toString();
        dolar = dolar.replace(".", "");
        dolar = dolar.replace(",", ".");
        if (isNaN(dolar) === false) {
          const newValue = { value: dolar };
          const result = await this.setNewDolar(newValue);
          if (result) {
            this.getDollar();
          }
        }
      }
    },
    async toRegister() {
      if (this.validateRecords()) {
        if (this.newPatient.total_dollars !== 0) {
          this.canDolares = true;
        } else {
          this.canDolares = false;
        }
        var result = await this.setNewPatient(this.newPatient);
        const patientId = result.id;
        const fechaActual = this.currentDate();
        const total = {
          patient_position: await this.getPatientsTotals(fechaActual),
        };
        result = await this.createPatientPosition(patientId, total);
        const examsTMP = JSON.parse(JSON.stringify(this.newExams));
        await this.asyncForEach(examsTMP, async (item) => {
          item.patientsId = patientId;
          item.date = fechaActual;
          item.price = item.price.replace(",", ".");
          item.total = item.total.replace(",", ".");
          item.tax_amount = item.tax_amount.replace(",", ".");
          item.tax_total = item.tax_total.replace(",", ".");
          result = await this.setNewExam(item);
        });
        const clientId = localStorage.clientId;
        if (this.newPatient.client_id === 1) {
          const newwayPay = {
            id_users: clientId,
            id_patients: patientId,
            id_client: this.newPatient.client_id,
            id_invoice: 0,
            date: fechaActual,
            date_patients: fechaActual,
            annulment: false,
          };
          result = await this.setwayPay(newwayPay);
          const wayPayId = result.id;
          this.wayPay.forEach(async (item) => {
            item.id_way_pay = wayPayId;
            result = await this.setWayPayItems(item);
          });
        }
        if (this.register.printInvoice) {
          await this.setInvoiceApply(patientId);
          const change = {
            invoice: this.totVoices,
          };
          await this.putNumbersInvoices(patientId, change);
          await this.printCreateInvoice(patientId);
        }
        if (this.register.printReceipt) {
          this.patientIdR = patientId;
        }
        if (this.register.printVoucher) {
          await this.getPatientVoucher(patientId);
        }
        // solo paciente en crÃ©dito
        if (this.register.printInvoice && this.newPatient.client_id !== 1) {
          const newCustomerAccounts = {
            client_id: this.newPatient.client_id,
            invoice: this.totVoices,
            total: this.newPatient.total,
            total_dollars: this.newPatient.total_dollars,
          };
          const result = await this.createAccountsReceivable(
            newCustomerAccounts
          );
        }
        this.newPatientEnd = this.newPatient.name;
        this.activeCerrarIngreso = true;
      }
    },
    async registerInvoice(patientId) {
      const newInvoice = {
        id_patients: patientId,
        business_name: this.newPatient.business_name,
        document_type: "Factura",
        rif: this.newPatient.rif,
        address: this.newPatient.address,
        id_users: localStorage.clientId,
        subtotal: this.newPatient.subtotal,
        discount: this.newPatient.discount,
        discount_total: this.newPatient.discount_total,
        iva: this.newPatient.iva,
        iva_total: this.newPatient.iva_total,
        tax_base: this.newPatient.tax_base,
        total: this.newPatient.total_no_dollars,
        paying: this.newPatient.client_id === 1 ? 1 : 0,
      };
      var result = await this.insertNewInvoice(newInvoice);
      return result.id;
    },
    async closeInvoice(totalJson, invoiceId) {
      const totales = {
        foot_payments: totalJson,
      };
      await this.changeInvoiceTotals(totales, invoiceId);
    },
    async setInvoiceApply(patientId) {
      var invoiceId = await this.registerInvoice(patientId);
      await this.increaseInvoiceNumber(invoiceId);
      var noRows = 1;
      var footPayments = await this.calculateTotals([], this.canDolares, []);
      footPayments[1].value = this.newPatient.foot_payments[1].value;
      var changeVoice = false;
      var index = 0;
      var listExaInvoice = [];
      var wayPayBs =
        (this.newPatient.way_pay_dollars * 100) / this.newPatient.total_dollars;
      await this.asyncForEach(this.newExams, async (item) => {
        const newInvoiceItem = {
          id_invoice: invoiceId,
          id_exams: item.examlistsId,
          quantity: item.amount,
          description: item.description,
          amount: item.price.replace(",", "."),
          total: item.total.replace(",", "."),
        };
        listExaInvoice.push(item);
        await this.setNewInvoiceItems(newInvoiceItem);

        if (noRows === this.rowsVoucher) {
          footPayments = await this.calculateTotals(
            footPayments,
            this.canDolares,
            listExaInvoice,
            wayPayBs
          );
          listExaInvoice = [];
          await this.closeInvoice(footPayments, invoiceId);
          footPayments = await this.calculateTotals([], this.canDolares, []);
          footPayments[1].value = this.newPatient.foot_payments[1].value;
          if (index + 1 !== this.newExams.length) {
            invoiceId = await this.registerInvoice(patientId);
            await this.increaseInvoiceNumber(invoiceId);
            changeVoice = false;
          } else {
            changeVoice = true;
          }
          noRows = 0;
        }
        noRows += 1;
        index += 1;
      });
      if (!changeVoice) {
        footPayments = await this.calculateTotals(
          footPayments,
          this.canDolares,
          listExaInvoice,
          wayPayBs
        );
        await this.closeInvoice(footPayments, invoiceId);
      }
    },
    async increaseInvoiceNumber(invoiceId) {
      let result = await this.getIncreaseInvoice();
      this.noInvoice = parseInt(result.invoice_number) + 1;
      let change = {
        invoice_number: this.noInvoice,
      };
      await this.increaseInvoice(change);
      change = {
        no_invoice: this.noInvoice,
      };
      await this.createInvoiceNo(invoiceId, change);
      if (this.totVoices !== "") {
        this.totVoices += ", ";
      }
      this.totVoices += this.noInvoice.toString();
    },
    async setNewInvoiceItems(item) {
      const result = await this.insertNewInvoiceItem(item);
      return result;
    },
    async setNewExam(item) {
      const result = await this.setNewExamsPatient(item);
      return result;
    },
    async setWayPayItems(item) {
      console.log("pago: ", item);
      const result = await this.setNewWayPay(item);
      return result;
    },
    currentDate() {
      const fecha = new Date();
      const anio = fecha.getFullYear();
      var mes = fecha.getMonth() + 1;
      var dia = fecha.getDate();
      if (mes < 10) {
        mes = "0" + mes;
      }
      if (dia < 10) {
        dia = "0" + dia;
      }
      const fechaActual = anio + "-" + mes + "-" + dia;
      return fechaActual;
    },
    validateRecords() {
      var validate = true;
      var texto = "";
      this.valid = false;
      if (this.newPatient.name === "") {
        validate = false;
        texto += "Â· Nombre de paciente no puede quedar en blanco<br>";
      }
      if (this.newPatient.birth_date === "") {
        validate = false;
        texto += "Â· La edad del paciente no puede quedar en blanco<br>";
      }
      if (this.newPatient.email_sent === 0) {
        if (this.newPatient.email === "") {
          validate = false;
          texto += "Â· El Email no puede quedar en blanco<br>";
        }
      }
      if (this.newExams.length === 0) {
        validate = false;
        texto += "Â· Debe seleccionar exÃ¡menes<br>";
      }
      if (this.newPatient.client_id === 1) {
        if (this.wayPay.length === 0) {
          validate = false;
          texto += "Â· Seleccione forma de pago<br>";
        }
        console.log("this.newPatient: ", this.newPatient);
        if (parseFloat(this.newPatient.total_dollars) !== 0) {
          console.log(
            "this.newPatient.total_dollars: ",
            this.newPatient.total_dollars
          );
          console.log(
            "this.newPatient.total_canceled: ",
            this.newPatient.total_canceled
          );
          if (
            parseFloat(this.newPatient.total_dollars) !==
            parseFloat(this.newPatient.total_canceled)
          ) {
            validate = false;
            texto += "Â· Saldo pendiente por cancelar<br>";
          }
        } else {
          if (
            parseFloat(this.newPatient.total) !==
            Math.round(parseFloat(this.newPatient.total_canceled))
          ) {
            validate = false;
            texto += "Â· Saldo pendiente por cancelar<br>";
          }
        }
      }
      if (this.register.printInvoice) {
        if (this.newPatient.business_name === "") {
          validate = false;
          texto += "Â· RazÃ³n social no puede quedar en blanco<br>";
        }
        if (this.newPatient.rif === "") {
          validate = false;
          texto +=
            "Â· Registro de informaciÃ³n fiscal no puede quedar en blanco<br>";
        }
        if (this.newPatient.address === "") {
          validate = false;
          texto += "Â· Domicilio no puede quedar en blanco<br>";
        }
      }
      if (this.register.printVoucher) {
        if (this.newPatient.business_name === "") {
          validate = false;
          texto += "Â· RazÃ³n social no puede quedar en blanco<br>";
        }
        if (this.newPatient.rif === "") {
          validate = false;
          texto +=
            "Â· Registro de informaciÃ³n fiscal no puede quedar en blanco<br>";
        }
        if (this.newPatient.address === "") {
          validate = false;
          texto += "Â· Domicilio no puede quedar en blanco<br>";
        }
      }
      if (!validate) {
        this.valid = true;
        this.textAlert = texto;
      }
      return validate;
    },
    async asyncForEach(array, callback) {
      for (let index = 0; index < array.length; index++) {
        await callback(array[index], index, array);
      }
    },
    async colocaFact(itemC, fechaActual, miDiv, patientTmp) {
      const printVoices = await this.getInvoiceNo(itemC);
      var detalle = "";
      var tipoFactura = this.printFactura;
      printVoices.invoiceitems.forEach((item) => {
        const newLinea = `
                <tr>
                    <td style="width: 10%; padding: 1px 10px; border-left: 2px solid black; text-align: center;">
                    ${item.quantity}
                    </td>
                    <td style="width: 50%; padding: 1px 10px; border-left: 1px solid black; text-align: left;">
                    ${item.description}
                    </td>
                    <td style="width: 20%; padding: 1px 10px; border-left: 1px solid black; text-align: right;">
                    ${this.formatNumber(item.amount * this.dollarValue.value)}
                    </td>
                    <td style="width: 20%; padding: 1px 10px; border-right: 2px solid black; border-left: 1px solid black; text-align: right;">
                    ${this.formatNumber(item.total * this.dollarValue.value)}
                    </td>
                </tr>`;
        detalle += newLinea;
      });
      const numberDescriptions = printVoices.invoiceitems.length;
      if (numberDescriptions < this.rowsVoucher) {
        for (var i = 0; i < this.rowsVoucher - numberDescriptions; i += 1) {
          const newLinea = `
                    <tr>
                        <td style="width: 10%; padding: 1px 10px; border-left: 2px solid black; text-align: center;">
                        &nbsp
                        </td>
                        <td style="width: 50%; padding: 1px 10px; border-left: 1px solid black; text-align: left;">
                        &nbsp
                        </td>
                        <td style="width: 20%; padding: 1px 10px; border-left: 1px solid black; text-align: right;">
                        &nbsp
                        </td>
                        <td style="width: 20%; padding: 1px 10px; border-right: 2px solid black; border-left: 1px solid black; text-align: right;">
                        &nbsp
                        </td>
                    </tr>`;
          detalle += newLinea;
        }
      }
      tipoFactura = tipoFactura.replace("[list_description]", detalle);
      tipoFactura = tipoFactura.replace("[fecha]", fechaActual);
      tipoFactura = tipoFactura.replace(
        "[razon-social]",
        printVoices.business_name
      );
      tipoFactura = tipoFactura.replace("[rif]", printVoices.rif);
      tipoFactura = tipoFactura.replace("[domicilio]", printVoices.address);
      tipoFactura = tipoFactura.replace(
        "[position]",
        patientTmp.patient_position
      );
      tipoFactura = tipoFactura.replace("[name]", patientTmp.name);
      tipoFactura = tipoFactura.replace("[phone]", patientTmp.phone);
      var ini = 0;
      var textFoot = "";
      await this.asyncForEach(printVoices.foot_payments, async (item) => {
        if (item.active) {
          textFoot += `<tr>
                        <td colspan="3" style="padding: 5px 10px; text-align: right;">
                            ${item.description}`;
          if (item.value !== null) {
            textFoot += ` ${item.value}`;
          }
          if (ini > 1 && ini !== printVoices.foot_payments.length - 1) {
            textFoot += ` %`;
          }
          if (item.sobre !== null) {
            textFoot += ` SOBRE ${this.formatNumber(
              parseFloat(item.sobre * this.dollarValue.value)
            )}`;
          }
          textFoot += `</td>
                        <td style="padding: 5px 10px; border-bottom: 2px solid black; border-right: 2px solid black; border-left: 2px solid black; text-align: right;">
                            ${this.formatNumber(
                              parseFloat(item.total * this.dollarValue.value)
                            )}
                        </td>
                    </tr>`;
        }
        ini += 1;
      });
      tipoFactura = tipoFactura.replace("[totales]", textFoot);
      tipoFactura = tipoFactura.replace("[noInvoice]", printVoices.no_invoice);
      var parrafo = document.createElement("div");
      parrafo.innerHTML = tipoFactura;
      miDiv.appendChild(parrafo);
    },
    async printCreateInvoice(patientId) {
      var miDiv = document.getElementById("printV");
      const fecha = new Date();
      const anio = fecha.getFullYear();
      var mes = fecha.getMonth() + 1;
      var dia = fecha.getDate();
      if (mes < 10) {
        mes = "0" + mes;
      }
      if (dia < 10) {
        dia = "0" + dia;
      }
      const fechaActual = dia + "-" + mes + "-" + anio;
      const impVoices = this.totVoices.split(", ");
      var ii = 0;
      const patientTmp = await this.getPatientById(patientId);
      await this.asyncForEach(impVoices, async (item) => {
        await this.colocaFact(item, fechaActual, miDiv, patientTmp);
        ii += 1;
        if (ii < impVoices.length) {
          var parrafo = document.createElement("div");
          parrafo.innerHTML = `<div style="page-break-after: always;"></div>`;
          miDiv.appendChild(parrafo);
        }
      });
      this.voucherOculto = await false;
      await this.$htmlToPaper("printV");
      this.voucherOculto = true;
    },
    cerrarIngreso() {
      location.reload();
    },
    deleteExamns() {
      this.newExams = [];
    },
  },
};
</script>
