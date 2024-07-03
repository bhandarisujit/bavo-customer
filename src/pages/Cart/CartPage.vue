<template>
  <q-pull-to-refresh @refresh="refreshCart">
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
          $t("Your Order")
        }}</q-toolbar-title>
        <q-btn
          v-if="CartData.hasCart && !loading"
          round
          dense
          icon="o_delete"
          unelevated
          color="red-2"
          text-color="red-9"
          @click="confirmDeleteCart"
        />
      </q-toolbar>
    </q-header>
    <q-page>
      <template v-if="loading">
        <div class="q-pa-md">
          <template v-for="items in 3" :key="items">
            <q-skeleton
              height="50px"
              square
              class="radius10 q-mb-sm"
              :class="{
                'bg-grey600': $q.dark.mode,
                'bg-mygrey': !$q.dark.mode,
              }"
            />
          </template>

          <template v-for="items in 3" :key="items">
            <q-skeleton
              height="180px"
              square
              class="radius10 q-mb-sm"
              :class="{
                'bg-grey600': $q.dark.mode,
                'bg-mygrey': !$q.dark.mode,
              }"
            />
          </template>
        </div>
      </template>
      <template v-else>
        <template v-if="CartData.hasCart">
          <div class="q-pa-md">
            <div
              class="radius10 q-mb-sm"
              :class="{
                'bg-grey600 ': $q.dark.mode,
                'bg-mygrey ': !$q.dark.mode,
              }"
            >
              <q-item clickable @click="showOrderdetails">
                <q-item-section avatar>
                  <q-avatar
                    color="primary"
                    text-color="white"
                    icon="schedule"
                  />
                </q-item-section>
                <q-item-section>
                  <q-item-label caption>{{ $t("Order & Time") }}</q-item-label>
                  <q-item-label
                    >{{ SettingStore.getTransactionData.transaction }}
                  </q-item-label>
                  <q-item-label class="text-caption">
                    <template v-if="SettingStore.getTransactionData.time">
                      {{ SettingStore.getTransactionData.time }}
                    </template>
                    <template v-else>
                      {{ SettingStore.getTransactionData.date }}
                    </template>
                  </q-item-label>
                </q-item-section>
                <q-item-section side>
                  <q-icon name="chevron_right" color="grey" />
                </q-item-section>
              </q-item>
            </div>

            <div
              class="radius10 q-mb-sm"
              :class="{
                'bg-grey600 ': $q.dark.mode,
                'bg-mygrey ': !$q.dark.mode,
              }"
            >
              <q-item clickable @click="showAreadetails">
                <q-item-section avatar>
                  <q-avatar
                    color="primary"
                    text-color="white"
                    icon="las la-map-marker"
                  />
                </q-item-section>
                <q-item-section>
                  <q-item-label caption>{{ $t("Area") }}</q-item-label>
                  <q-item-label
                    >{{ DataStorePersisted.delivery_area.label }} {{ DataStorePersisted.delivery_postalcode }}
                  </q-item-label>
                </q-item-section>
                <q-item-section side>
                  <q-icon name="chevron_right" color="grey" />
                </q-item-section>
              </q-item>
            </div>

            <div
              v-if="
                SettingStore.getTransactionData.transaction_type == 'delivery'
              "
              class="radius10 q-mb-sm"
              :class="{
                'bg-grey600 ': $q.dark.mode,
                'bg-mygrey ': !$q.dark.mode,
              }"
            >
              <q-item clickable @click="changeAddress">
                <q-item-section avatar>
                  <q-avatar
                    color="primary"
                    text-color="white"
                    icon="las la-map-marker"
                  />
                </q-item-section>
                <q-item-section>
                  <q-item-label caption>{{
                    $t("Delivery address")
                  }}</q-item-label>
                  <template v-if="DataStorePersisted.hasRecentAddress">
                    <q-item-label>{{
                      DataStorePersisted.location_data.formatted_address_pretty
                    }}</q-item-label>
                  </template>
                  <template v-else>{{ $t("Select your address") }} </template>
                </q-item-section>
                <q-item-section side>
                  <q-icon name="chevron_right" color="grey" />
                </q-item-section>
              </q-item>
            </div>

            <CartAddressSummary
            ref="cart_address_summary"
            :loading=false
            :data="SettingStore.getTransactionData.transaction_type"
            :trans_type="SettingStore.getTransactionData.transaction_type"
            :ischeckout="false"
            @after-selectAddress="afterSelectAddress"
            @set-error="setError"
          ></CartAddressSummary>

            <template v-if="CartData.isCartError">
              <div
                class="bg-red-2 q-pa-sm radius8 text-dark q-mt-sm q-mb-sm radius10x rounded-borders line-one"
              >
                <template
                  v-for="errors in CartData.getCartErrors"
                  :key="errors"
                >
                  {{ errors }}<br />
                </template>
              </div>
            </template>

            <!-- CUTERY -->
            <div
              v-if="SettingStore.settings_data.enabled_include_utensils"
              class="radius10 q-mb-sm"
              :class="{
                'bg-grey600 ': $q.dark.mode,
                'bg-mygrey ': !$q.dark.mode,
              }"
            >
              <q-item clickable tag="label">
                <q-item-section avatar>
                  <q-avatar
                    color="primary"
                    text-color="white"
                    icon="restaurant"
                  />
                </q-item-section>
                <q-item-section>
                  <q-item-label caption>{{ $t("Cutlery") }} </q-item-label>
                  <q-item-label>{{
                    $t("Include utensils, napkins, etc.")
                  }}</q-item-label>
                </q-item-section>
                <q-item-section side>
                  <q-checkbox
                    v-model="DataStorePersisted.include_utensil"
                    size="lg"
                    checked-icon="check_box"
                    unchecked-icon="check_box"
                    color="yellow-9"
                  />
                </q-item-section>
              </q-item>
            </div>
            <!-- CUTERY -->
          </div>

          <ItemsListCart
            :cart_loading="CartData.cart_loading"
            :cart_uuid="CartData.cart_uuid"
            :cart_items="CartData.cart_items"
            :cart_subtotal="CartData.cart_subtotal"
            @after-updatecart="afterUpdatecart"
          >
          </ItemsListCart>

          <div class="q-pl-md q-pr-md q-mt-sm">
            <q-btn
              :label="$t('Add more items')"
              icon="add"
              :color="$q.dark.mode ? 'grey600' : 'primary'"
              :text-color="$q.dark.mode ? 'grey300' : 'white'"
              no-caps
              rounded
              unelevated
              to="/menu"
              size="md"
              class="full-width"
            ></q-btn>
          </div>

          <q-separator></q-separator>
          <div class="q-pl-md q-pr-md q-mt-sm q-pb-md">
            <SimilarItems
              ref="similar_items"
              @after-addtocart="afterUpdatecart"
              @on-itemView="onItemView"
              @after-itemhide="afterItemhide"
            >
            </SimilarItems>
          </div>
        </template>
        <template v-else> <EmptyCart></EmptyCart> </template>
      </template>
    </q-page>
    <q-footer
      v-if="!loading && CartData.hasCart && !item_viewed"
      class=""
      :class="{
        'bg-mydark text-white': $q.dark.mode,
        'bg-white text-black': !$q.dark.mode,
      }"
    >
      <q-separator></q-separator>
      <q-item>
        <q-item-section>
          <q-item-label class="text-weight-medium">{{
            $t("Total Price")
          }}</q-item-label>
          <q-item-label
            class="text-negativex text-weight-bold"
            :class="{
              'text-grey300': $q.dark.mode,
              'text-negative': !$q.dark.mode,
            }"
          >
            {{ CartData.getCartSubTotalValue }}</q-item-label
          >
        </q-item-section>
        <q-item-section>
          <q-btn
            v-if="!CartData.isCartError && (this.DataStorePersisted.location_data.street && this.DataStorePersisted.location_data.house_number)"
            v-close-popup
            unelevated
            rounded
            color="primary"
            text-color="white"
            no-caps
            class="full-width"
            :label="$t('Checkout')"
            size="17px"
            :loading="refresh"
            :to="{ path: '/checkout', query: { redirect: '/checkout' } }"
          >
          </q-btn>
          <q-btn
            v-if="CartData.isCartError || (!this.DataStorePersisted.location_data.street || !this.DataStorePersisted.location_data.house_number)"
            v-close-popup
            unelevated
            rounded
            color="primary"
            text-color="white"
            no-caps
            class="full-width"
            :label="$t('Checkout')"
            size="17px"
            :loading="refresh"
            :to="{ path: '/checkout', query: { redirect: '/checkout' } }"
            disable
          >
          </q-btn>
        </q-item-section>
      </q-item>
    </q-footer>
  </q-pull-to-refresh>

  <AddressQuickList
    ref="address_list"
    redirect="/cart"
    @after-selectaddress="afterSelectaddress"
  ></AddressQuickList>

  <OrderDetailsinfo ref="order_details_info" @after-savetrans="afterSavetrans">
  </OrderDetailsinfo>

  <OrderDetailsArea ref="order_details_area" @after-saveareatrans="afterSaveareatrans">
  </OrderDetailsArea>
