<template>
  <template v-if="loading">
    <q-skeleton
      height="200px"
      square
      :class="{
        'bg-grey600 ': $q.dark.mode,
        'bg-mygrey ': !$q.dark.mode,
      }"
    />
  </template>
  <template v-else>
    <swiper
      ref="mySwiper"
      :slidesPerView="1.1"
      :spaceBetween="10"
      :pagination="{
        clickable: true,
        dynamicBullets: true,
      }"
      :modules="modules"
      :loop="true"
      :autoplay="{
        delay: 2500,
        disableOnInteraction: false,
      }"
      class="mySwiper"
    >
      <swiper-slide v-for="items in data" :key="items">
        <q-img
          :src="items.image"
          style="height: 200px"
          fit="cover"
          :spinner-color="$q.dark.mode ? 'grey300' : 'primary'"
          spinner-size="sm"
          class="rounded-borders cursor-pointer"
          @click="showItems(items)"
        ></q-img>
      </swiper-slide>
    </swiper>
  </template>
</template>

<script>
import { Swiper, SwiperSlide } from "swiper/vue";
import "swiper/css";
import "swiper/css/pagination";
import { Pagination, Autoplay } from "swiper/modules";
import APIinterface from "src/api/APIinterface";

export default {
  name: "BannerCarousel",
  components: {
    Swiper,
    SwiperSlide,
  },
  setup() {
    return {
      modules: [Pagination, Autoplay],
    };
  },
  data() {
    return {
      loading: true,
      data: [],
      item_data: [],
    };
  },
  mounted() {
    this.getBanner();
  },
  methods: {
    getBanner() {
      this.loading = true;
      APIinterface.fetchDataPost("getBanner")
        .then((data) => {
          this.data = data.details.data;
          this.item_data = data.details.item_data;
        })
        .catch((error) => {
          //
        })
        .then((data) => {
          this.loading = false;
        });
    },
    showItems(data) {
      if (!APIinterface.empty(this.item_data[data.item_id])) {
        this.$emit("viewItems", {
          item_uuid: this.item_data[data.item_id].item_token,
          cat_id: this.item_data[data.item_id].cat_id,
        });
      }
    },
  },
  beforeUnmount() {
    if (this.$refs.mySwiper) {
      const swiperInstance = this.$refs.mySwiper.$el.swiper;
      if (swiperInstance) {
        swiperInstance.destroy();
      }
    }
  },
};
</script>
