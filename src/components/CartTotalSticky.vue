<template>
  <q-btn
    round
    :color="$q.dark.mode ? 'grey600' : 'primary'"
    icon="shopping_bag"
    to="/cart"
  >
  <template v-if="!CartData.cartcount_loading && !CartData.home_view_items">
      <q-footer
        v-if="CartData.cartcount_data.items_count > 0"
        class="q-pl-md q-pr-md q-pt-sm q-pb-sm"
        :class="{
          'bg-mydark text-white': $q.dark.mode,
          'bg-white text-dark': !$q.dark.mode,
        }"
      >
        <q-intersection once transition="scale" class="example-item">
          <q-btn
            color="primary"
            text-color="white"
            unelevated
            no-caps
            class="fit"
            size="lg"
            rounded
            to="/cart"
          >
            <div class="fit flex items-center justify-around">
              <div class="text-body1 text-weight-medium">
                {{ $t("View cart") }} &#x2022;
              </div>
              <div class="text-body2 text-weight-light">
                <template v-if="CartData.cartcount_data.items_count > 1">
                  {{ CartData.cartcount_data.items_count }} {{ $t("items") }}
                </template>
                <template v-else>
                  {{ CartData.cartcount_data.items_count }} {{ $t("item") }}
                </template>
              </div>
              <div class="text-body1 text-weight-medium">
                {{ CartData.cartcount_data.subtotal.value }}
              </div>
            </div>
          </q-btn>
        </q-intersection>
      </q-footer>
    </template>

    <!--<template v-if="!CartData.cartcount_loading">
      <q-badge
        v-if="CartData.cartcount_data.items_count > 0"
        color="red-5"
        rounded
        floating
      >
        {{ CartData.cartcount_data.items_count }}
      </q-badge>
    </template>-->
  </q-btn>
</template>

<script>
import { defineAsyncComponent } from "vue";
import { userCartData } from "stores/CartData";

export default {
  name: "CartTotalSticky",
  props: ["morphGroupModel"],
  components: {
    // NumberFormat: defineAsyncComponent(() =>
    //   import("components/NumberFormat.vue")
    // ),
  },
  setup() {
    const CartData = userCartData();
    return { CartData };
  },
};
</script>
