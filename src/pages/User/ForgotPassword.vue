<template>
  <q-header
    class="bg-whitex"
    reveal
    :class="{
      'bg-mydark ': $q.dark.mode,
      'bg-white ': !$q.dark.mode,
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
    <div class="full-width q-pa-md">
      <h5 class="q-ma-none text-weight-bold">{{ $t("Forgot Password") }}</h5>
      <p class="text-weight-light">
        {{
          $t(
            "We need your registration email address to send your password reset code"
          )
        }}
      </p>
      <q-form @submit="onSubmit">
        <q-input
          v-model="email_address"
          :label="$t('Email address')"
          stack-label
          :rules="[
            (val, rules) =>
              rules.email(val) || this.$t('Please enter a valid email address'),
          ]"
        />

        <q-btn
          type="submit"
          color="primary"
          size="lg"
          rounded
          unelevated
          no-caps
          class="full-width"
          :loading="loading"
          >{{ $t("Send") }}</q-btn
        >

        <q-space class="q-pa-sm"></q-space>

        <div class="flex flex-center">
          <div>{{ $t("Already have an account") }}?</div>
          <q-btn flat no-caps color="primary" to="/user/login">
            {{ $t("Sign in") }}</q-btn
          >
        </div>
      </q-form>
    </div>
  </q-page>
</template>

<script>
import APIinterface from "src/api/APIinterface";

export default {
  name: "ForgotPassword",
  data() {
    return {
      loading: false,
      email_address: "",
    };
  },
  methods: {
    onSubmit() {
      this.loading = true;
      APIinterface.fetchDataPost(
        "requestResetPassword",
        "email_address=" + this.email_address
      )
        .then((data) => {
          this.$router.push({
            path: "/user/resetpassword",
            query: { msg: data.msg, uuid: data.details.uuid },
          });
        })
        .catch((error) => {
          APIinterface.notify("dark", error, "error_outline", this.$q);
        })
        .then((data) => {
          this.loading = false;
        });
    },
  },
};
</script>
