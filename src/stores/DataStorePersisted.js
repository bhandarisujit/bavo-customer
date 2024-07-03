import { defineStore } from "pinia";
import { api } from "boot/axios";

export const useDataStorePersisted = defineStore("datastorepersisted", {
  state: () => ({
    app_version: 0,
    merchant_uuid: "",
    dark_mode: false,
    app_language: "de",
    transaction_type: "",
    whento_deliver: "",
    use_currency_code: "",
    local_id: "",
    area_id: "",
    location_data: [],
    delivery_sched: false,
    delivery_date: "",
    delivery_time: "",
    delivery_time_data: "",
    delivery_postalcode: '',
    delivery_area : '',
    menu_type: "list",
    rtl: false,
    dark_mode: false,
    user_settings: [],
    loading: false,
    include_utensil: true,
    skip_home: false,
    tab: "active",
    push_off: false,
  }),

  getters: {
    hasRecentAddress() {
      if (Object.keys(this.location_data).length > 0) {
        return true;
      }
      return false;
    },
  },

  persist: true,

  actions: {
    getUseCurrency() {
      if (
        typeof this.use_currency_code === "undefined" ||
        this.use_currency_code === null ||
        this.use_currency_code === "" ||
        this.use_currency_code === "null" ||
        this.use_currency_code === "undefined"
      ) {
        return "";
      } else {
        return this.use_currency_code;
      }
    },
    async getLocationByIp() {
      try {
        this.loading = true;
        const response = await api.get("/getLocationByIp");
        if (response.data.code == 1) {
          //console.log("getLocationByIp", response.data.details);
          this.location_data = {
            id: response.data.details.place_id,
            addressLine1: response.data.details.address.address1,
            description: response.data.details.address.formatted_address,
            latitude: response.data.details.latitude,
            longitude: response.data.details.longitude,
          };
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        this.loading = false;
      }
    },
  },
});
