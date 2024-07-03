import { defineStore } from "pinia";
import APIinterface from "src/api/APIinterface";
import { api } from "boot/axios";
import auth from "src/api/auth";

export const useUserStore = defineStore("userstore", {
  state: () => ({
    loading_payment: false,
    payment_data: [],
    loading_address: false,
    address_data: [],
    loading: false,
    data: [],
    data_info: [],
    agb_data_info: [],
    review_data: [],
    user_data: [],
    currency_code: "",
  }),

  getters: {
    hasPaymentMethods(state) {
      if (Object.keys(this.payment_data).length > 0) {
        return true;
      }
      return false;
    },
    hasReview() {
      if (Object.keys(this.review_data).length > 0) {
        return true;
      }
      return false;
    },
    hasAddress() {
      if (Object.keys(this.address_data).length > 0) {
        if (Object.keys(this.address_data.addresses).length > 0) {
          return true;
        }
      }
      return false;
    },
  },

  actions: {
    SavedPaymentList() {
      this.loading_payment = true;
      APIinterface.fetchDataByTokenPost(
        "SavedPaymentList",
        "cart_uuid=" + APIinterface.getStorage("cart_uuid")
      )
        .then((data) => {
          this.payment_data = data.details;
        })
        .catch((error) => {
          this.payment_data = [];
        })
        .then((data) => {
          this.loading_payment = false;
        });
    },
    PaymentList(done) {
      this.loading_payment = true;
      APIinterface.fetchDataByTokenPost("PaymentList")
        .then((data) => {
          this.payment_data = data.details;
        })
        .catch((error) => {
          this.payment_data = [];
        })
        .then((data) => {
          this.loading_payment = false;
          if (!APIinterface.empty(done)) {
            done();
          }
        });
    },
    clientAddresses() {
      this.loading_address = true;
      APIinterface.fetchDataByTokenPost("clientAddresses")
        .then((data) => {
          this.address_data = data.details;
        })
        .catch((error) => {
          this.address_data = [];
        })
        .then((data) => {
          this.loading_address = false;
        });
    },
    MyPayments(done) {
      this.loading = true;
      APIinterface.fetchDataByTokenPost("MyPayments")
        .then((data) => {
          this.payment_data = data.details;
        })
        .catch((error) => {
          this.payment_data = [];
        })
        .then((data) => {
          this.loading = false;
          if (!APIinterface.empty(done)) {
            done();
          }
        });
    },
    getSaveItems(done) {
      this.loading = true;
      APIinterface.fetchDataByTokenPost("getSaveItems2")
        .then((data) => {
          this.data = data.details;
        })
        .catch((error) => {
          this.data = [];
        })
        .then((data) => {
          this.loading = false;
          if (!APIinterface.empty(done)) {
            done();
          }
        });
    },
    getInfo(done) {
      this.loading = true;
      APIinterface.fetchDataPost("getInfo")
        .then((data) => {
          this.data_info = data.details;
        })
        .catch((error) => {
          this.data_info = [];
        })
        .then((data) => {
          this.loading = false;
          if (!APIinterface.empty(done)) {
            done();
          }
        });
    },
    getAGBInfo(done) {
      this.loading = true;
      APIinterface.fetchDataPost("getAGBInfo")
        .then((data) => {
          this.agb_data_info = data.details;
        })
        .catch((error) => {
          this.agb_data_info = [];
        })
        .then((data) => {
          this.loading = false;
          if (!APIinterface.empty(done)) {
            done();
          }
        });
    },
    getReviewOrder(done, order_uuid) {
      this.loading = true;
      APIinterface.fetchDataByTokenPost(
        "getReviewOrder",
        "order_uuid=" + order_uuid
      )
        .then((data) => {
          this.review_data = data.details;
        })
        .catch((error) => {
          this.review_data = [];
        })
        .then((data) => {
          this.loading = false;
          if (!APIinterface.empty(done)) {
            done();
          }
        });
    },
    async paymentListnew(data) {
      try {
        const response = await api.post("/paymentListnew", data, {
          headers: {
            Authorization: `token ${auth.getToken()}`,
          },
        });
        if (response.data.code == 1) {
          return response.data.details;
        } else {
          return false;
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        //
      }
    },
  },
});
