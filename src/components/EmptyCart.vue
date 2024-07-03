<template>
  <div class="q-pl-md q-pr-md q-pb-md card-small-large flex flex-center">
    <div class="text-center">
      <q-icon name="o_shopping_bag" size="70px" color="grey-3" />
      <div class="text-body1">
        {{ $t("Your cart is empty") }}
      </div>
      <div class="text-grey text-body2">
        {{ $t("pull down to refresh") }}
      </div>
      <q-space class="q-pa-md"></q-space>
      <q-btn
        color="primary"
        size="17px"
        rounded
        unelevated
        no-caps
        class="full-width"
        to="/menu"
        >{{ $t("Start ordering") }}</q-btn
      >
    </div>
  </div>
</template>

<script>
export default {
  name: "EmptyCart",
  setup() {
    return {};
  },
};
</script>
