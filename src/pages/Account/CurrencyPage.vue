<template>
  <q-pull-to-refresh @refresh="refresh">
    <q-header
      reveal
      :class="{
        'bg-mydark text-white': $q.dark.mode,
        'bg-white text-dark': !$q.dark.mode,
      }"
      reveal-offset="10"
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
        <q-toolbar-title class="text-weight-bold">{{
          $t("Currency")
        }}</q-toolbar-title>
      </q-toolbar>
    </q-header>
    <q-page class="q-pa-md">
      <template v-if="loading">
        <div class="q-gutter-y-sm">
          <template v-for="items in 10" :key="items">
            <q-skeleton
              height="50px"
              square
              class="bg-mygreyx radius20"
              :class="{
                'bg-grey600': $q.dark.mode,
                'bg-mygrey': !$q.dark.mode,
              }"
            />
          </template>
        </div>
      </template>
      <template v-else>
        <q-list class="q-gutter-y-sm" dense>
          <template v-for="(items, code) in data" :key="items">
            <q-item
              class="radius20 bg-mygrey"
              clickable
              tag="label"
              :class="{
                'bg-grey600': $q.dark.mode,
                'bg-mygrey ': !$q.dark.mode,
              }"
            >
              <q-item-section>
                <q-item-label>{{ items }}</q-item-label>
              </q-item-section>
              <q-item-section side>
                <q-radio
                  v-model="currency_code"
                  :val="code"
                  color="yellow-9"
                  checked-icon="check_circle"
                  unchecked-icon="panorama_fish_eye"
                  size="lg"
                />
              </q-item-section>
            </q-item>
          </template>
        </q-list>

        <q-footer
          class="q-pa-md row q-col-gutter-xs"
          :class="{
            'bg-dark': $q.dark.mode,
            'bg-white text-dark': !$q.dark.mode,
          }"
        >
          <q-btn
            color="primary"
            size="lg"
            rounded
            unelevated
            no-caps
            class="full-width"
            @click="setCurrency"
            :loading="loading_submit"
            >{{ $t("Save") }}</q-btn
          >
        </q-footer>
      </template>
    </q-page>
  </q-pull-to-refresh>
</template>

<script>
import APIinterface from "src/api/APIinterface";
import { useSettingStore } from "stores/SettingStore";
import { useDataStorePersisted } from "stores/DataStorePersisted";

export default {
  name: "CurrencyPage",
  setup() {
    const SettingStore = useSettingStore();
    const DataStorePersisted = useDataStorePersisted();
    return { SettingStore, DataStorePersisted };
  },
  data() {
    return {
      loading: false,
      loading_submit: false,
      data: [],
      currency_code: "",
    };
  },
  mounted() {
    if (Object.keys(this.SettingStore.settings_data).length > 0) {
      this.getCurrencyList(false);
    } else {
      this.$watch(
        () => this.SettingStore.$state.settings_data,
        (newData, oldData) => {
          this.getCurrencyList(false);
        }
      );
    }
  },
  methods: {
    async refresh(done) {
      await this.getCurrencyList(done);
    },
    async getCurrencyList(refresh) {
      this.currency_code = this.DataStorePersisted.getUseCurrency();
      this.loading = refresh ? false : true;
      APIinterface.fetchDataPost(
        "getCurrencyList",
        "currency_code=" + this.DataStorePersisted.getUseCurrency()
      )
        .then((data) => {
          this.data = data.details.data;
        })
        .catch((error) => {})
        .then((data) => {
          this.loading = false;
          if (refresh) {
            refresh();
          }
        });
    },
    setCurrency() {
      this.DataStorePersisted.use_currency_code = this.currency_code;
      this.getCurrencySettings();
    },
    getCurrencySettings() {
      this.loading_submit = true;
      APIinterface.fetchDataPost(
        "getCurrencySettings",
        "currency_code=" + this.DataStorePersisted.getUseCurrency()
      )
        .then((data) => {
          this.SettingStore.settings_data.money_config = data.details;
          this.$router.replace("/account-menu");
        })
        .catch((error) => {})
        .then((data) => {
          this.loading_submit = false;
        });
    },
  },
};
</script>
