<template>
  <q-page padding class="login-page text-white flex flex-center">
    <div class="fixed-top q-pl-md q-pr-md">
      <q-toolbar>
        <q-space></q-space>
        <q-btn
          rounded
          color="primary"
          :label="$t('Skip')"
          no-caps
          unelevated
          @click="setHome"
        />
      </q-toolbar>
    </div>
    <q-img
          src="logo.png"
          placeholder-src="placeholder.png"
          style="height: 100px;width:200px;"
          fit="contain"
          spinner-color="primary"
          spinner-size="xs"
        >
    </q-img>
    <div class="full-width q-pa-md">
      <h4 class="q-ma-none text-weight-bold text-primary">{{ $t("Welcome to") }}</h4>
      <h4 class="q-ma-none text-weight-bolder text-primary">
        Bravo Pizzeria Weimar
      </h4>
      <p class="text-weight-light text-black q-mt-md">
        {{ $t("Your favorite foods delivered fast at your door") }}
      </p>
    </div>
    <div class="fixed-bottom q-pa-lg q-gutter-md">
      <q-btn
        color="primary"
        size="lg"
        rounded
        unelevated
        no-caps
        class="full-width"
        to="user/login"
        >{{ $t("Login") }}</q-btn
      >
      <q-btn
        color="primary"
        outline
        rounded
        unelevated
        no-caps
        class="full-width"
        size="lg"
        to="user/signup"
        >{{ $t("Sign up") }}</q-btn
      >
    </div>
  </q-page>
</template>

<script>
import { useDataStorePersisted } from "stores/DataStorePersisted";

export default {
  name: "WelcomePage",
  setup() {
    const DataStorePersisted = useDataStorePersisted();
    return { DataStorePersisted };
  },
  methods: {
    setHome() {
      this.DataStorePersisted.skip_home = true;
      this.$router.push("/home");
    },
  },
};
</script>
