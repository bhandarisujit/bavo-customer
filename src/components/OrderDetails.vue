<template>
  <q-dialog
    v-model="modal"
    persistent
    position="bottom"
    transition-show="fade"
    transition-hide="fadeout"
  >
    <q-card
      :class="{
        'bg-grey600': $q.dark.mode,
      }"
    >
      <q-card-section class="row items-center q-pb-none">
        <div class="text-h6 text-weight-bold">{{ $t("Order details") }}</div>
        <q-space />
        <q-btn icon="close" flat round dense v-close-popup />
      </q-card-section>
      <q-list>
        <!--<q-item>
          <q-item-section class="col-1" avatar top>
            <q-icon
              name="o_place"
              :color="$q.dark.mode ? 'grey' : 'dark'"
              size="20px"
            />
          </q-item-section>
          <q-item-section top>
            <template v-if="DataStorePersisted.hasRecentAddress">
              <q-item-label lines="2">
                {{ DataStorePersisted.location_data.addressLine1 }}
              </q-item-label>
              <q-item-label lines="2" caption>
                {{ DataStorePersisted.location_data.description }}
              </q-item-label>
            </template>
            <template v-else>
              <q-item-section>{{ $t("New address") }}</q-item-section>
            </template>
          </q-item-section>
          <q-item-section top side>
            <q-btn
              :label="$t('Change')"
              flat
              color="warning"
              class="text-weight-bold"
              :dense="$q.screen.lt.sm"
              v-close-popup
              @click="changeAddress"
            />
          </q-item-section>
        </q-item>-->
        <q-item>
          <q-item-section class="col-1" avatar top>
            <q-icon
              name="o_place"
              :color="$q.dark.mode ? 'grey' : 'dark'"
              size="20px"
            />
          </q-item-section>
          <q-item-section top>
            <template v-if="DataStorePersisted.area_id">
              <q-item-label lines="2">
                {{ DataStorePersisted.delivery_area.label }}
              </q-item-label>
              <q-item-label lines="2" caption>
                {{ DataStorePersisted.delivery_postalcode }}
              </q-item-label>
            </template>
            <template v-else>
              <q-item-section>{{ $t("New address") }}</q-item-section>
            </template>
          </q-item-section>
          <q-item-section top side>
            <q-btn
              :label="$t('Change')"
              flat
              color="warning"
              class="text-weight-bold"
              :dense="$q.screen.lt.sm"
              v-close-popup
              @click="changeArea"
            />
          </q-item-section>
        </q-item>
        <q-item>
          <q-item-section class="col-1" avatar top>
            <q-icon
              name="schedule"
              :color="$q.dark.mode ? 'grey' : 'dark'"
              size="20px"
            />
          </q-item-section>
          <q-item-section top>
            <template v-if="SettingStore.getTransactionData">
              <q-item-label lines="1">
                {{ SettingStore.getTransactionData.transaction }}
              </q-item-label>
              <q-item-label caption lines="1">
                {{ SettingStore.getTransactionData.date }}
                <span v-if="SettingStore.getTransactionData.time">
                  ,
                  {{ SettingStore.getTransactionData.time }}
                </span>
              </q-item-label>
            </template>
          </q-item-section>
          <q-item-section top side>
            <q-btn
              :label="$t('Change')"
              flat
              color="warning"
              class="text-weight-bold"
              :dense="$q.screen.lt.sm"
              v-close-popup
              @click="$emit('showOrderdetails')"
            >
            </q-btn>
          </q-item-section>
        </q-item>
      </q-list>
      <q-card-actions>
        <q-btn
          v-close-popup
          unelevated
          rounded
          color="primary"
          text-color="white"
          no-caps
          class="full-width q-mb-md"
          :label="$t('Done')"
          size="lg"
        >
        </q-btn>
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script>
import { useDataStorePersisted } from "stores/DataStorePersisted";
import { useSettingStore } from "stores/SettingStore";
import auth from "src/api/auth";

export default {
  name: "OrderDetails",
  setup() {
    const DataStorePersisted = useDataStorePersisted();
    const SettingStore = useSettingStore();
    return { DataStorePersisted, SettingStore };
  },
  data() {
    return {
      modal: false,
    };
  },
  methods: {
    changeAddress() {
      if (auth.authenticated()) {
        this.$emit("showSavedaddress");
      } else {
        this.$router.push({ path: "/location", query: { redirect: "/home" } });
      }
    },
    changeArea() {
      this.$emit("showSavedarea");
    },
  },
};
</script>
