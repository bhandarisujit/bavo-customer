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
          $t("Orders")
        }}</q-toolbar-title>
      </q-toolbar>
    </q-header>
    <q-page>
      <div class="q-pl-md q-pr-md q-pt-sm">
        <div
          class="border-dark-greyx q-pa-xs radius20 q-mb-md"
          :class="{
            'border-none bg-grey600': $q.dark.mode,
            'border-dark-grey': !$q.dark.mode,
          }"
        >
          <q-tabs
            v-model="DataStorePersisted.tab"
            dense
            class="text-grey"
            indicator-color="transparent"
            active-color="primary"
            align="justify"
            narrow-indicator
            no-caps
            @update:model-value="tabChange"
          >
            <template v-for="items in tabList" :key="items">
              <q-tab
                :name="items.value"
                :label="items.label"
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
                    <q-item clickable @click.stop="viewOrder(items)">
                      <q-item-section>
                        <q-item-label
                          :class="{
                            'text-grey300 ': $q.dark.mode,
                          }"
                        >
                          {{ items.order_id }}
                          <q-badge
                            rounded
                            :color="getColors"
                            :text-color="getTextColors"
                            >{{ items.status }}</q-badge
                          >
                        </q-item-label>
                        <q-item-label
                          caption
                          :class="{
                            'text-grey300 ': $q.dark.mode,
                          }"
                          >{{ items.date_created }}</q-item-label
                        >
                        <q-item-label
                          :class="{
                            'text-yellow-9': !$q.dark.mode,
                            'text-grey300': $q.dark.mode,
                          }"
                        >
                          {{ items.transaction_type }}
                        </q-item-label>
                      </q-item-section>
                      <q-item-section side top>
                        <q-item-label
                          class="text-weight-bold"
                          :class="{
                            'text-grey300 ': $q.dark.mode,
                          }"
                        >
                          {{ items.total }}
                        </q-item-label>
                      </q-item-section>
                    </q-item>
                    <q-item
                      class="item-normal-height q-mb-xs"
                      :class="{
                        'list-line-separator ': !$q.dark.mode,
                      }"
                    >
                      <q-item-section>
                        <q-item-label>
                          <template v-if="items.allowed_cancelled">
                            <q-btn
                              @click.stop="cancelOrder(items.order_uuid)"
                              flat
                              unelevated
                              no-caps
                              class="q-pl-none q-pr-sm"
                            >
                              <div class="flex items-center">
                                <div
                                  class="q-mr-sm text-body2 text-weight-light"
                                >
                                  {{ $t("Cancel") }}
                                </div>
                                <div
                                  class="radius20 bg-yellow-2 flex flex-center"
                                  style="width: 20px; height: 20px"
                                >
                                  <q-icon
                                    name="arrow_forward"
                                    class="text-yellow-9"
                                    size="16px"
                                  ></q-icon>
                                </div>
                              </div>
                            </q-btn>
                          </template>

                          <q-btn
                            @click.stop="orderAgain(items.order_uuid)"
                            flat
                            unelevated
                            no-caps
                            class="q-pl-none q-pr-sm"
                          >
                            <div class="flex items-center">
                              <div class="q-mr-sm text-body2 text-weight-light">
                                {{ $t("Reorder") }}
                              </div>
                              <div
                                class="radius20 bg-yellow-2 flex flex-center"
                                style="width: 20px; height: 20px"
                              >
                                <q-icon
                                  name="arrow_forward"
                                  class="text-yellow-9"
                                  size="16px"
                                ></q-icon>
                              </div>
                            </div>
                          </q-btn>

                          <template v-if="items.allowed_track">
                            <q-btn
                              flat
                              unelevated
                              no-caps
                              class="q-pl-none q-pr-sm"
                              :to="{
                                path: '/order/track',
                                query: {
                                  order_uuid: items.order_uuid,
                                  redirect: 'back',
                                },
                              }"
                            >
                              <div class="flex items-center">
                                <div
                                  class="q-mr-sm text-body2 text-weight-light"
                                >
                                  {{ $t("Track") }}
                                </div>
                                <div
                                  class="radius20 bg-yellow-2 flex flex-center"
                                  style="width: 20px; height: 20px"
                                >
                                  <q-icon
                                    name="arrow_forward"
                                    class="text-yellow-9"
                                    size="16px"
                                  ></q-icon>
                                </div>
                              </div>
                            </q-btn>
                          </template>

                          <!-- label-->
                        </q-item-label>
                      </q-item-section>
                      <q-item-section side v-if="items.is_reviews">
                        <div class="flex items-center">
                          <div>
                            <q-icon name="star" size="1.5em" color="yellow-9" />
                          </div>
                          <div class="text-caption">{{ items.ratings }}</div>
                        </div>
                      </q-item-section>
                    </q-item>
                    <template v-if="items.is_reviews"> </template>
                    <template v-else>
                      <q-item v-if="items.allowed_review">
                        <q-item-section avatar>
                          <q-item-label class="text-body2">{{
                            $t("Tap to rate")
                          }}</q-item-label>
                        </q-item-section>
                        <q-item-section>
                          <q-rating
                            :model-value="rate_value[items.order_uuid]"
                            size="2em"
                            :max="5"
                            color="grey-5"
                            color-selected="yellow-2"
                            class="q-mb-xs"
                            @update:model-value="
                              (v) => setRateValue(v, items.order_uuid)
                            "
                          />
                        </q-item-section>
                        <q-item-section side></q-item-section>
                      </q-item>
                    </template>
                  </template>
                </template>
              </q-list>
            </template>
            <template v-else>
              <template v-if="!loading">
                <div
                  class="card-small-medium flex flex-center text-body2 text-grey"
                >
                  <div>{{ $t("No orders yet") }}</div>
                </div>
              </template>
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

  <CancelOrder
    ref="cancel_order"
    @after-cancelorder="afterCancelorder"
  ></CancelOrder>

  <AddReview ref="review" @after-addreview="afterAddreview"></AddReview>
