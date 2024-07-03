<template>
  <q-pull-to-refresh @refresh="refresh">
    <q-header
      class="bg-whitex"
      reveal
      :class="{
        'bg-mydark ': $q.dark.mode,
        'bg-white ': !$q.dark.mode,
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
        <q-toolbar-title
          class="text-weight-bold text-darkx"
          :class="{
            'text-white': $q.dark.mode,
            'text-dark': !$q.dark.mode,
          }"
          >{{ $t("Language") }}</q-toolbar-title
        >
      </q-toolbar>
    </q-header>
    <q-page class="q-pa-md">
      <template v-if="!SettingStore.loading">
        <q-list>
          <template
            v-for="items in SettingStore.settings_data.language_list.list"
            :key="items"
          >
            <q-item
              class="radius10 q-mb-sm"
              clickable
              tag="label"
              :class="{
                'bg-grey600': $q.dark.mode,
                'bg-mygrey ': !$q.dark.mode,
              }"
            >
              <q-item-section avatar>
                <q-avatar square>
                  <q-img
                    :src="items.flag_url"
                    style="max-height: 25px"
                    spinner-color="primary"
                    spinner-size="sm"
                  ></q-img>
                </q-avatar>
              </q-item-section>
              <q-item-section>
                <q-item-label
                  class="text-weight-medium text-darkx"
                  :class="{
                    'text-grey300': $q.dark.mode,
                    'text-dark': !$q.dark.mode,
                  }"
                  >{{ items.title }}</q-item-label
                >
                <q-item-label class="text-grey font12 ellipsis-2-lines"
                  >{{ items.description }}
                </q-item-label>
              </q-item-section>
              <q-item-section side>
                <q-radio
                  v-model="language"
                  :val="items.code"
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
            @click="setLanguage"
            >{{ $t("Save") }}</q-btn
          >
        </q-footer>
      </template>
      <template v-else>
        <q-inner-loading :showing="true" color="yellow-9" />
      </template>
    </q-page>
  </q-pull-to-refresh>
</template>

<script>
import { useDataStorePersisted } from "stores/DataStorePersisted";
import { useSettingStore } from "stores/SettingStore";
import { useI18n } from "vue-i18n";
import { api } from "boot/axios";
import { defineAsyncComponent } from "vue";

export default {
  name: "LanguagePage",
  data() {
    return {
      language: "",
    };
  },
  setup() {
    const SettingStore = useSettingStore();
    const DataStorePersisted = useDataStorePersisted();
    return { SettingStore, DataStorePersisted };
  },
  mounted() {
    this.language = this.DataStorePersisted.app_language;
  },
  methods: {
    async refresh(done) {
      await this.SettingStore.getSettings();
      done();
    },
    async setLanguage() {
      this.DataStorePersisted.app_language = this.language;
      this.$i18n.locale = this.language;
      api.defaults.params = {};
      api.defaults.params["language"] = this.$i18n.locale;

      this.setRTL();
      await this.SettingStore.getSettings();
      this.SettingStore.formatTransaction();
    },
    setRTL() {
      if (Object.keys(this.SettingStore.settings_data).length > 0) {
        Object.entries(
          this.SettingStore.settings_data.language_list.list
        ).forEach(([key, items]) => {
          if (this.language == items.code) {
            if (items.rtl == 1) {
              this.$q.lang.set({ rtl: true });
              this.DataStorePersisted.rtl = true;
            } else {
              this.$q.lang.set({ rtl: false });
              this.DataStorePersisted.rtl = false;
            }
          }
        });
      }
    },
  },
};
</script>
