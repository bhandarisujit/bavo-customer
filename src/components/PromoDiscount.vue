<template>
  <div
    class="radius10 q-mb-sm"
    :class="{
      'bg-grey600 ': $q.dark.mode,
      'bg-mygrey ': !$q.dark.mode,
    }"
  >
    <q-item clickable @click.stop="showPromo">
      <q-item-section avatar top class="item-column-less">
        <q-avatar
          color="primary"
          text-color="white"
          icon="local_offer"
          size="md"
        />
      </q-item-section>
      <q-item-section>
        <q-item-label caption>{{ $t("Add Promo") }} </q-item-label>
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
            <template v-if="hasPromoselected">
              {{ $t("Promotion applied") }}
              <div class="text-caption text-green">
                {{ promo_selected.savings }}
              </div>
            </template>
            <template v-else>
              <template v-if="total_promo > 0">
                {{ total_promo }}
                {{ $t("promotional available") }}
              </template>
            </template>
          </template>
        </q-item-label>
      </q-item-section>
      <q-item-section side>
        <template v-if="hasPromoselected">
          <q-btn
            @click.stop="removePromo(promo_selected)"
            icon="clear"
            round
            size="sm"
            flat
            unelevated
            no-caps
            color="negative"
            :loading="loading_remove"
          ></q-btn>
        </template>
        <template v-else>
          <q-icon name="chevron_right" color="grey" />
        </template>
      </q-item-section>
    </q-item>
  </div>

  <q-dialog
    v-model="modal"
    persistent
    position="bottom"
    transition-show="fade"
    transition-hide="fadeout"
    @before-show="beforeShow"
  >
    <q-card
      :class="{
        'bg-grey600': $q.dark.mode,
        'bg-mygrey': !$q.dark.mode,
      }"
    >
      <q-form @submit="Submit">
        <q-card-section class="row items-center q-pb-none">
          <div class="text-h6 text-weight-bold">{{ $t("Add Promo") }}</div>
          <q-space />
          <q-btn icon="close" flat round dense v-close-popup />
        </q-card-section>
        <q-card-section
          style="max-height: 50vh; min-height: 30vh"
          class="scroll q-pa-none"
        >
          <div class="q-pa-md q-pt-none">
            <div
              class="radius10 q-mb-xs"
              :class="{
                'bg-grey600 ': $q.dark.mode,
                'bg-mygrey ': !$q.dark.mode,
                disabled: refresh,
              }"
            >
              <q-item>
                <q-item-section>
                  <q-input
                    v-model="promo_code"
                    :label="$t('Enter Promo Code')"
                    stack-label
                    :rules="[
                      (val) =>
                        (val && val.length > 0) ||
                        this.$t('This field is required'),
                    ]"
                  />
                </q-item-section>
                <q-item-section side>
                  <q-btn
                    type="submit"
                    unelevated
                    rounded
                    color="primary"
                    text-color="white"
                    no-caps
                    class="full-width"
                    :label="$t('Apply')"
                    size="15px"
                    :loading="loading_apply"
                  >
                  </q-btn>
                </q-item-section>
              </q-item>
            </div>
          </div>

          <template v-if="hasPromo">
            <q-list
              separator
              bordered
              :class="{
                disabled: refresh,
              }"
            >
              <template v-for="items in data" :key="items">
                <q-item clickable tag="label" @click.stop="usePromo(items)">
                  <q-item-section>
                    <q-item-label>{{ items.title }}</q-item-label>
                    <q-item-label caption>{{ items.sub_title }}</q-item-label>
                    <q-item-label caption>{{ items.valid_to }}</q-item-label>
                  </q-item-section>
                  <q-item-section side>
                    <q-btn
                      flat
                      label="Use Now"
                      unelevated
                      color="primary"
                      no-caps
                      :disable="refresh"
                    ></q-btn>
                  </q-item-section>
                </q-item>
              </template>
            </q-list>
          </template>
        </q-card-section>
        <q-card-actions>
          <q-btn
            v-close-popup
            unelevated
            rounded
            color="red-2"
            text-color="red-9"
            no-caps
            class="full-width"
            :label="$t('Close')"
            size="17px"
            :loading="refresh"
          >
          </q-btn>
        </q-card-actions>
      </q-form>
    </q-card>
  </q-dialog>
