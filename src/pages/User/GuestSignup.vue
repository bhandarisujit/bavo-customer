<template>
  <q-header
    class="bg-whitex"
    reveal
    :class="{
      'bg-mydark text-white': $q.dark.mode,
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
        $t("Guest")
      }}</q-toolbar-title>
    </q-toolbar>
  </q-header>
  <q-page class="q-pa-md">
    <q-form @submit="onSubmit" v-if="page_ready">
      <q-input
        v-model="first_name"
        :label="$t('First name')"
        stack-label
        :rules="[
          (val) => (val && val.length > 0) || this.$t('This field is required'),
        ]"
      />
      <q-input
        v-model="last_name"
        :label="$t('Last name')"
        stack-label
        :rules="[
          (val) => (val && val.length > 0) || this.$t('This field is required'),
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

      <div class="q-gutter-y-md">
        <q-input
          v-model="email_address"
          :label="$t('Email address')"
          stack-label
          autocomplete="off"
          :rules="[
            (val, rules) =>
              rules.email(val) || this.$t('Please enter a valid email address'),
          ]"
        />

        <div class="flex q-mb-sm">
          <div class="text-weight-bold q-mr-sm">{{ $t("Create Account") }}</div>
          <!--<div class="text-caption">(Optional)</div>-->
        </div>

        <q-input
          v-model="password"
          :type="field_type"
          :label="$t('Password')"
          stack-label
          color="grey-5"
          autocomplete="off"
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

        <div class="scroll">
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
        </div>

        <template v-if="SettingStore.settings_data.signup_enabled_terms">
          <div
            class="text-caption q-pb-md"
            v-html="SettingStore.settings_data.signup_terms"
          ></div>
        </template>
      </div>

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
          >{{ $t("Continue") }}</q-btn
        >
      </q-footer>
    </q-form>
  </q-page>
</template>

<script>
import { defineAsyncComponent } from "vue";
import { useSettingStore } from "stores/SettingStore";
import { useDataStorePersisted } from "stores/DataStorePersisted";
import APIinterface from "src/api/APIinterface";
import auth from "src/api/auth";

export default {
  name: "GuestSignup",
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
      APIinterface.fetchDataPost("registerGuest", {
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
            if(this.DataStorePersisted.area_id){
              this.$router.push("/cart");
            } else {
              this.$router.push("/home");
            }

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
