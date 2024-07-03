<template>
  <template v-for="items in data" :key="items">
    <q-item
      class="q-pa-sm bg-mygreyx radius10 q-mb-md"
      :class="{
        'bg-grey600 ': $q.dark.mode,
        'bg-mygrey ': !$q.dark.mode,
      }"
      clickable
      @click="
        this.$emit('onClick', {
          item_uuid: items.item_uuid,
          cat_id: items.cat_id ? items.cat_id : items.category_id[0],
        })
      "
    >
      <!--<q-item-section side top>
        <q-img
          :src="items.url_image"
          placeholder-src="placeholder.png"
          style="height: 90px; width: 90px"
          loading="lazy"
          fit="cover"
          spinner-color="primary"
          spinner-size="sm"
          class="rounded-borders"
        ></q-img>
      </q-item-section>-->
      <q-item-section>
        <q-item-label class="text-weight-bold">
          <span v-html="items.item_code"></span> <span v-html="items.item_name"></span>
        </q-item-label>
        <q-item-label caption class="ellipsis-2-lines">
          <span v-html="items.item_description" class="text-body2"></span>
        </q-item-label>
        <q-item-label>
          <div class="flex justify-between items-center">
            <div
              class="text-weight-light font13 text-darkx"
              v-if="items.price"
              :class="{
                'text-white': $q.dark.mode,
                'text-dark': !$q.dark.mode,
              }"
            >
              <template v-if="items.price[0]">
                {{ items.price[0].size_name }}
              </template>
            </div>
            <div v-if="items.price" class="text-weight-bold">
              <template v-if="items.price[0]">
                <template v-if="items.price[0].discount > 0">
                  <span color="dark" class="q-mr-sm text-strike ">
                    {{ items.price[0].pretty_price }}
                  </span>
                </template>
              </template>

              <span
                class="text-negativex"
                :class="{
                  'text-white': $q.dark.mode,
                  'text-red-9': !$q.dark.mode,
                }"
              >
                <template v-if="items.price[0]">
                  <template v-if="items.price[0].discount > 0">
                    {{ items.price[0].pretty_price_after_discount }}
                  </template>
                  <template v-else>
                    {{ items.price[0].pretty_price }}
                  </template>
                </template>
              </span>
            </div>
          </div>
        </q-item-label>
      </q-item-section>
    </q-item>
  </template>
</template>

<script>
export default {
  name: "ItemsList",
  props: ["data"],
  setup() {
    return {};
  },
};
</script>
