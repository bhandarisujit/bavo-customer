<template>
  <div class="relative-position">
    <q-list bordered dense class="rounded-borders q-pt-sm q-pb-sm q-mb-sm">
      <q-item clickable tag="label">
        <q-item-section avatar class="item-column-less">
          <q-avatar
            color="primary"
            text-color="white"
            icon="account_balance_wallet"
            size="md"
          />
        </q-item-section>
        <q-item-section>
          <q-item-label>
            <template v-if="loading">
              <q-skeleton
                recttype="type"
                :class="{
                  'bg-grey600': $q.dark.mode,
                  'bg-mygrey': !$q.dark.mode,
                }"
              />
            </template>
            <template v-else>
              {{ getData.balance }}
            </template>
          </q-item-label>
          <q-item-label caption>{{ $t("Use Wallet Balance") }}</q-item-label>
          <q-item-label caption v-if="message">
            <div
              class="q-pa-sm radius10 text-weight-thin"
              :class="{
                'bg-grey600 text-white': $q.dark.mode,
                ' bg-grey-2 text-dark': !$q.dark.mode,
              }"
            >
              {{ message }}
            </div>
          </q-item-label>
        </q-item-section>
        <q-item-section side>
          <q-checkbox
            v-model="use_wallet"
            val="1"
            color="yellow-9"
            :disable="!canUseWallet || loading_apply"
            @update:model-value="applyDigitalWallet"
          />
        </q-item-section>
      </q-item>
    </q-list>
    <q-inner-loading :showing="loading_apply" color="yellow-9" />
  </div>
</template>

<script>
import APIinterface from "src/api/APIinterface";
import { useDataStorePersisted } from "stores/DataStorePersisted";
import { userCartData } from "stores/CartData";

export default {
  name: "WalletComponents",
  props: ["cart_updated"],
  data() {
    return {
      use_wallet: false,
      data: [],
      loading: false,
      message: "",
      loading_apply: false,
    };
  },
  setup() {
    const DataStorePersisted = useDataStorePersisted();
    const CartData = userCartData();
    return { DataStorePersisted, CartData };
  },
  watch: {
    cart_updated(newval, oldval) {
      if (newval == false) {
        console.log("getCartWallet", 1);
        this.getCartWallet();
      }
    },
  },
  computed: {
    canUseWallet() {
      if (Object.keys(this.data).length > 0) {
        if (this.data.balance_raw > 0) {
          return true;
        }
      }
      return false;
    },
    getData() {
      return this.data;
    },
  },
  mounted() {
    if (Object.keys(this.CartData.cart_total).length > 0) {
      console.log("getCartWallet", 2);
      this.getCartWallet();
    } else {
      this.$watch(
        () => this.CartData.$state.cart_total,
        (newData, oldData) => {
          console.log("getCartWallet", 3);
          this.getCartWallet();
        }
      );
    }
  },
  methods: {
    getCartWallet() {
      this.loading = true;
      let amount_to_pay = !APIinterface.empty(this.CartData.cart_total)
        ? this.CartData.cart_total.raw
        : null;
      APIinterface.fetchDataByTokenPost(
        "getCartWallet",
        "cart_uuid=" +
          APIinterface.getStorage("cart_uuid") +
          "&currency_code=" +
          this.DataStorePersisted.getUseCurrency() +
          "&amount_to_pay=" +
          amount_to_pay
      )
        .then((data) => {
          this.data = data.details;
          this.use_wallet = data.details.use_wallet;
          if (this.use_wallet) {
            this.$emit("afterApplywallet", data.details.apply_wallet_data);
            if (data.details.apply_wallet_data.amount_due_raw > 0) {
              this.message = data.details.apply_wallet_data.message;
            }
          }
        })
        .catch((error) => {
          this.data = [];
          this.use_wallet = false;
        })
        .then((data) => {
          this.loading = false;
        });
    },
    applyDigitalWallet(data) {
      this.loading_apply = true;
      let use_wallet = data ? 1 : 0;
      let amount_to_pay = !APIinterface.empty(this.CartData.cart_total)
        ? this.CartData.cart_total.raw
        : null;
      APIinterface.fetchDataByTokenPost(
        "applyDigitalWallet",
        "cart_uuid=" +
          APIinterface.getStorage("cart_uuid") +
          "&currency_code=" +
          this.DataStorePersisted.getUseCurrency() +
          "&use_wallet=" +
          use_wallet +
          "&amount_to_pay=" +
          amount_to_pay
      )
        .then((data) => {
          if (use_wallet) {
            this.message = data.msg;
          } else {
            this.message = "";
          }
          this.$emit("afterApplywallet", data.details);
        })
        .catch((error) => {
          this.use_wallet = false;
          this.message = "";
          APIinterface.notify("dark", error, "error", this.$q);
        })
        .then((data) => {
          this.loading_apply = false;
        });
    },
  },
};
</script>
