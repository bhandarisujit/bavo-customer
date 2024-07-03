<template>
  <q-header
    class="bg-whitex"
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
        $t("Change password")
      }}</q-toolbar-title>
    </q-toolbar>
  </q-header>
  <q-page class="q-pa-md">
    <q-form @submit="onSubmit">
      <q-input
        v-model="old_password"
        :label="$t('Old password')"
        :type="field_type"
        stack-label
        :rules="[
          (val) => (val && val.length > 0) || this.$t('This field is required'),
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

      <q-input
        v-model="new_password"
        :label="$t('New password')"
        :type="field_type"
        stack-label
        :rules="[
          (val) => (val && val.length > 0) || this.$t('This field is required'),
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

      <q-input
        v-model="confirm_password"
        :label="$t('Confirm password')"
        :type="field_type"
        stack-label
        :rules="[
          (val) => (val && val.length > 0) || this.$t('This field is required'),
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

      <q-space class="q-pa-sm"></q-space>

      <q-footer
        class="q-pa-md bg-whitex row q-gutter-x-sm"
        :class="{
          'bg-mydark': $q.dark.mode,
          'bg-white': !$q.dark.mode,
        }"
      >
        <q-btn
          :color="$q.dark.mode ? 'grey' : 'dark'"
          :text-color="$q.dark.mode ? 'grey-9' : 'white'"
          size="lg"
          rounded
          unelevated
          no-caps
          class="col"
          @click="$router.back()"
          >{{ $t("Cancel") }}</q-btn
        >
        <q-btn
          type="submit"
          color="primary"
          text-color="white"
          size="lg"
          rounded
          unelevated
          no-caps
          class="col"
          :loading="loading"
          >{{ $t("Save") }}</q-btn
        >
      </q-footer>
    </q-form>
  </q-page>
</template>

<script>
import APIinterface from "src/api/APIinterface";

export default {
  name: "ChangePassword",
  data() {
    return {
      loading: false,
      old_password: "",
      new_password: "",
      confirm_password: "",
      field_type: "password",
    };
  },
  methods: {
    onSubmit() {
      this.loading = true;
      APIinterface.fetchDataByToken("updatePassword", {
        old_password: this.old_password,
        new_password: this.new_password,
        confirm_password: this.confirm_password,
      })
        .then((data) => {
          APIinterface.notify(
            this.$q.dark.mode ? "grey600" : "lightgreen",
            data.msg,
            "check_circle",
            this.$q
          );
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
