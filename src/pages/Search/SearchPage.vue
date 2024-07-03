<template>
  <q-header
    reveal
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
      <q-toolbar-title class="text-weight-bold text-darkx">{{
        $t("Search")
      }}</q-toolbar-title>
    </q-toolbar>
  </q-header>
  <q-page class="q-pa-md">
    <q-form @submit="onSubmit">
      <q-input
        v-model="q"
        :label="$t('Search menu')"
        outlined
        :color="$q.dark.mode ? 'grey600' : 'grey-1'"
        :bg-color="$q.dark.mode ? 'grey600' : 'grey-1'"
        label-color="grey-5"
        borderless
      >
        <template v-slot:prepend>
          <q-icon name="search" color="grey" />
        </template>
        <template v-slot:append>
          <q-btn
            v-if="isSubmit"
            round
            color="red-2"
            text-color="red-9"
            icon="close"
            no-caps
            unelevated
            size="sm"
            @click="resetSearch"
          />
          <q-btn
            v-else
            unelevated
            :label="$t('Search')"
            no-caps
            :color="$q.dark.mode ? 'grey' : 'primary'"
            :text-color="$q.dark.mode ? 'grey600' : 'white'"
            @click="onSubmit"
            :loading="search_loading"
          ></q-btn>
        </template>
      </q-input>
    </q-form>

    <q-space class="q-pa-md"></q-space>

    <!-- SEARCH RESULT -->
    <template v-if="hasData">
      <div class="row items-center justify-between q-mb-sm">
        <div class="text-weight-bold font15">
          {{ $t("Search results for") }} “{{ this.q }}” ({{ Count() }})
        </div>
      </div>
      <q-intersection once transition="scale" class="example-item">
        <ItemsList :data="search_data" @on-click="viewItems"></ItemsList>
      </q-intersection>
    </template>
    <template v-else-if="isSubmit">
      <div class="q-mb-md">
        <div class="text-weight-bold font15">
          {{ $t("No results for") }} “{{ this.q }}”
        </div>
        <div class="text-grey">
          {{
            $t("Sorry, no product matched for your search. Please try again")
          }}.
        </div>
      </div>
    </template>
    <!-- SEARCH RESULT -->

    <template v-if="!isSubmit">
      <div
        v-if="hasFeaturedData"
        class="row items-center justify-between q-mb-xs"
      >
        <div class="text-weight-bold font15">{{ $t("Trending Items") }}</div>
        <div>
          <q-btn
            flat
            no-caps
            :color="$q.dark.mode ? 'grey300' : 'primary'"
            to="/items/feature?tag=trending&title=Trending"
            >{{ $t("See All") }}</q-btn
          >
        </div>
      </div>

      <template v-if="loading">
        <div class="q-gutter-sm">
          <template v-for="x in 3" :key="x">
            <q-skeleton
              height="80px"
              square
              class="radius10"
              :class="{
                'bg-grey600': $q.dark.mode,
                'bg-mygrey': !$q.dark.mode,
              }"
            />
          </template>
        </div>
      </template>
      <template v-else>
        <q-list>
          <q-intersection once transition="scale" class="example-item">
            <ItemsList :data="data" @on-click="viewItems"></ItemsList>
          </q-intersection>
        </q-list>
      </template>
    </template>

    <q-space class="q-pa-md"></q-space>

    <ItemDetails
      ref="item_details"
      @after-addtocart="afterAddtocart"
    ></ItemDetails>
  </q-page>
</template>

<script>
import { defineAsyncComponent } from "vue";
import APIinterface from "src/api/APIinterface";
import { useDataStorePersisted } from "stores/DataStorePersisted";
import { userCartData } from "stores/CartData";

export default {
  name: "SearchPage",
  data() {
    return {
      morphGroupModel: "cart",
      tag: "trending",
      loading: false,
      data: [],
      q: "",
      search_loading: false,
      search_data: [],
      isSubmit: false,
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
  },
  mounted() {
    this.getFeaturedItems();
    this.CartData.getCartCount();
  },
  computed: {
    hasData() {
      if (Object.keys(this.search_data).length > 0) {
        return true;
      }
      return false;
    },
    hasFeaturedData() {
      if (Object.keys(this.data).length > 0) {
        return true;
      }
      return false;
    },
  },
  methods: {
    getFeaturedItems() {
      this.loading = true;
      APIinterface.fetchDataPost(
        "getFeaturedItems",
        "page=" +
          1 +
          "&tag=" +
          this.tag +
          "&limit=3" +
          "&currency_code=" +
          this.DataStorePersisted.getUseCurrency()
      )
        .then((data) => {
          this.data = data.details.data;
        })
        .catch((error) => {
          this.data = [];
        })
        .then((data) => {
          this.loading = false;
        });
    },
    viewItems(data) {
      this.$refs.item_details.showModal(true, data);
    },
    afterAddtocart() {
      this.CartData.getCartCount();
    },
    onSubmit() {
      if (!APIinterface.empty(this.q)) {
        this.search_loading = true;
        APIinterface.fetchDataPost(
          "menuSearch",
          "q=" +
            this.q +
            "&currency_code=" +
            this.DataStorePersisted.getUseCurrency()
        )
          .then((data) => {
            this.search_data = data.details.data;
          })
          .catch((error) => {
            this.search_data = [];
          })
          .then((data) => {
            this.search_loading = false;
            this.isSubmit = true;
          });
      }
    },
    Count() {
      if (Object.keys(this.search_data).length > 0) {
        return Object.keys(this.search_data).length;
      }
      return 0;
    },
    resetSearch() {
      this.isSubmit = false;
      this.search_data = [];
      this.q = "";
    },
  },
};
</script>
