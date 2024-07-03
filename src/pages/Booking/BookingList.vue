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
        <q-toolbar-title class="text-weight-bold">{{
          $t("Bookings")
        }}</q-toolbar-title>
      </q-toolbar>
    </q-header>
    <q-page>
      <q-card flat>
        <q-card-section class="q-pt-none q-pb-none">
          <q-item>
            <q-item-section>
              <q-item-label class="text-weight-bold">
                <div class="text-weight-bold text-body1">
                  {{ $t("Total Bookings") }}
                </div>
              </q-item-label>
              <q-item-label caption>
                {{ $t("Your bookings reservations") }}
              </q-item-label>
            </q-item-section>
            <q-item-section side top>
              <q-item-label>
                <template v-if="loading_balance">
                  <q-circular-progress
                    indeterminate
                    rounded
                    size="25px"
                    color="primary"
                  />
                </template>
                <template v-else>
                  <div class="text-weight-bold text-yellow-9 text-h6">
                    {{ balance }}
                  </div>
                </template>
              </q-item-label>
            </q-item-section>
          </q-item>
        </q-card-section>
      </q-card>

      <div class="q-pl-md q-pr-md q-pt-sm">
        <div
          class="border-dark-greyx q-pa-xs radius20 q-mb-md"
          :class="{
            'border-none bg-grey600': $q.dark.mode,
            'border-dark-grey': !$q.dark.mode,
          }"
        >
          <q-tabs
            v-model="tab"
            dense
            class="text-grey"
            indicator-color="transparent"
            active-color="primary"
            align="justify"
            narrow-indicator
            no-caps
            @update:model-value="tabChange"
          >
            <template v-for="(items, index) in tabList" :key="items">
              <q-tab
                :name="index"
                :label="items"
                no-caps
                content-class="text-weight-500 "
              />
            </template>
          </q-tabs>
        </div>
      </div>

      <div class="q-pl-md q-pr-md q-pb-xl">
        <q-infinite-scroll ref="nscroll" @load="getTransactions" :offset="250">
          <template v-slot:default>
            <template v-if="hasData">
              <q-list separator>
                <template v-for="datas in getData" :key="datas">
                  <template
                    v-for="items in datas"
                    :key="items.transaction_date"
                  >
                    <q-item
                      clickable
                      :to="{
                        path: '/reservation/track',
                        query: {
                          id: items.reservation_uuid,
                        },
                      }"
                    >
                      <q-item-section v-if="merchant[items.merchant_id]" avatar>
                        <q-img
                          :src="merchant[items.merchant_id].url_logo"
                          style="width: 70px; height: 70px"
                          fit="cover"
                          loading="lazy"
                          spinner-color="primary"
                          spinner-size="xs"
                          class="rounded-borders"
                        ></q-img>
                      </q-item-section>
                      <q-item-section>
                        <q-item-label v-if="merchant[items.merchant_id]">
                          {{ merchant[items.merchant_id].restaurant_name }}
                        </q-item-label>
                        <q-item-label caption>{{
                          items.booking_id
                        }}</q-item-label>
                        <q-item-label caption>
                          {{ items.reservation_date_raw }}
                        </q-item-label>
                        <q-item-label>
                          <q-badge
                            rounded
                            :label="items.status"
                            class="q-pl-sm q-pr-sm"
                            :style="{
                              'background-color': `${items.status_color.background}`,
                              color: `${items.status_color.color}`,
                            }"
                          />
                        </q-item-label>
                      </q-item-section>
                      <q-item-section side>
                        <q-icon name="chevron_right" size="sm" color="grey" />
                      </q-item-section>
                    </q-item>
                  </template>
                </template>
              </q-list>
            </template>
            <template v-else>
              <div
                v-if="!loading"
                class="card-form flex flex-center text-body2 text-grey"
              >
                <div>{{ $t("No available data") }}</div>
              </div>
            </template>
          </template>

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
import { useSettingStore } from "stores/SettingStore";
import APIinterface from "src/api/APIinterface";

export default {
  name: "BookingList",
  setup() {
    const SettingStore = useSettingStore();
    return { SettingStore };
  },
  data() {
    return {
      data: [],
      loading: false,
      tab: "all",
      tabList: [],
      page: 0,
      is_refresh: undefined,
      balance: 0,
      loading_balance: true,
      merchant: [],
      table_list: [],
    };
  },
  mounted() {
    if (Object.keys(this.SettingStore.settings_data).length > 0) {
      if (this.SettingStore.settings_data.booking_enabled) {
        this.tabList = this.SettingStore.settings_data.booking_status_list;
        this.BookingSummary();
      } else {
        this.$router.push("/home");
      }
    } else {
      this.$watch(
        () => this.SettingStore.$state.settings_data,
        (newData, oldData) => {
          if (newData.booking_enabled) {
            this.tabList = this.SettingStore.settings_data.booking_status_list;
            this.BookingSummary();
          } else {
            this.$router.push("/home");
          }
        }
      );
    }
  },
  computed: {
    hasData() {
      if (this.data.length > 0) {
        return true;
      }
      return false;
    },
    getData() {
      return this.data;
    },
  },
  methods: {
    async refresh(done) {
      await this.BookingSummary();
      this.resetPagination();
      done();
    },
    async BookingSummary() {
      this.loading_balance = true;
      APIinterface.fetchDataPostTableToken("BookingSummary")
        .then((data) => {
          if (data.code == 1) {
            this.balance = data.details.summary.total_reservation;
          } else {
            this.balance = 0;
          }
        })
        .catch((error) => {})
        .then((data) => {
          this.loading_balance = false;
        });
    },
    getTransactions(index, done) {
      this.loading = true;
      this.page = index;
      APIinterface.fetchDataPostTableToken(
        "BookingList",
        "page=" +
          index +
          "&status=" +
          this.tab +
          "&merchant_id=" +
          this.SettingStore.settings_data.merchant_id
      )
        .then((data) => {
          if (data.code == 1) {
            this.data.push(data.details.data);
            this.merchant = data.details.merchant;
            this.table_list = data.details.table_list;

            if (data.details.end_results) {
              if (this.$refs.nscroll) {
                this.$refs.nscroll.stop();
              }
            }
          } else {
            if (this.$refs.nscroll) {
              this.$refs.nscroll.stop();
            }
          }
        })
        .catch((error) => {
          if (this.$refs.nscroll) {
            this.$refs.nscroll.stop();
          }
        })
        .then((data) => {
          this.loading = false;
          done();
          if (!APIinterface.empty(this.is_refresh)) {
            this.is_refresh();
          }
        });
    },
    tabChange() {
      this.resetPagination();
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
