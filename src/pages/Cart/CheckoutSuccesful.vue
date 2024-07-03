<template>
  <q-header
    reveal
    :reveal-offset="50"
    :class="{
      'bg-mydark text-white': $q.dark.mode,
      'bg-white text-dark': !$q.dark.mode,
    }"
  >
    <q-toolbar>
      <q-btn
        round
        dense
        icon="close"
        unelevated
        :color="$q.dark.mode ? 'grey' : 'mygrey'"
        :text-color="$q.dark.mode ? 'grey-9' : 'dark'"
        replace="true"
        @click="Close"
      />
    </q-toolbar>
  </q-header>
  <q-page class="q-pl-md q-pr-md">
    <template v-if="CartData.order_loading">
      <q-inner-loading
        :showing="true"
        :color="$q.dark.mode ? 'grey300' : 'primary'"
      />
    </template>
    <template v-else>
      <div
        class="radius20 flex flex-center bg-mygrey card-small-height"
        :class="{
          'bg-grey600 ': $q.dark.mode,
          'bg-mygrey ': !$q.dark.mode,
        }"
      >
        <div class="full-width text-center relative-position">
          <svg
            class="checkmark"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 52 52"
          >
            <circle
              class="checkmark__circle"
              cx="26"
              cy="26"
              r="25"
              fill="none"
            />
            <path
              class="checkmark__check"
              fill="none"
              d="M14.1 27.2l7.1 7.2 16.7-16.8"
            />
          </svg>
          <template v-if="CartData.hasOrderDetails">
            <!-- <pre>{{ CartData.order_data.order_info }}</pre> -->
            <div class="text-weight-medium text-body1">
              {{ $t("Order Number") }} #{{
                CartData.order_data.order_info.order_id
              }}
            </div>
            <div class="text-grey text-body2">
              {{ $t("Got your order") }}
              {{ CartData.order_data.order_info.customer_name }}!
            </div>
          </template>
        </div>
      </div>

      <q-space class="q-pa-sm"></q-space>

      <q-card class="no-shadow" bordered v-if="CartData.hasOrderDetails">
        <q-card-section>
          <!--<q-item class="q-pa-none q-mb-sm">
            <q-item-section>
              <q-item-label
                class="text-body1"
                :class="{ 'text-green': completed }"
              >
                {{ order_status }}
              </q-item-label>
              <q-item-label caption>{{ order_status_details }}</q-item-label>
            </q-item-section>
            <q-item-section
              v-if="!completed"
              side
              class="text-body2 text-weight-bold"
            >
              <template
                v-if="
                  CartData.order_data.estimation[
                    CartData.order_data.order_info.order_type
                  ]
                "
              >
                <template
                  v-if="
                    CartData.order_data.estimation[
                      CartData.order_data.order_info.order_type
                    ]
                  "
                >
                  {{
                    CartData.order_data.estimation[
                      CartData.order_data.order_info.order_type
                    ][CartData.order_data.charge_type].estimation
                  }}
                  mins
                </template>
              </template>

            </q-item-section>
          </q-item>-->

          <!--<template
            v-if="CartData.order_data.order_info.order_type == 'delivery'"
          >
            <template v-if="order_progress > 0">
              <q-linear-progress
                v-if="order_progress <= 3"
                indeterminate
                color="secondary"
              />
              <q-space class="q-pa-xs"></q-space>
            </template>
          </template>
          <template v-else>
            <template v-if="order_progress > 0">
              <q-linear-progress
                v-if="order_progress <= 2"
                indeterminate
                color="secondary"
              />
              <q-space class="q-pa-xs"></q-space>
            </template>
          </template>-->

          <!--<div
            class="q-pa-sm radius10"
            :class="{
              'bg-grey600 ': $q.dark.mode,
              'bg-mygrey ': !$q.dark.mode,
            }"
          >
            <template
              v-if="CartData.order_data.order_info.order_type == 'delivery'"
            >
              <q-stepper
                v-model="order_progress"
                ref="stepper"
                contracted
                animated
                flat
                class="bg-transparent"
                done-color="primary"
                active-color="primary"
                :inactive-color="$q.dark.mode ? 'grey300' : 'white'"
              >
                <q-step
                  :name="1"
                  icon="check"
                  active-icon="done_all"
                  done-icon="done_all"
                  :done-color="order_progress > 1 ? 'primary' : 'red'"
                  :done="order_progress > 1 || order_progress <= 0"
                >
                </q-step>
                <q-step
                  :name="2"
                  icon="restaurant"
                  active-icon="restaurant"
                  done-icon="restaurant"
                  :done-color="order_progress > 2 ? 'primary' : 'red'"
                  :done="order_progress > 2 || order_progress <= 0"
                >
                </q-step>
                <q-step
                  :name="3"
                  icon="directions_run"
                  active-icon="directions_run"
                  done-icon="directions_run"
                  :done-color="order_progress > 3 ? 'primary' : 'red'"
                  :done="order_progress > 3 || order_progress <= 0"
                >
                </q-step>
                <q-step
                  :name="4"
                  icon="flag"
                  active-icon="flag"
                  done-icon="flag"
                  :done-color="order_progress > 4 ? 'primary' : 'red'"
                  :done="order_progress > 4 || order_progress <= 0"
                >
                </q-step>
              </q-stepper>
            </template>
            <template v-else>
              <q-stepper
                v-model="order_progress"
                ref="stepper"
                contracted
                animated
                flat
                class="bg-transparent"
                done-color="primary"
                active-color="primary"
                inactive-color="white"
              >
                <q-step
                  :name="1"
                  icon="check"
                  active-icon="done_all"
                  done-icon="done_all"
                  :done-color="order_progress > 1 ? 'primary' : 'red'"
                  :done="order_progress > 1 || order_progress <= 0"
                >
                </q-step>
                <q-step
                  :name="2"
                  icon="restaurant"
                  active-icon="restaurant"
                  done-icon="restaurant"
                  :done-color="order_progress > 2 ? 'primary' : 'red'"
                  :done="order_progress > 2 || order_progress <= 0"
                >
                </q-step>
                <q-step
                  :name="3"
                  icon="flag"
                  active-icon="flag"
                  done-icon="flag"
                  :done-color="order_progress > 3 ? 'primary' : 'red'"
                  :done="order_progress > 3 || order_progress <= 0"
                >
                </q-step>
              </q-stepper>
            </template>
          </div>-->

          <q-space class="q-pa-xs"></q-space>

          <q-item>
            <q-item-section avatar>
              <q-img
                :src="CartData.order_data.merchant_info.url_logo"
                style="width: 50px; height: 50px"
                fit="contain"
                spinner-color="primary"
                spinner-size="xs"
                class="rounded-borders"
              ></q-img>
            </q-item-section>
            <q-item-section>
              <q-item-label class="text-weight-bold">{{
                CartData.order_data.merchant_info.restaurant_name
              }}</q-item-label>
              <q-item-label caption>
                {{ CartData.order_data.merchant_info.address }}
              </q-item-label>
            </q-item-section>
            <q-item-section side>
              <div class="column items-center justify-center q-gutter-y-sm">
                <div class="col">
                  <q-btn
                    round
                    color="primary"
                    icon="las la-phone"
                    unelevated
                    :href="
                      'tel:' + CartData.order_data.merchant_info.contact_phone
                    "
                    size="sm"
                  />
                </div>
                <div class="col">
                  <q-btn
                    round
                    color="blue"
                    icon="chat"
                    unelevated
                    size="sm"
                    @click="createChat"
                    :loading="loading_chat"
                  />
                </div>
              </div>
            </q-item-section>
          </q-item>

          <q-list dense>
            <q-expansion-item
              expand-separator
              :label="itemCount(parseInt(CartData.order_data.items_count))"
              :caption="
                $t('Total price') +
                ' ' +
                CartData.order_data.order_info.pretty_total
              "
            >
              <q-card class="text-weight-light">
                <q-card-section class="q-pa-none">
                  <q-list>
                    <template
                      v-for="items in CartData.order_data.items"
                      :key="items"
                    >
                      <div
                        class="radius10 q-mb-sm"
                        :class="{
                          'bg-grey600': $q.dark.mode,
                          'bg-secondary ': !$q.dark.mode,
                        }"
                      >
                        <q-item>
                          <!--<q-item-section avatar>
                            <q-img
                              :src="items.url_image"
                              style="width: 50px; height: 50px"
                              fit="cover"
                              spinner-color="primary"
                              spinner-size="xs"
                              class="rounded-borders"
                            ></q-img>
                          </q-item-section>-->
                          <q-item-section>
                            <q-item-label>
                              {{ items.qty }} x
                              <span v-html="items.item_code"></span> <span v-html="items.item_name"></span>
                              <template v-if="items.size_name">
                                (<span v-html="items.size_name"></span>)
                              </template>
                            </q-item-label>
                          </q-item-section>
                        </q-item>
                      </div>
                    </template>
                  </q-list>
                  <q-list bordered dense class="radius10 q-pt-xs q-pb-xs">
                    <q-item
                      v-for="summary in CartData.order_data.order_info.summary"
                      :key="summary"
                      class="item-normal-height"
                    >
                      <q-item-section
                        class="text-caption"
                        :class="
                          summary.type == 'total' ? 'text-weight-bold' : ''
                        "
                        >{{ summary.name }}</q-item-section
                      >
                      <q-item-section
                        side
                        class="text-caption"
                        :class="
                          summary.type == 'total' ? 'text-weight-bold' : ''
                        "
                      >
                        {{ summary.value }}
                      </q-item-section>
                    </q-item>
                  </q-list>
                </q-card-section>
              </q-card>
            </q-expansion-item>
          </q-list>
        </q-card-section>
      </q-card>
    </template>

    <ComponentsRealtime></ComponentsRealtime>
  </q-page>
