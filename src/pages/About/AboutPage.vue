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
          $t("About Restaurant")
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
          <div class="text-weight-medium text-body1 line-normal">
            {{ $t("Few words about") }} {{ getData.restaurant_name }}
          </div>
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

          <div class="text-weight-medium text-body1 line-normal">
            {{ $t("Address") }}
          </div>
          <p class="q-ma-none text-body2">
            {{ getData.address }}
          </p>
          <q-btn
            color="red-2"
            text-color="red-9"
            unelevated
            :label="$t('Get directions')"
            no-caps
            style="min-height: auto"
            rounded
            :href="getData.map_direction"
            target="_blank"
          />
          <q-space class="q-pa-sm"></q-space>
          <div class="text-weight-medium text-body1 line-normal q-mb-sm">
            {{ $t("Opening hours") }}
          </div>
          <q-list bordered class="radius10">
            <q-expansion-item
              expand-separator
              :label="$t('Today')"
              :caption="openAt"
              class="q-pa-none"
            >
              <q-card class="text-weight-light">
                <q-card-section>
                  <div v-for="items in openHours" :key="items" class="row">
                    <div class="col text-capitalize text-caption">
                      {{ items.day }}
                    </div>
                    <div class="col text-caption">
                      {{ items.start_time }} - {{ items.end_time }}
                    </div>
                  </div>
                </q-card-section>
              </q-card>
            </q-expansion-item>
          </q-list>

          <q-space class="q-pa-sm"></q-space>
          <div class="text-weight-medium text-body1 line-normal q-mb-sm">
            {{ $t("Gallery") }}
          </div>
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
      if (Object.keys(this.UserStore.data_info).length > 0) {
        return true;
      }
      return false;
    },
    getData() {
      return this.UserStore.data_info.data;
    },
    openAt() {
      return this.UserStore.data_info.open_at;
    },
    openHours() {
      return this.UserStore.data_info.opening_hours;
    },
    getGallery() {
      let image = [];
      if (Object.keys(this.UserStore.data_info.gallery).length > 0) {
        Object.entries(this.UserStore.data_info.gallery).forEach(
          ([key, items]) => {
            image.push(items.image_url);
          }
        );
      }
      return image;
    },
  },
  methods: {
    getInfo() {
      this.UserStore.getInfo(null);
    },
    refresh(done) {
      this.UserStore.getInfo(done);
    },
  },
};
</script>
