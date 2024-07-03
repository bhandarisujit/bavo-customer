<template>
  <template v-if="loading">
    <div class="row q-gutter-xs">
      <template v-for="items in 2" :key="items">
        <q-skeleton height="50px" square class="col" />
      </template>
    </div>
  </template>
  <div v-else class="row items-center q-col-gutter-none">
    <div class="col">
      <swiper :slides-per-view="2.8" :space-between="10" >
        <template v-for="items in SettingStore.category_data" :key="items">
          <div v-if="this.$route.query.category_uiid == items.category_uiid" class="row items-center justify-between q-mb-xs q-mt-md">
            <div class="text-weight-bold text-h6">
              {{ items.category_name }}
            </div>
            <div caption class="ellipsis-3-lines q-pb-sm">
              <span class="text-body2">{{ items.category_description }}</span>
            </div>
          </div>
          <swiper-slide>
            <div
              class="q-pa-xs bg-mygreyx radius20 cursor-pointer"
              :class="{
                'bg-grey600 text-white': $q.dark.mode,
                'bg-mygrey ': !$q.dark.mode,
                'bg-primary': this.$route.query.category_uiid == items.category_uiid,
              }"
              style="border: 1px solid #000;"
              v-ripple:green
              @click="afterCategoryselected(items.category_name,items.category_uiid,items.cat_id)"
            >
              <div class="row items-center text-center">
                <div
                  class="ellipsis col text-weight-light text-darkx"
                  :class="{
                    'text-grey300': $q.dark.mode,
                    'text-dark': !$q.dark.mode,
                    'text-white': this.$route.query.category_uiid == items.category_uiid,
                  }"

                >
                  {{ items.category_name }}
                </div>
              </div>
            </div>
          </swiper-slide>
        </template>
      </swiper>
    </div>
  </div>
</template>

<script>
import { Swiper, SwiperSlide } from "swiper/vue";
import "swiper/css";
import { useSettingStore } from "stores/SettingStore";
export default {
  name: "CategorySlide",
  props: ["loading", "data"],
  components: {
    Swiper,
    SwiperSlide,
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
  methods: {
    afterCategoryselected(category_name,category_uiid,cat_id) {
      this.$router.push({
        path: "/items/category",
        query: {
          title: category_name,
          category_uiid: category_uiid,
          cat_id: cat_id,
        }
      }).then(() => { this.$router.go() });
    },
  }
};
</script>
