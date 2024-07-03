<template>
  <q-page v-if="page_ready">
    <div class="fixed-full">
      <div class="relative-position">
        <MapComponents
          ref="maps"
          :lat="maps_config.default_lat"
          :lng="maps_config.default_lng"
          :zoom="maps_config.zoom"
          :keys="maps_config.key"
          class_map="map medium"
          :provider="maps_config.provider"
          :drag_marker="true"
          :detect_location="false"
          :marker="marker"
          @after-selectmap="afterSelectmap"
          @on-drag="onDrag"
        />
      </div>
    </div>
    <q-page-sticky position="top-left" :offset="[12, 8]">
      <q-btn
        @click="$router.back()"
        round
        dense
        icon="arrow_back"
        unelevated
        :color="$q.dark.mode ? 'white' : 'mygrey'"
        text-color="dark"
      />
    </q-page-sticky>
    <q-dialog
      v-model="modal"
      seamless
      persistent
      position="bottom"
      transition-show="fade"
    >
      <q-card
        :class="{
          'card-small-height': !edit_address,
          'card-small-large': edit_address,
        }"
      >
        <template v-if="edit_address">
          <q-card-section class="q-pb-sm">
            <SearchLocation
              ref="search_location"
              :detect_location="true"
              @after-results="afterResults"
              @on-clear="onClear"
              @when-close="whenClose"
              @locate-location="locateLocation"
              @clear-Error="clearError"
            />
            <div
              v-if="hasError"
              class="bg-red-2 q-pa-sm radius8 text-dark q-mt-sm"
            >
              {{ error_message }}
            </div>
          </q-card-section>
          <q-separator></q-separator>
          <template v-if="hasData">
            <q-list>
              <template v-for="items in data" :key="items">
                <q-item clickable @click="getLocationDetails(items)">
                  <q-item-section avatar>
                    <q-icon name="o_place" class="text-grey" />
                  </q-item-section>
                  <q-item-section> {{ items.description }} </q-item-section>
                </q-item>
              </template>
            </q-list>
          </template>
          <template v-else>
            <q-card-section
              class="flex flex-center text-center card-small-medium"
            >
              <div class="text-grey">
                {{ $t("Enter your address") }}
              </div>
            </q-card-section>
          </template>
        </template>
        <template v-else>
          <q-card-section
            :class="{ disabled: loading }"
            class="q-pl-none q-pr-none"
          >
            <q-item>
              <q-item-section
                top
                avatar
                style="min-width: auto; padding-right: 5px"
              >
                <q-icon name="o_location_on" color="primary" size="md"></q-icon>
              </q-item-section>
              <q-item-section>
                <q-item-label
                  class="text-weight-medium text-body2 ellipsis-3-lines"
                >
                  <template v-if="hasLocation">
                    {{ location_data.addressLine1 }}
                    {{ location_data.description }}
                  </template>
                  <template v-else>
                    {{ $t("Location details not available") }}
                  </template>
                </q-item-label>
              </q-item-section>
              <q-item-section side>
                <q-btn
                  @click="edit_address = !edit_address"
                  flat
                  icon="o_edit"
                  color="yellow-9"
                ></q-btn>
                <q-btn
                  @click="this.locateLocation"
                  flat
                  icon="my_location"
                  color="primary"
                ></q-btn>
              </q-item-section>
            </q-item>
            <q-separator class="q-mt-sm q-mb-md"></q-separator>
            <div class="q-pl-md q-pr-md">
              <q-btn
                color="primary"
                text-color="white"
                size="lg"
                rounded
                unelevated
                no-caps
                class="fit"
                :loading="loading"
                :disable="hasLocation ? false : true"
                @click="confirmLocation"
                >{{ $t("Confirm location") }}</q-btn
              >
            </div>
          </q-card-section>
        </template>
      </q-card>
    </q-dialog>

    <AddressDetails
      ref="address_details"
      @after-saveaddress="afterSaveaddress"
    ></AddressDetails>

    <OrderDetailsinfo ref="order_details" @after-savetrans="afterSavetrans">
    </OrderDetailsinfo>
  </q-page>
</template>

<script>
import { defineAsyncComponent } from "vue";
import { useSettingStore } from "stores/SettingStore";
import jwtDecode from "jwt-decode";
import APIinterface from "src/api/APIinterface";
import AppLocation from "src/api/AppLocation";
import { useDataStorePersisted } from "stores/DataStorePersisted";
import auth from "src/api/auth";

