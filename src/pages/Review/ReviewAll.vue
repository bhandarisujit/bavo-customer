<template>
  <q-pull-to-refresh @refresh="refresh">
    <q-header
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
        <q-toolbar-title class="text-weight-bold text-dark">{{
          $t("Reviews")
        }}</q-toolbar-title>
      </q-toolbar>
    </q-header>
    <q-page>
      <div class="q-pl-md q-pr-md q-pb-xl">
        <q-infinite-scroll ref="nscroll" @load="getReview" :offset="250">
          <q-list separator>
            <template v-for="items in data" :key="items">
              <q-item v-for="item in items" :key="item">
                <q-item-section avatar top>
                  <q-avatar>
                    <q-img
                      :src="item.url_image"
                      fit="contain"
                      spinner-color="primary"
                      spinner-size="xs"
                      placeholder-src="placeholder.png"
                      loading="lazy"
                    ></q-img>
                  </q-avatar>
                </q-item-section>
                <q-item-section>
                  <q-item-label class="text-weight-bold">
                    <template v-if="item.as_anonymous == '1'">
                      {{ item.hidden_fullname }}
                    </template>
                    <template v-else>
                      {{ item.fullname }}
                    </template>
                  </q-item-label>
                  <q-item-label caption>{{ item.date_created }}</q-item-label>
                  <q-item-label lines="3">
                    <span v-html="item.review"></span>
                  </q-item-label>
                </q-item-section>
              </q-item>
            </template>
          </q-list>

          <template v-slot:loading>
            <template v-if="page <= 1">
              <q-inner-loading :showing="true" color="primary" size="md" />
            </template>
            <div
              v-else-if="page > 1"
              class="row justify-center absolute-bottom"
            >
              <div class="q-pa-md flex flex-center">
                <div class="flex items-center q-gutter-x-sm">
                  <div>
                    <q-circular-progress
                      indeterminate
                      rounded
                      size="30px"
                      color="primary"
                    />
                  </div>
                  <div class="text-body2 text-grey">{{ $t("loading") }}</div>
                </div>
              </div>
            </div>
          </template>
        </q-infinite-scroll>
      </div>

      <template v-if="!loading">
        <template v-if="hasData">
          <template v-if="data_done && data.length >= 10">
            <div class="row justify-center q-my-sm">
              <p class="font12 text-grey">{{ $t("end of results") }}</p>
            </div>
          </template>
        </template>
        <template v-else>
          <div class="flex flex-center card-small-medium">
            <div class="full-width text-center">
              <q-icon name="history" size="70px" color="grey-3" />
              <div class="text-weight-medium font15">
                {{ $t("No reviews available") }}
              </div>
              <div class="text-grey font12">
                {{ $t("pull down to refresh") }}
              </div>
            </div>
          </div>
        </template>
      </template>

      <q-page-scroller
        position="bottom-right"
        :scroll-offset="150"
        :offset="[18, 18]"
      >
        <q-btn
          fab
          icon="keyboard_arrow_up"
          :color="$q.dark.mode ? 'grey' : 'grey-2'"
          :text-color="$q.dark.mode ? 'grey-9' : 'grey'"
          padding="xs"
        />
      </q-page-scroller>
    </q-page>
  </q-pull-to-refresh>
</template>

<script>
import APIinterface from "src/api/APIinterface";

export default {
  name: "ReviewAll",
  data() {
    return {
      loading: true,
      data: [],
      data_done: false,
      page: 0,
      is_refresh: undefined,
    };
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
      this.resetPagination();
      this.is_refresh = done;
    },
    getReview(index, done) {
      this.loading = true;
      APIinterface.fetchDataPost("getReview2", "page=" + index + "&rows=20")
        .then((data) => {
          this.page = index;
          this.data.push(data.details.data);
          if (data.details.end_results) {
            if (this.$refs.nscroll) {
              this.$refs.nscroll.stop();
            }
          }
        })
        .catch((error) => {
          this.data_done = true;
          if (!APIinterface.empty(this.$refs.nscroll)) {
            this.$refs.nscroll.stop();
          }
        })
        .then((data) => {
          done();
          this.loading = false;
          if (!APIinterface.empty(this.is_refresh)) {
            this.is_refresh();
          }
        });
    },
    resetPagination() {
      this.page = 0;
      this.data = [];
      this.$refs.nscroll.reset();
      this.$refs.nscroll.resume();
      this.$refs.nscroll.trigger();
    },
  },
};
</script>
