<template>
  <q-header
    class="bg-whitex"
    reveal
    :class="{
      'bg-mydark text-white': $q.dark.mode,
      'bg-white text-black': !$q.dark.mode,
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
      <q-toolbar-title class="text-weight-bold text-darkx"
        >Update Reservation</q-toolbar-title
      >
    </q-toolbar>
  </q-header>
  <q-page class="q-pl-md q-pr-md q-pb-md q-pt-sm">
    <template v-if="BookingStore.hasData">
      <template v-if="BookingStore.getSteps == 1">
        <q-select
          v-model="BookingStore.guest"
          :options="BookingStore.guest_list"
          @update:model-value="
            BookingStore.getTimeslot(
              SettingStore.merchant_uuid,
              this.reservation_uuid
            )
          "
          :label="$t('Guest')"
          dense
          color="primary"
          class="q-mb-md col-xs-12 col-sm-12 col-md-4"
          transition-show="scale"
          transition-hide="scale"
          emit-value
        />

        <q-select
          v-model="BookingStore.reservation_date"
          :options="BookingStore.date_list"
          @update:model-value="
            BookingStore.getTimeslot(
              SettingStore.merchant_uuid,
              this.reservation_uuid
            )
          "
          :label="$t('Date')"
          dense
          color="primary"
          class="q-mb-md col-xs-12 col-sm-12 col-md-4"
          transition-show="scale"
          transition-hide="scale"
          emit-value
          map-options
        />

        <q-space class="q-pa-sm"></q-space>

        <q-input
          filled
          v-model="BookingStore.reservation_time"
          :label="$t('Time')"
          disable
        />

        <q-space class="q-pa-sm"></q-space>

        <div v-if="BookingStore.hasTimeSlot" class="row q-gutter-sm">
          <template v-for="items in BookingStore.getTimeList" :key="items">
            <template v-for="(item, index) in items" :key="item">
              <div class="col-2 text-center">
                <q-btn
                  unelevated
                  :label="item"
                  class="full-width"
                  :outline="BookingStore.isSelected(index) ? false : true"
                  :color="
                    BookingStore.isSelected(index)
                      ? $q.dark.mode
                        ? 'grey300'
                        : 'primary'
                      : BookingStore.isNotavailable(index)
                      ? 'grey'
                      : $q.dark.mode
                      ? 'grey300'
                      : 'black'
                  "
                  @click="BookingStore.reservation_time = index"
                  :disabled="BookingStore.isNotavailable(index)"
                />
              </div>
            </template>
          </template>
        </div>

        <!-- <template v-if="DataStorePersisted.getBookingTc">
          <div class="text-weight-bold font15 q-mt-md">
            Restaurant Terms & Conditions
          </div>
          <div class="text-grey" v-html="DataStorePersisted.getBookingTc"></div>
        </template> -->

        <q-footer
          class="q-pl-md q-pr-md q-pt-sm q-pb-sm bg-whitex border-top"
          :class="{
            'bg-mydark text-white': $q.dark.mode,
            'bg-white text-dark': !$q.dark.mode,
          }"
        >
          <q-btn
            color="primary"
            size="lg"
            rounded
            unelevated
            no-caps
            class="full-width"
            :disabled="!BookingStore.bookingValid"
            :loading="BookingStore.loading"
            @click="SetBooking"
            >{{ $t("Continue") }}</q-btn
          >
        </q-footer>
      </template>
      <!-- END STEP 1 -->

      <template v-if="BookingStore.getSteps == 2">
        <q-form @submit="onSubmit">
          <div class="q-mt-sm text-weight-bold text-body1">
            {{ $t("Reservation details") }}
          </div>
          <div class="text-caption text-body2">
            <div>{{ BookingStore.reservation_info.full_time }}</div>
            <div>{{ BookingStore.reservation_info.guest }}</div>
          </div>

          <div class="q-mt-sm text-weight-bold text-body1">
            {{ $t("Personal details") }}
          </div>

          <q-input
            v-model="BookingStore.first_name"
            :label="$t('First name')"
            lazy-rules
            :rules="[
              (val) => (val && val.length > 0) || $t('This field is required'),
            ]"
          />
          <q-input
            v-model="BookingStore.last_name"
            :label="$t('Last name')"
            lazy-rules
            :rules="[
              (val) => (val && val.length > 0) || $t('This field is required'),
            ]"
          />

          <q-input
            v-model="BookingStore.email_address"
            :label="$t('Email address')"
            lazy-rules
            :rules="[
              (val, rules) =>
                rules.email(val) || $t('Please enter a valid email address'),
            ]"
          />

          <q-input
            v-model="BookingStore.mobile_number"
            :label="$t('Mobile number')"
            mask="##################"
            :prefix="SettingStore.settings_data.phone_data.phonecode"
            :rules="[
              (val) => (val && val.length > 0) || $t('This field is required'),
              (val) =>
                val.length <= 15 || $t('Please use maximum 15 characters'),
            ]"
          />

          <template v-if="SettingStore.settings_data.allowed_choose_table">
            <q-select
              v-model="BookingStore.room_uuid"
              :options="BookingStore.room_list"
              @update:model-value="BookingStore.table_uuid = ''"
              :label="$t('Room name')"
              transition-show="scale"
              transition-hide="scale"
              emit-value
              map-options
              :rules="[
                (val) =>
                  (val && val.length > 0) || $t('This field is required'),
              ]"
            />
            <q-select
              v-model="BookingStore.table_uuid"
              :options="BookingStore.table_list[BookingStore.room_uuid]"
              :label="$t('Table name')"
              transition-show="scale"
              transition-hide="scale"
              emit-value
              map-options
              :rules="[
                (val) =>
                  (val && val.length > 0) || $t('This field is required'),
              ]"
            />
          </template>

          <div class="q-mt-sm text-weight-medium font15">
            {{ $t("Special requests") }}
          </div>

          <q-input
            v-model="BookingStore.special_request"
            autogrow
            color="warning"
          />

          <template v-if="SettingStore.settings_data.booking_enabled_capcha">
            <q-space class="q-pa-sm"></q-space>
            <componentsRecaptcha
              ref="recapcha"
              :sitekey="SettingStore.settings_data.captcha_site_key"
              is_enabled="1"
              :language_code="SettingStore.settings_data.captcha_lang"
              size="normal"
              theme="light"
              :tabindex="0"
              @verify="recaptchaVerified"
              @expire="recaptchaExpired"
              @fail="recaptchaFailed"
            />
          </template>

          <p class="text-grey q-mt-md q-mb-md">
            {{
              $t(
                "By continuing, you agree to Terms of Service and Privacy Policy"
              )
            }}.
          </p>

          <q-footer
            class="q-pl-md q-pr-md q-pt-sm q-pb-sm bg-whitex border-top"
            :class="{
              'bg-mydark text-white': $q.dark.mode,
              'bg-white text-dark': !$q.dark.mode,
            }"
          >
            <div class="row items-center q-gutter-sm">
              <q-btn
                :color="$q.dark.mode ? 'grey' : 'dark'"
                :text-color="$q.dark.mode ? 'grey-9' : 'white'"
                size="lg"
                rounded
                unelevated
                no-caps
                class="col"
                @click="this.BookingStore.steps = 1"
              >
                {{ $t("Cancel") }}</q-btn
              >
              <q-btn
                type="submit"
                color="primary"
                size="lg"
                rounded
                unelevated
                no-caps
                class="col"
                :loading="loading"
                >{{ $t("Update") }}</q-btn
              >
            </div>
          </q-footer>
        </q-form>
      </template>
      <!-- END STEP 2 -->

      <template v-if="BookingStore.getSteps == 3">
        <div class="flex flex-center text-center" style="height: calc(85vh)">
          <div class="text-center">
            <svg
              class="checkmark"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 52 52"
            >
              <circle
                class="checkmark__circle"
                cx="26"
                cy="26"
                r="25"
                fill="none"
              />
              <path
                class="checkmark__check"
                fill="none"
                d="M14.1 27.2l7.1 7.2 16.7-16.8"
              />
            </svg>
            <h4 class="text-body2 q-mb-none">
              <template v-if="isEdit">
                {{ $t("Your reservation succesfully updated") }}.
              </template>
              <template v-else>
                {{ $t("Your reservation successfully placed") }}.
              </template>
            </h4>
            <p class="text-grey text-body2">
              {{
                $t(
                  "You will receive another email once your reservation is confirm"
                )
              }}.
            </p>
            <h5 class="text-body2 line-normal q-mb-none">
              {{ success_data.full_time }}
            </h5>
            <div class="text-grey text-body2">
              <div>{{ success_data.guest }}</div>
              <div>
                {{ $t("Reservation ID") }}#
                <span class="text-success">{{
                  success_data.reservation_id
                }}</span>
              </div>
            </div>

            <q-space class="q-pa-md"></q-space>

            <div class="q-gutter-sm">
              <q-btn
                type="submit"
                color="primary"
                size="lg"
                rounded
                unelevated
                no-caps
                class="full-width"
                :label="$t('Track your reservation')"
                :to="{
                  path: '/reservation/track',
                  query: { id: success_data.reservation_uuid },
                }"
              ></q-btn>
              <q-btn
                type="submit"
                color="dark"
                size="lg"
                rounded
                unelevated
                no-caps
                class="full-width"
                :label="$t('Reserved table again')"
                @click="
                  BookingStore.resetReservation(SettingStore.merchant_uuid)
                "
              ></q-btn>
            </div>
          </div>
        </div>
      </template>
      <!-- END STEP 3 -->
    </template>
    <!-- end has booking data -->

    <template v-if="BookingStore.isLoading">
      <q-inner-loading
        :showing="true"
        :color="$q.dark.mode ? 'grey300' : 'primary'"
      />
    </template>
  </q-page>
