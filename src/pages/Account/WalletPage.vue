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
          $t("Digital Wallet")
        }}</q-toolbar-title>

        <template v-if="page_ready">
          <q-btn
            v-if="SettingStore.settings_data.digitalwallet_enabled_topup"
            round
            dense
            icon="add"
            unelevated
            :color="$q.dark.mode ? 'grey' : 'primary'"
            :text-color="$q.dark.mode ? 'grey-9' : 'white'"
            @click="this.$refs.topup.dialog = true"
          />
        </template>
      </q-toolbar>
    </q-header>
    <q-page>
      <q-card flat>
        <q-card-section class="q-pt-none q-pb-none">
          <q-item>
            <q-item-section>
              <q-item-label class="text-weight-bold">
                <div class="text-weight-bold text-body1">
                  {{ $t("Available Balance") }}
                </div>
              </q-item-label>
              <q-item-label caption>
                {{ $t("Your wallet transaction history") }}
              </q-item-label>
            </q-item-section>
            <q-item-section side>
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
        <WalletBunos ref="bunos"></WalletBunos>

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
            <template v-if="!hasData && !loading">
              <div class="flex flex-center text-grey text-body2 card-form">
                {{ $t("No data available") }}
              </div>
            </template>
            <q-list separator>
              <template v-for="datas in getData" :key="datas">
                <template v-for="items in datas" :key="items.transaction_date">
                  <q-item>
                    <q-item-section>
                      <q-item-label>{{
                        items.transaction_description
                      }}</q-item-label>
                      <q-item-label caption>
                        {{ items.transaction_date }}
                      </q-item-label>
                    </q-item-section>
                    <q-item-section side>
                      <q-item-label
                        class="text-weight-bold"
                        :class="{
                          'text-green': items.transaction_type == 'credit',
                          'text-red': items.transaction_type == 'debit',
                        }"
                      >
                        {{ items.transaction_amount }}
                      </q-item-label>
                    </q-item-section>
                  </q-item>
                </template>
              </template>
            </q-list>
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

      <WalletTopupform
        ref="topup"
        @after-preparepayment="afterPreparepayment"
        @setPaymentcredentials="setPaymentcredentials"
      ></WalletTopupform>

      <PaymentComponents
        ref="payment_components"
        :payment_credentials="payment_credentials"
        @after-addpayment="afterAddpayment"
        @after-successfulpayment="afterSuccessfulpayment"
      ></PaymentComponents>

      <WalletTopupreceipt
        ref="receipt"
        :data="receipt_data"
        @after-receiptclose="afterReceiptclose"
      >
      </WalletTopupreceipt>
    </q-page>
  </q-pull-to-refresh>
</template>

<script>
import { useSettingStore } from "stores/SettingStore";
import APIinterface from "src/api/APIinterface";
import { defineAsyncComponent } from "vue";

export default {
  name: "WalletPage",
  components: {
    WalletBunos: defineAsyncComponent(() =>
      import("components/WalletBunos.vue")
    ),
    WalletTopupform: defineAsyncComponent(() =>
      import("components/WalletTopupform.vue")
    ),
    PaymentComponents: defineAsyncComponent(() =>
      import("components/PaymentComponents.vue")
    ),
    WalletTopupreceipt: defineAsyncComponent(() =>
      import("components/WalletTopupreceipt.vue")
    ),
  },
  setup() {
    const SettingStore = useSettingStore();
    return { SettingStore };
  },
  data() {
    return {
      data: [],
      loading: false,
      tab: "all",
      tabList: [
        {
          value: "all",
          label: this.$t("All"),
        },
        {
          value: "order",
          label: this.$t("Orders"),
        },
        {
          value: "refund",
          label: this.$t("Refunds"),
        },
        {
          value: "topup",
          label: this.$t("Top-ups"),
        },
        {
          value: "cashback",
          label: this.$t("Cashbacks"),
        },
        {
          value: "adjustment",
          label: this.$t("Adjustment"),
        },
      ],
      page: 0,
      is_refresh: undefined,
      balance: 0,
      loading_balance: true,
      receipt_data: [],
      payment_credentials: [],
      page_ready: false,
    };
  },
  mounted() {
    if (Object.keys(this.SettingStore.settings_data).length > 0) {
      if (this.SettingStore.settings_data.digitalwallet_enabled) {
        this.page_ready = true;
        this.getBalance();
      } else {
        this.$router.push("/home");
      }
    } else {
      this.$watch(
        () => this.SettingStore.$state.settings_data,
        (newData, oldData) => {
          this.page_ready = true;
          if (newData.digitalwallet_enabled) {
            this.getBalance();
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
    setPaymentcredentials(data) {
      this.payment_credentials = data;
    },
    async refresh(done) {
      await this.getBalance();
      this.resetPagination();
      this.$refs.bunos.getDiscount();
      done();
    },
    async getBalance() {
      this.loading_balance = true;
      APIinterface.fetchDataByTokenPost("getWalletBalance")
        .then((data) => {
          this.balance = data.details.total;
        })
        .catch((error) => {})
        .then((data) => {
          this.loading_balance = false;
        });
    },
    getTransactions(index, done) {
      this.loading = true;
      this.page = index;
      APIinterface.fetchDataByTokenPost(
        "getWalletTransaction",
        "page=" + index + "&transaction_type=" + this.tab
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
    afterPreparepayment(data) {
      try {
        this.$refs.payment_components.doPayments(data);
      } catch (error) {
        APIinterface.notify("dark", error, "error", this.$q);
      }
    },
    afterSuccessfulpayment(data) {
      this.receipt_data = data;
      this.$refs.topup.dialog = false;
      this.$refs.receipt.dialog = true;
    },
    afterReceiptclose() {
      this.getBalance();
      this.resetPagination();
    },
    afterCancelPayment(data) {
      if (!APIinterface.empty(data)) {
        APIinterface.notify("dark", data, "error", this.$q);
      }
    },
    closePayment() {
      this.$refs.topup.dialog = false;
    },
  },
};
</script>
