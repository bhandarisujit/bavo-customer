<template>
  <q-dialog
    v-model="modal"
    persistent
    transition-show="fade"
    transition-hide="fadeout"
    :maximized="true"
  >
    <q-card class="scroll">
      <q-form @submit="onSubmit">
        <q-card-section class="row items-center q-pb-none">
          <div class="text-body1 text-weight-bold">
            {{ $t("Write A Review") }}
          </div>
          <q-space />
          <q-btn icon="close" flat round dense v-close-popup />
        </q-card-section>
        <q-card-section>
          <div class="q-mb-sm">
            <q-rating
              v-model="rating_value"
              size="2em"
              :max="5"
              color="grey-5"
              color-selected="yellow-2"
              class="q-mb-xs"
            />
          </div>

          <div class="text-subtitle1">{{ $t("What did you like") }}?</div>
          <q-input
            v-model="tags_like"
            class="q-mb-md full-width"
            color="primary"
            :label="$t('Describe in few words')"
            dense
          />

          <div class="text-subtitle1">{{ $t("What did you not like") }}?</div>
          <q-input
            v-model="tags_not_like"
            class="q-mb-md full-width"
            color="warning"
            :label="$t('Describe in few words')"
            dense
          />

          <div class="text-subtitle1">{{ $t("Write your review") }}</div>
          <q-input
            v-model="review_content"
            autogrow
            class="full-width"
            color="primary"
            :label="$t('Your review helps us to make better choices')"
            :rules="[
              (val) => (val && val.length > 0) || 'This field is required',
            ]"
          />

          <div class="text-subtitle1">{{ $t("Add Photo") }}</div>
          <q-btn
            unelevated
            round
            :color="$q.dark.mode ? 'grey600' : 'mygrey'"
            :text-color="$q.dark.mode ? 'grey300' : 'grey'"
            @click="pickFiles"
            dense
          >
            <q-icon name="attach_file" class="rotate-45"></q-icon>
          </q-btn>

          <q-uploader
            :url="upload_api"
            max-files="1"
            ref="uploader"
            flat
            accept=".jpg, image/*"
            max-total-size="10485760"
            field-name="file"
            @added="afterAddedFiles"
            @removed="afterRemoveFiles"
            @rejected="onRejectedFiles"
            @uploading="onUploadingFiles"
            @uploaded="afterUploaded"
            @finish="afterFinishUpload"
            class="full-width"
            :headers="[
              { name: 'Authorization', value: `token ${this.getToken()}` },
            ]"
          >
            <template v-slot:header>
              <q-uploader-add-trigger></q-uploader-add-trigger>
            </template>
            <template v-slot:list="scope">
              <div class="flex justify-start q-col-gutter-x-md">
                <template v-for="file in scope.files" :key="file.__key">
                  <div class="relative-position">
                    <img
                      :src="file.__img.src"
                      style="max-width: 60px; height: 60px"
                      class="radius10"
                    />
                    <div
                      class="absolute-right"
                      style="margin-right: -10px; margin-top: -5px"
                    >
                      <q-btn
                        unelevated
                        round
                        color="blue"
                        icon="close"
                        size="xs"
                        @click="scope.removeFile(file)"
                      ></q-btn>
                    </div>
                  </div>
                </template>
              </div>
            </template>
          </q-uploader>

          <div class="q-pb-md">
            <q-checkbox
              v-model="as_anonymous"
              size="sm"
              color="primary"
              :label="$t('post review as anonymous')"
            />
          </div>

          <template v-if="Object.keys(this.files).length > 0">
            <div class="q-pa-xl"></div>
          </template>
        </q-card-section>
        <q-separator></q-separator>

        <q-footer
          class="border-top q-pa-md"
          :class="{
            'bg-mydark text-white': $q.dark.mode,
            'bg-white text-dark': !$q.dark.mode,
          }"
        >
          <q-btn
            type="submit"
            unelevated
            rounded
            color="primary"
            text-color="white"
            no-caps
            class="full-width"
            :loading="loading"
            size="lg"
          >
            {{ $t("Submit Review") }}
          </q-btn>
        </q-footer>
      </q-form>
    </q-card>
  </q-dialog>
</template>

<script>
import APIinterface from "src/api/APIinterface";
import config from "src/api/config";
import auth from "src/api/auth";

export default {
  name: "AddReview",
  data() {
    return {
      modal: false,
      loading: false,
      upload_api: config.api_base_url + "/partnerapi/uploadReview",
      rating_value: 0,
      as_anonymous: false,
      review_content: "",
      tags_like: "",
      tags_not_like: "",
      upload_images: "",
      order_uuid: "",
      files: {},
      file_data: [],
      upload_loading: false,
    };
  },
  setup() {
    return {};
  },
  methods: {
    getToken() {
      return auth.getToken();
    },
    onSubmit() {
      if (Object.keys(this.files).length > 0) {
        this.$refs.uploader.upload();
      } else {
        this.addReview();
      }
    },
    addReview() {
      const params = {
        order_uuid: this.order_uuid,
        review_content: this.review_content,
        rating_value: this.rating_value,
        as_anonymous: this.as_anonymous,
        tags_like: [this.tags_like],
        tags_not_like: [this.tags_not_like],
        upload_images: {
          url_image: this.file_data.url_image,
          filename: this.file_data.filename,
          id: this.file_data.id,
        },
      };
      this.loading = true;
      APIinterface.fetchDataByTokenPost("addReview", params)
        .then((data) => {
          APIinterface.notify("dark", data.msg, "check_circle", this.$q);
          this.modal = false;
          this.$emit("afterAddreview");
        })
        .catch((error) => {
          APIinterface.notify("dark", error, "error_outline", this.$q);
        })
        .then((data) => {
          this.loading = false;
        });
    },
    pickFiles() {
      this.$refs.uploader.pickFiles();
    },
    onRejectedFiles(data) {
      let errors = "";
      Object.entries(data).forEach(([key, items]) => {
        errors += items.failedPropValidation;
      });
      APIinterface.notify(
        "dark",
        this.$t("Error") + " " + errors,
        "error",
        this.$q
      );
    },
    afterAddedFiles(data) {
      console.log("afterAddedFiles", data);
      Object.entries(data).forEach(([key, items]) => {
        this.files[items.name] = {
          name: items.name,
        };
      });
    },
    afterRemoveFiles(data) {
      Object.entries(data).forEach(([key, items]) => {
        delete this.files[items.name];
      });
    },
    onUploadingFiles(data) {
      this.upload_loading = true;
    },
    afterUploaded(data) {
      if (data.xhr.status == 200) {
        let result = JSON.parse(data.xhr.response);
        console.log("result", result);
        let code = result.code || false;
        let details = result.details || [];
        let message = result.msg || "";
        if (code == 1) {
          this.file_data = details;
          this.addReview();
        } else {
          APIinterface.notify("dark", message, "error", this.$q);
          this.$refs.uploader.reset();
        }
      } else {
        APIinterface.notify(
          "dark",
          this.$t("IError uploading files"),
          "error",
          this.$q
        );
        this.$refs.uploader.reset();
      }
    },
    afterFinishUpload() {
      this.upload_loading = false;
    },
    //
  },
};
</script>

<style lang="scss">
.q-uploader__list {
  min-height: auto !important;
}
</style>
