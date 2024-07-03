<template>
  <q-pull-to-refresh @refresh="refresh">
    <q-page
      class="q-pa-md"
      :class="{
        'bg-mydark text-white': $q.dark.mode,
        'bg-white text-black': !$q.dark.mode,
      }"
    >
      <h5 class="q-ma-none text-weight-bold">{{ $t("Fast and") }}</h5>
      <h5 class="q-ma-none text-weight-bold">
        {{ $t("Delicious") }} <span class="text-primary">{{ $t("Food") }}</span>
      </h5>

      <q-space class="q-pa-sm"></q-space>
      <!-- <pre>{{ SettingStore.getTransactionData }}</pre> -->
      <div class="row items-center q-col-gutter-md">
        <div class="col-2">
          <q-btn
            outline
            :color="$q.dark.mode ? 'bluegrey500' : 'grey-5'"
            icon="las la-map-marker"
            class="circle-borders"
            :disable="SettingStore.loading_transaction"
            @click.stop="changeOrderDetails"
          />
        </div>
        <div class="col">
          <template v-if="SettingStore.loading_transaction">
            <q-circular-progress
              indeterminate
              rounded
              size="20px"
              color="yellow-9"
            />
          </template>
          <template v-else>
            <!-- <pre>{{ SettingStore.getTransactionData }}</pre> -->
            <div class="text-weight-medium ellipsis">
              {{ SettingStore.getTransactionData.transaction }} (
              {{ SettingStore.getTransactionData.date }}
              <template v-if="SettingStore.getTransactionData.time">
                , {{ SettingStore.getTransactionData.time }}
              </template>
              )
            </div>
            <!--<q-btn
              flat
              no-caps
              :color="$q.dark.mode ? 'grey300' : 'primary'"
              class="q-pa-none"
              style="min-height: auto; max-width: 200px"
              @click.stop="changeOrderDetails"
            >
              <div class="ellipsis">
                <template v-if="DataStorePersisted.hasRecentAddress">
                  {{ DataStorePersisted.location_data.addressLine1 }}
                  {{ DataStorePersisted.location_data.description }}
                </template>
                <template v-else>{{ $t("Select your address") }} </template>
              </div>
            </q-btn>-->
            <q-btn
              flat
              no-caps
              :color="$q.dark.mode ? 'grey300' : 'primary'"
              class="q-pa-none"
              style="min-height: auto; max-width: 200px"
              @click.stop="changeOrderDetails"
            >
              <div class="ellipsis">
                <template v-if="DataStorePersisted.area_id">
                  {{ DataStorePersisted.delivery_area.label }}
                  {{ DataStorePersisted.delivery_postalcode }}
                </template>
                <template v-else>{{ $t("Select your area") }} </template>
              </div>
            </q-btn>
          </template>
        </div>
      </div>
      <q-space class="q-pa-sm"></q-space>

      <HomeCategories
        ref="cuisine"
        :layout="1"
        @after-categoryselected="afterCategoryselected"
        @after-menuselected="afterMenuselected"
      ></HomeCategories>

      <q-space class="q-pa-sm"></q-space>

      <BannerCarousel ref="banner" @view-items="viewItems"></BannerCarousel>

      <q-space class="q-pa-xs"></q-space>

      <div
        v-if="best_seller_flag"
        class="row items-center justify-between q-mb-xs"
      >
        <div class="text-weight-bold font15">{{ $t("Best Seller") }}</div>
        <div>
          <q-btn
            flat
            no-caps
            :color="$q.dark.mode ? 'grey300' : 'primary'"
            to="/items/feature?tag=best_seller&title=Best Seller"
            >{{ $t("See All") }}</q-btn
          >
        </div>
      </div>

      <ItemsGrid
        ref="items_grid"
        @view-items="viewItems"
        @after-fetchdata="afterFetchdata"
        featured="best_seller"
      ></ItemsGrid>
      <q-space v-if="best_seller_flag" class="q-pa-sm"></q-space>

      <div v-if="recommended_flag" class="row items-center justify-between">
        <div class="text-weight-bold font15">{{ $t("Recommended") }}</div>
        <div>
          <q-btn
            flat
            no-caps
            :color="$q.dark.mode ? 'grey300' : 'primary'"
            to="/items/feature?tag=recommended&title=Recommended"
            >{{ $t("See All") }}</q-btn
          >
        </div>
      </div>

      <ItemsColumn
        ref="items_column"
        featured="recommended"
        @view-items="viewItems"
        @after-fetch="afterFetch"
      ></ItemsColumn>

      <q-space v-if="recommended_flag" class="q-pa-md"></q-space>

      <div v-if="review_flag" class="row items-center justify-between q-mb-xs">
        <div class="text-weight-bold font15">
          {{ $t("What people say about us") }}
        </div>
        <div>
          <q-btn
            flat
            no-caps
            :color="$q.dark.mode ? 'grey300' : 'primary'"
            to="/review/all"
            >{{ $t("See All") }}</q-btn
          >
        </div>
      </div>

      <CustomerReviews ref="reviews" @after-reviewloaded="afterReviewloaded">
      </CustomerReviews>

      <ItemDetails
        ref="item_details"
        @after-addtocart="afterAddtocart"
      ></ItemDetails>

      <OrderDetails
        ref="order_details"
        @show-orderdetails="showOrderdetails"
        @show-savedaddress="showSavedaddress"
        @show-savedarea="showSavedarea"
      ></OrderDetails>

      <OrderDetailsinfo
        ref="order_details_info"
        @after-savetrans="afterSavetrans"
      >
      </OrderDetailsinfo>

      <OrderDetailsArea
        ref="order_details_area"
        @after-saveareatrans="afterSaveareatrans"
      >
      </OrderDetailsArea>

      <AddressQuickList
        ref="address_list"
        redirect="/home"
        @after-selectaddress="afterSelectaddress"
      ></AddressQuickList>
    </q-page>
  </q-pull-to-refresh>
