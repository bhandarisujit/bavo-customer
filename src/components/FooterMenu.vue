<template>
  <q-tabs
    v-model="tab"
    dense
    indicator-color="transparent"
    active-color="primary"
    class="bg-primary radius50 q-pa-xs q-pa-sm"
    :class="{
      'bg-mydark text-white': $q.dark.mode,
      'text-dark': !$q.dark.mode,
    }"
    align="justify"
  >
    <q-route-tab
      name="home"
      icon="las la-home"
      no-caps
      to="/home"
      class="text-white routertab_small"
    />
    <q-route-tab
      name="menu"
      icon="las la-utensils"
      no-caps
      to="/menu"
      class="text-white routertab_small"
    />
    <q-route-tab
      name="search"
      icon="las la-search"
      no-caps
      to="/search"
      class="text-white routertab_small"
    />
    <q-route-tab
      name="cart"
      icon="o_shopping_bag"
      no-caps
      to="/cart"
      class="text-white routertab_small"
    >
      <template v-if="!CartData.cartcount_loading">
        <q-badge
          v-if="CartData.cartcount_data.items_count > 0"
          color="green-5"
          floating
        >
          {{ CartData.cartcount_data.items_count }}
        </q-badge>
      </template>
    </q-route-tab>

    <template v-if="booking_enabled">
      <q-route-tab
        name="booking"
        icon="o_event_seat"
        no-caps
        to="/booking"
        class="text-white routertab_small"
      />
    </template>
    <q-route-tab
      name="user"
      icon="las la-user"
      no-caps
      to="/account-menu"
      class="text-white routertab_small"
    />
  </q-tabs>
</template>

<script>
import { userCartData } from "stores/CartData";
import { useSettingStore } from "stores/SettingStore";

export default {
  name: "FooterMenu",
  props: ["direction"],
  setup() {
    const CartData = userCartData();
    const SettingStore = useSettingStore();
    return {
      CartData,
      SettingStore,
    };
  },
  data() {
    return {
      booking_enabled: false,
    };
  },
  mounted() {
    if (Object.keys(this.SettingStore.settings_data).length > 0) {
      this.booking_enabled = this.SettingStore.settings_data.booking_enabled;
    } else {
      this.$watch(
        () => this.SettingStore.$state.settings_data,
        (newData, oldData) => {
          this.booking_enabled = newData.booking_enabled;
        }
      );
    }
  },
};
</script>
