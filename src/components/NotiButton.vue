<template>
  <!-- <pre>{{ SettingStore.realtime_data }}</pre> -->
  <q-btn
    dense
    flat
    unelevated
    :color="$q.dark.mode ? 'grey' : 'primary'"
    round
    icon="notifications"
    class="q-ml-sm"
    @click="toNotification"
    size="lg"
  >
    <transition
      v-if="hasData"
      appear
      enter-active-class="animated zoomIn"
      leave-active-class="animated zoomOut"
    >
      <q-badge color="red" rounded />
    </transition>
  </q-btn>
</template>

<script>
import { useSettingStore } from "stores/SettingStore";

export default {
  name: "NotiButton",
  components: {},
  data() {
    return {
      data: [],
    };
  },
  setup() {
    const SettingStore = useSettingStore();
    return { SettingStore };
  },
  computed: {
    hasData() {
      if (Object.keys(this.SettingStore.realtime_data).length > 0) {
        return true;
      }
      return false;
    },
  },
  methods: {
    toNotification() {
      this.SettingStore.realtime_data = [];
      this.$router.push("/notifications");
    },
  },
};
</script>