</template>

<script>
import { defineAsyncComponent } from "vue";
import { userCartData } from "stores/CartData";
import APIinterface from "src/api/APIinterface";
import { useDataStorePersisted } from "stores/DataStorePersisted";
import { useSettingStore } from "stores/SettingStore";
import auth from "src/api/auth";

export default {
  name: "CartPage",
  components: {
    ItemsListCart: defineAsyncComponent(() =>
      import("components/ItemsListCart.vue")
    ),
    AddressQuickList: defineAsyncComponent(() =>
      import("components/AddressQuickList.vue")
    ),
    OrderDetailsinfo: defineAsyncComponent(() =>
      import("components/OrderDetailsinfo.vue")
    ),
    OrderDetailsArea: defineAsyncComponent(() =>
      import("components/OrderDetailsArea.vue")
    ),
    CartAddressSummary: defineAsyncComponent(() =>
      import("components/CartAddressSummary.vue")
    ),
    SimilarItems: defineAsyncComponent(() =>
      import("components/SimilarItems.vue")
    ),
    EmptyCart: defineAsyncComponent(() => import("components/EmptyCart.vue")),
  },
  data() {
    return {
      loading: true,
      refresh: false,
      payload: [
        "items",
        "subtotal",
        "distance_local",
        "items_count",
        "merchant_info",
      ],
      params: {},
      is_guest: false,
      item_viewed: false,
    };
  },
  setup() {
    const CartData = userCartData();
    const DataStorePersisted = useDataStorePersisted();
    const SettingStore = useSettingStore();
    return { CartData, DataStorePersisted, SettingStore };
  },
  mounted() {
    this.is_guest = auth.authenticated() ? false : true;

    this.params = {
      cart_uuid: APIinterface.getStorage("cart_uuid"),
      local_id: this.DataStorePersisted.location_data.id,
      payload: this.payload,
      currency_code: this.DataStorePersisted.getUseCurrency(),
    };

    this.Cart();

    if (Object.keys(this.SettingStore.settings_data).length > 0) {
      if (Object.keys(this.SettingStore.format_transaction_data).length <= 0) {
        this.SettingStore.formatTransaction();
      }
    } else {
      this.$watch(
        () => this.SettingStore.$state.settings_data,
        (newData, oldData) => {
          this.SettingStore.formatTransaction();
        }
      );
    }

    this.storeOpen();
  },
  methods: {
    onItemView() {
      console.log("onItemView");
      this.item_viewed = true;
    },
    afterItemhide() {
      console.log("afterItemhide");
      this.item_viewed = false;
    },
    storeOpen() {
      this.CartData.checkStoreOpen({
        whento_deliver: this.DataStorePersisted.whento_deliver,
        delivery_date: this.DataStorePersisted.delivery_date,
        delivery_time: this.DataStorePersisted.delivery_time_data,
      });
    },
    printTime() {
      var currentDate = new Date();
      var dateTimeString = currentDate.toLocaleString();
      console.log(dateTimeString);
    },
    async Cart() {
      this.loading = true;
      this.params.local_id = this.DataStorePersisted.location_data.id;
      this.params.area_id = this.DataStorePersisted.area_id;
      await this.CartData.getCart(this.params);
      this.loading = false;
    },
    async afterUpdatecart() {
      this.refresh = true;
      this.params.local_id = this.DataStorePersisted.location_data.id;
      await this.CartData.getCart(this.params);
      this.refresh = false;
    },
    async refreshCart(done) {
      this.refresh = true;
      this.params.local_id = this.DataStorePersisted.location_data.id;
      await this.CartData.getCart(this.params);
      this.refresh = false;
      done();
    },
    confirmDeleteCart() {
      this.$q
        .dialog({
          title: this.$t("Clear cart"),
          message: this.$t("Are your sure you want to clear your cart?"),
          cancel: true,
          persistent: true,
          ok: {
            unelevated: true,
            color: "primary",
            rounded: true,
            "text-color": "white",
            size: "md",
            label: this.$t("Yes clear cart"),
            "no-caps": true,
          },
          cancel: {
            unelevated: true,
            rounded: true,
            color: "grey-3",
            "text-color": "black",
            size: "md",
            label: this.$t("Cancel"),
            "no-caps": true,
          },
        })
        .onOk(() => {
          this.clearCart();
        })
        .onOk(() => {})
        .onCancel(() => {})
        .onDismiss(() => {});
    },
    async clearCart() {
      this.refresh = true;
      const result = await this.CartData.clearCart(this.params);
      this.refresh = false;
      this.afterUpdatecart();
      this.CartData.getCartCount();
    },
    changeAddress() {
      console.log("is_guest", this.is_guest);
      if (this.is_guest) {
        this.$router.push({ path: "/location", query: { redirect: "/cart" } });
      } else {
        this.$refs.address_list.modal = true;
      }
    },
    afterSelectaddress(data) {
      this.DataStorePersisted.location_data = data;
      this.SettingStore.formatTransaction();
      this.$refs.cart_address_summary.street = data.street;
      this.$refs.cart_address_summary.house_number = data.house_number;
      this.afterUpdatecart();
    },
    showOrderdetails() {
      this.$refs.order_details_info.modal = true;
    },
    showAreadetails() {
      this.$refs.order_details_area.modal = true;
    },
    afterSavetrans() {
      console.log("afterSavetrans");
      this.storeOpen();
    },
    afterSaveareatrans(){
      this.Cart();
    },
    setError(data) {
      this.CartData.error.push(data);
    },
  },
};
</script>
<style lang="scss">
.border-negative {
  border : 1px solid red;
}
</style>
