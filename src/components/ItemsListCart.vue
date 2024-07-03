<template>
  <q-list separator>
    <template v-for="items in cart_items" :key="items.item_id">
      <q-slide-item
        @right="(opt) => onRight(opt, index)"
        right-color="secondary"
      >
        <template v-slot:right>
          <div class="q-gutter-md">
            <q-btn
              round
              color="primary"
              icon="close"
              unelevated
              @click="closeSlide(index)"
            />
            <FavsItemsCart
              ref="favs"
              :item_token="items.item_token"
              :cat_id="items.cat_id"
              :active="items.save_item"
              @after-savefav="afterSavefav(items)"
            />
            <q-btn
              round
              color="negative"
              icon="delete_outline"
              unelevated
              @click="removeItem(items)"
              :loading="loading_rm"
            />
          </div>
        </template>

        <q-item class="q-pa-md radius10">
          <!--<q-item-section avatar top>
            <q-img
              :src="items.url_image"
              style="height: 60px; width: 60px"
              loading="lazy"
              fit="cover"
              spinner-color="primary"
              spinner-size="sm"
              class="rounded-borders"
            ></q-img>
          </q-item-section>-->
          <q-item-section top>
            <q-item-label class="text-weight-medium">
              <span v-html="items.item_code"></span> <span v-html="items.item_name"></span>
            </q-item-label>
            <q-item-label caption v-if="items.price.size_name != ''">
              <span v-html="items.price.size_name"></span>
            </q-item-label>
            <q-item-label class="borderx">
              <!-- qty -->
              <div class="flex items-center q-col-gutter-x-sm">
                <div class="borderx">
                  <q-btn
                    :icon="items.qty == 1 ? 'delete_outline' : 'remove'"
                    :color="items.qty == 1 ? 'negative' : 'primary'"
                    unelevated
                    size="11px"
                    class="rounded-borders"
                    style="width: 30px"
                    @click="lessCartQty(items.qty > 1 ? items.qty-- : 1, items)"
                    :disable="isLoading"
                  ></q-btn>
                </div>
                <div class="borderx">
                  {{ items.qty }}
                </div>
                <div class="borderx">
                  <q-btn
                    icon="add"
                    color="primary"
                    unelevated
                    size="11px"
                    class="rounded-borders"
                    style="width: 30px"
                    @click="addCartQty(items.qty++, items)"
                    :disable="isLoading"
                  ></q-btn>
                </div>
              </div>
              <!-- qty -->
            </q-item-label>
            <q-item-label caption>
              <!-- start items addon and attributes -->
              <template v-if="items.special_instructions != ''">
                <div>{{ items.special_instructions }}</div>
              </template>

              <template v-if="items.attributes != ''">
                <template
                  v-for="attributes in items.attributes"
                  :key="attributes"
                >
                  <p class="no-margin">
                    <template
                      v-for="(attributes_data, attributes_index) in attributes"
                    >
                      {{ attributes_data
                      }}<template
                        v-if="attributes_index < attributes.length - 1"
                        >,
                      </template>
                    </template>
                  </p>
                </template>
              </template>

              <!-- addons -->
              <div v-for="addons in items.addons" :key="addons">
                <template
                  v-for="addon_items in addons.addon_items"
                  :key="addon_items"
                >
                  {{ addon_items.sub_item_name }}
                </template>
              </div>
              <!-- addons -->

              <!-- end items addon and attributes -->
            </q-item-label>
          </q-item-section>
          <q-item-section top side>
            <div class="column justify-end items-end fit">
              <div class="col">
                <q-btn
                  round
                  :color="$q.dark.mode ? 'grey500' : 'grey-4'"
                  icon="clear"
                  size="xs"
                  unelevated
                  @click="removeItem(items)"
                  :disable="isLoading"
                />
              </div>
              <div
                class="col text-weight-bold relative-position"
                :class="{
                  'text-grey300': $q.dark.mode,
                  'text-negative': !$q.dark.mode,
                }"
              >
                <div class="absolute-bottom-right">
                  <template v-if="items.price.discount <= 0">
                    {{ items.price.pretty_total }}
                  </template>
                  <template v-else>
                    {{ items.price.pretty_total_after_discount }}
                  </template>
                </div>
              </div>
            </div>
          </q-item-section>
        </q-item>
      </q-slide-item>
    </template>
  </q-list>
</template>

<script>
import { defineAsyncComponent } from "vue";
import APIinterface from "src/api/APIinterface";

export default {
  name: "ItemsListCart",
  props: ["cart_loading", "cart_uuid", "cart_items", "cart_subtotal"],
  components: {
    FavsItemsCart: defineAsyncComponent(() =>
      import("src/components/FavsItemsCart.vue")
    ),
  },
  data() {
    return {
      loading: false,
      data_slide: {},
      loading_rm: false,
      qty_options: [1, 2, 3, 4, 5, 6, 7, 8, 9],
    };
  },
  mounted() {
    this.qty_options = [];
    for (let i = 1; i < 100; i++) {
      this.qty_options.push(i);
    }
  },
  computed: {
    isLoading() {
      if (this.loading) {
        return true;
      } else {
        if (this.cart_loading) {
          return true;
        }
      }
      return false;
    },
  },
  methods: {
    lessCartQty(itemQty, item) {
      itemQty--;
      if (itemQty > 0) {
        this.updateCartQty(itemQty, item);
      } else {
        this.removeCartItem(item.cart_row);
      }
    },
    addCartQty(itemQty, item) {
      itemQty++;
      this.updateCartQty(itemQty, item);
    },
    updateCartQty(itemQty, item) {
      this.loading = true;
      let params =
        "cart_uuid=" +
        this.cart_uuid +
        "&cart_row=" +
        item.cart_row +
        "&item_qty=" +
        itemQty;
      APIinterface.fetchDataPost("updateCartItems", params)
        .then((data) => {
          this.$emit("afterUpdatecart");
        })
        .catch((error) => {
          this.$emit("afterUpdatecart");
          APIinterface.notify("dark", error, "error_outline", this.$q);
        })
        .then((data) => {
          this.loading = false;
        });
    },
    removeCartItem(cart_row) {
      this.loading_rm = true;
      let params = "cart_uuid=" + this.cart_uuid + "&row=" + cart_row;
      APIinterface.fetchDataPost("removeCartItem", params)
        .then((data) => {
          this.$emit("afterUpdatecart");
        })
        .catch((error) => {
          this.$emit("afterUpdatecart");
          APIinterface.notify("dark", error, "error_outline", this.$q);
        })
        .then((data) => {
          this.loading = false;
          this.loading_rm = false;
        });
    },
    onRight(details, index) {
      this.data_slide[index] = details;
    },
    closeSlide(index) {
      console.log(index);
      if (this.data_slide[index]) {
        console.log(this.data_slide[index]);
        this.data_slide[index].reset();
      }
    },
    removeItem(items) {
      this.removeCartItem(items.cart_row);
    },
    afterSavefav(items) {
      console.log("afterSavefav");
      console.log(items);
      this.removeCartItem(items.cart_row);
    },
  },
};
</script>