</template>

<script>
import { userCartData } from "stores/CartData";
import { defineAsyncComponent } from "vue";
import FirebaseService from "src/api/FirebaseService";
import auth from "src/api/auth";
import { useSettingStore } from "stores/SettingStore";

export default {
  name: "CheckoutSuccesful",
  components: {
    ComponentsRealtime: defineAsyncComponent(() =>
      import("components/ComponentsRealtime.vue")
    ),
  },
  data() {
    return {
      dialog: true,
      step: 1,
      order_uuid: "",
      order_status: "",
      order_progress: -1,
      order_status_details: "",
      instructions: [],
      redirect: "",
      loading_chat: false,
      user_uuid: "",
      completed: false,
    };
  },
  setup(props) {
    const CartData = userCartData();
    const SettingStore = useSettingStore();
    return { CartData, SettingStore };
  },
  mounted() {
    this.order_uuid = this.$route.query.order_uuid;
    this.redirect = this.$route.query.redirect;
    this.CartData.getOrder(this.order_uuid);

    let user = auth.getUser();
    this.user_uuid = user.client_uuid;

    this.$watch(
      () => this.CartData.$state.order_data,
      (newData, oldData) => {
        this.order_progress = newData.progress.order_progress;
        this.order_status = newData.progress.order_status;
        this.order_status_details = newData.progress.order_status_details;
        this.instructions = newData.instructions;
        this.completed = newData.progress.completed;
      }
    );
  },
  watch: {
    SettingStore: {
      immediate: false,
      deep: true,
      handler(newValue, oldValue) {
        if (Object.keys(newValue.realtime_data).length > 0) {
          if (newValue.realtime_data.event == "event-tracking-order") {
            this.afterReceive(newValue.realtime_data.data);
          }
        }
      },
    },
  },
  methods: {
    Close() {
      console.log("Close", this.redirect);
      if (this.redirect == "back") {
        this.$router.back();
      } else {
        this.$router.replace("/home");
      }
    },
    afterReceive(data) {
      console.log("afterReceive", data);
      if (data.order_id !== this.CartData.order_data.order_info.order_id) {
        return false;
      }
      if (data.order_progress === 0) {
        this.order_progress = data.order_progress;
        this.order_status = data.order_status;
        this.order_status_details = data.order_status_details;
        this.completed = data.completed;
      } else if (data.order_progress === -1) {
        // do nothing
      } else {
        this.order_progress = data.order_progress;
        this.order_status = data.order_status;
        this.order_status_details = data.order_status_details;
        this.completed = data.completed;
      }
    },
    itemCount(count) {
      if (count > 1) {
        return count + " " + this.$t("items");
      }
      return count + " " + this.$t("item");
    },
    async createChat() {
      this.loading_chat = true;
      FirebaseService.createChatOrder(
        this.CartData.order_data.order_info.order_id,
        this.CartData.order_data.order_info.order_uuid,
        this.CartData.order_data.merchant_info.merchant_uuid,
        this.user_uuid
      )
        .then((documentId) => {
          this.$router.push({
            path: "/account/chat/conversation",
            query: { doc_id: documentId },
          });
        })
        .catch((error) => {
          APIinterface.notify("dark", error, "error", this.$q);
        })
        .then((data) => {
          this.loading_chat = false;
        });
    },
    //
  },
};
</script>