</template>

<script>
import { useSettingStore } from "stores/SettingStore";
import APIinterface from "src/api/APIinterface";
import { defineAsyncComponent } from "vue";
import { useDataStorePersisted } from "stores/DataStorePersisted";

export default {
  name: "OrdersList",
  components: {
    CancelOrder: defineAsyncComponent(() =>
      import("components/CancelOrder.vue")
    ),
    AddReview: defineAsyncComponent(() => import("components/AddReview.vue")),
  },
  setup() {
    const SettingStore = useSettingStore();
    const DataStorePersisted = useDataStorePersisted();
    return { SettingStore, DataStorePersisted };
  },
  data() {
    return {
      data: [],
      loading: false,
      tabList: [
        {
          value: "active",
          label: this.$t("Active"),
        },
        {
          value: "history",
          label: this.$t("History"),
        },
        {
          value: "cancel",
          label: this.$t("Cancel"),
        },
      ],
      page: 0,
      is_refresh: undefined,
      balance: 0,
      loading_balance: true,
      status_allowed_cancelled: [],
      status_allowed_review: [],
      rate_value: [],
    };
  },
  mounted() {},
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
    getColors() {
      if (this.DataStorePersisted.tab == "active") {
        return "cyan-1";
      } else if (this.DataStorePersisted.tab == "history") {
        return "green-1";
      } else if (this.DataStorePersisted.tab == "cancel") {
        return "red-1";
      }
      return false;
    },
    getTextColors() {
      if (this.DataStorePersisted.tab == "active") {
        return "cyan-9";
      } else if (this.DataStorePersisted.tab == "history") {
        return "green-9";
      } else if (this.DataStorePersisted.tab == "cancel") {
        return "red-9";
      }
      return false;
    },
  },
  methods: {
    async refresh(done) {
      this.resetPagination();
      done();
    },
    getTransactions(index, done) {
      this.loading = true;
      this.page = index;
      APIinterface.fetchDataByTokenPost(
        "orderHistory2",
        "page=" + index + "&group=" + this.DataStorePersisted.tab
      )
        .then((data) => {
          if (data.code == 1) {
            this.data.push(data.details.data);
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
    setRateValue(data, order_uuid) {
      console.log("data", data);
      console.log("order_uuid", order_uuid);
      this.$refs.review.order_uuid = order_uuid;
      this.$refs.review.rating_value = data;
      this.$refs.review.modal = true;
    },
    afterAddreview() {
      console.log("afterAddreview");
      this.resetPagination();
    },
    viewOrder(data) {
      console.log("viewOrder", data);
      this.$router.push({
        path: "/order/view",
        query: { order_uuid: data.order_uuid },
      });
    },
    cancelOrder(data) {
      console.log("cancelOrder", data);
      this.$refs.cancel_order.showModal(data);
    },
    orderAgain(data) {
      APIinterface.showLoadingBox("", this.$q);
      APIinterface.fetchDataByTokenPost("orderBuyAgain", {
        cart_uuid: APIinterface.getStorage("cart_uuid"),
        order_uuid: data,
      })
        .then((data) => {
          APIinterface.setStorage("cart_uuid", data.details.cart_uuid);
          this.$router.push("/cart");
        })
        .catch((error) => {
          APIinterface.notify("dark", error, "error_outline", this.$q);
        })
        .then((data) => {
          APIinterface.hideLoadingBox(this.$q);
        });
    },
    afterCancelorder() {
      this.resetPagination();
    },
    //
  },
};
</script>
