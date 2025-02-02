<template>
  <q-list
    dense
    class="rounded-borders q-pt-xs q-pb-xs q-mb-sm bg-mygreyx radius10"
    :class="{
      'bg-grey600': $q.dark.mode,
      'bg-mygrey': !$q.dark.mode,
    }"
  >
    <q-item clickable v-ripple @click="$emit('changeAddress')">
      <q-item-section avatar class="item-column-less">
        <q-avatar
          color="primary"
          text-color="white"
          icon="las la-map-marker"
          size="md"
        />
      </q-item-section>
      <q-item-section>
        <q-item-label caption>{{ $t("Delivery address") }}</q-item-label>
      </q-item-section>
      <q-item-section side v-if="hasData">
        <q-btn round color="yellow-9" icon="edit" flat size="sm" />
      </q-item-section>
    </q-item>
    <template v-if="loading">
      <q-item>
        <q-item-section avatar class="item-column-less" style="min-width: 40px">
        </q-item-section>
        <q-item-section>
          <q-skeleton recttype="type" />
        </q-item-section>
      </q-item>
    </template>
    <template v-else>
      <template v-if="hasData">
        <q-item
          clickable
          v-ripple
          class="item-normal-height"
          @click="addInstructions"
        >
          <q-item-section
            avatar
            class="item-column-less"
            style="min-width: 40px"
          >
          </q-item-section>
          <q-item-section>
            <q-item-label class="text-caption">
              <div class="text-weight-bold">
                {{ $t(data.attributes.address_label) }}
              </div>
              <div class="ellipsis">
                {{ data.address.address1 }} {{ data.address.formatted_address }}
              </div>
            </q-item-label>
            <q-item-label class="text-caption text-yellow-9">{{
              $t("Add delivery instructions")
            }} </q-item-label>
          </q-item-section>
          <q-item-section side>
            <q-btn round color="yellow-9" icon="add" flat size="sm" />
          </q-item-section>
        </q-item>
      </template>
      <template v-else>
        <q-item>
        <template v-if="hasDataLocationData">
          {{ this.location_data.formatted_address_pretty}}
        </template>
        <template v-else>
          <q-item-section>
            <q-btn
              color="primary text-weight-bold bg-grey-4"
              flat
              :label="$t('Add new address')"
              no-caps
              @click="$emit('changeAddress')"
            />
          </q-item-section>
        </template>
        </q-item>
      </template>
    </template>
  </q-list>
</template>

<script>
import { useDataStorePersisted } from "stores/DataStorePersisted";
import APIinterface from "src/api/APIinterface";

export default {
  name: "CartAddress",
  data() {
    return {
      loading: false,
      data: [],
      location_data: [],
    };
  },
  setup() {
    const DataStorePersisted = useDataStorePersisted();
    return { DataStorePersisted };
  },
  mounted() {
    if (Object.keys(this.DataStorePersisted.location_data).length > 0) {
      if(this.DataStorePersisted.location_data.id){
        this.checkoutAddress();
      }
      else{
         /*if(this.DataStorePersisted.location_data.street != undefined && this.DataStorePersisted.location_data.house_number != undefined && this.DataStorePersisted.location_data.postal_code != undefined && this.DataStorePersisted.location_data.city != undefined){

         if(this.DataStorePersisted.location_data.postal_code != this.DataStorePersisted.delivery_postalcode){
            this.$emit("setError", "area pincode not match");
          }
          this.location_data.formatted_address_pretty = this.DataStorePersisted.location_data.street + ' ' + this.DataStorePersisted.location_data.house_number + ', ' + this.DataStorePersisted.location_data.postal_code  + ' ' + this.DataStorePersisted.location_data.city;
        }
        else{
          this.$emit("setError", "full address required");
        }*/
        this.location_data.formatted_address_pretty = this.DataStorePersisted.location_data.street + ' ' + this.DataStorePersisted.location_data.house_number + ', ' + this.DataStorePersisted.location_data.postal_code  + ' ' + this.DataStorePersisted.delivery_area.label;
      }

    }
    this.$watch(
      () => this.DataStorePersisted.$state.location_data,
      (newData, oldData) => {
        this.checkoutAddress();
      }
    );
  },
  computed: {
    hasData() {
      if (Object.keys(this.data).length > 0) {
        return true;
      }
      return false;
    },
    hasDataLocationData() {
      if (this.location_data.formatted_address_pretty) {
        return true;
      }
      return false;
    },
  },
  methods: {
    checkoutAddress() {
      this.loading = true;
      APIinterface.fetchDataByTokenPost(
        "checkoutAddress",
        "place_id=" + this.DataStorePersisted.location_data.id
      )
        .then((data) => {
          this.data = data.details.data;
        })
        .catch((error) => {
          this.$emit("setError", error);
          this.data = [];
        })
        .then((data) => {
          this.loading = false;
        });
    },
    addInstructions() {
      this.$emit("addInstructions", {
        id: this.data.place_id,
        addressLine1: this.data.address.address1,
        description: this.data.address.formatted_address,
        latitude: this.data.latitude,
        longitude: this.data.longitude,
        attributes: this.data.attributes,
      });
    },
  },
};
</script>