</template>

<script>
import { defineAsyncComponent } from "vue";
import { useBookingStore } from "stores/BookingStore";
import APIinterface from "src/api/APIinterface";
import { useSettingStore } from "stores/SettingStore";

export default {
  name: "BookingUpdate",
  components: {
    componentsRecaptcha: defineAsyncComponent(() =>
      import("components/componentsRecaptcha.vue")
    ),
  },
  data() {
    return {
      loading: false,
      recaptcha_response: "",
      success_data: [],
      reservation_uuid: "",
    };
  },
  setup() {
    const BookingStore = useBookingStore();
    const SettingStore = useSettingStore();
    return { BookingStore, SettingStore };
  },
  mounted() {
    this.BookingStore.steps = 1;
    this.reservation_uuid = this.$route.query.id;

    if (Object.keys(this.SettingStore.settings_data).length > 0) {
      this.Getbookingattributes();
    } else {
      this.$watch(
        () => this.SettingStore.$state.settings_data,
        (newData, oldData) => {
          this.Getbookingattributes();
        }
      );
    }
  },
  computed: {
    isEdit() {
      if (!APIinterface.empty(this.reservation_uuid)) {
        return true;
      }
      return false;
    },
  },
  methods: {
    Getbookingattributes() {
      this.reservation_uuid = this.$route.query.id;
      this.BookingStore.Getbookingattributes(
        this.SettingStore.merchant_uuid,
        this.reservation_uuid
      );
    },
    SetBooking() {
      this.BookingStore.SetBooking(
        this.SettingStore.merchant_uuid,
        this.reservation_uuid
      );
    },
    recaptchaExpired() {
      if (APIinterface.empty(this.$refs.recapcha)) {
        this.$refs.recapcha.reset();
      }
    },
    recaptchaFailed() {},
    recaptchaVerified(response) {
      this.recaptcha_response = response;
    },
    onSubmit() {
      this.loading = true;
      let $params = "merchant_uuid=" + this.SettingStore.merchant_uuid;
      $params += "&reservation_date=" + this.BookingStore.reservation_date;
      $params += "&reservation_time=" + this.BookingStore.reservation_time;
      $params += "&guest=" + this.BookingStore.guest;
      $params += "&first_name=" + this.BookingStore.first_name;
      $params += "&last_name=" + this.BookingStore.last_name;
      $params += "&email_address=" + this.BookingStore.email_address;
      $params +=
        "&mobile_prefix=" +
        this.SettingStore.settings_data.phone_data.phonecode;
      $params += "&mobile_number=" + this.BookingStore.mobile_number;
      $params += "&room_uuid=" + this.BookingStore.room_uuid;
      $params += "&table_uuid=" + this.BookingStore.table_uuid;
      $params += "&special_request=" + this.BookingStore.special_request;
      $params += "&recaptcha_response=" + this.recaptcha_response;
      $params += "&id=" + this.reservation_uuid;
      $params += "&request_from=single_app";

      APIinterface.fetchDataPostTableToken("ReserveTable", $params)
        .then((response) => {
          this.success_data = response.details;
          this.BookingStore.steps = 3;
          this.BookingStore.room_uuid = "";
          this.BookingStore.table_uuid = "";
        })
        .catch((error) => {
          this.recaptchaExpired();
          this.success_data = [];
          APIinterface.notify("dark", error, "error_outline", this.$q);
        })
        .then((data) => {
          this.loading = false;
        });
    },
  },
};
</script>
