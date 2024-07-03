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
        $t("Edit Info")
      }}</q-toolbar-title>
    </q-toolbar>
  </q-header>
  <q-page class="q-pa-md">
    <template v-if="page_ready">
      <q-inner-loading
        :showing="true"
        :color="$q.dark.mode ? 'grey300' : 'primary'"
      />
    </template>

    <template v-else>
      <q-inner-loading
        :showing="loading"
        :color="$q.dark.mode ? 'grey300' : 'primary'"
      />
      <q-form @submit="checkForm">
        <div class="row items-center justify-center q-mb-md">
          <div class="col-3 relative-position text-center">
            <q-avatar size="70px">
              <template v-if="hasPhoto">
                <q-img
                  :src="photo_data.path"
                  spinner-color="primary"
                  spinner-size="sm"
                  fit="cover"
                />
              </template>
              <template v-else-if="hasData">
                <q-img
                  :src="featured_url"
                  spinner-color="primary"
                  spinner-size="sm"
                  fit="cover"
                />
              </template>
            </q-avatar>

            <q-btn
              round
              color="primary"
              text-color="white"
              icon="las la-camera"
              unelevated
              size="sm"
              class="absolute-bottom-right"
              @click="takePhoto"
            />
          </div>
        </div>

        <template v-if="upload_enabled">
          <UploaderFile
            ref="uploader_file"
            path="upload/avatar"
            @after-uploadfile="afterUploadfile"
          ></UploaderFile>
        </template>

        <q-input
          v-model="first_name"
          :label="$t('First name')"
          stack-label
          :rules="[
            (val) =>
              (val && val.length > 0) || this.$t('This field is required'),
          ]"
        />

        <q-input
          v-model="last_name"
          :label="$t('Last name')"
          stack-label
          :rules="[
            (val) =>
              (val && val.length > 0) || this.$t('This field is required'),
          ]"
        />

        <q-input
          v-model="email_address"
          :label="$t('Email address')"
          stack-label
          :rules="[
            (val) =>
              (val && val.length > 0) || this.$t('This field is required'),
          ]"
        />

        <q-input
          v-model="mobile_number"
          :label="$t('Mobile number')"
          stack-label
          :prefix="mobile_prefix"
          mask="##################"
          :rules="[
            (val) => (val && val.length > 0) || $t('This field is required'),
            (val) => val.length <= 15 || $t('Please use maximum 15 characters'),
          ]"
        />

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
            :loading="loading_submit"
            >{{ $t("Save") }}</q-btn
          >
        </q-footer>
      </q-form>
    </template>

    <TwoStepsVerification
      ref="verification"
      :message="otp_message"
      :back_button="false"
      :loading="loading_submit"
      @after-verify="afterVerify"
    ></TwoStepsVerification>
  </q-page>
</template>

<script>
import { defineAsyncComponent } from "vue";
import { useDataStorePersisted } from "stores/DataStorePersisted";
import APIinterface from "src/api/APIinterface";
import auth from "src/api/auth";
import AppCamera from "src/api/AppCamera";
import { useUserStore } from "stores/UserStore";
import { useSettingStore } from "stores/SettingStore";

