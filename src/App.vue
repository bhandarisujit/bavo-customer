<template>
  <router-view />
</template>

<script>
import { defineComponent } from "vue";
import { FCM } from "@capacitor-community/fcm";
import { PushNotifications } from "@capacitor/push-notifications";
import APIinterface from "./api/APIinterface";
import config from "./api/config";
import auth from "./api/auth";
import { useDataStorePersisted } from "stores/DataStorePersisted";
import { useSettingStore } from "stores/SettingStore";
import { App } from "@capacitor/app";
import { Network } from "@capacitor/network";
import { api } from "boot/axios";
import { useUserStore } from "stores/UserStore";

const DEVICE_TOKEN = "single_device_token";

export default defineComponent({
  name: "App",
  data() {
    return {
      token: "",
      close_count: 0,
    };
  },
  setup(props) {
    const DataStorePersisted = useDataStorePersisted();
    const SettingStore = useSettingStore();
    const UserStore = useUserStore();
    return { DataStorePersisted, SettingStore, UserStore };
  },
  async created() {
    this.$q.dark.set(this.DataStorePersisted.dark_mode);

    if (!APIinterface.empty(this.DataStorePersisted.app_language)) {
      this.$i18n.locale = this.DataStorePersisted.app_language;
    }

    this.$q.lang.set({ rtl: this.DataStorePersisted.rtl });

    api.defaults.params = {};
    api.defaults.params["language"] = this.$i18n.locale;

    await this.SettingStore.getSettings();

    if (this.SettingStore.settings_data.multicurrency_enabled) {
      if (APIinterface.empty(this.DataStorePersisted.use_currency_code)) {
        this.DataStorePersisted.use_currency_code =
          this.SettingStore.settings_data.base_currency;
      }
    } else {
      this.DataStorePersisted.use_currency_code = "";
    }

    this.UserStore.currency_code = this.DataStorePersisted.use_currency_code;

    if (this.$q.capacitor) {
      this.initPush();
      this.getAppVersion();
    }

    this.close_count = 0;

    App.addListener("backButton", (data) => {
      this.close_count++;
      if (!data.canGoBack) {
        if (this.close_count >= 2) {
          this.closeApp();
        } else {
          APIinterface.showToast("Press BACK again to exit");
          setTimeout(() => {
            this.close_count = 0;
          }, 1000);
        }
      }
    });

    if (this.$q.capacitor) {
      this.checkNetwork();
      Network.addListener("networkStatusChange", (status) => {
        if (status.connected === false) {
          APIinterface.showToast("No internet connection");
          this.$router.push("/errornetwork");
        }
      });
    }

    //
  },
  methods: {
    async getAppVersion() {
      let result = await App.getInfo();
      if (result) {
        this.DataStorePersisted.app_version = result.version;
      }
    },
    async checkNetwork() {
      const status = await Network.getStatus();
      if (status.connected === false) {
        this.$router.push("/errornetwork");
      }
    },
    closeApp() {
      App.exitApp();
    },
    verifyToken() {
      auth
        .authenticate()
        .then((data) => {
          //
        })
        .catch((error) => {
          auth.logout();
        })
        .then((data) => {});
    },
    initPush() {
      PushNotifications.checkPermissions().then((result) => {
        console.log(JSON.stringify(result));
        if (result.receive === "prompt") {
          PushNotifications.requestPermissions().then((result) => {
            if (result.receive === "granted") {
              PushNotifications.register();
            }
          });
        } else if (result.receive === "granted") {
          PushNotifications.register();
        } else if (result.receive === "prompt-with-rationale") {
          PushNotifications.register();
        }
      });

      FCM.setAutoInit({ enabled: true }).then(() => {
        //
      });

      FCM.isAutoInitEnabled().then((r) => {
        // alert('Auto init is ' + (r.enabled ? 'enabled' : 'disabled'))
      });

      FCM.subscribeTo({ topic: config.topic })
        .then((r) => {
          //
        })
        .catch((error) => {
          APIinterface.notify(
            "red-5",
            "Error subscribing topics" + JSON.stringify(error),
            "warning",
            this.$q
          );
        });

      PushNotifications.addListener("registration", (Token) => {
        if (this.$q.platform.is.android) {
          this.token = Token.value;
          APIinterface.setSession(DEVICE_TOKEN, this.token);
        } else {
          FCM.getToken()
            .then((r) => {
              this.token = r.token;
              APIinterface.setSession(DEVICE_TOKEN, this.token);
            })
            .catch((error) => {
              //APIinterface.notify("dark", error, "error_outline", this.$q);
            });
        }
      });

      PushNotifications.addListener("registrationError", (error) => {
        APIinterface.notify(
          "red-5",
          "Error on registration" + JSON.stringify(error),
          "warning",
          this.$q
        );
      });

      PushNotifications.createChannel({
        description: "KMSR single app channel",
        id: config.channel,
        importance: 5,
        lights: true,
        name: "kmrs channel",
        sound: config.sound,
        vibration: true,
        visibility: 1,
      })
        .then(() => {
          // alert('push channel created: ')
        })
        .catch((error) => {
          // APIinterface.notify(
          //   "red-5",
          //   "Error on registration" + JSON.stringify(error),
          //   "warning",
          //   this.$q
          // );
        });

      PushNotifications.addListener(
        "pushNotificationReceived",
        (notification) => {
          //alert("Push received: " + JSON.stringify(notification));
        }
      );

      //
    },
  },
});
</script>
