<template>
  <q-pull-to-refresh @refresh="refresh">
    <q-header
      class="bg-whitex"
      reveal
      @reveal="scrollHandler"
      :class="{
        'bg-mydark text-white ': $q.dark.mode,
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
        <q-toolbar-title class="text-weight-bold text-darkx">{{
          $t(title)
        }}</q-toolbar-title>
      </q-toolbar>
    </q-header>
    <q-page
      class="q-pa-md q-pb-xl"
      :class="{ 'flex flex-center': !hasData && !loading }"
    >
      <q-infinite-scroll ref="nscroll" @load="getFeaturedItems" :offset="250">
        <q-list>
          <q-intersection
            v-for="items in data"
            :key="items"
            once
            transition="scale"
            class="example-item"
          >
            <ItemsList :data="items" @on-click="viewItems"></ItemsList>
          </q-intersection>
        </q-list>

        <template v-slot:loading>
          <template v-if="page <= 1">
            <q-inner-loading :showing="true" color="primary" size="md" />
          </template>
          <div v-else-if="page > 1" class="row justify-center absolute-bottom">
            <div class="q-pa-md flex flex-center">
              <div class="flex items-center q-gutter-x-sm">
                <div>
                  <q-circular-progress
                    indeterminate
                    rounded
                    size="30px"
                    color="primary"
                  />
                </div>
                <div class="text-body2 text-grey">{{ $t("loading") }}</div>
              </div>
            </div>
          </div>
        </template>
      </q-infinite-scroll>

      <template v-if="!loading">
        <template v-if="hasData">
          <template v-if="data_done && data.length >= 10">
            <div class="row justify-center q-my-sm">
              <p class="font12 text-grey">{{ $t("end of results") }}</p>
            </div>
          </template>
        </template>
        <template v-else>
          <div class="full-width text-center">
            <q-icon name="history" size="70px" color="grey-3" />
            <div class="text-weight-medium font15">
              {{ $t("No available data") }}
            </div>
            <div class="text-grey font12">
              {{ $t("pull down to refresh") }}
            </div>
          </div>
        </template>
      </template>

      <ItemDetails
        ref="item_details"
        @after-addtocart="afterAddtocart"
      ></ItemDetails>

      <q-page-scroller
        position="bottom"
        :scroll-offset="150"
        :offset="[18, 25]"
      >
        <q-btn
          fab
          icon="keyboard_arrow_up"
          color="grey-2"
          text-color="grey"
          padding="xs"
        />
      </q-page-scroller>

      <q-page-scroller
        position="bottom-right"
        :scroll-offset="150"
        :offset="[18, 18]"
      >
        <CartTotalSticky :morphGroupModel="morphGroupModel"></CartTotalSticky>
      </q-page-scroller>
    </q-page>
  </q-pull-to-refresh>
</template>

<script>
import APIinterface from "src/api/APIinterface";
import { defineAsyncComponent } from "vue";
import { useDataStorePersisted } from "stores/DataStorePersisted";
import { userCartData } from "stores/CartData";

export default {
  name: "CategoryItems",
  data() {
    return {
      morphGroupModel: "cart",
      loading: true,
      data: [],
      data_done: false,
      page: 0,
      is_refresh: undefined,
      title: "",
      tag: "",
    };
  },
  setup(props) {
    const DataStorePersisted = useDataStorePersisted();
    const CartData = userCartData();
    return { DataStorePersisted, CartData };
  },
  components: {
    ItemsList: defineAsyncComponent(() => import("components/ItemsList.vue")),
    ItemDetails: defineAsyncComponent(() =>
      import("components/ItemDetails.vue")
    ),
    CartTotalSticky: defineAsyncComponent(() =>
      import("components/CartTotalSticky.vue")
    ),
  },
  created() {
    this.title = this.$route.query.title;
    this.tag = this.$route.query.tag;
  },
  computed: {
    hasData() {
      if (Object.keys(this.data).length > 0) {
        return true;
      }
      return false;
    },
  },
  methods: {
    scrollHandler(data) {
      this.scroll_down = !data;
      if (data == false) {
        this.morphGroupModel = "btn";
      } else {
        this.morphGroupModel = "cart";
      }
    },
    refresh(done) {
      this.CartData.getCartCount();
      this.resetPagination();
      this.is_refresh = done;
    },
    getFeaturedItems(index, done) {
      this.loading = true;
      this.page = index;
      APIinterface.fetchDataPost(
        "getFeaturedItems",
        "page=" +
          index +
          "&tag=" +
          this.tag +
          "&currency_code=" +
          this.DataStorePersisted.getUseCurrency()
      )
        .then((data) => {
          this.data.push(data.details.data);
        })
        .catch((error) => {
          this.data_done = true;
          if (!APIinterface.empty(this.$refs.nscroll)) {
            this.$refs.nscroll.stop();
          }
        })
        .then((data) => {
          done();
          this.loading = false;
          if (!APIinterface.empty(this.is_refresh)) {
            this.is_refresh();
          }
        });
    },
    resetPagination() {
      this.page = 0;
      this.data = [];
      this.$refs.nscroll.reset();
      this.$refs.nscroll.resume();
      this.$refs.nscroll.trigger();
    },
    viewItems(data) {
      this.$refs.item_details.showModal(true, data);
    },
    afterAddtocart() {
      this.CartData.getCartCount();
    },
  },
};
</script>
