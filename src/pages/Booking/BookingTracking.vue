<template>
  <q-pull-to-refresh @refresh="refresh">
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
          $t("Track Booking")
        }}</q-toolbar-title>
        <template v-if="BookingStore.hasBookingData">
          <q-btn
            v-if="BookingStore.CanCancelReservation"
            dense
            flat
            unelevated
            color="red-5"
            round
            icon="las la-trash"
            class="q-ml-md"
            :to="{
              path: '/reservation/cancel',
              query: { id: this.reservation_uuid },
            }"
          />
        </template>
      </q-toolbar>
    </q-header>
    <q-page
      class="q-pa-md"
      :class="{
        'bg-mydark text-white': $q.dark.mode,
        'bg-white text-dark': !$q.dark.mode,
      }"
    >
      <template v-if="BookingStore.hasBookingData">
        <div
          class="q-pa-sm bg-mygreyx radius10"
          :class="{
            'bg-grey600 ': $q.dark.mode,
            'bg-mygrey ': !$q.dark.mode,
          }"
        >
          <q-stepper
            v-model="steps"
            ref="stepper"
            contracted
            animated
            flat
            class="bg-transparent"
            done-color="primary"
            active-color="primary"
            :inactive-color="$q.dark.mode ? 'grey300' : 'white'"
          >
            <q-step
              :name="1"
              icon="pending_actions"
              active-icon="pending_actions"
              done-icon="pending_actions"
              :done-color="
                BookingStore.getBookingStatusSteps > 1 ? 'primary' : 'red'
              "
              :done="
                BookingStore.getBookingStatusSteps >= 1 ||
                BookingStore.getBookingStatusSteps <= 0
              "
            />
            <q-step
              :name="2"
              icon="restaurant"
              active-icon="restaurant"
              done-icon="restaurant"
              :done-color="
                BookingStore.getBookingStatusSteps >= 2 ? 'primary' : 'red'
              "
              :done="
                BookingStore.getBookingStatusSteps >= 2 ||
                BookingStore.getBookingStatusSteps <= 0
              "
            />
            <q-step
              :name="3"
              icon="flag"
              active-icon="flag"
              done-icon="flag"
              :done-color="
                BookingStore.getBookingStatusSteps >= 3 ? 'primary' : 'red'
              "
              :done="
                BookingStore.getBookingStatusSteps >= 3 ||
                BookingStore.getBookingStatusSteps <= 0
              "
            />
          </q-stepper>
        </div>

        <template v-if="BookingStore.getBookingStatusSteps <= 0">
          <div class="text-center">
            <div class="q-pa-sm" :class="BookingStore.bookingStatusColor">
              {{ BookingStore.booking_data.data.status_pretty }}
            </div>
          </div>
        </template>
        <template v-else>
          <q-space class="q-pa-sm"></q-space>
        </template>
        <q-list>
          <q-item>
            <q-item-section avatar top>
              <q-img
                :src="BookingStore.getBooking.merchant.logo"
                style="width: 70px; height: 70px"
                fit="cover"
                loading="lazy"
                spinner-color="primary"
                spinner-size="xs"
                class="rounded-borders"
              ></q-img>
            </q-item-section>
            <q-item-section top>
              <q-item-label>{{
                BookingStore.getBooking.merchant.restaurant_name
              }}</q-item-label>
              <q-item-label caption>
                {{ BookingStore.getBooking.merchant.address }}
              </q-item-label>
            </q-item-section>
          </q-item>
        </q-list>
        <q-space class="q-pa-sm"></q-space>

        <q-list bordered dense class="radius10">
          <q-item class="q-pa-none">
            <q-item-section>
              <q-item-label>{{ $t("Reservation ID") }}</q-item-label>
            </q-item-section>
            <q-item-section>
              <q-item-label caption>{{
                BookingStore.getBooking.data.reservation_id
              }}</q-item-label>
            </q-item-section>
          </q-item>
          <q-item class="q-pa-none">
            <q-item-section>
              <q-item-label>{{ $t("Guest") }}</q-item-label>
            </q-item-section>
            <q-item-section>
              <q-item-label caption>{{
                BookingStore.getBooking.data.guest_number
              }}</q-item-label>
            </q-item-section>
          </q-item>
          <q-item class="q-pa-none">
            <q-item-section>
              <q-item-label>{{ $t("Date") }} :</q-item-label>
            </q-item-section>
            <q-item-section>
              <q-item-label caption>{{
                BookingStore.getBooking.data.reservation_date
              }}</q-item-label>
            </q-item-section>
          </q-item>
          <q-item class="q-pa-none">
            <q-item-section>
              <q-item-label>{{ $t("Time") }}</q-item-label>
            </q-item-section>
            <q-item-section>
              <q-item-label caption>{{
                BookingStore.getBooking.data.reservation_time
              }}</q-item-label>
            </q-item-section>
          </q-item>
        </q-list>
        <q-space class="q-pa-sm"></q-space>

        <q-list bordered dense class="radius10">
          <q-item class="q-pa-none">
            <q-item-section>
              <q-item-label>{{ $t("Name") }}</q-item-label>
            </q-item-section>
            <q-item-section>
              <q-item-label caption>{{
                BookingStore.getBooking.data.full_name
              }}</q-item-label>
            </q-item-section>
          </q-item>
          <q-item class="q-pa-none">
            <q-item-section>
              <q-item-label>{{ $t("Email address") }}</q-item-label>
            </q-item-section>
            <q-item-section>
              <q-item-label caption>{{
                BookingStore.getBooking.data.email_address
              }}</q-item-label>
            </q-item-section>
          </q-item>
          <q-item class="q-pa-none">
            <q-item-section>
              <q-item-label>{{ $t("Contact number") }}</q-item-label>
            </q-item-section>
            <q-item-section>
              <q-item-label caption>{{
                BookingStore.getBooking.data.contact_phone
              }}</q-item-label>
            </q-item-section>
          </q-item>
          <q-item class="q-pa-none">
            <q-item-section>
              <q-item-label>{{ $t("Special Request") }}</q-item-label>
            </q-item-section>
            <q-item-section>
              <q-item-label caption>{{
                BookingStore.getBooking.data.special_request
              }}</q-item-label>
            </q-item-section>
          </q-item>
        </q-list>

        <q-footer
          class="q-pl-md q-pr-md q-pt-sm q-pb-sm text-dark border-top"
          :class="{
            'bg-mydark ': $q.dark.mode,
            'bg-white ': !$q.dark.mode,
          }"
          v-if="BookingStore.CanCancelReservation"
        >
          <q-btn
            unelevated
            color="primary"
            :label="$t('Modify Reservation')"
            class="radius20 fit"
            no-caps
            size="lg"
            :to="{
              path: '/reservation/update',
              query: { id: this.reservation_uuid },
            }"
          />
        </q-footer>
      </template>

      <template v-if="BookingStore.isLoading">
        <q-inner-loading
          :showing="true"
          :color="$q.dark.mode ? 'grey300' : 'primary'"
        />
      </template>
    </q-page>
  </q-pull-to-refresh>

  <ComponentsRealtime
    ref="realtime"
    getevent="notifications"
    @after-receive="afterReceive"
  />
</template>

<script>
import { defineAsyncComponent } from "vue";
import { useBookingStore } from "stores/BookingStore";

export default {
  name: "BookingTracking",
  components: {
    ComponentsRealtime: defineAsyncComponent(() =>
      import("components/ComponentsRealtime.vue")
    ),
  },
  data() {
    return {
      reservation_uuid: "",
      steps: 1,
    };
  },
  setup() {
    const BookingStore = useBookingStore();
    return { BookingStore };
  },
  mounted() {
    this.reservation_uuid = this.$route.query.id;
    console.log("reservation_uuid", this.reservation_uuid);
    this.BookingDetails();
  },
  methods: {
    refresh(done) {
      this.BookingStore.getBookingDetails(this.reservation_uuid, done);
    },
    BookingDetails() {
      this.BookingStore.getBookingDetails(this.reservation_uuid, null);
    },
    afterReceive(data) {
      console.log("afterReceive");
      console.log(data);
    },
  },
};
</script>
