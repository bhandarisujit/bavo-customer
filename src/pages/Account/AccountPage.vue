<template>
  <q-page class="q-pa-md">
    <!-- <router-link to="/" style="text-decoration: none"> -->
    <div
      class="row items-center bg-mygreyx q-pa-md radius10"
      :class="{
        'bg-grey600 text-grey300': $q.dark.mode,
        'bg-mygrey ': !$q.dark.mode,
      }"
    >
      <div class="col-3">
        <q-knob show-value v-model="knob" size="50px" color="primary">
          <q-avatar size="50px">
            <q-img
              :src="avatar"
              style="max-width: 40px; height: 40px"
              fit="cover"
              spinner-color="primary"
              spinner-size="xs"
              class="radius50"
            ></q-img>
          </q-avatar>
        </q-knob>
      </div>
      <div class="col text-body2">
        <template v-if="is_guest">
          <div class="text-weight-medium">
            {{ $t("Guest") }}
          </div>
        </template>
        <template v-else>
          <div class="text-weight-medium">
            {{ user.first_name }} {{ user.last_name }}
          </div>
          <div class="text-grey text-caption ellipsis">
            {{ user.email_address }}
          </div>
        </template>
      </div>
    </div>
    <!-- </router-link> -->

    <q-space class="q-pa-sm"></q-space>

    <q-list>
      <q-item
        class="q-pa-md bg-mygreyx radius10 q-mb-sm"
        :class="{
          'bg-grey600 text-grey300': $q.dark.mode,
          'bg-mygrey ': !$q.dark.mode,
        }"
        clickable
        to="/account/update-profile"
      >
        <q-item-section side>
          <q-icon color="grey-5" name="las la-user" />
        </q-item-section>
        <q-item-section>
          <q-item-label class="text-weight-medium">{{
            $t("My Profile")
          }}</q-item-label>
        </q-item-section>
        <q-item-section side>
          <q-icon name="chevron_right" size="sm" color="grey" />
        </q-item-section>
      </q-item>

      <q-item
        class="q-pa-md bg-mygreyx radius10 q-mb-sm"
        :class="{
          'bg-grey600 text-grey300': $q.dark.mode,
          'bg-mygrey ': !$q.dark.mode,
        }"
        clickable
        to="/account/change-password"
      >
        <q-item-section side>
          <q-icon color="grey-5" name="o_lock" />
        </q-item-section>
        <q-item-section>
          <q-item-label class="text-weight-medium">{{
            $t("Change Password")
          }}</q-item-label>
        </q-item-section>
        <q-item-section side>
          <q-icon name="chevron_right" size="sm" color="grey" />
        </q-item-section>
      </q-item>

      <q-item
        class="q-pa-md bg-mygreyx radius10 q-mb-sm"
        :class="{
          'bg-grey600 text-grey300': $q.dark.mode,
          'bg-mygrey ': !$q.dark.mode,
        }"
        clickable
        to="/account/orders"
      >
        <q-item-section side>
          <q-icon color="grey-5" name="o_featured_play_list" />
        </q-item-section>
        <q-item-section>
          <q-item-label class="text-weight-medium">{{
            $t("My Orders")
          }}</q-item-label>
        </q-item-section>
        <q-item-section side>
          <q-icon name="chevron_right" size="sm" color="grey" />
        </q-item-section>
      </q-item>

      <q-item
        class="q-pa-md bg-mygreyx radius10 q-mb-sm"
        :class="{
          'bg-grey600 text-grey300': $q.dark.mode,
          'bg-mygrey ': !$q.dark.mode,
        }"
        clickable
        to="/account/address-list"
      >
        <q-item-section side>
          <q-icon color="grey-5" name="o_place" />
        </q-item-section>
        <q-item-section>
          <q-item-label class="text-weight-medium">{{
            $t("Delivery Address")
          }}</q-item-label>
        </q-item-section>
        <q-item-section side>
          <q-icon name="chevron_right" size="sm" color="grey" />
        </q-item-section>
      </q-item>

      <q-item
        class="q-pa-md bg-mygreyx radius10 q-mb-sm"
        :class="{
          'bg-grey600 text-grey300': $q.dark.mode,
          'bg-mygrey ': !$q.dark.mode,
        }"
        clickable
        to="/account/payments"
      >
        <q-item-section side>
          <q-icon color="grey-5" name="o_account_balance_wallet" />
        </q-item-section>
        <q-item-section>
          <q-item-label class="text-weight-medium">{{
            $t("Payment Methods")
          }}</q-item-label>
        </q-item-section>
        <q-item-section side>
          <q-icon name="chevron_right" size="sm" color="grey" />
        </q-item-section>
      </q-item>

      <q-item
        v-if="SettingStore.settings_data.points_enabled"
        class="q-pa-md bg-mygreyx radius10 q-mb-sm"
        :class="{
          'bg-grey600 text-grey300': $q.dark.mode,
          'bg-mygrey ': !$q.dark.mode,
        }"
        clickable
        to="/account/points"
      >
        <q-item-section side>
          <q-icon color="grey-5" name="o_loyalty" />
        </q-item-section>
        <q-item-section>
          <q-item-label class="text-weight-medium">{{
            $t("Points")
          }}</q-item-label>
        </q-item-section>
        <q-item-section side>
          <q-icon name="chevron_right" size="sm" color="grey" />
        </q-item-section>
      </q-item>

      <q-item
        v-if="SettingStore.settings_data.digitalwallet_enabled"
        class="q-pa-md bg-mygreyx radius10 q-mb-sm"
        :class="{
          'bg-grey600 text-grey300': $q.dark.mode,
          'bg-mygrey ': !$q.dark.mode,
        }"
        clickable
        to="/account/wallet"
      >
        <q-item-section side>
          <q-icon color="grey-5" name="o_wallet" />
        </q-item-section>
        <q-item-section>
          <q-item-label class="text-weight-medium">{{
            $t("Digital Wallet")
          }}</q-item-label>
        </q-item-section>
        <q-item-section side>
          <q-icon name="chevron_right" size="sm" color="grey" />
        </q-item-section>
      </q-item>

      <q-item
        v-if="SettingStore.settings_data.chat_enabled"
        class="q-pa-md bg-mygreyx radius10 q-mb-sm"
        :class="{
          'bg-grey600 text-grey300': $q.dark.mode,
          'bg-mygrey ': !$q.dark.mode,
        }"
        clickable
        to="/account/chat"
      >
        <q-item-section side>
          <q-icon color="grey-5" name="o_question_answer" />
        </q-item-section>
        <q-item-section>
          <q-item-label class="text-weight-medium">{{
            $t("Live Chat")
          }}</q-item-label>
        </q-item-section>
        <q-item-section side>
          <q-icon name="chevron_right" size="sm" color="grey" />
        </q-item-section>
      </q-item>

      <q-item
        v-if="SettingStore.settings_data.booking_enabled"
        class="q-pa-md bg-mygreyx radius10 q-mb-sm"
        :class="{
          'bg-grey600 text-grey300': $q.dark.mode,
          'bg-mygrey ': !$q.dark.mode,
        }"
        clickable
        to="/account/booking"
      >
        <q-item-section side>
          <q-icon color="grey-5" name="o_table_restaurant" />
        </q-item-section>
        <q-item-section>
          <q-item-label class="text-weight-medium">{{
            $t("Bookings")
          }}</q-item-label>
        </q-item-section>
        <q-item-section side>
          <q-icon name="chevron_right" size="sm" color="grey" />
        </q-item-section>
      </q-item>

      <q-item
        class="q-pa-md bg-mygreyx radius10 q-mb-sm"
        :class="{
          'bg-grey600 text-grey300': $q.dark.mode,
          'bg-mygrey ': !$q.dark.mode,
        }"
        clickable
        to="/account/favorites"
      >
        <q-item-section side>
          <q-icon color="grey-5" name="o_favorite_border" />
        </q-item-section>
        <q-item-section>
          <q-item-label class="text-weight-medium">{{
            $t("Favorites")
          }}</q-item-label>
        </q-item-section>
        <q-item-section side>
          <q-icon name="chevron_right" size="sm" color="grey" />
        </q-item-section>
      </q-item>

      <q-item
        tag="label"
        class="q-pa-md bg-mygreyx radius10 q-mb-sm"
        clickable
        :class="{
          'bg-grey600 text-grey300': $q.dark.mode,
          'bg-mygrey ': !$q.dark.mode,
        }"
      >
        <q-item-section side>
          <q-icon color="grey-5" name="o_notifications" />
        </q-item-section>
        <q-item-section>
          <q-item-label class="text-weight-medium">{{
            $t("Notifications")
          }}</q-item-label>
        </q-item-section>
        <q-item-section side>
          <q-toggle
            v-model="notification"
            @update:model-value="Updateaccountnotification"
          />
        </q-item-section>
      </q-item>

      <q-item
        v-if="SettingStore.settings_data.enabled_language"
        class="q-pa-md bg-mygreyx radius10 q-mb-sm"
        :class="{
          'bg-grey600 text-grey300': $q.dark.mode,
          'bg-mygrey ': !$q.dark.mode,
        }"
        clickable
        to="/account/language"
      >
        <q-item-section side>
          <q-icon color="grey-5" name="o_language" />
        </q-item-section>
        <q-item-section>
          <q-item-label class="text-weight-medium">{{
            $t("Language")
          }}</q-item-label>
        </q-item-section>
        <q-item-section side>
          <div class="flex items-center">
            <div class="text-grey">
              <template v-for="lang in getLanguageData" :key="lang">
                <template
                  v-if="lang.code == this.DataStorePersisted.app_language"
                >
                  {{ lang.title }}
                </template>
              </template>
            </div>
            <q-icon name="chevron_right" size="sm" color="grey" />
          </div>
        </q-item-section>
      </q-item>

      <q-item
        v-if="SettingStore.settings_data.multicurrency_enabled"
        class="q-pa-md bg-mygreyx radius10 q-mb-sm"
        :class="{
          'bg-grey600 text-grey300': $q.dark.mode,
          'bg-mygrey ': !$q.dark.mode,
        }"
        clickable
        to="/account/currency"
      >
        <q-item-section side>
          <q-icon color="grey-5" name="toll" />
        </q-item-section>
        <q-item-section>
          <q-item-label class="text-weight-medium">{{
            $t("Currency")
          }}</q-item-label>
        </q-item-section>
        <q-item-section side>
          <div class="row items-center">
            <div class="col">
              {{ this.DataStorePersisted.use_currency_code }}
            </div>
            <div class="col">
              <q-icon name="chevron_right" size="sm" color="grey" />
            </div>
          </div>
        </q-item-section>
      </q-item>

      <q-item
        class="q-pa-md bg-mygreyx radius10 q-mb-sm"
        clickable
        to="/about"
        :class="{
          'bg-grey600 text-grey300': $q.dark.mode,
          'bg-mygrey ': !$q.dark.mode,
        }"
      >
        <q-item-section side>
          <q-icon color="grey-5" name="o_restaurant" />
        </q-item-section>
        <q-item-section>
          <q-item-label class="text-weight-medium">{{
            $t("About")
          }}</q-item-label>
        </q-item-section>
        <q-item-section side>
          <q-icon name="chevron_right" size="sm" color="grey" />
        </q-item-section>
      </q-item>

      <q-item
        class="q-pa-md bg-mygreyx radius10 q-mb-sm"
        clickable
        to="/conditions"
        :class="{
          'bg-grey600 text-grey300': $q.dark.mode,
          'bg-mygrey ': !$q.dark.mode,
        }"
      >
        <q-item-section side>
          <q-icon color="grey-5" name="o_policy" />
        </q-item-section>
        <q-item-section>
          <q-item-label class="text-weight-medium">{{
            $t("terms & condition")
          }}</q-item-label>
        </q-item-section>
        <q-item-section side>
          <q-icon name="chevron_right" size="sm" color="grey" />
        </q-item-section>
      </q-item>

      <q-item
        class="q-pa-md bg-mygreyx radius10 q-mb-sm"
        clickable
        to="/legal"
        :class="{
          'bg-grey600 text-grey300': $q.dark.mode,
          'bg-mygrey ': !$q.dark.mode,
        }"
      >
        <q-item-section side>
          <q-icon color="grey-5" name="o_policy" />
        </q-item-section>
        <q-item-section>
          <q-item-label class="text-weight-medium">{{
            $t("Legal")
          }}</q-item-label>
        </q-item-section>
        <q-item-section side>
          <q-icon name="chevron_right" size="sm" color="grey" />
        </q-item-section>
      </q-item>

      <q-item
        class="q-pa-md bg-mygreyx radius10 q-mb-sm"
        :class="{
          'bg-grey600 text-grey300': $q.dark.mode,
          'bg-mygrey ': !$q.dark.mode,
        }"
        clickable
        to="/account/request-delete"
      >
        <q-item-section side>
          <q-icon color="grey-5" name="o_logout" />
        </q-item-section>
        <q-item-section>
          <q-item-label class="text-weight-medium">{{
            $t("Delete account")
          }}</q-item-label>
        </q-item-section>
        <q-item-section side>
          <q-icon name="chevron_right" size="sm" color="grey" />
        </q-item-section>
      </q-item>
    </q-list>

    <div class="q-mt-lg q-mb-md" v-if="!is_guest">
      <q-btn
        color="red"
        icon="las la-power-off"
        :label="$t('Log out')"
        class="radius20"
        no-caps
        unelevated
        @click="logout"
        size="lg"
      />
    </div>
    <ConfirmDialog
      ref="logout_dialog"
      :data="{
        title: this.$t('Logout'),
        subtitle: this.$t('Are you sure you want to logout?'),
        confirm: this.$t('Yes'),
        cancel: this.$t('Cancel'),
      }"
      @after-confirm="afterConfirm"
    >
    </ConfirmDialog>
  </q-page>
