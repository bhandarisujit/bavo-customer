<template>
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
        $t("Order Confirmation")
      }}</q-toolbar-title>
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
        <div class="q-pl-md q-pr-md q-pb-md">
          <!-- ORDER & TIME -->
          <div
            class="radius10 q-mb-sm"
            :class="{
              'bg-grey600 ': $q.dark.mode,
              'bg-mygrey ': !$q.dark.mode,
            }"
          >
            <q-item clickable @click="showOrderdetails">
              <q-item-section avatar class="item-column-less">
                <q-avatar
                  color="primary"
                  text-color="white"
                  icon="schedule"
                  size="md"
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
          <!-- ORDER & TIME -->

          <!-- TABLE BOOKING -->
          <template
            v-if="
              SettingStore.settings_data.booking_enabled &&
              SettingStore.getTransactionData.transaction_type == 'dinein'
            "
          >
            <BookingCheckout ref="booking"></BookingCheckout>
          </template>
          <!-- TABLE BOOKING -->

          <!-- ADDRESS -->
          <template
            v-if="
              SettingStore.getTransactionData.transaction_type == 'delivery'
            "
          >
            <CartAddress
              @change-address="changeAddress"
              @add-instructions="addInstructions"
              @set-error="setError"
            ></CartAddress>
          </template>
          <!-- ADDRESS -->

          <template v-if="CartData.isCartError">
            <div
              class="bg-red-2 q-pa-sm radius8 text-dark q-mt-sm q-mb-sm radius10x rounded-borders line-one"
            >
              <template v-for="errors in CartData.getCartErrors" :key="errors">
                {{ errors }}<br />
              </template>
            </div>
          </template>

          <!-- CONTACT PHONE -->
          <!-- <ContactPhone ref="contact_phone"></ContactPhone> -->
          <!-- CONTACT PHONE -->

          <!-- PROMO -->
          <PromoDiscount
            ref="promo"
            @after-applypromo="afterUpdatecart"
            @after-removepromo="afterUpdatecart"
          ></PromoDiscount>
          <!-- PROMO -->

          <!-- WALLET -->
          <!-- WALLET -->

          <!-- PAYMENT METHOD -->
          <PaymentMethod
            ref="payment_method"
            :cart_total="CartData.cart_total"
            @show-paymentmethod="showPaymentmethod"
            @set-paymentmethod="setPaymentmethod"
            redirect="/checkout"
            :wallet_data="wallet_data"
          ></PaymentMethod>
          <!-- PAYMENT METHOD -->

          <!-- POINTS DISCOUNT -->
          <!-- <PointsDiscount
            :settings="SettingStore.settings_data"
            @after-applypoints="afterUpdatecart"
          ></PointsDiscount> -->
          <!-- POINTS DISCOUNT -->

          <!-- TIPS -->
          <TipSelections
            :settings="SettingStore.settings_data"
            :transaction_type="DataStorePersisted.transaction_type"
            @on-applytips="onApplytips"
            @after-applytips="afterApplytips"
          ></TipSelections>
          <!-- TIPS -->

          <!-- ORDER SUMMARY -->
          <CartItemSummary
            :cart_loading="CartData.cart_loading"
            :cart_uuid="CartData.cart_uuid"
            :cart_items="CartData.cart_items"
            :cart_summary="CartData.cart_summary"
          ></CartItemSummary>
          <!-- ORDER SUMMARY -->

          <div class="text-caption q-mt-sm">
            {{ $t("By clicking")}} <span class="text-primary text-weight-medium">{{ $t('Place Order') }}</span> {{ $t("By completing this order, i agree to all") }}
            <span class="text-yellow-9 text-weight-medium">{{
              $t("terms & condition")
            }}</span>
          </div>
        </div>

        <!-- q-pa-md -->
      </template>
      <template v-else>
        <EmptyCart></EmptyCart>
      </template>
    </template>
  </q-page>

  <q-footer
    v-if="!loading && CartData.hasCart"
    :class="{
      'bg-mydark text-white': $q.dark.mode,
      'bg-white text-dark': !$q.dark.mode,
    }"
  >
    <q-separator></q-separator>
    <q-item>
      <q-item-section>
        <q-item-label class="text-weight-medium">{{
          $t("Total Price")
        }}</q-item-label>
        <q-item-label
          class="text-weight-bold"
          :class="{
            'text-grey300 ': $q.dark.mode,
            'text-negative': !$q.dark.mode,
          }"
        >
          {{ CartData.getCartTotal }}</q-item-label
        >
      </q-item-section>
      <q-item-section>
        <q-btn
          v-close-popup
          unelevated
          rounded
          color="primary"
          text-color="white"
          no-caps
          class="full-width"
          :label="$t('Place Order')"
          size="17px"
          :disable="CartData.isCartError || refresh"
          @click="PlaceOrder"
          :loading="loading_place"
        >
        </q-btn>
      </q-item-section>
    </q-item>
  </q-footer>

  <AddressQuickList
    ref="address_list"
    redirect="/checkout"
    @after-selectaddress="afterSelectaddress"
  ></AddressQuickList>

  <OrderDetailsinfo ref="order_details_info" @after-savetrans="afterSavetrans">
  </OrderDetailsinfo>

  <AddressDetails
    ref="address_details"
    @after-saveaddress="afterSaveaddress"
  ></AddressDetails>

  <PaymentComponents
    ref="payment_components"
    :payment_credentials="payment_credentials"
    @after-addpayment="afterAddpayment"
    @after-successfulpayment="afterSuccessfulpayment"
  ></PaymentComponents>

  <LoaderDialog ref="loader_dialog"></LoaderDialog>
