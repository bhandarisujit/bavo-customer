<template>
  <!-- PAYMENTS COMPONENTS -->
  <PaydeliveryComponents
    ref="paydelivery"
    payment_code="paydelivery"
    :title="$t('Add Payment')"
    :label="{
      submit: this.$t('Saved'),
      notes: this.$t('Pay using different card'),
    }"
    :payment_credentials="payment_credentials"
    @after-addpayment="afterAddpayment"
  >
  </PaydeliveryComponents>

  <codComponents
    ref="cod"
    payment_code="cod"
    :title="$t('Add Cash On delivery')"
    :label="{
      submit: this.$t('Add Cash'),
      notes: this.$t(
        'Cash on Delivery or COD is a payment method that allows pay for the items you have ordered only when it gets delivered.'
      ),
    }"
    :payment_credentials="payment_credentials"
    @after-addpayment="afterAddpayment"
  />

  <ecComponents
    ref="ec"
    payment_code="ec"
    :title="$t('Add Ec')"
    :label="{
      submit: this.$t('Add Ec'),
      notes: this.$t(
        'Cash on Delivery or COD is a payment method that allows pay for the items you have ordered only when it gets delivered.'
      ),
    }"
    :payment_credentials="payment_credentials"
    @after-addpayment="afterAddpayment"
  />

  <ocrComponents
    ref="ocr"
    payment_code="ocr"
    :title="$t('Add Credit card')"
    :label="{
      submit: $t('Add Card'),
      notes: '',
    }"
    :payment_credentials="payment_credentials"
    @after-addpayment="afterAddpayment"
  />

  <BankComponents
    ref="bank"
    payment_code="bank"
    :title="$t('Add Bank Transfer')"
    :label="{
      submit: this.$t('Add Payment'),
      notes: this.$t('Pay using bank Transfer'),
    }"
    :payment_credentials="payment_credentials"
    @after-addpayment="afterAddpayment"
  />

  <PaypalComponents
    ref="paypal"
    payment_code="paypal"
    :title="$t('Add Paypal')"
    :label="{
      submit: this.$t('Add Paypal'),
      notes: this.$t('Pay using your paypal account'),
      payment_title: this.$t('Pay using Paypal'),
      payment_subtitle: this.$t(
        'You will re-direct to paypal account to login to your account.'
      ),
    }"
    :payment_credentials="payment_credentials"
    @after-addpayment="afterAddpayment"
    @after-successfulpayment="afterSuccessfulpayment"
  />

  <RazorpayComponents
    ref="razorpay"
    payment_code="razorpay"
    :title="$t('Add Razorpay')"
    :label="{
      submit: this.$t('Submit'),
      notes: this.$t('Pay using your Razorpay account'),
    }"
    :payment_credentials="payment_credentials"
    @after-addpayment="afterAddpayment"
    @after-successfulpayment="afterSuccessfulpayment"
  />

  <MercadopagoComponents
    ref="mercadopago"
    payment_code="mercadopago"
    :title="$t('Add Mercadopago')"
    :label="{
      submit: this.$t('Add Mercadopago'),
      notes: this.$t('Pay using your mercadopago account'),
    }"
    :payment_credentials="payment_credentials"
    @after-addpayment="afterAddpayment"
    @after-successfulpayment="afterSuccessfulpayment"
  />

  <StripeComponents
    ref="stripe"
    payment_code="stripe"
    :title="$t('Add Stripe')"
    :label="{
      submit: this.$t('Add Stripe'),
      notes: this.$t('Add your card account'),
    }"
    :payment_credentials="payment_credentials"
    @after-addpayment="afterAddpayment"
    @after-successfulpayment="afterSuccessfulpayment"
  />
  <!-- END PAYMENTS COMPONENTS -->
</template>

<script>
import { defineAsyncComponent } from "vue";
import APIinterface from "src/api/APIinterface";

export default {
  name: "PaymentComponents",
  props: ["payment_credentials"],
  components: {
    codComponents: defineAsyncComponent(() =>
      import("components/codComponents.vue")
    ),
    ecComponents: defineAsyncComponent(() =>
      import("components/ecComponents.vue")
    ),
    PaydeliveryComponents: defineAsyncComponent(() =>
      import("components/PaydeliveryComponents.vue")
    ),
    ocrComponents: defineAsyncComponent(() =>
      import("components/ocrComponents.vue")
    ),
    PaypalComponents: defineAsyncComponent(() =>
      import("components/PaypalComponents.vue")
    ),
    RazorpayComponents: defineAsyncComponent(() =>
      import("components/RazorpayComponents.vue")
    ),
    BankComponents: defineAsyncComponent(() =>
      import("components/BankComponents.vue")
    ),
    MercadopagoComponents: defineAsyncComponent(() =>
      import("components/MercadopagoComponents.vue")
    ),
    StripeComponents: defineAsyncComponent(() =>
      import("components/StripeComponents.vue")
    ),
  },
  setup() {
    return {};
  },
  methods: {
    onSelectPayment(payment_code) {
      try {
        this.$refs[payment_code].showPaymentForm();
      } catch (error) {
        APIinterface.notify("dark", error, "error_outline", this.$q);
      }
    },
    doPayment(data) {
      try {
        this.$refs[data.payment_code].PaymentRender(data);
      } catch (error) {
        APIinterface.notify("dark", error, "error_outline", this.$q);
      }
    },
    doPayments(data) {
      try {
        this.$refs[data.payment_code].Dopayment(data.data, data);
      } catch (error) {
        APIinterface.notify("dark", error, "error_outline", this.$q);
      }
    },
    afterAddpayment() {
      this.$emit("afterAddpayment");
    },
    afterSuccessfulpayment(data) {
      this.$emit("afterSuccessfulpayment", data);
    },
  },
};
</script>
