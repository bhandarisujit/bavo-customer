<template>
  <q-layout view="lHh Lpr lFf" @scroll="scrollHandler">
    <q-header
      reveal
      :class="{
        'bg-mydark text-white': $q.dark.mode,
        'bg-white text-dark': !$q.dark.mode,
      }"
    >
      <q-toolbar>
        <div>
          <!--<q-icon :name="getDarkMode" size="lg" color="grey" />
          <q-toggle
            v-model="DataStorePersisted.dark_mode"
            :color="$q.dark.mode ? 'grey' : 'primary'"
            @update:model-value="setDarkMode"
            size="lg"
          />-->
          <q-btn
            to="/home"
            flat
            round
            >

          <q-img
            src="logo.png"
            placeholder-src="placeholder.png"
            style="height: 40px;width:100px;"
            fit="contain"
            spinner-color="primary"
            spinner-size="xs"
          ></q-img></q-btn>
          <!--<h5 class="q-ma-none text-weight-bolder text-primary">{{ $t("Tony's Pizza") }}</h5>-->

        </div>
        <q-space></q-space>
        <q-btn
          v-if="path == '/cart' && CartData.hasCart"
          dense
          flat
          unelevated
          color="red-5"
          round
          icon="las la-trash"
          class="q-ml-md"
          @click="clearCart"
        />
        <template v-else>
          <q-btn
            dense
            flat
            unelevated
            :color="$q.dark.mode ? 'grey300' : 'grey'"
            round
            icon="las la-globe"
            to="/account/language"
            class="q-ml-sm"
            size="lg"
          />
          <NotiButton></NotiButton>
        </template>
      </q-toolbar>
    </q-header>

    <q-footer
      bordered
      class="bg-transparent modified-footer text-center relative-position text-dark"
      style="height: 60px"
      v-if="!CartData.home_view_items"
    >
      <FooterMenu :direction="direction"></FooterMenu>
    </q-footer>

    <q-page-container>
      <transition
        enter-active-class="animated fadeIn"
        leave-active-class="animated fadeOut"
        appear
        :duration="300"
      >
        <router-view />
      </transition>
      <ComponentsRealtime></ComponentsRealtime>
    </q-page-container>
  </q-layout>
</template>

<script>
import { Device } from "@capacitor/device";
import { defineComponent, defineAsyncComponent } from "vue";
import { useDataStorePersisted } from "stores/DataStorePersisted";
import { useSettingStore } from "stores/SettingStore";
import { userCartData } from "stores/CartData";
import APIinterface from "src/api/APIinterface";
import auth from "src/api/auth";
import { FCM } from "@capacitor-community/fcm";

export default defineComponent({
  name: "MainLayout",
  data() {
    return {
      direction: "",
      //dark_mode: false,
      path: "",
      loading: false,
    };
  },
  setup() {
    const CartData = userCartData();
    const DataStorePersisted = useDataStorePersisted();
    const SettingStore = useSettingStore();
    return { CartData, DataStorePersisted, SettingStore };
  },
  components: {
    FooterMenu: defineAsyncComponent(() => import("components/FooterMenu.vue")),
    NotiButton: defineAsyncComponent(() => import("components/NotiButton.vue")),
    ComponentsRealtime: defineAsyncComponent(() =>
      import("components/ComponentsRealtime.vue")
    ),
  },
  computed: {
    getDarkMode() {
      if (this.DataStorePersisted.dark_mode) {
        return "las la-adjust";
      }
      return "las la-moon";
    },
  },
  mounted() {
    this.path = this.$route.path;

    if (this.$q.capacitor) {
      this.DeviceInit();

      if (Object.keys(this.SettingStore.settings_data).length > 0) {
        this.checkAppVersion();
      } else {
        this.$watch(
          () => this.SettingStore.$state.settings_data,
          (newData, oldData) => {
            this.checkAppVersion();
          }
        );
      }
    }
  },
  updated() {
    this.path = this.$route.path;
  },
  methods: {
    scrollHandler(data) {
      this.direction = data;
    },
    DeviceInit() {
      const $deviceToken = APIinterface.getSession("single_device_token");
      const $isRegistered = APIinterface.getSession("device_registered");
      const $isRegisteredAuth = APIinterface.getSession(
        "device_registered_auth"
      );
      if (auth.authenticated()) {
        if ($isRegisteredAuth !== 1) {
          Device.getId().then((data) => {
            Device.getInfo().then((Info) => {
              this.updateDevice($deviceToken, data.identifier, Info.platform);
            });
          });
        }
      } else {
        if ($isRegistered !== 1) {
          Device.getId().then((data) => {
            Device.getInfo().then((Info) => {
              this.registerDevice($deviceToken, data.identifier, Info.platform);
            });
          });
        }
      }

      this.subsribeDevice();
    },
    registerDevice(token, deviceUuid, platform) {
      APIinterface.fetchDataByBearer("registerDevice", {
        token: token,
        device_uiid: deviceUuid,
        platform: platform,
      }).then((data) => {
        APIinterface.setSession("device_registered", 1);
        //alert(JSON.stringify(data));
      });
    },
    updateDevice(token, deviceUuid, platform) {
      APIinterface.fetchDataByToken("updateDevice", {
        token: token,
        device_uiid: deviceUuid,
        platform: platform,
      })
        .then((data) => {
          APIinterface.setSession("device_registered_auth", 1);
        })
        .catch((error) => {
          APIinterface.notify("red-5", error, "error_outline", this.$q);
        });
    },
    setDarkMode() {
      console.log(this.DataStorePersisted.dark_mode);
      this.$q.dark.set(this.DataStorePersisted.dark_mode);
    },
    subsribeDevice() {
      let $user_data = auth.getUser();
      if ($user_data && !this.DataStorePersisted.push_off) {
        FCM.subscribeTo({ topic: $user_data.client_uuid })
          .then((r) => {
            this.DataStorePersisted.user_settings.app_push_notifications = true;
          })
          .catch((error) => {
            this.DataStorePersisted.user_settings.app_push_notifications = false;
          });
      }
    },
    checkAppVersion() {
      if (
        this.$q.platform.is.android &&
        this.SettingStore.settings_data.app_update.mobile_app_version_android >
          0
      ) {
        if (
          this.SettingStore.settings_data.app_update
            .mobile_app_version_android > this.DataStorePersisted.app_version
        ) {
          this.$router.replace("/update-app");
        }
      } else if (
        this.$q.platform.is.ios &&
        this.SettingStore.settings_data.app_update.mobile_app_version_ios > 0
      ) {
        if (
          this.SettingStore.settings_data.app_update.mobile_app_version_ios >
          this.DataStorePersisted.app_version
        ) {
          this.$router.replace("/update-app");
        }
      }
    },
    //
  },
});
</script>
