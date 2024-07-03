<template>
  <q-pull-to-refresh @refresh="refresh">
    <q-header
      class="bg-whitex"
      reveal
      @reveal="scrollHandler"
      :class="{
        'bg-mydark text-white': $q.dark.mode,
        'bg-white text-dark': !$q.dark.mode,
      }"
    >
      <q-toolbar>
        <q-btn
          @click="$router.back()"
          round
          dense
          icon="arrow_back"
          unelevated
          :color="$q.dark.mode ? 'grey' : 'mygrey'"
          :text-color="$q.dark.mode ? 'grey-9' : 'dark'"
        />
        <q-toolbar-title class="text-weight-bold">{{
          $t("Menu")
        }}</q-toolbar-title>
        <q-btn
          to="/menu/search"
          round
          dense
          icon="search"
          unelevated
          :color="$q.dark.mode ? 'grey300' : 'mygrey'"
          text-color="dark"
        />
      </q-toolbar>
    </q-header>
    <q-page class="q-pa-md">
      <CuisineCarousel
        ref="cuisine"
        :layout="2"
        :category_uuid_selected="category_uuid_selected"
        @after-categoryselected="afterCategoryselected"
      ></CuisineCarousel>

      <q-page-sticky
        v-if="scroll_down"
        expand
        position="top"
        class="q-pt-sm q-pb-sm"
        style="z-index: 2"
        :class="{
          'bg-mydark text-white': $q.dark.mode,
          'bg-white border-bottom text-black': !$q.dark.mode,
        }"
      >
        <div class="row items-center fit">
          <div class="col-2 text-center">
            <q-btn
              @click="$router.back()"
              round
              dense
              icon="arrow_back"
              unelevated
              :color="$q.dark.mode ? 'grey' : 'mygrey'"
              :text-color="$q.dark.mode ? 'grey-9' : 'dark'"
            />
          </div>
          <div class="col">
            <CategorySticky
              :loading="SettingStore.category_loading"
              :data="SettingStore.category_data"
              :category_uuid_selected="category_uuid_selected"
              @after-categoryselected="afterCategoryselected"
            ></CategorySticky>
          </div>
        </div>
      </q-page-sticky>

      <q-space class="q-pa-sm"></q-space>

      <template v-if="CartData.menu_loading">
        <template v-for="items in 6" :key="items">
          <q-item class="q-pt-none q-pl-none q-pr-none">
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

      <template v-else>
        <template
          v-for="(category, index) in CartData.data_category"
          :key="category.cat_id"
        >
          <div class="row items-center justify-between q-mb-xs">
            <div
              class="text-weight-bold text-h6 col"
              :id="category.category_uiid"
              :ref="setItemRef"
            >
              <span v-html="category.category_name"></span>
            </div>
            <div v-if="index <= 0" class="col-3 text-right">
              <q-btn
                round
                :color="$q.dark.mode ? 'grey' : 'white'"
                :text-color="$q.dark.mode ? 'grey-9' : 'dark'"
                :icon="
                  DataStorePersisted.menu_type == 'column'
                    ? 'o_view_agenda'
                    : 'grid_view'
                "
                unelevated
                @click="changeMenuType"
              />
            </div>
          </div>
          <div caption class="ellipsis-3-lines q-pb-sm">
            <span
              v-html="category.category_description"
              class="text-body2 "
            ></span>
          </div>
          <template v-if="DataStorePersisted.menu_type == 'list'">
            <ItemsdisplayList
              ref="items_list"
              :loading="CartData.menu_loading"
              :cat_id="category.cat_id"
              :data="category.items"
              :data_items="CartData.data_items"
              :dish="CartData.dish"
              @view-items="viewItems"
              @show-allergens="showAllergens"
            >
            </ItemsdisplayList>
          </template>
          <template v-else>
            <ItemsGrids
              ref="items_grid"
              :loading="CartData.menu_loading"
              :cat_id="category.cat_id"
              :data="category.items"
              :data_items="CartData.data_items"
              :dish="CartData.dish"
              @view-items="viewItems"
              @show-allergens="showAllergens"
            ></ItemsGrids>
          </template>

          <q-space class="q-pa-sm"></q-space>
        </template>
      </template>

      <q-page-scroller
        position="bottom-right"
        :scroll-offset="150"
        :offset="[18, 18]"
      >
        <q-btn
          fab
          icon="keyboard_arrow_up"
          :color="$q.dark.mode ? 'grey' : 'grey-2'"
          :text-color="$q.dark.mode ? 'grey-9' : 'grey'"
          padding="xs"
        />
      </q-page-scroller>
    </q-page>

    <template v-if="!CartData.cartcount_loading && !CartData.home_view_items">
      <q-footer
        v-if="CartData.cartcount_data.items_count > 0"
        class="q-pl-md q-pr-md q-pt-sm q-pb-sm"
        :class="{
          'bg-mydark text-white': $q.dark.mode,
          'bg-white text-dark': !$q.dark.mode,
        }"
      >
        <q-intersection once transition="scale" class="example-item">
          <q-btn
            color="primary"
            text-color="white"
            unelevated
            no-caps
            class="fit"
            size="lg"
            rounded
            to="/cart"
          >
            <div class="fit flex items-center justify-around">
              <div class="text-body1 text-weight-medium">
                {{ $t("View cart") }} &#x2022;
              </div>
              <div class="text-body2 text-weight-light">
                <template v-if="CartData.cartcount_data.items_count > 1">
                  {{ CartData.cartcount_data.items_count }} {{ $t("items") }}
                </template>
                <template v-else>
                  {{ CartData.cartcount_data.items_count }} {{ $t("item") }}
                </template>
              </div>
              <div class="text-body1 text-weight-medium">
                {{ CartData.cartcount_data.subtotal.value }}
              </div>
            </div>
          </q-btn>
        </q-intersection>
      </q-footer>
    </template>
  </q-pull-to-refresh>

  <ItemDetails
    ref="item_details"
    @after-addtocart="afterAddtocart"
  ></ItemDetails>

  <AllergensDetails
    ref="allergens"
    :allergens_item_id="allergens_item_id"
  ></AllergensDetails>

  <OrderDetailsArea
        ref="order_details_area"
        @after-savetrans="afterSaveAreatrans"
      >
  </OrderDetailsArea>
