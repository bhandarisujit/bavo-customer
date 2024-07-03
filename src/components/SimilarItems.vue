<template>
  <template v-if="CartData.similar_loading">
    <swiper :slides-per-view="2.5" :space-between="10">
      <template v-for="items in 5" :key="items">
        <swiper-slide>
          <q-skeleton height="100px" class="bg-mygrey" />
        </swiper-slide>
      </template>
    </swiper>
  </template>
  <template v-else>
    <transition-group
      appear
      enter-active-class="animated fadeIn"
      leave-active-class="animated fadeOut"
    >
      <div class="text-weight-bold">{{ $t("Popular with your order") }}</div>
      <div class="q-mb-md">{{ $t("Other customer also bought these") }}</div>
      <swiper :slides-per-view="2.5" :space-between="10">
        <template v-for="items in this.CartData.similar_data" :key="items">
          <swiper-slide>
            <div
              class="font12 cursor-pointer"
              @click="
                viewItems({
                  item_uuid: items.item_uuid,
                  cat_id: items.cat_id,
                })
              "
            >
              <div class="relative-position">
                <q-img
                  :src="items.url_image"
                  style="max-width: 100%; height: 100px"
                  spinner-color="primary"
                  spinner-size="sm"
                  placeholder-src="placeholder.png"
                  class="radius10"
                ></q-img>
                <div class="absolute-bottom-right q-pa-sm">
                  <q-btn
                    round
                    :color="$q.dark.mode ? 'grey300' : 'yellow-2'"
                    :text-color="$q.dark.mode ? 'grey600' : 'yellow-9'"
                    icon="add"
                    unelevated
                    size="sm"
                  />
                </div>
              </div>
              <div class="q-pt-sm">
                <div class="text-weight-bold" v-if="items.price">
                  <template v-if="items.price[0]">
                    <template v-if="items.price[0].discount > 0">
                      {{ items.price[0].pretty_price_after_discount }}
                    </template>
                    <template v-else>
                      {{ items.price[0].pretty_price }}
                    </template>
                  </template>
                </div>
                <div
                  class="line-normal text-body2 ellipsis-2-lines"
                  v-html="items.item_name"
                ></div>
              </div>
            </div>
          </swiper-slide>
        </template>
      </swiper>
    </transition-group>
  </template>
  <ItemDetails
    ref="item_details"
    @after-addtocart="afterAddtocart"
    @item-hide="itemHide"
  ></ItemDetails>
</template>

<script>
import { Swiper, SwiperSlide } from "swiper/vue";
import "swiper/css";
import { userCartData } from "stores/CartData";
import { defineAsyncComponent } from "vue";

export default {
  name: "SimilarItems",
  components: {
    Swiper,
    SwiperSlide,
    ItemDetails: defineAsyncComponent(() =>
      import("components/ItemDetails.vue")
    ),
  },
  setup(props) {
    const CartData = userCartData();
    return { CartData };
  },
  mounted() {
    if (Object.keys(this.CartData.similar_data).length > 0) {
    } else {
      this.CartData.SimilarItems();
    }
  },
  methods: {
    viewItems(data) {
      this.$emit("onItemView");
      this.$refs.item_details.showModal(true, data);
    },
    afterAddtocart() {
      this.$emit("afterAddtocart");
    },
    itemHide() {
      this.$emit("afterItemhide");
    },
  },
};
</script>
