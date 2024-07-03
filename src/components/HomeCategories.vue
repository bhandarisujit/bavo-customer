<template>
  <template v-if="SettingStore.category_loading">
    <div class="row q-gutter-xs">
      <template v-for="items in 2" :key="items">
        <q-skeleton
          height="60px"
          square
          class="col radius20"
          :class="{
            'bg-grey600 ': $q.dark.mode,
            'bg-mygrey ': !$q.dark.mode,
          }"
        />
      </template>
    </div>
  </template>
  <template v-else>
    <div class="col-12 q-mr-sm">
      <q-btn
        no-caps
        :color="$q.dark.mode ? 'grey600' : 'primary'"
        dense
        unelevated
        size="lg"
        class="rounded-borders q-pl-md q-pr-md full-width"
        @click="this.$emit('afterMenuselected', items)"
      >
        <div class="font16"><q-icon name="import_contacts" size="sm"></q-icon> {{ $t("Menu") }}</div>
      </q-btn>
    </div>
    <div class="row">
      <template v-for="items in SettingStore.category_data" :key="items">
        <div class="col-6 ">
          <template v-if="layout == 1">
            <div class="font12 cursor-pointer q-pa-sm" clickable @click="this.$emit('afterCategoryselected', items)">
              <div class="relative-position border-dark-grey ">
                <q-img
                  :src="items.url_icon"
                  style="max-width: 95%; height: 160px"
                  spinner-color="primary"
                  spinner-size="sm"
                  placeholder-src="placeholder.png"
                  class="radius10"
                ></q-img>
                <div class="q-pt-sm">
                  <div class="text-center font16 text-weight-bold text-dark">
                    {{ items.category_name }}
                  </div>
                </div>
              </div>
            </div>
          </template>
          <template v-else>
            <q-item
              clickable
              @click="this.$emit('afterCategoryselected', items)"
              class="q-pa-none"
            >
              <q-item-section class="text-center">
                <div class="flex flex-center q-mb-xs">
                  <q-avatar
                    size="45px"
                    class="relative-position"
                    :class="{
                      'border-primary':
                        category_uuid_selected == items.category_uiid,
                    }"
                  >
                    <img :src="items.url_image" />
                  </q-avatar>
                </div>
                <div class="line-height-one text-caption">
                  <span
                    v-html="items.category_name"
                    :class="{
                      'text-primary text-weight-bold':
                        category_uuid_selected == items.category_uiid,
                    }"
                  ></span>
                </div>
              </q-item-section>
            </q-item>
          </template>
        </div>
      </template>
    </div>
  </template>
</template>

<script>
//import { Swiper, SwiperSlide } from "swiper/vue";
//import "swiper/css";
import APIinterface from "src/api/APIinterface";
import { useSettingStore } from "stores/SettingStore";

export default {
  name: "HomeCategories",
  props: ["layout", "category_uuid_selected"],
  // components: {
  //   Swiper,
  //   SwiperSlide,
  // },
  data() {
    return {
      loading: true,
      data: [],
    };
  },
  setup() {
    const SettingStore = useSettingStore();
    return { SettingStore };
  },
  mounted() {
    if (Object.keys(this.SettingStore.category_data).length <= 0) {
      this.SettingStore.getCategory();
    }
  },
  methods: {},
};
</script>