</template>

<script>
import { defineAsyncComponent } from "vue";
import { useDataStorePersisted } from "stores/DataStorePersisted";
import { userCartData } from "stores/CartData";
import { useSettingStore } from "stores/SettingStore";
import APIinterface from "src/api/APIinterface";

export default {
  name: "HomePage",
  components: {
    HomeCategories: defineAsyncComponent(() =>
      import("components/HomeCategories.vue")
    ),
    ItemsGrid: defineAsyncComponent(() => import("components/ItemsGrid.vue")),
    ItemsColumn: defineAsyncComponent(() =>
      import("components/ItemsColumn.vue")
    ),
    BannerCarousel: defineAsyncComponent(() =>
      import("components/BannerCarousel.vue")
    ),
    CustomerReviews: defineAsyncComponent(() =>
      import("components/CustomerReviews.vue")
    ),
    ItemDetails: defineAsyncComponent(() =>
      import("components/ItemDetails.vue")
    ),
    OrderDetails: defineAsyncComponent(() =>
      import("components/OrderDetails.vue")
    ),
    OrderDetailsinfo: defineAsyncComponent(() =>
      import("components/OrderDetailsinfo.vue")
    ),
    OrderDetailsArea: defineAsyncComponent(() =>
      import("components/OrderDetailsArea.vue")
    ),
    AddressQuickList: defineAsyncComponent(() =>
      import("components/AddressQuickList.vue")
    ),
  },
  setup(props) {
    const DataStorePersisted = useDataStorePersisted();
    const CartData = userCartData();
    const SettingStore = useSettingStore();
    return { DataStorePersisted, CartData, SettingStore };
  },
  data() {
    return {
      best_seller_flag: false,
      recommended_flag: false,
      review_flag: false,
      redirect: "",
    };
  },
  mounted() {
    this.CartData.getCartCount();
    if (Object.keys(this.DataStorePersisted.location_data).length <= 0) {
      this.DataStorePersisted.getLocationByIp();
    }

    if (Object.keys(this.SettingStore.settings_data).length > 0) {
      if (Object.keys(this.SettingStore.format_transaction_data).length <= 0) {
        this.SettingStore.formatTransaction();
      }
    } else {
      this.$watch(
        () => this.SettingStore.$state.settings_data,
        (newData, oldData) => {
          this.SettingStore.formatTransaction();
        }
      );
    }
  },
  methods: {
    refresh(done) {
      this.SettingStore.getCategory();
      this.$refs.banner.getBanner();
      this.$refs.items_grid.itemfeatured();
      this.$refs.items_column.itemfeatured();
      done();
    },
    viewItems(data) {
      this.$refs.item_details.showModal(true, data);
    },
    afterAddtocart() {
      console.log("afterAddtocart");
      this.CartData.getCartCount();
    },
    afterFetchdata(data) {
      this.best_seller_flag = data;
    },
    afterFetch(data) {
      this.recommended_flag = data;
    },
    afterCategoryselected(data) {
      if (Object.keys(this.DataStorePersisted.area_id).length <= 0) {
        this.$refs.order_details_area.modal = true;
        this.redirect = { path: "/items/category", query: {
          title: data.category_name,
          category_uiid: data.category_uiid,
          cat_id: data.cat_id,
        } };
        return false;
      }
      else{
      }
      this.$router.push({
        path: "/items/category",
        query: {
          title: data.category_name,
          category_uiid: data.category_uiid,
          cat_id: data.cat_id,
        },
      });
    },
    afterMenuselected(data) {
      if (Object.keys(this.DataStorePersisted.area_id).length <= 0) {
        this.$refs.order_details_area.modal = true;
        this.redirect = '/menu';
        return false;
      }
      else{
        this.$router.push({
        path: "/menu",
      });
      }

    },
    changeOrderDetails() {
      /*if (Object.keys(this.DataStorePersisted.location_data).length <= 0) {
        this.$router.push({ path: "/location", query: { redirect: "/home" } });
      }*/  if (Object.keys(this.DataStorePersisted.area_id).length <= 0) {
        this.$refs.order_details_area.modal = true;
      }
      else {
        this.$refs.order_details.modal = true;
      }
    },
    showOrderdetails() {
      this.$refs.order_details_info.modal = true;
    },
    afterSavetrans() {
      console.log("afterSavetrans");
    },
    afterSaveareatrans() {
      console.log(this.redirect);
      console.log("afterSaveareatrans..");
      if (!APIinterface.empty(this.redirect)) {
        this.$router.push(this.redirect);
      }
    },
    afterReviewloaded() {
      this.review_flag = true;
    },
    showSavedaddress() {
      this.$refs.address_list.modal = true;
    },
    showSavedarea() {
      this.$refs.order_details_area.modal = true;
    },
    afterSelectaddress(data) {
      this.DataStorePersisted.location_data = data;
      this.SettingStore.formatTransaction();
    },
  },
};
</script>
