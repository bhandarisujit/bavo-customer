<template>
  <q-dialog
    v-model="modal"
    persistent
    position="bottom"
    transition-show="fade"
    transition-hide="fadeout"
    @before-show="beforeShow"
  >
    <q-card>
      <q-inner-loading
        :showing="loading_default"
        color="primary"
      ></q-inner-loading>
      <q-card-section class="row items-center q-pb-none">
        <div class="text-h6 text-weight-bold">{{ $t("Details") }}</div>
        <q-space />
        <q-btn icon="close" flat round dense v-close-popup />
      </q-card-section>
      <q-card-section>
        <q-item tag="label">
          <q-item-section>
            <q-item-label>{{ data.attr1 }}</q-item-label>
            <q-item-label caption>{{ data.attr2 }}</q-item-label>
          </q-item-section>
        </q-item>
        <q-item-section>
          <q-item-label>
            <q-checkbox
              color="primary"
              v-model="as_default"
              :label="$t('Set as default')"
              @update:model-value="Setdefault"
              :disable="loading_default"
            />
          </q-item-label>
        </q-item-section>
      </q-card-section>
      <q-separator></q-separator>
      <q-card-actions>
        <q-btn
          color="red-9"
          text-color="red-2"
          unelevated
          class="fit"
          size="17px"
          no-caps
          :label="$t('Delete')"
          rounded
          @click="confirmDelete"
          :loading="loading"
          :disable="loading_default"
        />
      </q-card-actions>
    </q-card>
  </q-dialog>

  <ConfirmDialog
    ref="dialog"
    :data="{
      title: this.$t('Delete'),
      subtitle: this.$t('Are you sure you want to continue?'),
      confirm: this.$t('Yes'),
      cancel: this.$t('Cancel'),
    }"
    @after-confirm="afterConfirm"
  >
  </ConfirmDialog>
</template>

<script>
import { defineAsyncComponent } from "vue";
import APIinterface from "src/api/APIinterface";

export default {
  name: "PaymentDetails",
  components: {
    ConfirmDialog: defineAsyncComponent(() =>
      import("components/ConfirmDialog.vue")
    ),
  },
  props: ["data"],
  data() {
    return {
      loading: false,
      loading_default: false,
      modal: false,
      as_default: false,
    };
  },
  setup() {
    return {};
  },
  methods: {
    beforeShow() {
      this.as_default = this.data.as_default == 1 ? true : false;
    },
    Setdefault(data) {
      let as_default = data == true ? 1 : 0;
      this.loading_default = true;

      APIinterface.fetchDataByTokenPost(
        "SetDefaultPayment",
        "payment_uuid=" + this.data.payment_uuid + "&default=" + as_default
      )
        .then((data) => {
          this.modal = false;
          this.$emit("afterDelete");
        })
        .catch((error) => {
          APIinterface.notify("dark", error, "error_outline", this.$q);
        })
        .then((data) => {
          this.loading_default = false;
        });
    },
    confirmDelete() {
      this.$refs.dialog.dialog = true;
    },
    afterConfirm() {
      this.$refs.dialog.dialog = false;
      this.loading = true;
      APIinterface.fetchDataByTokenPost(
        "deletePayment",
        "payment_uuid=" + this.data.payment_uuid
      )
        .then((data) => {
          this.modal = false;
          this.$emit("afterDelete");
        })
        .catch((error) => {
          APIinterface.notify("dark", error, "error_outline", this.$q);
        })
        .then((data) => {
          this.loading = false;
        });
    },
  },
};
</script>
