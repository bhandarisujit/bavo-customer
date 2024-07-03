<template>
  <q-list v-if="hasData" class="q-list-small2">
    <div
      class="bg-mygreyx q-pa-sm q-mb-sm q-pb-xs"
      :class="{
        'bg-grey600 ': $q.dark.mode,
        'bg-mygrey ': !$q.dark.mode,
      }"
    >
     <q-item-label class="font12 ellipsis-2-lines q-mb-sm"
          ><q-icon name="o_pin_drop" size="md" color="grey-4"></q-icon> <span class="q-pl-md q-mb-lg">{{ $t("Delivery Address") }} </span>
        </q-item-label>
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
            filled
            autofocus
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
            filled
            autofocus
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
            filled
            disable
          />
        </div>
        <div class="col">
          <q-input
            v-model="area"
            :label="$t('Area')"
            stack-label
            :rules="[
              (val) =>
                (val && val.length > 0) || this.$t('This field is required'),
            ]"
            filled
            disable
          />
        </div>
        <!--<div class="col">
          <q-input
            v-model="city"
            :label="$t('City')"
            stack-label
            :rules="[
              (val) =>
                (val && val.length > 0) || this.$t('This field is required'),
            ]"
            filled
          />
        </div>-->
      </div>

      <div class="row q-col-gutter-md">
        <div class="col-6">
          <q-input
            v-model="location_name"
            :label="$t('Aparment, suite or floor number')"
            stack-label
            filled
            class="q-mb-lg"
          />
        </div>
        <div class="col">
          <q-input
            v-model="company_name"
            :label="$t('Company Name')"
            stack-label
            filled
            class="q-mb-lg"
          />
        </div>
      </div>

      <q-input
        v-model="delivery_instructions"
        autogrow
        :label="$t('Add delivery instructions')"
        filled
        lazy-rules
        class="q-mb-lg"
      />
    </div>

  </q-list>


</template>

<script>
import { defineAsyncComponent } from "vue";
import APIinterface from "src/api/APIinterface";
import { useDataStorePersisted } from "stores/DataStorePersisted";

export default {
  name: "CartAddressSummary",
  props: ["trans_type", "loading", "data", "ischeckout", "checkout_address"],
  data() {
    return {
      phone_number: "",
      street:"",
      house_number:"",
      postal_code:"",
      city:"",
      area:"",
      location_name:"",
      company_name:"",
      delivery_instructions:""
    };
  },
  setup(props) {
    const DataStorePersisted = useDataStorePersisted();
    return { DataStorePersisted };
  },
  created() {
    this.getDetails();
  },
  computed: {
    hasAddress() {
      if (!APIinterface.empty(this.data.formatted_address)) {
        return true;
      }
      return false;
    },
    hasData() {
      if (Object.keys(this.data).length > 0) {
        return true;
      }
      return false;
    },
    hasDataStreet(){
      return false;
    }
  },
  watch: {
    street(newValue, oldValue) {
      this.DataStorePersisted.location_data.street = newValue
    },
    house_number(newValue, oldValue) {
      this.DataStorePersisted.location_data.house_number = newValue
    },
    city(newValue, oldValue) {
      this.DataStorePersisted.location_data.city = newValue
    },
    postal_code(newValue, oldValue) {
      this.DataStorePersisted.location_data.postal_code = newValue
    },
    location_name(newValue, oldValue) {
      this.DataStorePersisted.location_data.location_name = newValue
    },
    company_name(newValue, oldValue) {
      this.DataStorePersisted.location_data.company_name = newValue
    },
    delivery_instructions(newValue, oldValue) {
      this.DataStorePersisted.location_data.delivery_instructions = newValue
    },
  },
  methods: {
    getDetails() {
      this.street = this.DataStorePersisted.location_data.street;
      this.house_number = this.DataStorePersisted.location_data.house_number;
      this.postal_code =  this.DataStorePersisted.delivery_postalcode ?  this.DataStorePersisted.delivery_postalcode : this.DataStorePersisted.location_data.postal_code;
      this.city = this.DataStorePersisted.location_data.city;
      this.area = this.DataStorePersisted.delivery_area.label ? this.DataStorePersisted.delivery_area.label : '-';
      this.location_name = this.DataStorePersisted.location_data.location_name;
      this.company_name = this.DataStorePersisted.location_data.company_name;
      this.delivery_instructions = this.DataStorePersisted.delivery_instructions;

    },
  },
};
</script>
