<template>
  <q-header
    reveal
    :class="{
      'bg-mydark ': $q.dark.mode,
      'bg-white text-dark': !$q.dark.mode,
    }"
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
        $t("Create Account")
      }}</q-toolbar-title>
    </q-toolbar>
  </q-header>
  <q-page
    padding
    class="text-darkx flex flex-center"
    :class="{
      'text-white': $q.dark.mode,
      'text-dark': !$q.dark.mode,
    }"
  >
    <div v-if="page_ready" class="full-width q-pa-md">
      <q-form @submit="onSubmit">
        <q-input
          v-model="first_name"
          :label="$t('First name')"
          stack-label
          :rules="[
            (val) =>
              (val && val.length > 0) || this.$t('This field is required'),
          ]"
        />

        <q-input
          v-model="last_name"
          :label="$t('Last name')"
          stack-label
          :rules="[
            (val) =>
              (val && val.length > 0) || this.$t('This field is required'),
          ]"
        />

        <q-input
          v-model="email_address"
          :label="$t('Email address')"
          stack-label
          :rules="[
            (val, rules) =>
              rules.email(val) || this.$t('Please enter a valid email address'),
          ]"
        />

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
              :name="password_icon"
              color="grey"
              class="cursor-pointer"
            />
          </template>
        </q-input>

        <q-input
          v-model="cpassword"
          :type="field_type"
          :label="$t('Confirm password')"
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
              :name="password_icon"
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

        <q-footer
          class="q-pa-md border-top"
          :class="{
            'bg-mydark text-white': $q.dark.mode,
            'bg-white text-black': !$q.dark.mode,
          }"
        >
          <q-btn
            type="submit"
            color="primary"
            size="lg"
            rounded
            unelevated
            no-caps
            class="full-width"
            :loading="loading"
            >{{ $t("Create Account") }}</q-btn
          >
        </q-footer>
      </q-form>
    </div>
  </q-page>
</template>

<script>
import { defineAsyncComponent } from "vue";
import { useSettingStore } from "stores/SettingStore";
import { useDataStorePersisted } from "stores/DataStorePersisted";
import APIinterface from "src/api/APIinterface";
import auth from "src/api/auth";

export default {
  name: "LoginPage",
  components: {
    componentsRecaptcha: defineAsyncComponent(() =>
      import("components/componentsRecaptcha.vue")
    ),
  },
  setup(props) {
    const SettingStore = useSettingStore();
    const DataStorePersisted = useDataStorePersisted();
    return { SettingStore, DataStorePersisted };
  },
  data() {
    return {
      loading: false,
      first_name: "",
      last_name: "",
      email_address: "",
      mobile_number: "",
      mobile_prefix: "",
      password: "",
      cpassword: "",
      field_type: "password",
      password_icon: "las la-low-vision",
      recaptcha_response: "",
      page_ready: false,
    };
  },
  mounted() {
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
  watch: {
    field_type(newval, oldval) {
      this.password_icon =
        newval == "password" ? "las la-low-vision" : "las la-eye";
    },
  },
  methods: {
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
      APIinterface.fetchDataPost("registerUser", {
        first_name: this.first_name,
        last_name: this.last_name,
        email_address: this.email_address,
        mobile_prefix: this.SettingStore.settings_data.phone_data.phonecode,
        mobile_number: this.mobile_number,
        password: this.password,
        cpassword: this.cpassword,
        recaptcha_response: this.recaptcha_response,
      })
        .then((data) => {
          if (data.details.verify === true) {
            this.$router.push({
              path: "/user/verifycode",
              query: { uuid: data.details.uuid, msg: data.msg },
            });
          } else {
            auth.setUser(data.details.user_data);
            auth.setToken(data.details.user_token);
            this.DataStorePersisted.user_settings = data.details.user_settings;
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
