<template>
  <template v-if="active">
    <q-btn
      @click="addTofav()"
      :color="$q.dark.mode ? 'grey300' : 'blue'"
      icon="favorite_border"
      size="sm"
      outline
      round
      :loading="loading"
    />
  </template>
  <template v-else>
    <q-btn
      @click="addTofav()"
      :color="$q.dark.mode ? 'mygrey' : 'primary'"
      icon="favorite_border"
      size="sm"
      outline
      round
      :loading="loading"
    />
  </template>
</template>

<script>
import APIinterface from "src/api/APIinterface";
import auth from "src/api/auth";

export default {
  name: "FavsItems",
  props: ["item_token", "cat_id", "active"],
  data() {
    return {
      loading: false,
    };
  },
  methods: {
    addTofav() {
      if (auth.authenticated()) {
        this.loading = true;
        let $params =
          "item_token=" + this.item_token + "&cat_id=" + this.cat_id;
        APIinterface.fetchDataByTokenPost("addTofav", $params)
          .then((data) => {
            this.$emit("afterSavefav", data.details.found);
          })
          .catch((error) => {
            APIinterface.notify("negative", error, "error_outline", this.$q);
          })
          .then((data) => {
            this.loading = false;
          });
      } else {
        APIinterface.notify(
          "negative",
          this.$t("You need to login to save this to your favorites items"),
          "error_outline",
          this.$q
        );
      }
    },
  },
};
</script>
