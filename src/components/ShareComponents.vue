<template>
  <template v-if="this.$q.capacitor">
    <q-btn
      @click="share"
      color="primary"
      icon="share"
      size="sm"
      outline
      round
    />
  </template>
  <template v-else>
    <q-btn color="primary" icon="share" size="sm" outline round />
  </template>
</template>

<script>
import { Share } from "@capacitor/share";

export default {
  name: "ShareComponents",
  props: ["title", "text", "url", "dialogTitle"],
  methods: {
    share() {
      Share.share({
        title: this.title,
        text: this.text,
        url: this.url,
        dialogTitle: this.dialogTitle,
      })
        .then((data) => {
          //
        })
        .catch((error) => {});
    },
  },
};
</script>
