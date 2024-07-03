<template>
  <template v-if="isEnabled">
    <q-list
      bordered
      dense
      class="rounded-borders q-pt-xs q-pb-xs q-mb-sm shadow-1"
    >
      <q-item>
        <q-item-section avatar class="item-column-less">
          <q-avatar
            color="primary"
            text-color="white"
            icon="las la-coins"
            size="md"
          />
        </q-item-section>
        <q-item-section>
          <q-item-label>{{ $t("Tip your rider") }}</q-item-label>
        </q-item-section>
      </q-item>
      <q-item class="item-normal-height">
        <q-item-section>
          <q-item-label>
            <div class="text-caption line-normal q-mb-sm">
              {{ $t("Your rider receives the entire amount of your tip.") }}
            </div>
            <div>
              <template v-if="loading">
                <q-skeleton
                  recttype="type"
                  animation="pulse"
                  :class="{
                    'bg-grey600': $q.dark.mode,
                    'bg-mygrey': !$q.dark.mode,
                  }"
                />
              </template>
              <template v-else>
                <template v-if="tips == 'fixed'">
                  <div class="q-pa-md">
                    <div
                      class="radius10"
                      :class="{
                        'bg-grey600 ': $q.dark.mode,
                        'bg-mygrey ': !$q.dark.mode,
                      }"
                    >
                      <q-item class="q-pt-lg relative-position">
                        <div class="absolute-top-right">
                          <q-btn
                            flat
                            icon="close"
                            size="sm"
                            color="negative"
                            rounded
                            @click="tips = 0"
                          ></q-btn>
                        </div>
                        <q-item-section>
                          <q-input
                            v-model="amount"
                            :label="$t('Enter amount')"
                            stack-label
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
                            size="14px"
                            :loading="loading_apply"
                            @click="ApplyAmount"
                          >
                          </q-btn>
                        </q-item-section>
                      </q-item>
                    </div>
                  </div>
                </template>
                <template v-else>
                  <q-btn-toggle
                    v-model="tips"
                    toggle-color="yellow-9"
                    :color="$q.dark.mode ? 'grey600' : 'white'"
                    :text-color="$q.dark.mode ? 'grey300' : 'dark'"
                    no-caps
                    rounded
                    unelevated
                    class="rounded-group2 small q-pa-none"
                    :options="data"
                    @update:model-value="updateTips"
                    :dense="$q.screen.lt.sm"
                    :disable="refresh"
                  >
                  </q-btn-toggle>
                </template>
              </template>
            </div>
          </q-item-label>
        </q-item-section>
      </q-item>
    </q-list>
  </template>
</template>

<script>
import APIinterface from "src/api/APIinterface";
import { useDataStorePersisted } from "stores/DataStorePersisted";

export default {
  name: "TipSelections",
  props: ["settings", "transaction_type"],
  data() {
    return {
      tips: 0,
      amount: 0,
      data: [],
      loading: false,
      refresh: false,
      loading_apply: false,
    };
  },
  setup() {
    const DataStorePersisted = useDataStorePersisted();
    return { DataStorePersisted };
  },
  computed: {
    isEnabled() {
      let enabled_tip = this.settings
        ? this.settings.enabled_tip == 1
          ? true
          : false
        : false;

      if (enabled_tip) {
        let tips_in_transactions = this.settings.tips_in_transactions;
        if (tips_in_transactions.includes(this.transaction_type) === true) {
          return true;
        }
      }
      return false;
    },
  },
  mounted() {
    let enabled_tip = this.settings
      ? this.settings.enabled_tip == 1
        ? true
        : false
      : false;

    if (enabled_tip) {
      this.loadTips();
    }
  },
  methods: {
    loadTips() {
      this.loading = true;
      APIinterface.fetchDataPost(
        "loadTips",
        "cart_uuid=" +
          APIinterface.getStorage("cart_uuid") +
          "&currency_code=" +
          this.DataStorePersisted.getUseCurrency()
      )
        .then((data) => {
          this.data = data.details.data;
          this.tips = data.details.tips;
        })
        .catch((error) => {
          this.data = [];
        })
        .then((data) => {
          this.loading = false;
        });
    },
    updateTips(data) {
      if (data != "fixed") {
        this.checkoutAddTips(data);
      }
    },
    checkoutAddTips(data) {
      this.refresh = true;
      this.$emit("onApplytips");
      APIinterface.fetchDataByToken("checkoutAddTips", {
        cart_uuid: APIinterface.getStorage("cart_uuid"),
        value: data,
        is_manual: false,
      })
        .then((data) => {
          this.$emit("afterApplytips");
        })
        .catch((error) => {
          APIinterface.notify("dark", error, "error_outline", this.$q);
        })
        .then((data) => {
          this.refresh = false;
        });
    },
    ApplyAmount() {
      this.loading_apply = true;
      APIinterface.fetchDataByToken("checkoutAddTips", {
        cart_uuid: APIinterface.getStorage("cart_uuid"),
        value: this.amount,
        is_manual: true,
      })
        .then((data) => {
          this.$emit("afterApplytips");
        })
        .catch((error) => {
          APIinterface.notify("dark", error, "error_outline", this.$q);
        })
        .then((data) => {
          this.loading_apply = false;
        });
    },
  },
};
</script>