export default {
  name: "LocationPage",
  components: {
    MapComponents: defineAsyncComponent(() =>
      import("components/MapComponents.vue")
    ),
    SearchLocation: defineAsyncComponent(() =>
      import("components/SearchLocation.vue")
    ),
    AddressDetails: defineAsyncComponent(() =>
      import("components/AddressDetails.vue")
    ),
    OrderDetailsinfo: defineAsyncComponent(() =>
      import("components/OrderDetailsinfo.vue")
    ),
  },
  data() {
    return {
      loading: false,
      confirm_loading: false,
      modal: true,
      page_ready: false,
      maps_config: [],
      marker: [],
      edit_address: false,
      data: [],
      details:[],
      location_data: [],
      error_message: "",
      redirect: "",
      add_address: false,
      is_guest: false,
    };
  },
  setup() {
    const SettingStore = useSettingStore();
    const DataStorePersisted = useDataStorePersisted();
    return { SettingStore, DataStorePersisted };
  },
  mounted() {
    this.is_guest = !auth.authenticated();

    this.redirect = this.$route.query.redirect;
    this.add_address = this.$route.query.add_address;

    if (Object.keys(this.SettingStore.settings_data).length > 0) {
      this.page_ready = true;
      this.mapsConfig();
      setTimeout(() => {
        if (Object.keys(this.DataStorePersisted.location_data).length <= 0) {
          this.locateLocation();
        }
      }, 500);
    } else {
      this.$watch(
        () => this.SettingStore.$state.settings_data,
        (newData, oldData) => {
          this.page_ready = true;
          this.mapsConfig();
          setTimeout(() => {
            if (
              Object.keys(this.DataStorePersisted.location_data).length <= 0
            ) {
              this.locateLocation();
            }
          }, 500);
        }
      );
    }
  },
  computed: {
    hasError() {
      if (!APIinterface.empty(this.error_message)) {
        return true;
      }
      return false;
    },
    hasLocation() {
      if (Object.keys(this.location_data).length > 0) {
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
  },
  methods: {
    mapsConfig() {
      try {
        this.maps_config = jwtDecode(
          this.SettingStore.settings_data.maps_config
        );

        if (Object.keys(this.DataStorePersisted.location_data).length > 0) {
          this.location_data = {
            id: this.DataStorePersisted.location_data.id,
            addressLine1: this.DataStorePersisted.location_data.addressLine1,
            description: this.DataStorePersisted.location_data.description,
            latitude: this.DataStorePersisted.location_data.latitude,
            longitude: this.DataStorePersisted.location_data.longitude,
          };
          this.marker = [
            {
              id: 0,
              draggable: true,
              icon: this.maps_config.icon,
              lat: this.DataStorePersisted.location_data.latitude,
              lng: this.DataStorePersisted.location_data.longitude,
            },
          ];
        } else {
          this.marker = [
            {
              id: 0,
              draggable: true,
              icon: this.maps_config.icon,
              lat: this.maps_config.default_lat,
              lng: this.maps_config.default_lng,
            },
          ];
        }
      } catch (err) {
        console.log("err", err);
      }
    },
    locateLocation() {
      this.edit_address = false;
      if (this.$q.capacitor) {
        // DEVICE
        AppLocation.checkAccuracy()
          .then((data) => {
            AppLocation.getPosition()
              .then((data) => {
                this.loading = false;
                this.marker = [
                  {
                    id: 0,
                    draggable: true,
                    icon: this.maps_config.icon,
                    lat: data.lat,
                    lng: data.lng,
                  },
                ];
                this.afterSelectmap(data.lat, data.lng);
              })
              .catch((error) => {})
              .then((data) => {
                this.loading = false;
              });
          })
          .catch((error) => {})
          .then((data) => {
            //
          });
      } else {
        // BROWSER BASED
        if (navigator.geolocation) {
          this.loading = true;
          navigator.geolocation.getCurrentPosition(
            (data) => {
              this.loading = false;
              this.marker = [
                {
                  id: 0,
                  draggable: true,
                  icon: this.maps_config.icon,
                  lat: data.coords.latitude,
                  lng: data.coords.longitude,
                },
              ];
              this.afterSelectmap(data.coords.latitude, data.coords.longitude);
            },
            (error) => {
              this.loading = false;
              if (error.code === error.PERMISSION_DENIED) {
                this.error_message = this.$t("geolocation_permission");
                this.data = [];
              }
            }
          );
        }
      }
    },
    afterSelectmap(lat, lng) {
      APIinterface.fetchDataPost(
        "reverseGeocoding",
        "lat=" + lat + "&lng=" + lng
      )
        .then((data) => {
          if (data.code == 1) {
            if (data.details.data) {
              const addressData = data.details.data;
              console.log("addressData", addressData);
              if (addressData.address) {
                this.location_data = {
                  id: addressData.place_id,
                  addressLine1: addressData.address.address1,
                  description: addressData.address.formatted_address,
                  latitude: addressData.latitude,
                  longitude: addressData.longitude,
                };
              } else {
                this.location_data = [];
              }
            }
          }
        })
        .catch((error) => {
          console.debug(error);
        })
        .then((data) => {
          this.loading = false;
        });
    },
    onDrag(data) {
      console.log("onDrag", data);
      this.loading = data;
    },
    afterResults(data) {
      this.data = data.data;
      this.details = data.detail;
    },
    onClear() {
      console.log("onClear");
      this.data = [];
    },
    whenClose() {
      this.edit_address = false;
    },
    clearError() {
      this.error_message = "";
    },
    getLocationDetails(data) {
      this.whenClose();
      this.location_data = data;
      this.marker = [
        {
          id: 0,
          draggable: true,
          icon: this.maps_config.icon,
          lat: data.latitude,
          lng: data.longitude,
        },
      ];
    },
    confirmLocation() {
      console.log("is_guest", this.is_guest);
      if (this.is_guest) {
        this.$refs.order_details.modal = true;
      } else {
        this.$refs.address_details.location_data = this.location_data;
        if(this.details.address){
          this.$refs.address_details.location_data.street = this.details.address.street;
          this.$refs.address_details.location_data.house_number = this.details.address.house_number;
          this.$refs.address_details.location_data.postal_code = this.details.address.postal_code;
          this.$refs.address_details.location_data.city = this.details.address.city;
        }
        this.$refs.address_details.modal = true;
      }
    },
    afterSaveaddress(data) {
      console.log("afterSaveaddress", data);
      this.DataStorePersisted.location_data = data;
      this.$router.replace(this.redirect);
    },
    afterSavetrans() {
      console.log("afterSavetrans");
      this.DataStorePersisted.location_data = this.location_data;
      this.$router.replace(this.redirect);
    },
  },
};
</script>
