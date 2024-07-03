<template>
  <q-dialog
    v-model="show_modal"
    @before-show="cancelOrderStatus"
    persistent
    position="bottom"
    transition-show="fade"
    transition-hide="fadeout"
  >
    <q-card
      :class="{
        'bg-grey600 text-white': $q.dark.mode,
      }"
    >
      <template v-if="loading">
        <q-card-section>
          <q-skeleton
            height="150px"
            square
            :class="{
              'bg-grey600': $q.dark.mode,
              'bg-mygrey': !$q.dark.mode,
            }"
          />
          <div class="row q-gutter-x-sm q-mt-sm">
            <div class="col">
              <q-skeleton
                type="QToolbar"
                :class="{
                  'bg-grey600': $q.dark.mode,
                  'bg-mygrey': !$q.dark.mode,
                }"
              />
            </div>
            <div class="col">
              <q-skeleton
                type="QToolbar"
                :class="{
                  'bg-grey600': $q.dark.mode,
                  'bg-mygrey': !$q.dark.mode,
                }"
              />
            </div>
          </div>
        </q-card-section>
      </template>
      <template v-else>
        <q-card-section class="row items-center q-pb-none">
          <div class="text-h6 text-weight-bold">{{ $t("Cancel order") }}</div>
          <q-space />
          <q-btn icon="close" flat round dense v-close-popup />
        </q-card-section>

        <q-card-section>
          <div
            class="text-weight-bold text-body1"
            v-if="cancel_response.refund_status === 'full_refund'"
          >
            {{ $t("Are you sure") }}?
          </div>
          <h5 class="text-weight-bold no-margin text-body1" v-else>
            {{ $t("How would you like to proceed") }}?
          </h5>

          <div class="q-mt-md">
            <p class="text-body2">{{ cancel_msg }}</p>
          </div>

          <div class="q-mt-md q-mb-sm" v-if="cancel_response.refund_msg">
            <p class="text-body2">
              {{ cancel_response.refund_msg }}
            </p>
          </div>
        </q-card-section>
        <q-separator></q-separator>
        <q-card-actions>
          <div class="row fit q-gutter-x-sm">
            <div class="col">
              <q-btn
                unelevated
                rounded
                color="primary"
                no-caps
                size="17px"
                :disable="!cancel_status"
                :loading="loading_submit"
                @click="applyCancelOrder"
                class="fit"
              >
                {{ $t("Cancel order") }}
              </q-btn>
            </div>
            <div class="col">
              <q-btn
                unelevated
                rounded
                :color="$q.dark.mode ? 'grey300' : 'dark'"
                :text-color="$q.dark.mode ? 'grey600' : 'white'"
                no-caps
                v-close-popup
                size="17px"
                class="fit"
              >
                {{ $t("Don't Cancel") }}
              </q-btn>
            </div>
          </div>
        </q-card-actions>
      </template>
    </q-card>
  </q-dialog>
</template>

<script>
import APIinterface from "src/api/APIinterface";

export default {
  name: "CancelOrder",
  data() {
    return {
      loading: false,
      loading_submit: false,
      show_modal: false,
      order_uuid: "",
      cancel_status: false,
      cancel_msg: "",
      cancel_response: [],
    };
  },
  methods: {
    showModal(orderUuid) {
      this.order_uuid = orderUuid;
      this.show_modal = true;
    },
    cancelOrderStatus() {
      this.loading = true;
      APIinterface.fetchDataByTokenPost(
        "cancelOrderStatus",
        "order_uuid=" + this.order_uuid
      )
        .then((data) => {
          this.cancel_status = data.details.cancel_status;
          this.cancel_msg = data.details.cancel_msg;
          this.cancel_response = data.details;
        })
        .catch((error) => {
          APIinterface.notify("dark", error, "error_outline", this.$q);
        })
        .then((data) => {
          this.loading = false;
        });
    },
    applyCancelOrder() {
      this.loading_submit = true;
      APIinterface.fetchDataByTokenPost(
        "applyCancelOrder",
        "order_uuid=" + this.order_uuid
      )
        .then((data) => {
          this.show_modal = false;
          APIinterface.notify("dark", data.msg, "check_circle", this.$q);
          this.$emit("afterCancelorder");
        })
        .catch((error) => {
          APIinterface.notify("dark", error, "warning", this.$q);
        })
        .then((data) => {
          this.loading_submit = false;
        });
    },
  },
};
</script>
