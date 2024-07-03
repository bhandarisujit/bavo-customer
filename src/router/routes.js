const routes = [
  {
    path: "/",
    component: () => import("layouts/NotopfooterLayout.vue"),
    children: [
      {
        path: "",
        //component: () => import("src/pages/Home/IntroPage.vue"),
        component: () => import("src/pages/User/WelcomePage.vue"),
        meta: { checkIntro: true },
      },
      {
        path: "select-language",
        component: () => import("src/pages/User/SelectLanguage.vue"),
      },
      {
        path: "welcome",
        component: () => import("src/pages/User/WelcomePage.vue"),
      },
      {
        path: "update-app",
        component: () => import("src/pages/UpdateApp.vue"),
      },
    ],
  },

  {
    path: "/user",
    component: () => import("layouts/NotopfooterLayout.vue"),
    children: [
      {
        path: "login",
        component: () => import("src/pages/User/LoginPage.vue"),
      },
      {
        path: "signup",
        component: () => import("src/pages/User/SignupPage.vue"),
      },
      {
        path: "forgotpassword",
        component: () => import("src/pages/User/ForgotPassword.vue"),
      },
      {
        path: "verifycode",
        component: () => import("src/pages/User/VerifyCode.vue"),
      },
      {
        path: "resetpassword",
        component: () => import("src/pages/User/ResetPassword.vue"),
      },
      {
        path: "loginbyphone",
        component: () => import("src/pages/User/LoginByPhone.vue"),
      },
      {
        path: "guest",
        component: () => import("src/pages/User/GuestSignup.vue"),
      },
    ],
  },

  {
    path: "/home",
    component: () => import("layouts/MainLayout.vue"),
    children: [
      { path: "", component: () => import("src/pages/Home/HomePage.vue") },
    ],
  },

  {
    path: "/search",
    component: () => import("layouts/NotopfooterLayout.vue"),
    children: [
      { path: "", component: () => import("src/pages/Search/SearchPage.vue") },
    ],
  },

  {
    path: "/booking",
    component: () => import("layouts/NotopfooterLayout.vue"),
    children: [
      {
        path: "",
        component: () => import("src/pages/Booking/BookingPage.vue"),
      },
    ],
  },

  {
    path: "/reservation",
    component: () => import("layouts/NotopfooterLayout.vue"),
    children: [
      {
        path: "track",
        component: () => import("src/pages/Booking/BookingTracking.vue"),
      },
      {
        path: "cancel",
        component: () => import("src/pages/Booking/BookingCancel.vue"),
      },
      {
        path: "update",
        component: () => import("src/pages/Booking/BookingUpdate.vue"),
      },
    ],
  },

  {
    path: "/cart",
    component: () => import("layouts/NotopfooterLayout.vue"),
    children: [
      {
        path: "",
        component: () => import("src/pages/Cart/CartPage.vue"),
      },
    ],
  },

  {
    path: "/checkout",
    component: () => import("layouts/NotopfooterLayout.vue"),
    children: [
      {
        path: "",
        component: () => import("src/pages/Cart/CheckoutPage.vue"),
        meta: { requiresAuth: true, verifyToken: true },
      },
      {
        path: "successful",
        component: () => import("src/pages/Cart/CheckoutSuccesful.vue"),
        meta: { requiresAuth: true },
      },
    ],
  },

  {
    path: "/account-menu",
    component: () => import("layouts/MainLayout.vue"),
    children: [
      {
        path: "",
        component: () => import("src/pages/Account/AccountPage.vue"),
        meta: { requiresAuth: true, verifyToken: true },
      },
    ],
  },

  {
    path: "/account",
    component: () => import("layouts/NotopfooterLayout.vue"),
    children: [
      {
        path: "update-profile",
        component: () => import("src/pages/Account/UpdateProfile.vue"),
        meta: { requiresAuth: true, verifyToken: true },
      },
      {
        path: "change-password",
        component: () => import("src/pages/Account/ChangePassword.vue"),
        meta: { requiresAuth: true, verifyToken: true },
      },
      {
        path: "orders",
        component: () => import("src/pages/Account/OrdersList.vue"),
        meta: { requiresAuth: true, verifyToken: true },
      },
      {
        path: "address-list",
        component: () => import("src/pages/Account/AddressList.vue"),
        meta: { requiresAuth: true, verifyToken: true },
      },
      {
        path: "payments",
        component: () => import("src/pages/Account/PaymentList.vue"),
        meta: { requiresAuth: true, verifyToken: true },
      },
      {
        path: "favorites",
        component: () => import("src/pages/Account/FavoritesList.vue"),
        meta: { requiresAuth: true, verifyToken: true },
      },
      {
        path: "request-delete",
        component: () => import("src/pages/Account/RequestDeleteaccount.vue"),
        meta: { requiresAuth: true, verifyToken: true },
      },
      {
        path: "deletety",
        component: () => import("src/pages/Account/DeleteTy.vue"),
        meta: { requiresAuth: true },
      },
      {
        path: "language",
        component: () => import("src/pages/Account/LanguagePage.vue"),
      },
      {
        path: "complete-registration",
        component: () => import("src/pages/Account/CompleteRegistration.vue"),
      },
      {
        path: "payment-methods",
        component: () => import("src/pages/Account/PaymentMethods.vue"),
        meta: { requiresAuth: true, verifyToken: true },
      },
      {
        path: "points",
        component: () => import("src/pages/Account/PointPage.vue"),
        meta: { requiresAuth: true, verifyToken: true },
      },
      {
        path: "wallet",
        component: () => import("src/pages/Account/WalletPage.vue"),
        meta: { requiresAuth: true, verifyToken: true },
      },
      {
        path: "chat",
        component: () => import("src/pages/Account/ChatPage.vue"),
        meta: { requiresAuth: true, verifyToken: true },
      },
      {
        path: "chat/conversation",
        component: () => import("src/pages/Account/ChatConversation.vue"),
        meta: { requiresAuth: true, verifyToken: true },
      },
      {
        path: "currency",
        component: () => import("src/pages/Account/CurrencyPage.vue"),
      },
      {
        path: "booking",
        component: () => import("src/pages/Booking/BookingList.vue"),
        meta: { requiresAuth: true, verifyToken: true },
      },
    ],
  },

  {
    path: "/order",
    component: () => import("layouts/NotopfooterLayout.vue"),
    children: [
      {
        path: "view",
        component: () => import("src/pages/Order/OrderDetails.vue"),
        meta: { requiresAuth: true, verifyToken: true },
      },
      {
        path: "write-review",
        component: () => import("src/pages/Order/WriteReview.vue"),
        meta: { requiresAuth: true, verifyToken: true },
      },
      {
        path: "track",
        //component: () => import("src/pages/Order/TrackOrder.vue"),
        component: () => import("src/pages/Cart/CheckoutSuccesful.vue"),
        meta: { requiresAuth: true, verifyToken: true },
      },
    ],
  },

  {
    path: "/location",
    component: () => import("layouts/NotopfooterLayout.vue"),
    children: [
      {
        path: "",
        component: () => import("src/pages/Location/LocationPage.vue"),
      },
    ],
  },

  {
    path: "/legal",
    component: () => import("layouts/NotopfooterLayout.vue"),
    children: [
      {
        path: "",
        component: () => import("src/pages/Legal/LegalList.vue"),
      },
      {
        path: "page",
        component: () => import("src/pages/Legal/GetPage.vue"),
      },
    ],
  },

  {
    path: "/about",
    component: () => import("layouts/NotopfooterLayout.vue"),
    children: [
      {
        path: "",
        component: () => import("src/pages/About/AboutPage.vue"),
      },
    ],
  },

  {
    path: "/conditions",
    component: () => import("layouts/NotopfooterLayout.vue"),
    children: [
      {
        path: "",
        component: () => import("src/pages/Conditions/ConditionsPage.vue"),
      },
    ],
  },

  {
    path: "/menu",
    component: () => import("layouts/NotopfooterLayout.vue"),
    children: [
      {
        path: "",
        component: () => import("src/pages/Menu/MenuPage.vue"),
      },
      {
        path: "search",
        component: () => import("src/pages/Menu/SearchPage.vue"),
      },
    ],
  },

  {
    path: "/items",
    component: () => import("layouts/NotopfooterLayout.vue"),
    children: [
      {
        path: "feature",
        component: () => import("src/pages/Items/FeaturePage.vue"),
      },
      {
        path: "category",
        component: () => import("src/pages/Items/CategoryItems.vue"),
      },
    ],
  },

  {
    path: "/review",
    component: () => import("layouts/NotopfooterLayout.vue"),
    children: [
      {
        path: "all",
        component: () => import("src/pages/Review/ReviewAll.vue"),
      },
    ],
  },

  {
    path: "/notifications",
    component: () => import("layouts/NotopfooterLayout.vue"),
    children: [
      {
        path: "",
        component: () => import("src/pages/Notifications/NotificationAll.vue"),
        meta: { requiresAuth: true },
      },
      {
        path: "all",
        component: () => import("src/pages/Notifications/NotificationAll.vue"),
        meta: { requiresAuth: true },
      },
    ],
  },

  {
    path: "/payment",
    component: () => import("layouts/NotopfooterLayout.vue"),
    children: [
      {
        path: "",
        component: () => import("src/pages/Payment/SelectPaymentList.vue"),
        meta: { requiresAuth: true, verifyToken: true },
      },
    ],
  },

  {
    path: "/errornetwork",
    component: () => import("layouts/NotopfooterLayout.vue"),
    children: [
      {
        path: "",
        component: () => import("src/pages/NetworkError.vue"),
      },
    ],
  },

  // Always leave this as last one,
  // but you can also remove it
  {
    path: "/:catchAll(.*)*",
    component: () => import("pages/ErrorNotFound.vue"),
  },
];

export default routes;
