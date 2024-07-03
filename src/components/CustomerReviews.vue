<template>
  <template v-if="loading">
    <q-item>
      <q-item-section>
        <q-skeleton
          height="110px"
          square
          class="radius20"
          :class="{
            'bg-grey600 ': $q.dark.mode,
            'bg-mygrey ': !$q.dark.mode,
          }"
        />
      </q-item-section>
      <q-item-section>
        <q-skeleton
          height="110px"
          square
          class="radius20"
          :class="{
            'bg-grey600 ': $q.dark.mode,
            'bg-mygrey ': !$q.dark.mode,
          }"
        />
      </q-item-section>
    </q-item>
  </template>
  <template v-else>
    <swiper :slides-per-view="1.1" :space-between="10">
      <template v-for="items in data" :key="items">
        <swiper-slide>
          <q-item>
            <q-item-section avatar>
              <q-avatar size="60px">
                <img :src="items.url_image" />
              </q-avatar>
            </q-item-section>
            <q-item-section>
              <q-item-label class="text-weight-medium">
                {{ items.hidden_fullname }}
              </q-item-label>
              <q-item-label caption>
                {{ items.date_created }}
              </q-item-label>
              <q-item-label>
                <span v-html="items.review" class="ellipsis-2-lines"></span>
              </q-item-label>
            </q-item-section>
          </q-item>
        </swiper-slide>
      </template>
    </swiper>
  </template>
</template>

<script>
import { Swiper, SwiperSlide } from "swiper/vue";
import "swiper/css";
import APIinterface from "src/api/APIinterface";

export default {
  name: "CustomerReviews",
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
  mounted() {
    this.getReview();
  },
  methods: {
    getReview() {
      this.loading = true;
      APIinterface.fetchDataPost("getReview", "page=0")
        .then((data) => {
          this.data = data.details.data;
        })
        .catch((error) => {
          this.data = [];
        })
        .then((data) => {
          this.loading = false;
          this.$emit("afterReviewloaded");
        });
    },
  },
};
</script>
<style scoped>
.swiper-slide {
  min-height: 130px;
}
</style>
