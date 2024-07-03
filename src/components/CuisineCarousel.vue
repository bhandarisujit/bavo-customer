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
    <swiper :slides-per-view="layout == 1 ? 1.5 : 4" :space-between="10">
      <template v-for="items in SettingStore.category_data" :key="items">
        <swiper-slide>
          <template v-if="layout == 1">
            <div
              class="radius20"
              :class="{
                'bg-grey600': $q.dark.mode,
                'bg-mygrey ': !$q.dark.mode,
              }"
            >
              <q-item
                clickable
                @click="this.$emit('afterCategoryselected', items)"
              >
                <q-item-section avatar>
                  <q-avatar size="50px">
                    <img :src="items.url_image" />
                  </q-avatar>
                </q-item-section>
                <q-item-section>
                  <q-item-label
                    class="line-height-one text-weight-medium text-body2"
                  >
                    {{ items.category_name }}
                  </q-item-label>
                </q-item-section>
              </q-item>
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
        </swiper-slide>
      </template>
    </swiper>
  </template>
</template>

<script>
import { Swiper, SwiperSlide } from "swiper/vue";
import "swiper/css";
import APIinterface from "src/api/APIinterface";
import { useSettingStore } from "stores/SettingStore";

export default {
  name: "CuisineCarousel",
  props: ["layout", "category_uuid_selected"],
  components: {
    Swiper,
    SwiperSlide,
  },
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