</template>

<script>
import { userCartData } from "stores/CartData";
import { useDataStorePersisted } from "stores/DataStorePersisted";
import APIinterface from "src/api/APIinterface";

export default {
  name: "PromoDiscount",
  data() {
    return {
      modal: false,
      data: [],
      promo_selected: [],
      loading: false,
      total_promo: 0,
      promo_code: "",
      refresh: false,
      loading_remove: false,
      loading_apply: false,
    };
  },
  setup() {
    const CartData = userCartData();
    const DataStorePersisted = useDataStorePersisted();
    return { CartData, DataStorePersisted };
  },
  computed: {
    hasPromo() {
      if (Object.keys(this.data).length > 0) {
        return true;
      }
      return false;
    },
    hasPromoselected() {
      if (Object.keys(this.promo_selected).length > 0) {
        return true;
      }
      return false;
    },
  },
  mounted() {
    if (Object.keys(this.CartData.cart_items).length > 0) {
      this.loadPromo();
    } else {
      this.$watch(
        () => this.SettingStore.$state.cart_items,
        (newData, oldData) => {
          this.loadPromo();
        }
      );
    }
  },
  methods: {
    beforeShow() {
      this.promo_code = "";
    },
    loadPromo() {
      this.loading = true;
      APIinterface.fetchDataPost(
        "loadPromo",
        "cart_uuid=" +
          APIinterface.getStorage("cart_uuid") +
          "&currency_code=" +
          this.DataStorePersisted.getUseCurrency()
      )
        .then((data) => {
          this.total_promo = data.details.count;
          this.data = data.details.data;
          this.promo_selected = data.details.promo_selected;
        })
        .catch((error) => {})
        .then((data) => {
          this.loading = false;
        });
    },
    showPromo() {
      this.modal = true;
    },
    Submit() {
      this.loading_apply = true;
      const params = {
        cart_uuid: APIinterface.getStorage("cart_uuid"),
        promo_code: this.promo_code,
        currency_code: this.DataStorePersisted.getUseCurrency(),
        transaction_type: this.DataStorePersisted.transaction_type,
      };
      APIinterface.fetchDataByToken("applyPromoCode", params)
        .then((data) => {
          this.modal = false;
          this.loadPromo();
        })
        .catch((error) => {
          APIinterface.notify("dark", error, "error_outline", this.$q);
        })
        .then((data) => {
          this.loading_apply = false;
        });
    },
    usePromo(data) {
      const params = {
        cart_uuid: APIinterface.getStorage("cart_uuid"),
        promo_id: data.promo_id,
        promo_type: data.promo_type,
        currency_code: this.DataStorePersisted.getUseCurrency(),
        transaction_type: this.DataStorePersisted.transaction_type,
      };
      this.refresh = true;
      APIinterface.fetchDataByToken("applyPromo", params)
        .then((data) => {
          this.modal = false;
          this.loadPromo();
        })
        .catch((error) => {
          APIinterface.notify("dark", error, "error_outline", this.$q);
        })
        .then((data) => {
          this.refresh = false;
          this.$emit("afterApplypromo");
        });
    },
    removePromo(data) {
      this.loading_remove = true;
      const params = {
        cart_uuid: APIinterface.getStorage("cart_uuid"),
        promo_id: data.promo_id,
        promo_type: data.promo_type,
        transaction_type: this.DataStorePersisted.transaction_type,
      };
      APIinterface.fetchDataByToken("removePromo", params)
        .then((data) => {
          this.modal = false;
          this.promo_selected = [];
        })
        .catch((error) => {
          APIinterface.notify("dark", error, "error_outline", this.$q);
        })
        .then((data) => {
          this.loading_remove = false;
          this.$emit("afterRemovepromo");
        });
    },
  },
};
</script>
