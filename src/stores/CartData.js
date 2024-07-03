import { defineStore } from "pinia";
import APIinterface from "src/api/APIinterface";
import { api } from "boot/axios";
import auth from "src/api/auth";
import { useDataStorePersisted } from "stores/DataStorePersisted";

let $openingHours = [];
let $openingDates = [];

export const userCartData = defineStore("CartData", {
  state: () => ({
    cart_loading: true,
    first_cart_loading: true,
    items_count: 0,
    cart_items: [],
    cart_summary: [],
    cart_total: [],
    error: [],
    cart_subtotal: [],
    cart_uuid: "",
    refresh_done: undefined,
    trans_loading: true,
    trans_data: [],
    deliverytimes_loading: false,
    deliverytimes_data: [],
    delivery_date_list: [],
    delivery_time_list: [],
    delivery_date: "",
    delivery_time: "",
    whento_deliver: "",
    checkout_address_loading: false,
    checkout_address: [],
    order_loading: false,
    order_data: [],
    loading_storeopen: false,
    data_storeopen: [],
    storeopen_error: "",
    similar_loading: false,
    similar_data: [],
    menu_loading: false,
    data_category: [],
    data_items: [],
    items_not_available: [],
    category_not_available: [],
    cartcount_loading: false,
    cartcount_data: [],
    dish: [],
    home_view_items: false,
  }),

  getters: {
    hasCart(state) {
      if (state.items_count > 0) {
        return true;
      }
      return false;
    },
    isCartError(state) {
      if (state.items_count > 0) {
        if (Object.keys(this.error).length > 0) {
          return true;
        }
      }
      return false;
    },
    getCartErrors(state) {
      return state.error;
    },
    hasOrderDetails() {
      if (Object.keys(this.order_data).length > 0) {
        return true;
      }
      return false;
    },
    isClose(state) {
      if (
        !APIinterface.empty(state.storeopen_error) &&
        !state.loading_storeopen
      ) {
        return true;
      }
      return false;
    },
    getCartSubTotal(state) {
      if (state.cart_subtotal) {
        return state.cart_subtotal;
      }
    },
    getCartSubTotalValue(state) {
      if (state.cart_subtotal) {
        return state.cart_subtotal.value;
      }
    },
    getCartTotal(state) {
      if (state.cart_total) {
        return state.cart_total.value;
      }
    },
  },

  actions: {
    async getCart(data) {
      try {
        this.cart_loading = true;
        const response = await api.post("getCart", data);
        if (response.data.code == 1) {
          const result = response.data.details;
          this.items_count = result.items_count;
          this.cart_uuid = result.cart_uuid;
          this.cart_items = result.data.items;
          this.cart_summary = result.data.summary;
          this.cart_total = result.data.total;
          this.error = result.error;
          this.cart_subtotal = result.data.subtotal;

          this.cartcount_data = {
            items_count: result.items_count,
            subtotal: result.data.subtotal,
          };
          return true;
        } else {
          this.items_count = 0;
          this.cart_uuid = "";
          this.cart_items = [];
          this.cart_summary = [];
          this.cart_total = [];
          this.error = [];
          this.cart_subtotal = [];
          return false;
        }
      } catch (error) {
        console.error("Error fetching data:", error);
        this.cartcount_data = {
          items_count: 0,
          subtotal: {
            raw: 0,
          },
        };
        return error;
      } finally {
        this.cart_loading = false;
      }
    },
    async getCartCheckout(data) {
      try {
        this.cart_loading = true;
        const response = await api.post("getCartCheckout", data, {
          headers: {
            "Content-Type": "application/json",
            Authorization: `token ${auth.getToken()}`,
          },
        });
        if (response.data.code == 1) {
          const result = response.data.details;
          this.items_count = result.items_count;
          this.cart_uuid = result.cart_uuid;
          this.cart_items = result.data.items;
          this.cart_summary = result.data.summary;
          this.cart_total = result.data.total;
          this.error = result.error;
          this.cart_subtotal = result.data.subtotal;
          return true;
        } else {
          this.items_count = 0;
          this.cart_uuid = "";
          this.cart_items = [];
          this.cart_summary = [];
          this.cart_total = [];
          this.error = [];
          this.cart_subtotal = [];
          return false;
        }
      } catch (error) {
        console.error("Error fetching data:", error);
        return error;
      } finally {
        this.cart_loading = false;
      }
    },
    TransactionInfo(data) {
      this.trans_loading = true;
      APIinterface.fetchDataPost("TransactionInfo", data)
        .then((data) => {
          this.trans_data = data.details;
        })
        .catch((error) => {
          this.trans_data = [];
        })
        .then((data) => {
          this.trans_loading = false;
        });
    },
    clearDeliveryList() {
      this.delivery_date_list = [];
      this.delivery_time_list = [];
    },
    getDeliveryTimes(cart_uuid) {
      this.clearDeliveryList();
      this.deliverytimes_loading = true;
      APIinterface.fetchDataPost("getDeliveryTimes", "cart_uuid=" + cart_uuid)
        .then((data) => {
          if (Object.keys(data.details.opening_hours).length > 0) {
            Object.entries(data.details.opening_hours.dates).forEach(
              ([key, items]) => {
                this.delivery_date_list.push({
                  label: items.name,
                  value: items.value,
                });
              }
            );
          }

          $openingDates = data.details.opening_hours.dates;
          $openingHours = data.details.opening_hours.time_ranges;

          const keys = Object.keys($openingDates);
          this.delivery_date = keys[0];

          this.getTimeList(this.delivery_date);
          if (!APIinterface.empty($openingHours[this.delivery_date])) {
            const keystime = $openingHours[this.delivery_date][0];
            this.delivery_time = {
              label: keystime.pretty_time,
              value: keystime.end_time,
              start_time: keystime.start_time,
              end_time: keystime.end_time,
              pretty_time: keystime.pretty_time,
            };
          }

          if (!APIinterface.empty(this.trans_data.delivery_date)) {
            this.delivery_date = this.trans_data.delivery_date;
            const temptime = JSON.parse(this.trans_data.delivery_time);
            if (Object.keys(temptime).length > 0) {
              this.delivery_time = temptime;
            }
          }
          //
        })
        .catch((error) => {
          console.debug(error);
        })
        .then((data) => {
          this.deliverytimes_loading = false;
        });
    },
    getTimeList(dateSelected) {
      if (!APIinterface.empty($openingHours[dateSelected])) {
        Object.entries($openingHours[dateSelected]).forEach(([key, items]) => {
          this.delivery_time_list.push({
            label: items.pretty_time,
            value: items.end_time,
            start_time: items.start_time,
            end_time: items.end_time,
            pretty_time: items.pretty_time,
          });
        });
      }
    },
    checkoutAddress() {
      this.checkout_address_loading = true;
      APIinterface.fetchDataByTokenPost(
        "checkoutAddress",
        "place_id=" + APIinterface.getStorage("local_id")
      )
        .then((data) => {
          this.checkout_address = data.details.data;
        })
        .catch((error) => {
          this.checkout_address = [];
        })
        .then((data) => {
          this.checkout_address_loading = false;
        });
    },
    hasCartError() {
      if (this.items_count > 0 && !this.cart_loading) {
        if (Object.keys(this.error).length > 0) {
          return true;
        }
      }
      return false;
    },
    getCartError() {
      let message = "";
      if (this.items_count > 0 && !this.cart_loading) {
        if (Object.keys(this.error).length > 0) {
          Object.entries(this.error).forEach(([key, items]) => {
            message += items + "<br/>";
          });
        }
      }
      return message;
    },
    getOrder(order_uuid) {
      this.order_loading = true;
      APIinterface.fetchDataByTokenPost("getOrder", "order_uuid=" + order_uuid)
        .then((data) => {
          this.order_data = data.details;
        })
        .catch((error) => {
          this.order_data = [];
        })
        .then((data) => {
          this.order_loading = false;
        });
    },
    // checkStoreOpen(data) {
    //   this.loading_storeopen = true;
    //   APIinterface.fetchDataPost("checkStoreOpen", data)
    //     .then((data) => {
    //       this.data_storeopen = data.details;
    //       this.storeopen_error = "";
    //     })
    //     .catch((error) => {
    //       this.data_storeopen = [];
    //       this.storeopen_error = error;
    //     })
    //     .then((data) => {
    //       this.loading_storeopen = false;
    //     });
    // },
    async checkStoreOpen(data) {
      try {
        this.loading_storeopen = true;
        const response = await api.post("/checkStoreOpen", data);
        if (response.data.code == 1) {
        } else {
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        this.loading_storeopen = false;
      }
    },
    SimilarItems() {
      this.similar_loading = true;
      APIinterface.fetchDataPost("SimilarItems", "rows=infinite")
        .then((data) => {
          this.similar_data = data.details.data;
        })
        .catch((error) => {
          this.similar_data = [];
        })
        .then((data) => {
          this.similar_loading = false;
        });
    },
    geStoreMenu(done) {
      this.menu_loading = true;
      const DataStorePersisted = useDataStorePersisted();
      APIinterface.fetchDataPost(
        "geStoreMenu",
        "currency_code=" + DataStorePersisted.getUseCurrency()
      )
        .then((data) => {
          this.data_category = data.details.data.category;
          this.data_items = data.details.data.items;
          this.items_not_available = data.details.data.items_not_available;
          this.category_not_available =
            data.details.data.category_not_available;

          this.dish = data.details.data.dish;
        })
        .catch((error) => {
          this.items_not_available = [];
          this.category_not_available = [];
        })
        .then((data) => {
          this.menu_loading = false;
          if (!APIinterface.empty(done)) {
            done();
          }
        });
    },
    getCartCount() {
      this.cartcount_loading = true;
      const DataStorePersisted = useDataStorePersisted();
      const $data = {
        cart_uuid: APIinterface.getStorage("cart_uuid"),
        local_id: APIinterface.getStorage("local_id"),
        currency_code: DataStorePersisted.getUseCurrency(),
        payload: ["subtotal", "items_count"],
      };
      APIinterface.fetchDataPost("getCart", $data)
        .then((data) => {
          this.cartcount_data = {
            items_count: data.details.items_count,
            subtotal: data.details.data.subtotal,
          };
        })
        .catch((error) => {
          this.cartcount_data = {
            items_count: 0,
            subtotal: {
              raw: 0,
            },
          };
        })
        .then((data) => {
          this.cartcount_loading = false;
        });
    },
    async clearCart() {
      try {
        const response = await api.post(
          "clearCart",
          "cart_uuid=" + APIinterface.getStorage("cart_uuid")
        );
        if (response.data.code == 1) {
          const result = response.data.details;
          console.log("data", result);
          return result;
        } else {
          return false;
        }
      } catch (error) {
        console.error("Error fetching data:", error);
        return error;
      } finally {
      }
    },
    //
  },
});
