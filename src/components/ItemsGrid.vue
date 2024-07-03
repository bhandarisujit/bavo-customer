<template>
  <template v-if="loading">
    <template v-for="items in 2" :key="items">
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
  </template>
  <div v-else class="relative-position" style="height: 100%">
    <swiper
      ref="mySwiper"
      :slidesPerView="1.6"
      :grid="{
        rows: 2,
        fill: 'row',
      }"
      :spaceBetween="10"
      :pagination="{
        clickable: true,
      }"
      :modules="modules"
    >
      <template v-for="items in data" :key="items">
        <swiper-slide
          :class="{
            'bg-dark ': $q.dark.mode,
            'bg-white ': !$q.dark.mode,
          }"
        >
          <div
            class="radius20"
            :class="{
              'bg-grey600 ': $q.dark.mode,
              'bg-mygrey ': !$q.dark.mode,
            }"
          >
            <q-item
              clickable
              @click="
                $emit('viewItems', {
                  item_uuid: items.item_token,
                  cat_id: items.cat_id,
                })
              "
            >
              <q-item-section>
                <q-item-label>
                  <q-img
                    :src="items.url_image"
                    style="height: 7em"
                    fit="contain"
                    loading="lazy"
                    spinner-color="primary"
                    spinner-size="xs"
                    class="rounded-borders"
                    placeholder-src="placeholder.png"
                  ></q-img>
                </q-item-label>

                <q-item-label class="text-weight-medium">
                  <span
                    v-html="items.item_name"
                    class="ellipsis-2-lines"
                  ></span>
                </q-item-label>
                <q-item-label caption class="text-weight-bold">
                  {{ items.pretty_price }}
                </q-item-label>
              </q-item-section>
            </q-item>
          </div>
        </swiper-slide>
      </template>
    </swiper>
  </div>
</template>

<script>
import { Swiper, SwiperSlide } from "swiper/vue";
import "swiper/css";
import "swiper/css/grid";
import "swiper/css/pagination";
import { Grid } from "swiper/modules";
import APIinterface from "src/api/APIinterface";
import { useDataStorePersisted } from "stores/DataStorePersisted";

export default {
  name: "ItemsGrid",
  props: ["featured"],
  components: {
    Swiper,
    SwiperSlide,
  },
  setup() {
    const DataStorePersisted = useDataStorePersisted();
    return {
      modules: [Grid],
      DataStorePersisted,
    };
  },
  mounted() {
    this.itemfeatured();
  },
  data() {
    return {
      loading: true,
      data: [],
    };
  },
  methods: {
    itemfeatured() {
      this.loading = true;
      APIinterface.fetchDataGet(
        "itemfeatured",
        "meta=" +
          this.featured +
          "&currency_code=" +
          this.DataStorePersisted.getUseCurrency()
      )
        .then((data) => {
          this.data = data.details;
          this.$emit("afterFetchdata", true);
        })
        .catch((error) => {
          this.data = [];
          this.$emit("afterFetchdata", false);
        })
        .then((data) => {
          this.loading = false;
        });
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
