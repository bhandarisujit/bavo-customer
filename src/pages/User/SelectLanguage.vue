<template>
  <q-header class="bg-white" reveal>
    <q-toolbar>
      <q-toolbar-title class="text-weight-bold text-dark">{{
        $t("Select Language")
      }}</q-toolbar-title>
    </q-toolbar>
  </q-header>
  <q-page class="q-pa-md">
    <template v-if="!page_ready">
      <q-inner-loading :showing="true" color="primary"></q-inner-loading>
    </template>
    <template v-else>
      <q-list>
        <template
          v-for="items in SettingStore.settings_data.language_list.list"
          :key="items"
        >
          <q-item class="bg-mygrey radius10 q-mb-sm" clickable tag="label">
            <q-item-section avatar>
              <q-avatar square>
                <q-img :src="items.flag_url" style="max-height: 25px"></q-img>
              </q-avatar>
            </q-item-section>
            <q-item-section>
              <q-item-label class="text-weight-medium">{{
                items.title
              }}</q-item-label>
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

      <q-footer class="q-pa-md bg-white row q-gutter-sm">
        <q-btn
          color="dark"
          text-color="white"
          size="lg"
          rounded
          unelevated
          no-caps
          class="col"
          to="/welcome"
          >{{ $t("Skip") }}</q-btn
        >
        <q-btn
          color="primary"
          size="lg"
          rounded
          unelevated
          no-caps
          class="col"
          @click="setLanguage"
          >{{ $t("Save") }}</q-btn
        >
      </q-footer>
    </template>
  </q-page>
</template>

<script>
import { useI18n } from "vue-i18n";
import { api } from "boot/axios";
import APIinterface from "src/api/APIinterface";
import { useSettingStore } from "stores/SettingStore";
import { useDataStorePersisted } from "stores/DataStorePersisted";

export default {
  name: "SelectLanguage",
  data() {
    return {
      language: "",
      page_ready: false,
    };
  },
  setup() {
    const SettingStore = useSettingStore();
    const DataStorePersisted = useDataStorePersisted();
    return { SettingStore, DataStorePersisted };
  },
  mounted() {
    if (Object.keys(this.SettingStore.settings_data).length > 0) {
      this.page_ready = true;
    } else {
      this.$watch(
        () => this.SettingStore.$state.settings_data,
        (newData, oldData) => {
          this.page_ready = true;
        }
      );
    }
  },
  methods: {
    setLanguage() {
      this.DataStorePersisted.app_language = this.language;
      this.$i18n.locale = this.language;
      api.defaults.params = {};
      api.defaults.params["language"] = this.$i18n.locale;

      this.SettingStore.getSettings();
      APIinterface.setStorage("single_intro", 1);
      this.$router.push("/welcome");
    },
  },
};
</script>
