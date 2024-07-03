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
          $t("Legal")
        }}</q-toolbar-title>
      </q-toolbar>
    </q-header>
    <q-page class="q-pt-md">
      <template v-if="SettingStore.loading">
        <q-inner-loading color="primary" showing="true"></q-inner-loading>
      </template>
      <template v-else>
        <q-list separator>
          <template
            v-for="(items, index) in SettingStore.settings_data.legal_menu"
            :key="items"
          >
            <q-item
              clickable
              :to="{
                path: 'legal/page',
                query: {
                  page_id: index,
                },
              }"
            >
              <q-item-label>{{ items }}</q-item-label>
            </q-item>
          </template>
        </q-list>
      </template>
    </q-page>
  </q-pull-to-refresh>
</template>

<script>
import { useSettingStore } from "stores/SettingStore";

export default {
  name: "LegalList",
  setup() {
    const SettingStore = useSettingStore();
    return { SettingStore };
  },
  methods: {
    async refresh(done) {
      await this.SettingStore.getSettings();
      done();
    },
  },
};
</script>
