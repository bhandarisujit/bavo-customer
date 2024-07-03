<template>
  <q-dialog
    v-model="show_modal"
    persistent
    transition-show="scale"
    transition-hide="scale"
    :position="this.$q.screen.gt.sm ? 'standard' : 'bottom'"
    :full-width="this.$q.screen.gt.sm ? false : true"
  >
    <q-card
      :class="{
        'bg-grey600 text-white': $q.dark.mode,
      }"
    >
      <q-card-section class="row items-center q-pb-none">
        <div class="text-h5 text-weight-bold">{{ title }}</div>
        <q-space />
        <q-btn icon="close" flat round dense v-close-popup />
      </q-card-section>

      <q-form @submit="onSubmit">
        <q-card-section class="q-pa-md">
          <div class="text-body2 q-mb-md">
            {{ label.notes }}
          </div>

          <div class="column q-col-gutter-sm">
            <q-input
              color="primary"
              stack-label
              v-model="credit_card_number"
              :label="$t('Card number')"
              :rules="[
                (val) =>
                  (val && val.length > 0) || $t('this field is required'),
              ]"
              mask="#### #### #### ####"
            />
          </div>

          <div class="row q-col-gutter-md">
            <div class="col">
              <q-input
                color="primary"
                stack-label
                v-model="expiry_date"
                :label="$t('Exp. date')"
                class="no-margin"
                :rules="[
                  (val) =>
                    (val && val.length > 0) || $t('this field is required'),
                ]"
                mask="##/##"
              />
            </div>
            <div class="col">
              <q-input
                color="primary"
                stack-label
                v-model="cvv"
                :label="$t('Security Code')"
                class="no-margin"
                :rules="[
                  (val) =>
                    (val && val.length > 0) || $t('this field is required'),
                ]"
                mask="####"
              />
            </div>
          </div>
          <!-- row -->

          <div class="row q-col-gutter-md">
            <div class="col-12">
              <q-input
                color="primary"
                stack-label
                v-model="card_name"
                class="no-margin"
                :label="$t('Card name')"
                :rules="[
                  (val) =>
                    (val && val.length > 0) || $t('this field is required'),
                ]"
              />
            </div>
          </div>
          <!-- row -->

          <div class="row q-col-gutter-md">
            <div class="col">
              <q-select
                v-model="identification_type"
                :options="identification_type_list"
                :label="$t('Identitification Type')"
                color="primary"
                stack-label
              />
            </div>
            <div class="col">
              <q-input
                color="primary"
                stack-label
                v-model="identification_number"
                :label="$t('Identification Number')"
                class="no-margin"
                :rules="[
                  (val) =>
                    (val && val.length > 0) || $t('this field is required'),
                ]"
                mask="####"
              />
            </div>
          </div>
          <!-- row -->
        </q-card-section>

        <q-separator spaced />
        <q-card-actions>
          <q-btn
            type="submit"
            unelevated
            rounded
            color="primary"
            text-color="white"
            no-caps
            class="full-width q-mb-sm"
            :label="label.submit"
            size="lg"
            :loading="loading"
          />
        </q-card-actions>
      </q-form>
    </q-card>
  </q-dialog>

  <q-dialog
    v-model="modal_cvv"
    transition-show="fade"
    transition-hide="fadeout"
    :position="this.$q.screen.gt.sm ? 'standard' : 'bottom'"
    :full-width="this.$q.screen.gt.sm ? false : true"
  >
    <q-card
      :class="{
        'bg-grey600 text-white': $q.dark.mode,
      }"
    >
      <q-card-section class="row items-center q-pb-none">
        <div class="text-h5 text-weight-bold">{{ $t("Verification") }}</div>
        <q-space />
        <q-btn icon="close" flat round dense v-close-popup />
      </q-card-section>

      <q-form @submit="SubmitPayment">
        <q-card-section class="q-pa-md">
          <div class="text-body2 q-mb-md">
            {{ $t("Enter CVV for card") }} {{ card_number }}
          </div>

          <q-input
            dense
            color="primary"
            stack-label
            v-model="verify_cvv"
            :label="$t('Security Code')"
            class="no-margin"
            :rules="[
              (val) => (val && val.length > 0) || $t('this field is required'),
            ]"
            mask="####"
          />
        </q-card-section>

        <q-card-actions>
          <q-btn
            type="submit"
            unelevated
            rounded
            color="primary"
            text-color="white"
            no-caps
            class="full-width q-mb-sm"
            :label="$t('Submit')"
            size="lg"
            :loading="loading"
          />
        </q-card-actions>
      </q-form>
    </q-card>
  </q-dialog>
