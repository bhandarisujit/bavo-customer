<template>
  <q-dialog
    v-model="modal"
    position="bottom"
    persistent
    transition-show="fade"
    transition-hide="fadeout"
    full-width
    @before-show="beforeShow"
  >
    <q-card
      :class="{
        'bg-grey600 text-white': $q.dark.mode,
      }"
    >
      <q-card-section class="row items-center q-pb-none">
        <div class="text-h6 text-weight-bold">
          {{ $t("Choose your area") }}
        </div>
        <q-space />
        <q-btn icon="close" flat round dense v-close-popup />
      </q-card-section>
      <q-card-section>
        <div
          class="q-mt-md relative-position"
        >
          <q-inner-loading
            :showing="SettingStore.loading_gettimes"
            color="warning"
          ></q-inner-loading>

          <q-select
            :label="$t('PostalCode')"
            stack-label
            v-model="delivery_postalcode"
            transition-show="scale"
            transition-hide="scale"
            :options="SettingStore.postalcodes"
            emit-value
            map-options
            @update:model-value="val => showAreas(val)"
          />

          <q-select
            :label="$t('Area')"
            stack-label
            v-model="delivery_area"
            transition-show="scale"
            transition-hide="scale"
            :options="SettingStore.areas"
            map-options
          />
        </div>
      </q-card-section>
      <q-card-actions>
        <q-btn
          unelevated
          rounded
          color="primary"
          text-color="white"
          no-caps
          class="full-width q-mb-md"
          :label="$t('Save')"
          size="lg"
          @click="saveTransactionAreaInfo"
          :loading="loading"
        >
        </q-btn>
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script>
import { useSettingStore } from "stores/SettingStore";
import { useDataStorePersisted } from "stores/DataStorePersisted";
import APIinterface from "src/api/APIinterface";

export default {
  name: "OrderDetailsArea",
  data() {
    return {
      modal: false,
      loading: false,
      transaction_type: "",
      whento_deliver: "now",
      delivery_date: "",
      delivery_time: "",
      delivery_postcalode: '',
      delivery_area : '',
    };
  },
  setup() {
    const SettingStore = useSettingStore();
    const DataStorePersisted = useDataStorePersisted();
    return { SettingStore, DataStorePersisted };
  },
  methods: {
    beforeShow() {
      this.loading = true;
      if (Object.keys(this.SettingStore.settings_data).length > 0) {
        this.setForm();
      } else {
        this.$watch(
          () => this.SettingStore.$state.settings_data,
          (newData, oldData) => {
            this.setForm();
          }
        );
      }
    },
    setForm() {
      this.loading = false;
      console.log("setForm");
      this.chooseWhen();
    },
    async chooseWhen() {
      const resp = await this.SettingStore.getPostalCodes();
      if (!APIinterface.empty(this.DataStorePersisted.delivery_postalcode)) {
        this.delivery_postalcode = this.DataStorePersisted.delivery_postalcode;
      } else {
        this.delivery_postalcode = resp ? resp : null;
      }
      if (!APIinterface.empty(this.DataStorePersisted.delivery_area)) {
        this.delivery_area = this.DataStorePersisted.delivery_area
          ? this.DataStorePersisted.delivery_area
          : "";
      }
    },
    saveTransactionAreaInfo() {
      this.DataStorePersisted.delivery_postalcode = this.delivery_postalcode;
      this.DataStorePersisted.delivery_area = this.delivery_area;
      this.DataStorePersisted.area_id = this.delivery_area.value;
      this.modal = false;
      this.SettingStore.formatAreaTransaction();
      this.$emit("afterSaveareatrans");
    },
    async showAreas(val){
      const resp = await this.SettingStore.getAreaByPostalCode(val);

      this.delivery_area = resp ? resp : null;
    },
  },
};
</script>
