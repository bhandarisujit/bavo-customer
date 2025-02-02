<template>
  <div class="row q-col-gutter-none items-center" :class="class_name">
    <div class="col-2" style="margin-left: -8px">
      <q-btn
        @click="$emit('whenClose')"
        icon="arrow_back"
        flat
        dense
        color="primary"
      ></q-btn>
    </div>
    <div class="col" style="margin-left: -15px">
      <div
        class="radius10 q-pl-md q-pr-sm"
        :class="{
          'bg-grey600': $q.dark.mode,
          'bg-grey-2': !$q.dark.mode,
        }"
      >
        <q-select
          v-model="address"
          ref="address"
          use-input
          hide-selected
          fill-input
          input-debounce="0"
          :options="options"
          @filter="filterFn"
          @update:model-value="selectAddress"
          @input-value="setModel"
          @clear="$emit('onClear')"
          hide-dropdown-icon
          :loading="loading_search"
          borderless
          :standout="$q.dark.mode ? 'grey600' : 'bg-grey-2'"
          :bg-color="$q.dark.mode ? 'grey600' : 'grey-2'"
          dense
          clearable
          clear-icon="o_cancel"
          :placeholder="$t('Enter your address')"
        >
          <template v-slot:option="scope">
            <q-item v-bind="scope.itemProps">
              <q-item-section avatar>
                <q-icon name="o_place" />
              </q-item-section>
              <q-item-section>
                <q-item-label>{{ scope.opt.description }}</q-item-label>
              </q-item-section>
            </q-item>
          </template>
          <template v-slot:append>
            <q-icon
              @click="$emit('locateLocation')"
              name="my_location"
              class="cursor-pointer"
              color="primary"
            />
          </template>
        </q-select>
      </div>
    </div>
  </div>
</template>

<script>
import APIinterface from "src/api/APIinterface";

export default {
  name: "SearchLocation",
  props: ["detect_location", "class_name", "error"],
  data() {
    return {
      address: "",
      address_data: [],
      options: [],
      data: [],
      loading: false,
      loading_search: false,
      old_search: "",
    };
  },
  mounted() {
    setTimeout(() => {
      this.$refs.address.focus();
    }, 100);
  },
  watch: {
    address(newval, oldval) {
      if (APIinterface.empty(newval)) {
        setTimeout(() => {
          this.$emit("onClear");
        }, 500);
      }
    },
  },
  methods: {
    filterFn(val, update, abort) {
      if (val.length < 2) {
        if (!APIinterface.empty(this.address)) {
          update(() => {});
          return;
        }
        this.old_search = "";
        this.loading_search = false;
        abort();
        return;
      }

      if (this.old_search == val) {
        update(() => {});
      }

      this.loading_search = true;
      this.$emit("clearError");
      setTimeout(() => {
        update(() => {
          this.options = [];
          APIinterface.fetchDataPost("getlocationAutocomplete", "q=" + val)
            .then((data) => {
              this.$emit("afterResults", data.details);
              this.old_search = val;
            })
            .catch((error) => {
              abort();
            })
            .then((data) => {
              this.loading_search = false;
            });
        });
      }, 300);
    },
    setModel(val) {
      this.address = val;
    },
  },
};
</script>
