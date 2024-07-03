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
        <q-toolbar-title class="text-weight-bold">
          <template v-if="hasData">
            {{ data.title }}
          </template>
        </q-toolbar-title>
      </q-toolbar>
    </q-header>
    <q-page
      class="q-pa-md"
      :class="{ 'flex flex-center': !hasData && !loading }"
    >
      <div class="text-body2">
        <span v-html="data.long_content"></span>
      </div>

      <div v-if="!hasData && !loading" class="full-width text-center">
        <q-icon name="history" size="70px" color="grey-3" />
        <div class="text-weight-medium font15">
          {{ $t("No available data") }}
        </div>
        <div class="text-grey font12">
          {{ $t("pull down to refresh") }}
        </div>
      </div>

      <q-inner-loading
        :showing="loading"
        :color="$q.dark.mode ? 'grey300' : 'primary'"
      />
    </q-page>
  </q-pull-to-refresh>
</template>

<script>
import APIinterface from "src/api/APIinterface";

export default {
  name: "GetPage",
  data() {
    return {
      data: [],
      loading: false,
      page_id: "",
    };
  },
  created() {
    this.page_id = this.$route.query.page_id;
    this.getPage(null);
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
      this.getPage(done);
    },
    getPage(done) {
      this.loading = true;
      APIinterface.fetchDataPost("getPage2", "page_id=" + this.page_id)
        .then((data) => {
          this.data = data.details;
        })
        .catch((error) => {
          this.data = [];
        })
        .then((data) => {
          this.loading = false;
          if (!APIinterface.empty(done)) {
            done();
          }
        });
    },
  },
};
</script>