</template>

<script>
import auth from "src/api/auth";
import { defineAsyncComponent } from "vue";
import { useDataStorePersisted } from "stores/DataStorePersisted";
import { useSettingStore } from "stores/SettingStore";
import APIinterface from "src/api/APIinterface";
import { FCM } from "@capacitor-community/fcm";

export default {
  name: "AccountPage",
  components: {
    ConfirmDialog: defineAsyncComponent(() =>
      import("components/ConfirmDialog.vue")
    ),
  },
  setup() {
    const DataStorePersisted = useDataStorePersisted();
    const SettingStore = useSettingStore();
    return { DataStorePersisted, SettingStore };
  },
  data() {
    return {
      knob: 71,
      notification: false,
      avatar: "/public/user@2x.png",
      language: "",
      user: [],
      is_guest: true,
    };
  },
  mounted() {
    if (auth.authenticated()) {
      this.is_guest = false;
      this.getCurrentProfile();
      this.getUserSettings();
      this.language = this.DataStorePersisted.app_language;
    } else {
      this.is_guest = true;
    }
  },
  computed: {
    getLanguageData() {
      if (Object.keys(this.SettingStore.settings_data).length > 0) {
        return this.SettingStore.settings_data.language_list.list;
      }
      return false;
    },
  },
  methods: {
    getCurrentProfile() {
      const $oldprofile = auth.getUser();
      this.user = auth.getUser();
      if ($oldprofile) {
        this.avatar = $oldprofile.avatar;
      }
    },
    getUserSettings() {
      if (Object.keys(this.DataStorePersisted.user_settings).length > 0) {
        this.notification =
          this.DataStorePersisted.user_settings.app_push_notifications == 1
            ? true
            : false;
      }
    },
    logout() {
      this.$refs.logout_dialog.dialog = true;
    },
    afterConfirm() {
      this.DataStorePersisted.user_settings = [];
      this.unsubscribeToTopic();
      auth.logout();
      this.$router.push("/home");
    },
    Updateaccountnotification(data) {
      if (this.is_guest) {
        return;
      }

      if (this.$q.capacitor) {
        if (data) {
          this.subsribeDevice();
        } else {
          this.unsubscribeToTopic();
        }
      } else {
        APIinterface.fetchDataByTokenPost(
          "Updateaccountnotification",
          "app_push_notifications=" + data
        )
          .then((response) => {
            this.DataStorePersisted.user_settings.app_push_notifications = data
              ? 1
              : "";
          })
          .catch((error) => {
            //
          })
          .then((data) => {});
      }
    },
    subsribeDevice() {
      FCM.subscribeTo({ topic: this.user.client_uuid })
        .then((r) => {
          this.notification = true;
          this.DataStorePersisted.user_settings.app_push_notifications = 1;
          this.DataStorePersisted.push_off = false;
        })
        .catch((error) => {
          this.notification = false;
          this.DataStorePersisted.user_settings.app_push_notifications = "";
        });
    },
    unsubscribeToTopic() {
      FCM.unsubscribeFrom({ topic: this.user.client_uuid })
        .then(() => {
          this.notification = false;
          this.DataStorePersisted.user_settings.app_push_notifications = "";
          this.DataStorePersisted.push_off = true;
        })
        .catch((err) => {});
    },
    //
  },
};
</script>
