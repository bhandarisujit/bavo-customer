<template>
  <q-page v-if="page_ready" class="q-pl-md q-pr-md flex flex-center">
    <div class="full-width text-center">
      <q-img
        src="update.png"
        fit="fill"
        spinner-color="primary"
        style="max-width: 150px"
        loading="lazy"
      />
      <q-space class="q-pa-sm"></q-space>
      <div class="text-body1 text-weight-bold">
        {{
          $t("app_name_update", {
            app_name: app_name,
          })
        }}
      </div>
      <div class="text-caption">
        {{ $t("To continue to use the app, download the latest version") }}
      </div>
      <q-space class="q-pa-sm"></q-space>

      <q-btn
        :label="$t('Update')"
        no-caps
        target="_blank"
        size="17px"
        color="primary"
        unelevated
        rounded
        class="q-pl-lg q-pr-lg"
        :href="
          $q.platform.is.android
            ? this.SettingStore.settings_data.app_update.android_download_url
            : this.SettingStore.settings_data.app_update.ios_download_url
        "
      />
    </div>
  </q-page>
</template>

<script>
import { useSettingStore } from "stores/SettingStore";
import { App } from "@capacitor/app";

export default {
  name: "UpdateApp",
  data() {
    return {
      page_ready: false,
      app_name: "{{}}",
    };
  },
  setup(props) {
    const SettingStore = useSettingStore();
    return { SettingStore };
  },
  mounted() {
    if (this.$q.capacitor) {
      this.getApp();
    }
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
    async getApp() {
      let result = await App.getInfo();
      if (result) {
        this.app_name = result.name;
      }
    },
  },
};
</script>
