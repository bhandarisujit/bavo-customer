<template>
  <q-dialog
    v-model="modal"
    persistent
    :maximized="true"
    transition-show="slide-up"
    transition-hide="slide-down"
    @before-show="beforeShow"
  >
    <q-card>
      <q-form @submit="submit">
        <q-toolbar>
          <q-btn
            round
            dense
            icon="arrow_back"
            unelevated
            :color="$q.dark.mode ? 'grey' : 'mygrey'"
            :text-color="$q.dark.mode ? 'grey-9' : 'dark'"
            v-close-popup
          />
          <q-toolbar-title class="text-weight-bold text-darkx">{{
            $t("Address details")
          }}</q-toolbar-title>
        </q-toolbar>

        <q-card-section class="scroll card-small-medium">

          <div class="row q-col-gutter-md">
            <div class="col-6">
              <q-input
                v-model="street"
                :label="$t('Street')"
                stack-label
                :rules="[
                  (val) =>
                    (val && val.length > 0) || this.$t('This field is required'),
                ]"
              />
            </div>
            <div class="col">
              <q-input
                v-model="house_number"
                :label="$t('House Number')"
                stack-label
                :rules="[
                  (val) =>
                    (val && val.length > 0) || this.$t('This field is required'),
                ]"
              />
            </div>
          </div>

          <div class="row q-col-gutter-md">
            <div class="col-6">
              <q-input
                v-model="postal_code"
                :label="$t('Postal Code')"
                stack-label
                :rules="[
                  (val) =>
                    (val && val.length > 0) || this.$t('This field is required'),
                ]"
              />
            </div>
            <div class="col">
              <q-input
                v-model="city"
                :label="$t('City')"
                stack-label
                :rules="[
                  (val) =>
                    (val && val.length > 0) || this.$t('This field is required'),
                ]"
              />
            </div>
          </div>

          <q-input
            v-model="location_name"
            :label="$t('Aparment, suite or floor')"
            stack-label
          />

          <q-input
            v-model="company_name"
            :label="$t('Company Name')"
            stack-label
          />

          <!--<q-select
            :label="$t('Delivery options')"
            stack-label
            v-model="delivery_options"
            :options="delivery_options_data"
            transition-show="scale"
            transition-hide="scale"
            emit-value
            map-options
          />-->
          <q-space class="q-pa-sm"></q-space>
          <q-input
            v-model="delivery_instructions"
            autogrow
            stack-label
            :label="$t('Add delivery instructions')"
          />
          <q-space class="q-pa-sm"></q-space>

          <div class="text-body2 q-mb-sm">{{ $t("Address label") }}</div>
          <div class="scroll bg-grey-2x radius20">
            <q-btn-toggle
              class="rounded-group no-margin"
              v-model="address_label"
              :toggle-color="$q.dark.mode ? 'grey600' : dark"
              no-caps
              unelevated
              :options="address_label_data"
              emit-value
              size="16px"
              :color="$q.dark.mode ? 'grey' : 'mygrey'"
              :text-color="$q.dark.mode ? 'grey-9' : 'dark'"
            />
          </div>

          <q-space class="q-pa-sm"></q-space>

          <!-- end form -->
        </q-card-section>
        <!-- <q-separator></q-separator>
        <q-card-actions>
          <q-btn
            type="submit"
            color="primary"
            text-color="white"
            size="lg"
            rounded
            unelevated
            no-caps
            class="fit"
            :loading="loading"
            >{{ $t("Save Address") }}</q-btn
          >
        </q-card-actions> -->
        <q-footer
          class="bg-whitex q-pa-md border-top"
          :class="{
            'bg-mydark text-white': $q.dark.mode,
            'bg-white text-dark': !$q.dark.mode,
          }"
        >
          <q-btn
            type="submit"
            color="primary"
            text-color="white"
            size="lg"
            rounded
            unelevated
            no-caps
            class="fit"
            :loading="loading"
            >{{ $t("Save Address") }}</q-btn
          >
        </q-footer>
      </q-form>
    </q-card>
  </q-dialog>
</template>

<script>
import { useSettingStore } from "stores/SettingStore";
import APIinterface from "src/api/APIinterface";

export default {
  name: "AddressDetails",
  //props: ["locationdata"],
  setup() {
    const SettingStore = useSettingStore();
    return { SettingStore };
  },
  data() {
    return {
      loading: false,
      modal: false,
      formatted_address: "",
      address1: "",
      street:"",
      house_number:"",
      city:"",
      postal_code:"",
      location_name: "",
      company_name:"",
      delivery_options: this.$t("Leave it at my door"),
      delivery_instructions: "",
      address_label: "Home",
      delivery_options_data: [],
      address_label_data: [],
      location_data: "",
      latitude: "",
      longitude: "",
      place_id: "",
    };
  },
  mounted() {
    if (Object.keys(this.SettingStore.settings_data).length > 0) {
      this.setFormData();
    } else {
      this.$watch(
        () => this.SettingStore.$state.settings_data,
        (newData, oldData) => {
          this.setFormData();
        }
      );
    }
  },
  watch: {
    location_data(newVal, oldVal) {
      // this.address1 = newVal.addressLine1;
      // this.formatted_address = newVal.description;
      this.street = newVal.street;
      this.house_number = newVal.house_number;
      this.postal_code = newVal.postal_code;
      this.city = newVal.city;
      this.address1 = newVal.description;
      this.formatted_address = newVal.addressLine1;
      this.latitude = newVal.latitude;
      this.longitude = newVal.longitude;
      this.place_id = newVal.id;
      if (newVal.attributes) {
        this.location_name = newVal.attributes.location_name;
        this.company_name = newVal.attributes.company_name;
        this.delivery_options = newVal.attributes.delivery_options;
        this.delivery_instructions = newVal.attributes.delivery_instructions;
        this.address_label = newVal.attributes.address_label;
      }
    },
  },
  methods: {
    setFormData() {
      /*this.delivery_options_data =
        this.SettingStore.settings_data.addresss_delivery_option;*/

      this.address_label_data = this.SettingStore.settings_data.address_label;
    },
    submit() {
      this.loading = true;
      let params = "formatted_address=" + this.formatted_address;
      params += "&street=" + this.street;
      params += "&house_number=" + this.house_number;
      params += "&postal_code=" + this.postal_code;
      params += "&city=" + this.city;
      params += "&address1=" + this.address1;
      params += "&location_name=" + this.location_name;
      params += "&delivery_options=" + this.delivery_options;
      params += "&delivery_instructions=" + this.delivery_instructions;
      params += "&address_label=" + this.address_label;
      params += "&latitude=" + this.latitude;
      params += "&longitude=" + this.longitude;
      params += "&place_id=" + this.place_id;
      APIinterface.fetchDataByTokenPost("saveClientAddress", params)
        .then((data) => {
          this.modal = false;
          this.$emit("afterSaveaddress", {
            id: this.place_id,
            addressLine1: this.address1,
            description: this.formatted_address,
            latitude: this.latitude,
            longitude: this.longitude,
          });
        })
        .catch((error) => {
          APIinterface.notify("negative", error, "error_outline", this.$q);
        })
        .then((data) => {
          this.loading = false;
        });
    },
  },
};
</script>