export default {
  name: "UpdateProfile",
  components: {
    TwoStepsVerification: defineAsyncComponent(() =>
      import("components/TwoStepsVerification.vue")
    ),
    UploaderFile: defineAsyncComponent(() =>
      import("components/UploaderFile.vue")
    ),
  },
  data() {
    return {
      loading: true,
      loading_submit: false,
      first_name: "",
      last_name: "",
      email_address: "",
      mobile_number: "",
      mobile_prefix: "",
      original_email_address: "",
      original_mobile_number: "",
      otp: "",
      otp_message: "",
      photo_data: [],
      upload_enabled: false,
      featured_filename: "",
      featured_url: "",
      upload_path: "",
      has_photo: false,
      knob: 71,
      page_ready: false,
    };
  },
  setup(props) {
    const DataStorePersisted = useDataStorePersisted();
    const UserStore = useUserStore();
    const SettingStore = useSettingStore();
    return { DataStorePersisted, UserStore, SettingStore };
  },
  mounted() {
    if (Object.keys(this.SettingStore.settings_data).length > 0) {
      this.mobile_prefix = this.SettingStore.settings_data.phone_data.phonecode;
      this.getProfiledata();
    } else {
      this.$watch(
        () => this.SettingStore.$state.settings_data,
        (newData, oldData) => {
          this.mobile_prefix = newData.phone_data.phonecode;
          this.getProfiledata();
        }
      );
    }
  },
  computed: {
    hasData() {
      if (!APIinterface.empty(this.featured_url)) {
        return true;
      }
      return false;
    },
    hasPhoto() {
      if (Object.keys(this.photo_data).length > 0) {
        return true;
      }
      return false;
    },
  },
  methods: {
    getProfiledata() {
      this.getProfile();
    },
    getProfile() {
      this.loading = true;
      APIinterface.fetchDataByToken("getProfile", "")
        .then((data) => {
          this.UserStore.user_data = data.details;
          this.first_name = data.details.first_name;
          this.last_name = data.details.last_name;
          this.email_address = data.details.email_address;
          this.mobile_number = data.details.mobile_number;
          this.mobile_prefix = data.details.mobile_prefix;
          this.featured_url = data.details.avatar;

          this.original_email_address = this.email_address;
          this.original_mobile_number = this.mobile_number;
        })
        .catch((error) => {
          APIinterface.notify("dark", error, "error_outline", this.$q);
          this.UserStore.user_data = [];
        })
        .then((data) => {
          this.loading = false;
        });
    },
    checkForm() {
      console.log("this.email_address", this.email_address);
      console.log("this.mobile_number", this.mobile_number);

      console.log("this.original_email_address", this.original_email_address);
      console.log("this.original_mobile_number", this.original_mobile_number);
      let _change = false;
      if (this.email_address !== this.original_email_address) {
        _change = true;
      }
      if (this.mobile_number !== this.original_mobile_number) {
        _change = true;
      }

      console.log("_change", _change);
      if (_change) {
        this.loading_submit = true;
        APIinterface.fetchDataByToken("RequestEmailCode")
          .then((data) => {
            this.otp_message = data.msg;
            this.$refs.verification.showModal(true);
          })
          .catch((error) => {
            APIinterface.notify("dark", error, "error_outline", this.$q);
          })
          .then((data) => {
            this.loading_submit = false;
          });
      } else {
        this.onSubmit();
      }
    },
    afterVerify(data) {
      this.otp = data;
      this.onSubmit();
    },
    onSubmit() {
      this.loading_submit = true;
      const params = {
        code: this.otp,
        first_name: this.first_name,
        last_name: this.last_name,
        email_address: this.email_address,
        mobile_number: this.mobile_number,
        mobile_prefix: this.mobile_prefix,
        featured_filename: this.featured_filename,
        upload_path: this.upload_path,
        file_data: this.hadData() ? this.photo_data.data : "",
        image_type: this.hadData() ? this.photo_data.format : "",
      };
      APIinterface.fetchDataByToken("saveProfile", params)
        .then((data) => {
          this.$refs.verification.showModal(false);
          auth.setUser(data.details);
          APIinterface.notify(
            this.$q.dark.mode ? "grey600" : "dark",
            data.msg,
            "check_circle",
            this.$q
          );

          let userData = auth.getUser();

          this.UserStore.user_data = {
            first_name: this.first_name,
            last_name: this.last_name,
            email_address: this.email_address,
            mobile_number: this.mobile_number,
            mobile_prefix: this.mobile_prefix,
            avatar: userData ? userData.avatar : "",
          };

          this.original_email_address = this.email_address;
          this.original_mobile_number = this.mobile_number;
        })
        .catch((error) => {
          APIinterface.notify("dark", error, "error_outline", this.$q);
        })
        .then((data) => {
          this.loading_submit = false;
        });
    },
    takePhoto() {
      if (this.$q.capacitor) {
        AppCamera.isCameraEnabled()
          .then((data) => {
            AppCamera.isFileAccessEnabled()
              .then((data) => {
                AppCamera.getPhoto(1)
                  .then((data) => {
                    this.photo_data = data;
                  })
                  .catch((error) => {
                    this.photo_data = [];
                  });
                //
              })
              .catch((error) => {
                APIinterface.notify("dark", error, "error", this.$q);
              });
            //
          })
          .catch((error) => {
            APIinterface.notify("dark", error, "error", this.$q);
          });
      } else {
        this.upload_enabled = !this.upload_enabled;
      }
    },
    afterUploadfile(data) {
      this.featured_filename = data.filename;
      this.featured_url = data.url_image;
      this.upload_path = data.upload_path;
    },
    hadData() {
      if (Object.keys(this.photo_data).length > 0) {
        return true;
      }
      return false;
    },
    //
  },
};
</script>