</template>

<script>
import { defineAsyncComponent } from "vue";
import { useDataStorePersisted } from "stores/DataStorePersisted";
import { scroll } from "quasar";
import { userCartData } from "stores/CartData";
import { useSettingStore } from "stores/SettingStore";
import { useUserStore } from "stores/UserStore";

const {
  getScrollTarget,
  setVerticalScrollPosition,
  getVerticalScrollPosition,
} = scroll;

export default {
  name: "MenuPage",
  data() {
    return {
      morphGroupModel: "cart",
      data: [],
      loading: false,
      category_seleted: "",
      itemRefs: [],
      category_position: [],
      trans_type: "",
      scroll_down: false,
      allergens_item_id: "",
      category_uuid_selected: "",
    };
  },
  setup(props) {
    const DataStorePersisted = useDataStorePersisted();
    const CartData = userCartData();
    const SettingStore = useSettingStore();
    const UserStore = useUserStore();
    return { DataStorePersisted, CartData, SettingStore, UserStore };
  },
  mounted() {
    if (Object.keys(this.CartData.data_category).length > 0) {
      if (
        this.UserStore.currency_code !=
        this.DataStorePersisted.use_currency_code
      ) {
        this.UserStore.currency_code =
          this.DataStorePersisted.use_currency_code;
        this.CartData.geStoreMenu();
      }
    } else {
      this.CartData.geStoreMenu();
    }
    this.CartData.getCartCount();
  },
  components: {
    CuisineCarousel: defineAsyncComponent(() =>
      import("components/CuisineCarousel.vue")
    ),
    ItemsGrids: defineAsyncComponent(() => import("components/ItemsGrids.vue")),
    ItemsdisplayList: defineAsyncComponent(() =>
      import("src/components/ItemsdisplayList.vue")
    ),
    ItemDetails: defineAsyncComponent(() =>
      import("components/ItemDetails.vue")
    ),
    CategorySticky: defineAsyncComponent(() =>
      import("components/CategorySticky.vue")
    ),
    // CartTotalSticky: defineAsyncComponent(() =>
    //   import("components/CartTotalSticky.vue")
    // ),
    OrderDetailsArea: defineAsyncComponent(() =>
      import("components/OrderDetailsArea.vue")
    ),
    AllergensDetails: defineAsyncComponent(() =>
      import("components/AllergensDetails.vue")
    ),
  },
  methods: {
    changeMenuType() {
      this.DataStorePersisted.menu_type =
        this.DataStorePersisted.menu_type == "column" ? "list" : "column";
    },
    refresh(done) {
      this.CartData.geStoreMenu(done);
    },
    viewItems(data) {
      if (Object.keys(this.DataStorePersisted.area_id).length <= 0) {
        this.$refs.order_details_area.modal = true;
        return false;
      }
      else{
      this.$refs.item_details.showModal(true, data);
      }
    },
    scrollHandler(data) {
      this.scroll_down = !data;
      if (data == false) {
        this.morphGroupModel = "btn";
      } else {
        this.morphGroupModel = "cart";
      }
    },
    afterCategoryselected(data) {
      this.category_uuid_selected = data.category_uiid;
      this.scrollToElement(data.category_uiid);
    },
    scrollToElement(id) {
      const ele = document.getElementById(id);
      const target = getScrollTarget(ele);
      const offset = ele.offsetTop;
      const duration = 500;
      setVerticalScrollPosition(target, offset, duration);
    },
    afterAddtocart() {
      this.CartData.getCartCount();
    },
    showAllergens(item_id) {
      this.allergens_item_id = item_id;
      this.$refs.allergens.dialog = true;
    },
  },
};
</script>
