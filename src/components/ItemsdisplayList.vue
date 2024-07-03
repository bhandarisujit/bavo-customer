<template>
  <q-list>
    <template v-for="items_id in data" :key="items_id">
      <q-card
        flat
        class="radius20 q-mb-sm"
        :class="{
          'bg-grey600 ': $q.dark.mode,
          'bg-mygrey ': !$q.dark.mode,
          disabled: !itemAvailable(items_id, cat_id),
        }"
      >
        <q-item
          clickable
          @click.stop="
            itemAvailable(items_id, cat_id)
              ? $emit('viewItems', {
                  item_uuid: data_items[items_id].item_uuid,
                  cat_id: cat_id,
                })
              : false
          "
        >
          <!--<q-item-section avatar>
            <q-img
              :src="data_items[items_id].url_image"
              style="height: 90px; width: 90px"
              loading="lazy"
              fit="cover"
              spinner-color="primary"
              spinner-size="sm"
              class="rounded-borders"
            ></q-img>
          </q-item-section>-->
          <q-item-section top>
            <q-item-label class="text-weight-bold">
              <span v-html="data_items[items_id].item_code"></span> <span v-html="data_items[items_id].item_name"></span>
            </q-item-label>
            <q-item-label caption class="ellipsis-3-lines">
              <span
                v-html="data_items[items_id].item_description"
                class="text-body2"
              ></span>
            </q-item-label>
            <q-item-label v-if="data_items[items_id].dish">
              <div class="q-gutter-x-xs">
                <template
                  v-for="dish_id in data_items[items_id].dish"
                  :key="dish_id"
                >
                  <template v-if="dish[dish_id]">
                    <q-avatar
                      size="md"
                      style="border: 2px solid white"
                      class="bg-yellow-9"
                    >
                      <img :src="dish[dish_id].url_image" />
                    </q-avatar>
                  </template>
                </template>
              </div>
            </q-item-label>
          </q-item-section>
        </q-item>

        <q-item>
          <!--<q-item-section avatar style="width: 120px">
            <template v-if="data_items[items_id].total_allergens > 0">
              <q-btn
                round
                unelevated
                color="primary"
                text-color="white"
                padding="2px"
                size="sm"
                icon="o_info"
                @click.stop="showAllergens(items_id)"
              />
            </template>
          </q-item-section>-->
          <q-item-section>
            <q-item-label caption class="text-weight-bold text-body">
              <template v-if="data_items[items_id].price[0]">
                {{ printSize(data_items[items_id].price) }}
              </template>
              <template v-if="data_items[items_id].price[0]">
                <template v-if="data_items[items_id].price[0].discount > 0">
                  <span class="text-strike">{{
                    data_items[items_id].price[0].pretty_price
                  }}</span>
                </template>
                {{ PrintPrice(data_items[items_id].price) }}
              </template>
            </q-item-label>
          </q-item-section>
          <q-item-section side>
            <q-item-label>
              <q-btn
                round
                :color="itemAvailable(items_id, cat_id) ? 'primary' : 'grey-3'"
                :disable="itemAvailable(items_id, cat_id) ? false : true"
                icon="add"
                unelevated
                size="12px"
                @click.stop="
                  $emit('viewItems', {
                    item_uuid: data_items[items_id].item_uuid,
                    cat_id: cat_id,
                  })
                "
              />
            </q-item-label>
          </q-item-section>
        </q-item>
      </q-card>
    </template>
  </q-list>
</template>

<script>
import { userCartData } from "stores/CartData";

export default {
  name: "ItemsdisplayList",
  props: ["loading", "data", "data_items", "cat_id", "dish"],
  setup(props) {
    const CartData = userCartData();
    return { CartData };
  },
  data() {
    return {
      allergens_item_id: "",
    };
  },
  methods: {
    PrintPrice(data) {
      if (data[0]) {
        if (data[0].discount > 0) {
          return data[0].pretty_price_after_discount;
        } else {
          return data[0].pretty_price;
        }
      }
    },
    printSize(data) {
      if (data[0]) {
        return data[0].size_name;
      }
    },
    showAllergens(item_id) {
      this.$emit("showAllergens", item_id);
    },
    itemAvailable(item_id, cat_id) {
      if (
        this.CartData.items_not_available.includes(parseInt(item_id)) === false
      ) {
        if (
          this.CartData.category_not_available.includes(parseInt(cat_id)) ===
          false
        ) {
          return true;
        }
      }
      return false;
    },
  },
};
</script>
