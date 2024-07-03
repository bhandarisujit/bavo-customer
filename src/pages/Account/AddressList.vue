<template>
  <q-pull-to-refresh @refresh="refresh">
    <q-header
      class="bg-whitex"
      reveal
      :class="{
        'bg-mydark text-white': $q.dark.mode,
        'bg-white text-black': !$q.dark.mode,
      }"
    >
      <q-toolbar>
        <q-btn
          @click="$router.back()"
          round
          dense
          icon="arrow_back"
          unelevated
          :color="$q.dark.mode ? 'grey' : 'mygrey'"
          :text-color="$q.dark.mode ? 'grey-9' : 'dark'"
        />
        <q-toolbar-title class="text-weight-bold text-darkx">{{
          $t("My address")
        }}</q-toolbar-title>
      </q-toolbar>
    </q-header>
    <q-page
      class="q-pa-md"
      :class="{
        'flex flex-center': !hasData && !loading,
        'bg-mydark text-white': $q.dark.mode,
        'bg-white text-dark': !$q.dark.mode,
      }"
    >
      <template v-if="first_loading">
        <q-inner-loading
          :showing="true"
          :color="$q.dark.mode ? 'grey300' : 'primary'"
        />
      </template>
      <template v-else>
        <template v-if="!hasData">
          <div class="text-center">
            <q-icon name="history" size="70px" color="grey-3" />
            <div class="text-weight-medium font15">
              {{ $t("You don't have any address yet") }}
            </div>
            <div class="text-grey font12">
              {{ $t("pull down to refresh") }}
            </div>
          </div>
        </template>
        <q-list v-else>
          <q-intersection once transition="scale">
            <template v-for="(items, item_index) in data" :key="items">
              <q-slide-item
                @right="(opt) => onRight(opt, index)"
                right-color="secondary"
                class="q-mb-sm radius20"
              >
                <template v-slot:right>
                  <div class="q-gutter-md">
                    <q-btn
                      round
                      color="primary"
                      text-color="dark"
                      icon="close"
                      unelevated
                      @click="closeSlide(index)"
                      :disable="loading"
                    />
                    <q-btn
                      round
                      color="red-2"
                      text-color="red-9"
                      icon="delete_outline"
                      unelevated
                      @click="removeItem(items, item_index)"
                      :loading="loading"
                    />
                  </div>
                </template>
                <q-item
                  @click="editAddress(items)"
                  class="radius10"
                  :class="{
                    'bg-grey600 text-grey300': $q.dark.mode,
                    'bg-mygrey text-dark': !$q.dark.mode,
                  }"
                  clickable
                >
                  <q-item-section avatar>
                    <q-icon name="o_pin_drop" size="md" color="grey-4"></q-icon>
                  </q-item-section>
                  <q-item-section>
                    <q-item-label class="text-body2 ellipsis-2-lines">{{
                      items.address.formatted_address_pretty
                    }}</q-item-label>
                    <q-item-label class="ellipsis text-body1" caption>
                      {{ items.attributes.company_name }}
                    </q-item-label>
                    <q-item-label class="ellipsis text-body1" caption>
                      {{ items.attributes.address_label }}
                    </q-item-label>
                  </q-item-section>
                  <q-item-section side>
                    <q-icon name="navigate_next" size="sm"></q-icon>
                  </q-item-section>
                </q-item>
              </q-slide-item>
            </template>
          </q-intersection>
        </q-list>

        <q-footer
          class="q-pa-md bg-whitex row q-col-gutter-xs"
          :class="{
            'bg-mydark ': $q.dark.mode,
            'bg-white ': !$q.dark.mode,
          }"
        >
          <q-btn
            color="primary"
            text-color="white"
            size="lg"
            rounded
            unelevated
            no-caps
            class="fit"
            :to="{
              path: '/location',
              query: { redirect: '/account/address-list', add_address: 1 },
            }"
            :loading="loading"
            >{{ $t("New address") }}</q-btn
          >
        </q-footer>
      </template>

      <AddressDetails
        ref="address_details"
        @after-saveaddress="afterSaveaddress"
      ></AddressDetails>
    </q-page>
  </q-pull-to-refresh>
</template>

<script>
import { defineAsyncComponent } from "vue";
import APIinterface from "src/api/APIinterface";

export default {
  name: "AddressList",
  components: {
    AddressDetails: defineAsyncComponent(() =>
      import("components/AddressDetails.vue")
    ),
  },
  data() {
    return {
      first_loading: true,
      loading: false,
      data: [],
      data_slide: [],
      refresh_done: undefined,
    };
  },
  created() {
    this.getAddresses();
  },
  computed: {
    hasData() {
      if (Object.keys(this.data).length > 0) {
        return true;
      }
      return false;
    },
  },
  methods: {
    refresh(done) {
      this.refresh_done = done;
      this.getAddresses();
    },
    afterSaveaddress() {
      this.getAddresses();
    },
    onRight(details, index) {
      this.data_slide[index] = details;
    },
    closeSlide(index) {
      console.log(index);
      if (this.data_slide[index]) {
        console.log(this.data_slide[index]);
        this.data_slide[index].reset();
      }
    },
    removeItem(items, index) {
      this.loading = true;
      APIinterface.fetchDataByTokenPost(
        "deleteAddress",
        "address_uuid=" + items.address_uuid
      )
        .then((data) => {
          this.data.splice(index, 1);
        })
        .catch((error) => {
          APIinterface.notify("dark", error, "error_outline", this.$q);
        })
        .then((data) => {
          this.loading = false;
        });
    },
    getAddresses() {
      if (!APIinterface.empty(this.refresh_done)) {
      } else {
        this.first_loading = true;
      }
      APIinterface.fetchDataByTokenPost("getAddresses")
        .then((data) => {
          this.data = data.details.data;
        })
        .catch((error) => {
          this.data = [];
        })
        .then((data) => {
          this.first_loading = false;
          if (!APIinterface.empty(this.refresh_done)) {
            this.refresh_done();
          }
        });
    },
    editAddress(data) {
      console.log("editAddress", data);
      this.$refs.address_details.location_data = {
        id: data.place_id,
        street: data.address.street,
        house_number: data.address.house_number,
        city: data.address.city,
        postal_code: data.address.postal_code,
        addressLine1: data.address.address1,
        description: data.address.formatted_address,
        latitude: data.latitude,
        longitude: data.longitude,
        attributes: data.attributes,
      };
      this.$refs.address_details.modal = true;
    },
  },
};
</script>
