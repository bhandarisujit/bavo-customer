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
    <swiper :slides-per-view="1.3" :space-between="10" ref="mySwiper">
      <template v-for="items in data" :key="items">
        <swiper-slide
          class="radius20"
          :class="{
            'bg-grey600': $q.dark.mode,
            'bg-ltgreen': !$q.dark.mode,
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
            <!--<q-item-section avatar>
              <q-img
                :src="items.url_image"
                style="width: 80px; height: 80px"
                fit="contain"
                spinner-color="primary"
                spinner-size="xs"
                class="rounded-borders"
              ></q-img>
            </q-item-section>-->
            <q-item-section>
              <q-item-label class="text-weight-medium">
                {{ items.item_code}} {{ items.item_name }}
              </q-item-label>
              <q-item-label class="text-red-9 text-weight-medium">
                {{ items.pretty_price }}
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
import { useDataStorePersisted } from "stores/DataStorePersisted";

export default {
  name: "ItemsColumn",
  props: ["featured"],
  components: {
    Swiper,
    SwiperSlide,
  },
  setup() {
    const DataStorePersisted = useDataStorePersisted();
    return { DataStorePersisted };
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
          this.$emit("afterFetch", true);
        })
        .catch((error) => {
          this.data = [];
          this.$emit("afterFetch", false);
        })
        .then((data) => {
          this.loading = false;
        });
    },
    beforeUnmount() {
      if (this.$refs.mySwiper) {
        const swiperInstance = this.$refs.mySwiper.$el.swiper;
        if (swiperInstance) {
          swiperInstance.destroy();
        }
      }
    },
    //
  },
};
</script>
