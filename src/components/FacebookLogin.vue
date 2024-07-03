<template>
  <q-btn
    icon="lab la-facebook-f"
    unelevated
    :color="$q.dark.mode ? 'grey600' : 'grey-3'"
    class="rounded-borders text-grey"
    @click="Signin"
    :loading="loading"
    size="lg"
  />
</template>

<script>
import { FacebookLogin } from "@capacitor-community/facebook-login";
import APIinterface from "src/api/APIinterface";

const FACEBOOK_PERMISSIONS = [
  "email",
  "user_birthday",
  "user_photos",
  "user_gender",
];

export default {
  name: "FacebookLogin",
  props: ["app_id"],
  data() {
    return {
      loading: false,
    };
  },
  mounted() {
    this.init();
  },
  methods: {
    init() {
      FacebookLogin.initialize({ appId: this.app_id });
    },
    Signin() {
      FacebookLogin.login({ permissions: FACEBOOK_PERMISSIONS })
        .then((data) => {
          this.getFbProfile(data.accessToken.token);
        })
        .catch((error) => {
          // alert(JSON.stringify(error))
        })
        .then((data) => {
          //
        });
    },
    getFbProfile(accessToken) {
      this.loading = true;
      FacebookLogin.getProfile({ fields: ["email", "first_name", "last_name"] })
        .then((data) => {
          console.debug(data);
          const $params = {
            id: data.id,
            email_address: data.email,
            first_name: data.first_name,
            last_name: data.last_name,
            social_strategy: "facebook",
            social_token: accessToken,
          };
          this.$emit("afterLogin", $params);
        })
        .catch((error) => {
          APIinterface.notify("red-5", error, "error_outline", this.$q);
        })
        .then((data) => {
          this.loading = false;
        });
    },
  },
};
</script>
