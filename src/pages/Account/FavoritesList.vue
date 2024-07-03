<template>
  <q-pull-to-refresh @refresh="refresh">
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
        <q-toolbar-title class="text-weight-bold">{{
          $t("Favorites")
        }}</q-toolbar-title>
      </q-toolbar>
    </q-header>
    <q-page>
      <div class="q-pl-md q-pr-md q-pt-sm q-pb-xl">
        <q-infinite-scroll ref="nscroll" @load="getTransactions" :offset="250">
          <template v-slot:default>
            <template v-if="hasData">
              <q-list separator>
                <template v-for="(datas, index) in getData" :key="datas">
                  <template
                    v-for="(items, index2) in datas"
                    :key="items.item_id"
                  >
                    <q-item
                      clickable
                      @click="
                        viewItems({
                          cat_id: items.cat_id,
                          item_uuid: items.item_uuid,
                        })
                      "
                    >
                      <!--<q-item-section avatar>
                        <q-img
                          :src="items.image_url"
                          style="width: 70px; height: 70px"
                          fit="cover"
                          loading="lazy"
                          spinner-color="primary"
                          spinner-size="xs"
                          class="rounded-borders"
                        ></q-img>
                      </q-item-section>-->
                      <q-item-section>
                        <q-item-label>
                          <span class="text-bold" v-html="items.item_code"></span> <span class="text-bold" v-html="items.item_name"></span>
                        </q-item-label>
                        <q-item-label caption lines="2">
                          <span v-html="items.item_description"></span>
                        </q-item-label>
                      </q-item-section>
                      <q-item-section side>
                        <div
                          class="text-bold"
                          :class="{
                            'text-green': items.transaction_type == 'credit',
                            'text-red': items.transaction_type == 'debit',
                          }"
                        >
                          {{ items.transaction_amount }}
                        </div>
                      </q-item-section>
                      <q-item-section side top>
                        <q-btn
                          icon="delete_outline"
                          color="red-2"
                          text-color="red-9"
                          unelevated
                          size="11px"
                          round
                          @click.stop="addTofav(items, index, index2)"
                        ></q-btn>
                      </q-item-section>
                    </q-item>
                  </template>
                </template>
              </q-list>
            </template>
            <template v-else>
              <div
                v-if="!loading"
                class="card-small-medium flex flex-center text-body2 text-grey"
              >
                <div>{{ $t("No available data") }}</div>
              </div>
            </template>
          </template>

          <template v-slot:loading>
            <template v-if="page <= 1">
              <q-inner-loading :showing="true" color="primary" size="md" />
            </template>
            <div
              v-else-if="page > 1"
              class="row justify-center absolute-bottom"
            >
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
      </div>

      <q-page-scroller
        position="bottom-right"
        :scroll-offset="150"
        :offset="[18, 18]"
      >
        <q-btn
          fab
          icon="keyboard_arrow_up"
          color="grey-2"
          text-color="grey"
          padding="xs"
        />
      </q-page-scroller>

      <ItemDetails
        ref="item_details"
        @after-addtocart="afterAddtocart"
      ></ItemDetails>

      <LoaderDialog ref="loader_dialog"></LoaderDialog>
    </q-page>
  </q-pull-to-refresh>
</template>

<script>
import { defineAsyncComponent } from "vue";
import { useSettingStore } from "stores/SettingStore";
import APIinterface from "src/api/APIinterface";

export default {
  name: "FavoritesList",
  components: {
    ItemDetails: defineAsyncComponent(() =>
      import("components/ItemDetails.vue")
    ),
    LoaderDialog: defineAsyncComponent(() =>
      import("components/LoaderDialog.vue")
    ),
  },
  setup() {
    const SettingStore = useSettingStore();
    return { SettingStore };
  },
  data() {
    return {
      data: [],
      loading: false,
      tab: "transaction",
      tabList: [
        {
          value: "transaction",
          label: this.$t("Transactions"),
        },
        {
          value: "points_merchant",
          label: this.$t("Points by merchant"),
        },
      ],
      page: 0,
      is_refresh: undefined,
      balance: 0,
      loading_balance: true,
    };
  },
  mounted() {},
  computed: {
    hasData() {
      if (Object.keys(this.data).length > 0) {
        return true;
      }
      return false;
    },
    getData() {
      return this.data;
    },
  },
  methods: {
    async refresh(done) {
      this.resetPagination();
      done();
    },
    getTransactions(index, done) {
      this.loading = true;
      this.page = index;
      APIinterface.fetchDataByTokenPost("getsaveitems2", "page=" + index)
        .then((data) => {
          if (data.code == 1) {
            this.data.push(data.details.data);
            if (data.details.end_results) {
              if (this.$refs.nscroll) {
                this.$refs.nscroll.stop();
              }
            }
          } else {
            if (this.$refs.nscroll) {
              this.$refs.nscroll.stop();
            }
          }
        })
        .catch((error) => {
          if (this.$refs.nscroll) {
            this.$refs.nscroll.stop();
          }
        })
        .then((data) => {
          this.$refs.nscroll.stop();
          this.loading = false;
          done();
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
      this.$router.push("/cart");
    },
    addTofav(items, index, index2) {
      this.$refs.loader_dialog.modal = true;
      APIinterface.fetchDataByTokenPost(
        "addTofav",
        "cat_id=" + items.cat_id + "&item_token=" + items.item_uuid
      )
        .then((data) => {
          if (this.data[index]) {
            this.data[index].splice(index2, 1);
          }
          if (this.data[index].length === 0) {
            this.data.splice(index, 1);
          }
        })
        .catch((error) => {
          APIinterface.notify("dark", error, "error_outline", this.$q);
        })
        .then((data) => {
          this.$refs.loader_dialog.modal = false;
        });
    },
  },
};
</script>