</template>

<script>
import APIinterface from "src/api/APIinterface";
import { loadScript } from "vue-plugin-load-script";

let mp;
export default {
  name: "MercadopagoComponents",
  props: ["title", "label", "payment_code", "payment_credentials"],
  data() {
    return {
      show_modal: false,
      data: [],
      loading: false,
      credentials: [],
      identification_type_list: [],
      identification_type: "",
      identification_number: "",
      credit_card_number: "",
      expiry_date: "",
      cvv: "",
      card_name: "",
      customer_id: "",
      payment_uuid: "",
      order_uuid: "",
      modal_cvv: false,
      card_number: "",
      verify_cvv: "",
    };
  },
  methods: {
    showPaymentForm() {
      this.show_modal = true;
      this.setCredentials();
      this.includeScript(true);
    },
    close() {
      this.show_modal = false;
    },
    closePayment() {
      this.$emit("afterCancelPayment");
    },
    setCredentials() {
      if (
        typeof this.payment_credentials[this.payment_code] !== "undefined" &&
        this.payment_credentials[this.payment_code] !== null
      ) {
        this.credentials = this.payment_credentials[this.payment_code];
      }
    },
    includeScript(initFunc) {
      loadScript("https://sdk.mercadopago.com/js/v2")
        .then(() => {
          if (initFunc) {
            this.initPayment();
            this.createCustomer();
          }
        })
        .catch((error) => {
          console.log("error", error);
        });
    },
    initPayment() {
      // eslint-disable-next-line
      mp = new MercadoPago(this.credentials.attr2);
      this.identification_type_list = [];
      mp.getIdentificationTypes()
        .then((result) => {
          Object.entries(result).forEach(([key, items]) => {
            this.identification_type_list.push({
              label: items.name,
              value: items.id,
            });
          });
        })
        .catch((e) => {
          APIinterface.notify("dark", e.message, "error_outline", this.$q);
        });
    },
    createCustomer() {
      const $params = {
        payment_code: this.payment_code,
        merchant_id: this.credentials.merchant_id,
        merchant_type: this.credentials.merchant_type,
      };
      this.loading = true;
      APIinterface.PaymentPost("MercadopagoCustomer", $params)
        .then((data) => {
          this.customer_id = data.details.customer_id;
        })
        .catch((error) => {
          APIinterface.notify("dark", error, "error_outline", this.$q);
        })
        .then((data) => {
          this.loading = false;
        });
    },
    onSubmit() {
      /* eslint-disable */
      var str = this.expiry_date;
      var expiry = str.split("/");
      var expiry_month = expiry[0];
      var expiry_year = expiry[1];

      const str_card = this.credit_card_number;
      const card_number = str_card.replace(/ /g, "");

      this.is_loading = true;
      mp.createCardToken({
        cardNumber: card_number,
        cardholderName: this.card_name,
        cardExpirationMonth: expiry_month,
        cardExpirationYear: expiry_year,
        securityCode: this.cvv,
        identificationType: this.identification_type,
        identificationNumber: this.identification_number,
      })
        .then((result) => {
          this.AddCard(result);
        })
        .catch((error) => {
          this.is_loading = false;
          if (typeof error.message !== "undefined" && error.message !== null) {
            APIinterface.notify(
              "dark",
              error.message,
              "error_outline",
              this.$q
            );
          } else {
            let error;
            error.forEach((item, index) => {
              error += item.message;
            });
            APIinterface.notify("dark", error, "error_outline", this.$q);
          }
        });
    },
    AddCard(data) {
      let $params = {
        payment_code: this.payment_code,
        merchant_id: this.credentials.merchant_id,
        merchant_type: this.credentials.merchant_type,
        id: data.id,
        card_name: this.card_name,
        customer_id: this.customer_id,
      };
      this.loading = true;
      APIinterface.PaymentPost("MercadopagoAddcard", $params)
        .then((data) => {
          this.close();
          this.$emit("afterAddpayment");
        })
        .catch((error) => {
          APIinterface.notify("dark", error, "error_outline", this.$q);
        })
        .then((data) => {
          this.loading = false;
        });
    },
    PaymentRender(data) {
      this.payment_uuid = data.payment_uuid;
      this.order_uuid = data.order_uuid;
      let $data = {
        payment_uuid: this.payment_uuid,
      };
      APIinterface.showLoadingBox(this.$t("processing_payment"), this.$q);
      APIinterface.PaymentPost("MercadopagoGetcard", $data)
        .then((data) => {
          this.card_number = data.details.card_number;
          this.card_id = data.details.card_id;
          this.includeScript(false);
          this.setCredentials();
          this.modal_cvv = true;
        })
        .catch((error) => {
          APIinterface.notify("dark", error, "error_outline", this.$q);
        })
        .then((data) => {
          APIinterface.hideLoadingBox(this.$q);
        });
    },
    SubmitPayment() {
      this.loading = true;
      mp = new MercadoPago(this.credentials.attr2);
      mp.createCardToken({
        cardId: this.card_id,
        securityCode: this.verify_cvv,
      })
        .then((result) => {
          this.loading = false;
          if (!APIinterface.empty(this.jwt_data)) {
            this.processPayment(result.id);
          } else {
            this.capturePayment(result.id);
          }
        })
        .catch((error) => {
          this.loading = false;
          if (typeof error.message !== "undefined" && error.message !== null) {
            APIinterface.notify(
              "dark",
              error.message,
              "error_outline",
              this.$q
            );
          } else {
            let err;
            error.forEach((item, index) => {
              err += item.message;
            });
            APIinterface.notify("dark", err, "error_outline", this.$q);
          }
        });
    },
    capturePayment(card_token) {
      var $params = {
        payment_code: this.payment_code,
        merchant_id: this.credentials.merchant_id,
        merchant_type: this.credentials.merchant_type,
        order_uuid: this.order_uuid,
        cart_uuid: APIinterface.getStorage("cart_uuid"),
        payment_uuid: this.payment_uuid,
        card_token: card_token,
      };
      APIinterface.showLoadingBox(this.$t("processing_payment"), this.$q);
      APIinterface.PaymentPost("MercadopagoCapturePayment", $params)
        .then((data) => {
          this.$emit("afterSuccessfulpayment", data.details);
        })
        .catch((error) => {
          APIinterface.notify("dark", error, "error_outline", this.$q);
        })
        .then((data) => {
          APIinterface.hideLoadingBox(this.$q);
        });
    },
    Dopayment(data, datas) {
      this.jwt_data = data;
      APIinterface.showLoadingBox(this.$t("processing_payment"), this.$q);
      APIinterface.PaymentPost("MercadopagoGetcardid", {
        payment_uuid: datas.payment_uuid,
      })
        .then((data) => {
          this.setCredentials();
          this.includeScript();
          this.card_number = data.details.card_number;
          this.card_id = data.details.card_id;
          this.error = [];
          this.$emit("closePayment");
          this.modal_cvv = true;
        })
        .catch((error) => {
          APIinterface.notify("dark", error, "error", this.$q);
        })
        .then((data) => {
          APIinterface.hideLoadingBox(this.$q);
        });
    },
    processPayment(card_token) {
      APIinterface.showLoadingBox(this.$t("processing_payment"), this.$q);
      APIinterface.PaymentPost("MercadopagoProcesspayment", {
        card_token: card_token,
        data: this.jwt_data,
      })
        .then((data) => {
          this.modal_cvv = false;
          this.$emit("afterSuccessfulpayment", data.details);
        })
        .catch((error) => {
          APIinterface.notify("dark", error, "error", this.$q);
        })
        .then((data) => {
          APIinterface.hideLoadingBox(this.$q);
        });
    },
    //
  },
};
</script>