</template>

<script>
import { defineAsyncComponent } from "vue";
import APIinterface from "src/api/APIinterface";
import { userCartData } from "stores/CartData";
import { useDataStorePersisted } from "stores/DataStorePersisted";
import { useUserStore } from "stores/UserStore";
import { useSettingStore } from "stores/SettingStore";

export default {
  name: "CheckoutPage",
  components: {
    // ContactPhone: defineAsyncComponent(() =>
    //   import("components/ContactPhone.vue")
    // ),
    CartAddress: defineAsyncComponent(() =>
      import("components/CartAddress.vue")
    ),
    AddressQuickList: defineAsyncComponent(() =>
      import("components/AddressQuickList.vue")
    ),
    OrderDetailsinfo: defineAsyncComponent(() =>
      import("components/OrderDetailsinfo.vue")
    ),
    PromoDiscount: defineAsyncComponent(() =>
      import("components/PromoDiscount.vue")
    ),
    CartItemSummary: defineAsyncComponent(() =>
      import("components/CartItemSummary.vue")
    ),
    PaymentMethod: defineAsyncComponent(() =>
      import("components/PaymentMethod.vue")
    ),
    TipSelections: defineAsyncComponent(() =>
      import("components/TipSelections.vue")
    ),
    /*PointsDiscount: defineAsyncComponent(() =>
      import("components/PointsDiscount.vue")
    ),*/
    AddressDetails: defineAsyncComponent(() =>
      import("components/AddressDetails.vue")
    ),
    LoaderDialog: defineAsyncComponent(() =>
      import("components/LoaderDialog.vue")
    ),
    EmptyCart: defineAsyncComponent(() => import("components/EmptyCart.vue")),
    PaymentComponents: defineAsyncComponent(() =>
      import("components/PaymentComponents.vue")
    ),
    BookingCheckout: defineAsyncComponent(() =>
      import("components/BookingCheckout.vue")
    ),
  },
  data() {
    return {
      loading: true,
      refresh: false,
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
        "distance_local",
        "summary",
        "total",
        "items_count",
        "points",
        "points_discount",
      ],
      params: {},
      payment_uuid: "",
      payment_code: "",
      payment_credentials: [],
      wallet_data: [],
      loading_place: false,
    };
  },
  setup() {
    const CartData = userCartData();
    const DataStorePersisted = useDataStorePersisted();
    const SettingStore = useSettingStore();
    return { CartData, DataStorePersisted, SettingStore };
  },
  mounted() {
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
    storeOpen() {
      this.CartData.checkStoreOpen({
        whento_deliver: this.DataStorePersisted.whento_deliver,
        delivery_date: this.DataStorePersisted.delivery_date,
        delivery_time: this.DataStorePersisted.delivery_time_data,
      });
    },
    async Cart() {
      this.loading = true;
      this.params.local_id = this.DataStorePersisted.location_data.id;
      this.params.area_id = this.DataStorePersisted.area_id;
      await this.CartData.getCartCheckout(this.params);
      this.loading = false;
    },
    async afterUpdatecart() {
      this.refresh = true;
      this.$refs.loader_dialog.modal = true;
      this.params.local_id = this.DataStorePersisted.location_data.id;
      await this.CartData.getCartCheckout(this.params);
      this.refresh = false;
      this.$refs.loader_dialog.modal = false;
    },
    changeAddress() {
      this.$refs.address_list.modal = true;
    },
    afterSelectaddress(data) {
      console.log("afterSelectaddress");
      this.DataStorePersisted.location_data = data;
      this.SettingStore.formatTransaction();
      this.afterUpdatecart();
    },
    showOrderdetails() {
      this.$refs.order_details_info.modal = true;
    },
    afterSavetrans() {
      console.log("afterSavetrans");
      this.afterUpdatecart();
      this.storeOpen();
    },
    addInstructions(data) {
      this.$refs.address_details.location_data = data;
      this.$refs.address_details.modal = true;
    },
    afterSaveaddress(data) {
      console.log("afterSaveaddress", data);
      this.DataStorePersisted.location_data = data;
      this.afterUpdatecart();
    },
    afterApplytips() {
      console.log("afterApplytips");
      this.afterUpdatecart();
    },
    showPaymentmethod() {
      this.$refs.payment_list.modal = true;
    },
    setPaymentmethod(payment) {
      this.payment_uuid = payment.data.payment_uuid;
      this.payment_code = payment.data.payment_code;
      this.payment_credentials = payment.payment_credentials;
    },
    PlaceOrder() {
      const attributes_data = {
        whento_deliver: this.DataStorePersisted.whento_deliver,
        delivery_date: this.DataStorePersisted.delivery_date,
        delivery_time: this.DataStorePersisted.delivery_time_data,
      };
      const params = {
        cart_uuid: APIinterface.getStorage("cart_uuid"),
        local_id: this.DataStorePersisted.location_data.id,
        area_id: this.DataStorePersisted.area_id,
        include_utensils: this.DataStorePersisted.include_utensil,
        payment_uuid: this.payment_uuid,
        payment_change: parseFloat(this.$refs.payment_method.payment_change),
        use_digital_wallet: this.$refs.digital_wallet
          ? this.$refs.digital_wallet.use_wallet
          : "",
        guest_number: this.$refs.booking ? this.$refs.booking.guest_number : 0,
        room_uuid: this.$refs.booking ? this.$refs.booking.room_uuid : "",
        table_uuid: this.$refs.booking ? this.$refs.booking.table_uuid : "",
        currency_code: this.DataStorePersisted.getUseCurrency(),
        attributes_data: attributes_data,
        transaction_type: this.DataStorePersisted.transaction_type,
        street: this.DataStorePersisted.location_data.street,
        house_number: this.DataStorePersisted.location_data.house_number,
        city: this.DataStorePersisted.location_data.city,
        postal_code: this.DataStorePersisted.location_data.postal_code,
        location_name: this.DataStorePersisted.location_name ? this.DataStorePersisted.location_data.location_name : '',
        company_name: this.DataStorePersisted.company_name ? this.DataStorePersisted.location_data.company_name : '',
        delivery_instructions: this.DataStorePersisted.location_data.delivery_instructions,
      };
      this.loading_place = true;
      this.$refs.loader_dialog.modal = true;
      APIinterface.fetchDataByTokenPost("PlaceOrder", params)
        .then((data) => {
          if (data.details.payment_instructions.method === "offline") {
            this.resetCart();
            this.$router.replace({
              path: "/checkout/successful",
              query: { order_uuid: data.details.order_uuid },
            });
          } else {
            this.doPayment(data.details);
          }
        })
        .catch((error) => {
          APIinterface.notify("dark", error, "error_outline", this.$q);
        })
        .then((data) => {
          this.loading_place = false;
          this.$refs.loader_dialog.modal = false;
        });
    },
    doPayment(data) {
      this.$refs.payment_components.doPayment(data);
    },
    afterSuccessfulpayment(data) {
      this.resetCart();
      this.$router.replace({
        path: "/checkout/successful",
        query: { order_uuid: data.order_uuid },
      });
    },
    resetCart() {
      //this.DataStorePersisted.whento_deliver = "";
      this.DataStorePersisted.delivery_date = "";
      this.DataStorePersisted.delivery_time_data = "";
    },
    setError(data) {
      this.CartData.error.push(data);
    },
    afterApplywallet(data) {
      this.wallet_data = data;
    },
  },
};
</script>
