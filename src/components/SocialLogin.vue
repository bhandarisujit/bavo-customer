<template>
  <div
    class="flexx full-width items-center"
    v-if="settings.google_login_enabled || settings.fb_flag"
  >
    <div class="text-grey q-pr-sm">
      {{ $t("Or sign in with social account") }}
    </div>
    <div><q-separator style="width: 100px" /></div>
    <div class="row q-col-gutter-md">
      <div class="q-mt-xs" v-if="settings.google_login_enabled">
        <GoogleLogin
          :client_id="settings.google_client_id"
          ref="google_login"
          @after-login="afterLogin"
        ></GoogleLogin>
      </div>
      <div class="q-mt-xs" v-if="settings.fb_flag">
        <FacebookLogin
          ref="facebook_login"
          :app_id="settings.fb_app_id"
          @after-login="afterLogin"
        />
      </div>
      <div class="q-mt-xs">
        <q-btn
          icon="las la-phone"
          unelevated
          :color="$q.dark.mode ? 'grey600' : 'grey-3'"
          class="rounded-borders text-grey"
          to="/user/loginbyphone"
          size="lg"
        />
      </div>
    </div>
  </div>
  <div v-else class="full-width items-center">
    <div class="text-grey q-pr-sm">
      {{ $t("Or sign in with phone number") }}
    </div>
    <div><q-separator style="width: 100px" /></div>
    <div class="row q-col-gutter-md">
      <div class="q-mt-xs">
        <q-btn
          icon="las la-phone"
          unelevated
          :color="$q.dark.mode ? 'grey600' : 'grey-3'"
          class="rounded-borders text-grey"
          to="/user/loginbyphone"
          size="lg"
        />
      </div>
    </div>
  </div>
</template>

<script>
import { defineAsyncComponent } from "vue";
import { useDataStorePersisted } from "stores/DataStorePersisted";
import { useSettingStore } from "stores/SettingStore";
import APIinterface from "src/api/APIinterface";
import auth from "src/api/auth";

export default {
  name: "SocialLogin",
  data() {
    return {
      settings: [],
    };
  },
  setup() {
    const DataStorePersisted = useDataStorePersisted();
    const SettingStore = useSettingStore();
    return { DataStorePersisted, SettingStore };
  },
  components: {
    GoogleLogin: defineAsyncComponent(() =>
      import("components/GoogleLogin.vue")
    ),
    FacebookLogin: defineAsyncComponent(() =>
      import("components/FacebookLogin.vue")
    ),
  },
  mounted() {
    if (Object.keys(this.SettingStore.settings_data).length > 0) {
      this.settings = this.SettingStore.settings_data.social_settings;
    } else {
      this.$watch(
        () => this.SettingStore.$state.settings_data,
        (newData, oldData) => {
          this.settings = newData.social_settings;
        }
      );
    }
  },
  methods: {
    afterLogin(data) {
      console.log("afterLogin");
      data.local_id = APIinterface.getStorage("local_id");
      APIinterface.fetchDataPost("SocialRegister", data)
        .then((data) => {
          if (data.details.redirect.page === "verify") {
            this.$router.push({
              path: "/account/verify",
              query: { uuid: data.details.redirect.uuid },
            });
          } else if (data.details.redirect.page === "complete-registration") {
            this.$router.push({
              path: "/account/complete-registration",
              query: { uuid: data.details.redirect.uuid },
            });
          } else {
            auth.setUser(data.details.user_data);
            auth.setToken(data.details.user_token);
            this.DataStorePersisted.user_settings = data.details.user_settings;
            this.$router.push("/home");
          }
        })
        .catch((error) => {
          APIinterface.notify("negative", error, "error_outline", this.$q);
        })
        .then((data) => {});
    },
  },
};
</script>
