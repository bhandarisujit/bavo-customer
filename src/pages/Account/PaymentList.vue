<template>
  <q-pull-to-refresh @refresh="refresh">
    <q-header
      class="bg-whitex"
      reveal
      :class="{
        'bg-mydark text-white': $q.dark.mode,
        'bg-white text-dark': !$q.dark.mode,
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
          $t("Payment Methods")
        }}</q-toolbar-title>
      </q-toolbar>
    </q-header>
    <q-page class="q-pa-md">
      <template v-if="loading">
        <template v-for="items in 5" :key="items">
          <q-skeleton
            height="40px"
            class="q-mb-sm"
            :class="{
              'bg-grey600': $q.dark.mode,
              'bg-mygrey': !$q.dark.mode,
            }"
          />
        </template>
        <q-space class="q-pa-md"></q-space>
        <template v-for="items in 5" :key="items">
          <q-skeleton
            height="40px"
            class="q-mb-sm"
            :class="{
              'bg-grey600': $q.dark.mode,
              'bg-mygrey': !$q.dark.mode,
            }"
          />
        </template>
      </template>
      <template v-else>
        <q-list separator>
          <q-item-label
            header
            class="text-weight-bold text-caption item-normal-height"
            style="padding: 5px 16px"
            >{{ $t("Currently Linked") }}</q-item-label
          >
          <template v-if="!hasData">
            <q-item>
              <q-item-section>
                <q-item-label caption>
                  {{ $t("You don't have link payment") }}
                </q-item-label>
              </q-item-section>
            </q-item>
          </template>
          <template v-else>
            <template v-for="items in data" :key="items">
              <q-item clickable tag="label" @click="showDetails(items)">
                <q-item-section avatar>
                  <template v-if="items.logo_type == 'icon'">
                    <div
                      class="rounded-borders"
                      style="padding: 1px 2px"
                      :class="
                        SettingStore.payment_icons[items.payment_code]
                          ? SettingStore.payment_icons[items.payment_code].bg
                          : 'bg-blue'
                      "
                    >
                      <q-icon
                        :name="
                          SettingStore.payment_icons[items.payment_code]
                            ? SettingStore.payment_icons[items.payment_code]
                                .icon
                            : 'credit_card'
                        "
                        size="sm"
                        color="white"
                      ></q-icon>
                    </div>
                  </template>
                  <template v-else>
                    <q-img
                      :src="items.logo_image"
                      fit="contain"
                      style="max-height: 40px; max-width: 40px"
                      spinner-size="sm"
                      spinner-color="primary"
                    ></q-img>
                  </template>
                </q-item-section>
                <q-item-section>
                  <q-item-label>{{ items.attr1 }}</q-item-label>
                  <q-item-label caption>{{ items.attr2 }}</q-item-label>
                </q-item-section>
                <q-item-section
                  v-if="default_payment_uuid == items.payment_uuid"
                >
                  <q-item-label>
                    <q-badge
                      color="grey-2"
                      text-color="dark"
                      :label="$t('Default')"
                    />
                  </q-item-label>
                </q-item-section>
                <q-item-section side>
                  <q-icon name="chevron_right" size="sm" color="grey"
                /></q-item-section>
              </q-item>
            </template>
          </template>
        </q-list>

        <q-separator class="q-mt-md q-mb-md"></q-separator>

        <q-list separator>
          <q-item-label
            header
            class="text-weight-bold text-caption item-normal-height"
            style="padding: 5px 16px"
            >{{ $t("Add Methods") }}</q-item-label
          >
          <template v-if="!hasPaymentList">
            <q-item>
              <q-item-section>
                <q-item-label caption>
                  {{ $t("No payment available") }}
                </q-item-label>
              </q-item-section>
            </q-item>
          </template>
          <template v-else>
            <template v-for="items in payment_list" :key="items">
              <q-item clickable @click="onSelectPayment(items)">
                <q-item-section avatar>
                  <template v-if="items.logo_type == 'icon'">
                    <div
                      class="rounded-borders"
                      style="padding: 1px 2px"
                      :class="
                        SettingStore.payment_icons[items.payment_code]
                          ? SettingStore.payment_icons[items.payment_code].bg
                          : 'bg-blue'
                      "
                    >
                      <q-icon
                        :name="
                          SettingStore.payment_icons[items.payment_code]
                            ? SettingStore.payment_icons[items.payment_code]
                                .icon
                            : 'credit_card'
                        "
                        size="sm"
                        color="white"
                      ></q-icon>
                    </div>
                  </template>
                  <template v-else>
                    <q-img
                      :src="items.logo_image"
                      fit="contain"
                      style="max-height: 40px; max-width: 40px"
                      spinner-size="sm"
                      spinner-color="primary"
                    ></q-img>
                  </template>
                </q-item-section>
                <q-item-section>
                  <q-item-label>{{ items.payment_name }}</q-item-label>
                </q-item-section>
                <q-item-section side>
                  <q-icon name="chevron_right" color="grey" />
                </q-item-section>
              </q-item>
            </template>
          </template>
        </q-list>
      </template>

      <LoaderDialog ref="loader_dialog"></LoaderDialog>

      <PaymentComponents
        ref="payment_components"
        :payment_credentials="payment_credentials"
        @after-addpayment="afterAddpayment"
      ></PaymentComponents>

      <PaymentDetails
        ref="payment_details"
        :data="payment_details"
        @after-delete="afterDelete"
      ></PaymentDetails>
    </q-page>
  </q-pull-to-refresh>
