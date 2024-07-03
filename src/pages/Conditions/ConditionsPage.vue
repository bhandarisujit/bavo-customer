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
          $t("Restaurant Terms & Conditions")
        }}</q-toolbar-title>
      </q-toolbar>
    </q-header>
    <q-page class="q-pa-md">
      <template v-if="UserStore.loading">
        <q-inner-loading
          :showing="UserStore.loading"
          :color="$q.dark.mode ? 'grey300' : 'primary'"
        />
      </template>
      <template v-else>
        <template v-if="hasData">
          <q-space class="q-pa-xs"></q-space>
          <div class="text-body2">
            <span
              v-html="getData.short_description"
              :class="{ 'ellipsis-3-lines': read_more }"
            ></span>
            <q-btn
              :label="read_more ? $t('read_more') : $t('read_less')"
              flat
              unelevated
              no-caps
              color="primary"
              style="min-height: auto"
              class="q-pa-none"
              @click="read_more = !read_more"
            />
          </div>
          <q-space class="q-pa-sm"></q-space>

          <div style="height: 200px">
            <grid-images :items="getGallery" />
          </div>
        </template>
      </template>

      <div class="q-pa-md"></div>
    </q-page>
  </q-pull-to-refresh>
</template>

<script>
import GiGridImages from "@chinhpd/vue3-grid-images";
import { useUserStore } from "stores/UserStore";

export default {
  name: "AboutPage",
  components: {
    "grid-images": GiGridImages,
  },
  setup(props) {
    const UserStore = useUserStore();
    return { UserStore };
  },
  data() {
    return {
      read_more: true,
    };
  },
  created() {
    this.getInfo();
  },
  computed: {
    hasData() {
      if (Object.keys(this.UserStore.agb_data_info).length > 0) {
        return true;
      }
      return false;
    },
    getData() {
      return this.UserStore.agb_data_info.data;
    },
  },
  methods: {
    getInfo() {
      this.UserStore.getAGBInfo(null);
    },
    refresh(done) {
      this.UserStore.getAGBInfo(done);
    },
  },
};
</script>
