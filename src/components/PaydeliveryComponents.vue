<template>
  <q-dialog
    v-model="show_modal"
    persistent
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
        <div class="text-h6 text-weight-bold">{{ title }}</div>
        <q-space />
        <q-btn icon="close" flat round dense v-close-popup />
      </q-card-section>

      <q-card-section class="q-pa-md card-small-height">
        <template v-if="loading_get">
          <q-inner-loading :showing="true" color="primary"></q-inner-loading>
        </template>
        <template v-else>
          <template v-if="hasData">
            <div class="row q-gutter-none modified-radio q-col-gutter-sm">
              <div
                v-for="items in getData"
                :key="items"
                class="col-lg-3 col-md-3 col-sm-6 col-xs-4 text-center"
              >
                <q-radio v-model="payment_id" :val="items.id" label="">
                  <q-avatar size="50px" square class="col self-center">
                    <q-img
                      fit="contain"
                      :src="items.url_image"
                      class="no-margin"
                      height="50px"
                      loading="lazy"
                      placeholder-src="placeholder.png"
                      spinner-color="secondary"
                      spinner-size="sm"
                    />
                  </q-avatar>
                </q-radio>
              </div>
            </div>
          </template>
          <template v-else>
            <div class="flex flex-center card-small-height">
              <p class="text-grey">{{ $t("No available data") }}</p>
            </div>
          </template>
        </template>
      </q-card-section>

      <q-separator spaced />
      <q-card-actions>
        <q-btn
          unelevated
          rounded
          color="primary"
          text-color="white"
          no-caps
          class="full-width q-mb-sm"
          :label="label.submit"
          size="lg"
          :loading="loading"
          :disable="hasSelected"
          @click="onSubmit()"
        />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script>
import APIinterface from "src/api/APIinterface";

export default {
  name: "PaydeliveryComponents",
  props: ["title", "label", "payment_code", "payment_credentials"],
  data() {
    return {
      show_modal: false,
      data: [],
      loading: false,
      payment_id: "",
      loading_get: true,
    };
  },
  computed: {
    getData() {
      return this.data;
    },
    hasData() {
      if (Object.keys(this.data).length > 0) {
        return true;
      }
      return false;
    },
    hasSelected() {
      if (this.payment_id > 0) {
        return false;
      }
      return true;
    },
  },
  methods: {
    showPaymentForm() {
      this.show_modal = true;
      this.getPaydelivery();
    },
    close() {
      this.show_modal = false;
    },
    onSubmit() {
      this.loading = true;
      let merchant_id = this.payment_credentials[this.payment_code]
        ? this.payment_credentials[this.payment_code].merchant_id
        : "";
      APIinterface.fetchDataByTokenPost(
        "savedPaydelivery",
        "payment_id=" +
          this.payment_id +
          "&payment_code=" +
          this.payment_code +
          "&merchant_id=" +
          merchant_id
      )
        .then((data) => {
          this.close();
          this.$emit("afterAddpayment");
        })
        .catch((error) => {
          APIinterface.notify("dark", error, "error", this.$q);
        })
        .then((data) => {
          this.loading = false;
        });
    },
    getPaydelivery() {
      this.loading_get = true;
      APIinterface.fetchDataPost("getPaydelivery")
        .then((data) => {
          this.data = data.details.data;
        })
        .catch((error) => {})
        .then((data) => {
          this.loading_get = false;
        });
    },
  },
};
</script>