</template>

<script>
import APIinterface from "src/api/APIinterface";
import { useDataStorePersisted } from "stores/DataStorePersisted";
import { defineAsyncComponent } from "vue";
import { useSettingStore } from "stores/SettingStore";
import { useUserStore } from "stores/UserStore";

export default {
  name: "PaymentMethods",
  components: {
    LoaderDialog: defineAsyncComponent(() =>
      import("components/LoaderDialog.vue")
    ),
    PaymentComponents: defineAsyncComponent(() =>
      import("components/PaymentComponents.vue")
    ),
    PaymentDetails: defineAsyncComponent(() =>
      import("components/PaymentDetails.vue")
    ),
  },
  data() {
    return {
      modal: false,
      loading: false,
      data: [],
      payment_list: [],
      payment_credentials: [],
      default_payment_uuid: "",
      redirect: "",
      payment_details: [],
    };
  },
  setup() {
    const DataStorePersisted = useDataStorePersisted();
    const SettingStore = useSettingStore();
    const UserStore = useUserStore();
    return { DataStorePersisted, SettingStore, UserStore };
  },
  mounted() {
    this.redirect = this.$route.query.redirect;
    this.paymentListnew();
  },
  computed: {
    hasData() {
      if (Object.keys(this.data).length > 0) {
        return true;
      }
      return false;
    },
    hasPaymentList() {
      if (Object.keys(this.payment_list).length > 0) {
        return true;
      }
      return false;
    },
  },
  methods: {
    async paymentListnew() {
      this.loading = true;
      APIinterface.fetchDataByTokenPost(
        "MyPaymentsNew",
        "currency_code=" + this.DataStorePersisted.getUseCurrency()
      )
        .then((data) => {
          this.data = data.details.data;
          this.default_payment_uuid = data.details.default_payment_uuid;
          this.payment_list = data.details.payment_list;
          this.payment_credentials = data.details.credentials;
        })
        .catch((error) => {
          this.data = [];
        })
        .then((data) => {
          this.loading = false;
        });
    },
    async refresh(done) {
      this.$refs.loader_dialog.modal = true;
      APIinterface.fetchDataByTokenPost(
        "MyPaymentsNew",
        "currency_code=" + this.DataStorePersisted.getUseCurrency()
      )
        .then((data) => {
          this.data = data.details.data;
          this.default_payment_uuid = data.details.default_payment_uuid;
          this.payment_list = data.details.payment_list;
          this.payment_credentials = data.details.credentials;
        })
        .catch((error) => {
          this.data = [];
        })
        .then((data) => {
          this.$refs.loader_dialog.modal = false;
          if (!APIinterface.empty(done)) {
            done();
          }
        });
    },
    setDefaultPayment(data) {
      this.$refs.loader_dialog.modal = true;
      APIinterface.fetchDataByTokenPost(
        "setDefaultPayment",
        "payment_uuid=" + data.payment_uuid
      )
        .then((data) => {
          if (!APIinterface.empty(this.redirect)) {
            this.$router.replace(this.redirect);
          } else {
            this.refresh(null);
          }
        })
        .catch((error) => {
          APIinterface.notify("dark", error, "error_outline", this.$q);
        })
        .then((data) => {
          this.$refs.loader_dialog.modal = false;
        });
    },
    onSelectPayment(data) {
      console.log(this.$refs.payment_components);
      this.$refs.payment_components.onSelectPayment(data.payment_code);
    },
    afterAddpayment() {
      if (!APIinterface.empty(this.redirect)) {
        this.$router.replace(this.redirect);
      } else {
        this.refresh(null);
      }
    },
    showDetails(data) {
      console.log("showDetails", data);
      this.payment_details = data;
      this.$refs.payment_details.modal = true;
    },
    afterDelete() {
      console.log("afterDelete");
      this.refresh(null);
    },
  },
};
</script>
