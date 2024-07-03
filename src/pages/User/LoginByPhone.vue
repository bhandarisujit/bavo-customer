<template>
  <q-header
    :class="{
      'bg-mydark ': $q.dark.mode,
      'bg-white text-dark': !$q.dark.mode,
    }"
    reveal
  >
    <q-toolbar>
      <q-btn
        @click="$router.back()"
        round
        dense
        icon="arrow_back"
        unelevated
        :color="$q.dark.mode ? 'grey' : 'mygrey'"
        :text-color="$q.dark.mode ? 'grey-9' : 'dark'"
      />
      <q-toolbar-title class="text-weight-bold text-darkx">{{
        $t("Let's Sign You In")
      }}</q-toolbar-title>
    </q-toolbar>
  </q-header>
  <q-page padding class="text-dark flex flex-center">
    <div v-if="page_ready" class="full-width q-pa-md">
      <!-- <h5 class="q-ma-none text-weight-bold">{{ $t("Let's Sign You In") }}</h5> -->
      <p class="text-weight-light text-dark">
        {{ $t("Enter your phone number and password for sigin") }}.
      </p>
      <q-form @submit="onSubmit">
        <q-input
          v-model="mobile_number"
          :label="$t('Mobile number')"
          stack-label
          :prefix="SettingStore.settings_data.phone_data.phonecode"
          mask="##################"
          :rules="[
            (val) => (val && val.length > 0) || $t('This field is required'),
            (val) => val.length <= 15 || $t('Please use maximum 15 characters'),
          ]"
        />

        <q-input
          v-model="password"
          :type="field_type"
          :label="$t('Password')"
          stack-label
          color="grey-5"
          :rules="[
            (val) =>
              (val && val.length > 0) || this.$t('This field is required'),
          ]"
        >
          <template v-slot:append>
            <q-icon
              @click="
                this.field_type =
                  this.field_type == 'password' ? 'text' : 'password'
              "
              :name="
                this.field_type == 'password'
                  ? 'las la-low-vision'
                  : 'las la-eye'
              "
              color="grey"
              class="cursor-pointer"
            />
          </template>
        </q-input>

        <componentsRecaptcha
          ref="recapcha"
          :sitekey="SettingStore.settings_data.captcha_site_key"
          :is_enabled="SettingStore.settings_data.captcha_enabled"
          :language_code="SettingStore.settings_data.captcha_lang"
          size="normal"
          theme="light"
          :tabindex="0"
          @verify="recaptchaVerified"
          @expire="recaptchaExpired"
          @fail="recaptchaFailed"
        />

        <div class="text-center">
          <q-btn flat no-caps color="primary" to="/user/forgotpassword"
            >{{ $t("Forgot Password") }}?</q-btn
          >
        </div>

        <q-space class="q-pa-sm"></q-space>

        <q-btn
          type="submit"
          color="primary"
          size="lg"
          rounded
          unelevated
          no-caps
          class="full-width"
          :loading="loading"
          >{{ $t("Login") }}</q-btn
        >

        <q-space class="q-pa-sm"></q-space>

        <div class="flex flex-center">
          <div>{{ $t("Don't have an account") }}?</div>
          <q-btn flat no-caps color="primary" to="/user/signup">{{
            $t("Sign up")
          }}</q-btn>
        </div>

        <q-space class="q-pa-md"></q-space>

        <SocialLogin></SocialLogin>
      </q-form>
    </div>
  </q-page>
</template>

<script>
import { defineAsyncComponent } from "vue";
import { useSettingStore } from "stores/SettingStore";
import { useDataStorePersisted } from "stores/DataStorePersisted";
import auth from "src/api/auth";
import APIinterface from "src/api/APIinterface";

export default {
  name: "LoginByPhone",
  components: {
    SocialLogin: defineAsyncComponent(() =>
      import("components/SocialLogin.vue")
    ),
    componentsRecaptcha: defineAsyncComponent(() =>
      import("components/componentsRecaptcha.vue")
    ),
  },
  data() {
    return {
      loading: false,
      mobile_number: "",
      password: "test",
      field_type: "password",
      password_icon: "las la-low-vision",
      recaptcha_response: "",
      redirect: "",
      page_ready: false,
    };
  },
  setup(props) {
    const SettingStore = useSettingStore();
    const DataStorePersisted = useDataStorePersisted();
    return { SettingStore, DataStorePersisted };
  },
  mounted() {
    this.redirect = this.$route.query.redirect;
    if (auth.authenticated()) {
      this.$router.push("/home");
    }

    if (Object.keys(this.SettingStore.settings_data).length > 0) {
      this.page_ready = true;
    } else {
      this.$watch(
        () => this.SettingStore.$state.settings_data,
        (newData, oldData) => {
          this.page_ready = true;
        }
      );
    }
  },
  methods: {
    refresh() {},
    recaptchaVerified(response) {
      this.recaptcha_response = response;
    },
    recaptchaExpired() {
      if (this.SettingStore.settings_data.captcha_enabled) {
        this.$refs.recapcha.reset();
      }
    },
    recaptchaFailed() {},
    onSubmit() {
      this.loading = true;
      APIinterface.fetchDataPost("userLoginPhone", {
        mobile_number: this.mobile_number,
        moble_prefix: this.SettingStore.settings_data.phone_data.phonecode,
        password: this.password,
        recaptcha_response: this.recaptcha_response,
      })
        .then((data) => {
          auth.setUser(data.details.user_data);
          auth.setToken(data.details.user_token);
          this.DataStorePersisted.user_settings = data.details.user_settings;
          if (!APIinterface.empty(this.redirect)) {
            this.$router.push(this.redirect);
          } else {
            this.$router.push("/home");
          }
        })
        .catch((error) => {
          this.recaptchaExpired();
          APIinterface.notify("dark", error, "error_outline", this.$q);
        })
        .then((data) => {
          this.loading = false;
        });
    },
  },
};
</script>
