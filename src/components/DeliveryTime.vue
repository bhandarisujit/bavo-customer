<template>
  <q-dialog
    v-model="dialog"
    position="bottom"
    @show="onShow"
    @before-show="beforeShow"
    @before-hide="beforeHide"
  >
    <q-card>
      <q-card-section class="q-pa-none">
        <q-toolbar class="text-primary">
          <q-btn
            v-if="whento_deliver == 'now'"
            flat
            round
            dense
            icon="close"
            :color="$q.dark.mode ? 'grey300' : 'dark'"
            v-close-popup
          />
          <q-btn
            v-else
            round
            dense
            icon="arrow_back"
            unelevated
            :color="$q.dark.mode ? 'white' : 'mygrey'"
            text-color="dark"
            @click="whento_deliver = 'now'"
          />
          <q-toolbar-title
            class="font16 text-darkx"
            :class="{
              'text-grey300': $q.dark.mode,
              'text-dark': !$q.dark.mode,
            }"
            >{{ $t("Delivery Time") }}</q-toolbar-title
          >
        </q-toolbar>

        <div class="q-pl-md q-pr-md q-pb-md">
          <template v-if="whento_deliver == 'now'">
            <q-list v-if="hasData">
              <q-item
                v-for="items in data.delivery_option"
                :key="items"
                class="bg-mygreyx radius10 q-mb-sm"
                :class="{
                  'bg-grey600 ': $q.dark.mode,
                  'bg-mygrey ': !$q.dark.mode,
                }"
                clickable
                tag="label"
              >
                <q-item-section side>
                  <q-radio
                    v-model="whento_deliver"
                    :val="items.value"
                    size="xs"
                    checked-icon="fiber_manual_record"
                    unchecked-icon="fiber_manual_record"
                    @update:model-value="chooseWhen"
                  />
                </q-item-section>
                <q-item-section> {{ items.name }} </q-item-section>
              </q-item>
            </q-list>
            <q-space class="q-pa-lg"></q-space>
            <q-space class="q-pa-sm"></q-space>
          </template>
          <template v-else>
            <template v-if="CartData.deliverytimes_loading">
              <div class="text-center q-pa-xl">
                <q-spinner color="primary" size="3em" />
              </div>
            </template>
            <template v-else>
              <div
                class="border-dark-greyx q-pa-xs radius20"
                :class="{
                  'border-none': $q.dark.mode,
                  'border-dark-grey': !$q.dark.mode,
                }"
              >
                <swiper :slides-per-view="2.5" :space-between="10">
                  <template
                    v-for="items_date in CartData.delivery_date_list"
                    :key="items_date"
                  >
                    <swiper-slide>
                      <q-btn
                        no-caps
                        :color="
                          CartData.delivery_date == items_date.value
                            ? 'primary'
                            : 'white'
                        "
                        :text-color="
                          CartData.delivery_date == items_date.value
                            ? 'white'
                            : 'dark'
                        "
                        class="radius20 line-normal font12"
                        unelevated
                        @click="chooseDate(items_date.value)"
                      >
                        {{ items_date.label }}
                      </q-btn>
                    </swiper-slide>
                  </template>
                </swiper>
              </div>

              <q-space class="q-pa-sm"></q-space>
              <q-list class="q-list-small">
                <template
                  v-for="items_time in CartData.delivery_time_list"
                  :key="items_time"
                >
                  <q-item
                    tag="label"
                    class="bg-mygreyx radius10 q-mb-sm"
                    :class="{
                      'bg-grey600 text-grey300': $q.dark.mode,
                      'bg-mygrey': !$q.dark.mode,
                    }"
                    clickable
                  >
                    <q-item-section side>
                      <q-radio
                        v-model="CartData.delivery_time"
                        :val="items_time"
                        size="xs"
                        checked-icon="fiber_manual_record"
                        unchecked-icon="fiber_manual_record"
                      />
                    </q-item-section>
                    <q-item-section>{{ items_time.label }}</q-item-section>
                  </q-item>
                </template>
              </q-list>
            </template>
            <q-space class="q-pa-lg"></q-space>
            <q-space class="q-pa-sm"></q-space>
          </template>
        </div>
      </q-card-section>
    </q-card>
    <div
      class="fixed-bottom q-pa-md bg-whitex relative-position text-center"
      :class="{
        'bg-dark ': $q.dark.mode,
        'bg-white ': !$q.dark.mode,
      }"
    >
      <q-btn
        unelevated
        color="primary"
        :label="$t('Confirm')"
        class="radius20 fit"
        no-caps
        size="lg"
        @click="onConfirm"
        :loading="loading_confirm"
      />
    </div>
  </q-dialog>
</template>

<script>
import { Swiper, SwiperSlide } from "swiper/vue";
import "swiper/css";
import { userCartData } from "stores/CartData";
import APIinterface from "src/api/APIinterface";
import { useDataStorePersisted } from "stores/DataStorePersisted";

export default {
  name: "DeliveryTime",
  props: ["data", "loading", "whentoDeliver"],
  components: {
    Swiper,
    SwiperSlide,
  },
  setup(props) {
    const CartData = userCartData();
    const DataStorePersisted = useDataStorePersisted();
    return { CartData, DataStorePersisted };
  },
  data() {
    return {
      dialog: false,
      whento_deliver: "now",
      delivery_time: "",
      loading_confirm: false,
      payload: [
        "items",
        "merchant_info",
        "service_fee",
        "delivery_fee",
        "packaging",
        "tax",
        "tips",
        "checkout",
        "discount",
        "distance",
        "summary",
        "total",
        "items_count",
      ],
    };
  },
  updated() {
    //this.whento_deliver = this.whentoDeliver;
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
    showModal(data) {
      this.dialog = data;
    },
    onShow() {
      //
    },
    beforeShow() {
      //
    },
    beforeHide() {},
    chooseWhen(data) {
      console.log(data);
      if (data === "schedule") {
        this.CartData.getDeliveryTimes();
      }
    },
    chooseDate(data) {
      this.CartData.delivery_date = data;
      this.CartData.delivery_time_list = [];
      this.CartData.delivery_time = "";
      this.CartData.getTimeList(data);
    },
    onConfirm() {
      this.loading_confirm = true;
      let params = {
        cart_uuid: APIinterface.getStorage("cart_uuid"),
        delivery_date: this.CartData.delivery_date,
        delivery_time: this.CartData.delivery_time,
        whento_deliver: this.whento_deliver,
      };
      this.DataStorePersisted.delivery_datetime = {
        delivery_date: this.CartData.delivery_date,
        delivery_time: this.CartData.delivery_time,
        whento_deliver: this.whento_deliver,
      };
      APIinterface.fetchDataPost("saveTransactionInfo2", params)
        .then((data) => {
          this.dialog = false;
          this.$emit("afterSelecttime");
        })
        .catch((error) => {
          APIinterface.notify("dark", error, "error_outline", this.$q);
        })
        .then((data) => {
          this.loading_confirm = false;
        });
    },
  },
};
</script>
