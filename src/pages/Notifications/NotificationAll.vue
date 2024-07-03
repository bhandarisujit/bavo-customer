<template>
  <q-pull-to-refresh @refresh="refresh">
    <q-header
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
        <q-toolbar-title class="text-weight-bold">
          <template v-if="hold"
            >{{ itemToDelete }} {{ $t("selected") }}</template
          >
          <template v-else>{{ $t("Notifications") }}</template>
        </q-toolbar-title>
        <q-btn
          v-if="hold"
          @click="hold = false"
          flat
          round
          dense
          icon="close"
          :color="$q.dark.mode ? 'white' : 'dark'"
        />
        <template v-else>
          <q-btn
            v-if="hasData"
            @click="deleteAll"
            round
            dense
            icon="o_delete"
            color="red-2"
            text-color="red-9"
            unelevated
          />
        </template>
      </q-toolbar>
    </q-header>

    <q-page
      class="q-pa-md"
      :class="{ 'flex flex-center': !hasData && !loading }"
    >
      <q-infinite-scroll ref="nscroll" @load="getNotifications" :offset="250">
        <q-list>
          <template v-for="(item, index1) in data" :key="item">
            <q-slide-item
              v-for="(items, index2) in item"
              :key="items"
              @action="deleteNotification(index1, index2, items)"
              right-color="red"
              class="q-mb-sm radius10"
            >
              <template v-slot:right>
                <q-btn
                  round
                  color="primary"
                  icon="delete_outline"
                  unelevated
                  size="sm"
                />
              </template>
              <q-item
                v-touch-hold.mouse="handleHold"
                tag="label"
                class="q-pa-sm bg-mygreyx radius10"
                :class="{
                  'bg-grey600 text-grey300': $q.dark.mode,
                  'bg-mygrey text-dark': !$q.dark.mode,
                }"
              >
                <q-item-section avatar>
                  <template v-if="hold">
                    <q-checkbox
                      v-model="notification_uuids"
                      :val="items.notification_uuid"
                    />
                  </template>
                  <template v-else>
                    <q-img
                      :src="items.image"
                      style="width: 70px; height: 70px"
                      fit="cover"
                      loading="lazy"
                      spinner-color="primary"
                      spinner-size="xs"
                      class="rounded-borders"
                    ></q-img>
                  </template>
                </q-item-section>
                <q-item-section>
                  <div class="text-weight-bold">{{ items.date }}</div>
                  <div class="ellipsis-3-lines text-grey-6">
                    {{ items.message }}
                  </div>
                </q-item-section>
                <q-item-section side>
                  <q-badge
                    rounded
                    :color="$q.dark.mode ? 'grey600' : 'mygrey'"
                  />
                </q-item-section>
              </q-item>
            </q-slide-item>
          </template>
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
              {{ $t("No new notifications") }}
            </div>
            <div class="text-grey font12">
              {{ $t("pull down to refresh") }}
            </div>
          </div>
        </template>
      </template>

      <q-page-scroller
        position="bottom-right"
        :scroll-offset="150"
        :offset="[18, 18]"
      >
        <q-btn fab icon="keyboard_arrow_up" color="dark" padding="xs" />
      </q-page-scroller>
    </q-page>
  </q-pull-to-refresh>

  <q-footer v-if="hold && itemToDelete > 0" class="bg-lightprimary">
    <q-tabs
      v-model="tab"
      class="text-grey-8"
      no-caps
      dense
      shrink
      narrow-indicator
      stretch
      align="left"
      :breakpoint="0"
      indicator-color="dark"
    >
      <q-tab
        name="delete"
        icon="delete"
        :label="$t('Delete')"
        @click="deleteAllNotification"
      />
    </q-tabs>
  </q-footer>
</template>

<script>
import APIinterface from "src/api/APIinterface";

export default {
  name: "NotificationsPage",
  data() {
    return {
      loading: true,
      data: [],
      page: 0,
      data_done: false,
      is_refresh: undefined,
      hold: false,
      notification_uuids: [],
      tab: "delete",
    };
  },
  watch: {
    hold(newval, oldval) {
      if (!newval) {
        this.notification_uuids = [];
      }
    },
  },
  computed: {
    hasData() {
      if (Object.keys(this.data).length > 0) {
        return true;
      }
      return false;
    },
    itemToDelete() {
      return Object.keys(this.notification_uuids).length;
    },
  },
  methods: {
    refresh(done) {
      this.resetPagination();
      this.is_refresh = done;
    },
    getNotifications(index, done) {
      this.loading = true;
      this.page = index;
      APIinterface.fetchDataByTokenPost("getNotification", "page=" + index)
        .then((data) => {
          this.data.push(data.details.data);
          if (data.details.end_results) {
            if (this.$refs.nscroll) {
              this.$refs.nscroll.stop();
            }
          }
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
    deleteNotification(index1, index2, items) {
      this.data[index1].splice(index2, 1);
      APIinterface.fetchDataByTokenPost(
        "deleteNotification",
        "uuid=" + items.notification_uuid
      ).then((data) => {
        //
      });
    },
    handleHold(event) {
      this.hold = true;
    },
    resetHold() {
      this.hold = false;
      this.notification_uuids = [];
    },
    deleteAllNotification() {
      APIinterface.fetchDataByTokenPost("deleteAllNotification", {
        notification_uuids: this.notification_uuids,
      })
        .then((data) => {
          this.hold = false;
          this.resetPagination();
        })
        .catch((error) => {})
        .then((data) => {});
    },
    deleteAll() {
      this.$q
        .dialog({
          title: this.$t("Delete all"),
          message: this.$t("Are you sure want to delete all notifications?"),
          transitionShow: "fade",
          transitionHide: "fade",
          ok: {
            unelevated: true,
            color: "primary",
            rounded: false,
            "text-color": "white",
            size: "md",
            label: this.$t("Okay"),
            "no-caps": true,
          },
        })
        .onOk(() => {
          APIinterface.fetchDataByTokenPost("deleteNotifications", {})
            .then((data) => {
              this.hold = false;
              this.resetPagination();
            })
            .catch((error) => {})
            .then((data) => {});
        })
        .onCancel(() => {
          // console.log('Cancel')
        })
        .onDismiss(() => {
          // console.log('I am triggered on both OK and Cancel')
        });
    },
  },
};
</script>
