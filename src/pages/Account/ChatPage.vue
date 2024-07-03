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
    </q-toolbar>
  </q-header>
  <q-page>
    <q-card flat>
      <q-card-section class="q-pt-none q-pb-none">
        <q-item>
          <q-item-section>
            <q-item-label class="text-weight-bold">
              <div class="text-weight-bold text-body1">
                {{ $t("Live Chat") }}
              </div>
            </q-item-label>
            <q-item-label caption>
              {{ $t("Let's chat and chase the blues") }}
            </q-item-label>
          </q-item-section>
          <q-item-section side>
            <q-btn
              round
              color="blue"
              icon="chat"
              @click="searchConversation(SettingStore.merchant_uuid)"
            />
          </q-item-section>
        </q-item>

        <!-- CHAT -->

        <q-inner-loading
          color="warning"
          :showing="loading_searchat"
        ></q-inner-loading>

        <template v-if="!hasData && !loading">
          <div
            class="text-body2 text-weight-medium flex flex-center text-grey text-center card-small-medium"
          >
            {{ $t("Click chat button to start to chat with restaurant") }}
          </div>
        </template>

        <div class="q-pt-md card-form">
          <template v-if="loading">
            <q-list>
              <q-item v-for="items in 6" :key="items">
                <q-item-section avatar>
                  <q-skeleton type="QAvatar" />
                </q-item-section>
                <q-item-section>
                  <q-item-label>
                    <q-skeleton type="text" />
                  </q-item-label>
                  <q-item-label caption>
                    <q-skeleton type="text" />
                  </q-item-label>
                </q-item-section>
              </q-item>
            </q-list>
          </template>

          <template v-if="hasData && !loading && hasUserData">
            <q-list separator>
              <template v-for="items in getData" :key="items">
                <template v-if="users_data[items.user_uuid]">
                  <q-item clickable @click="loadConversation(items.doc_id)">
                    <q-item-section avatar>
                      <q-avatar>
                        <img :src="users_data[items.user_uuid].photo_url" />
                      </q-avatar>
                    </q-item-section>
                    <q-item-section>
                      <q-item-label class="text-weight-bold">
                        {{ users_data[items.user_uuid].first_name }}
                        {{ users_data[items.user_uuid].last_name }}
                      </q-item-label>

                      <q-item-label caption>
                        <template v-if="items.orderID">
                          {{ $t("Order#") }} {{ items.orderID }}
                        </template>
                        <template v-else>
                          {{ users_data[items.user_uuid].user_type }}
                        </template>
                      </q-item-label>

                      <q-item-label
                        caption
                        lines="2"
                        v-if="getLastMessageData[items.doc_id]"
                      >
                        <template v-if="isTyping(items.user_uuid)">
                          <span class="text-primary"
                            >{{ users_data[items.user_uuid].first_name }} is
                            typing ...</span
                          >
                        </template>
                        <template v-else>
                          {{ getLastMessageData[items.doc_id].message }}
                        </template>
                      </q-item-label>
                    </q-item-section>
                    <q-item-section side>
                      <q-item-label caption lines="2" class="text-center">
                        <div
                          class="time"
                          v-if="getLastMessageData[items.doc_id]"
                        >
                          {{ getLastMessageData[items.doc_id].time }}
                        </div>
                      </q-item-label>
                    </q-item-section>
                  </q-item>
                </template>
              </template>
            </q-list>
          </template>
        </div>

        <!-- END CHAT -->
      </q-card-section>
    </q-card>
  </q-page>
</template>

<script>
import APIinterface from "src/api/APIinterface";
import { defineAsyncComponent } from "vue";
import { firebaseDb, firebaseCollectionEnum } from "src/boot/FirebaseChat";
import {
  collection,
  query,
  where,
  orderBy,
  limit,
  onSnapshot,
  getDocs,
  addDoc,
  serverTimestamp,
  doc,
  setDoc,
} from "firebase/firestore";
import auth from "src/api/auth";
import { date } from "quasar";
import { useSettingStore } from "stores/SettingStore";

export default {
  name: "ChatPage",
  data() {
    return {
      user_uuid: "",
      data: [],
      users: [],
      all_users: [],
      users_data: [],
      loading: true,
      loading_user: false,
      last_message_data: {},
      whoistyping_data: {},
      document_id: "",
      main_user_type: "",
      refresh_page: undefined,
      loading_searchat: false,
    };
  },
  setup(props) {
    const SettingStore = useSettingStore();
    return { SettingStore };
  },
  async mounted() {
    let user = auth.getUser();
    this.user_uuid = user.client_uuid;

    if (!APIinterface.empty(this.user_uuid)) {
      if (Object.keys(this.SettingStore.settings_data).length > 0) {
        if (this.SettingStore.settings_data.chat_enabled) {
          this.getParticipants();
        } else {
          this.$router.push("/home");
        }
      } else {
        this.$watch(
          () => this.SettingStore.$state.settings_data,
          (newData, oldData) => {
            if (newData.chat_enabled) {
              this.getParticipants();
            } else {
              this.$router.push("/home");
            }
          }
        );
      }
    } else {
      this.$router.push("/home");
    }
  },
  computed: {
    getData() {
      return this.data;
    },
    getLastMessageData() {
      return this.last_message_data;
    },
    hasData() {
      if (Object.keys(this.data).length > 0) {
        return true;
      }
      return false;
    },
    hasUserData() {
      if (Object.keys(this.users_data).length > 0) {
        return true;
      }
      return false;
    },
    getShowistyping() {
      return this.whoistyping_data;
    },
  },
  methods: {
    getParticipants() {
      try {
        this.loading = true;
        const collectionRef = collection(
          firebaseDb,
          firebaseCollectionEnum.chats
        );
        const q = query(
          collectionRef,
          where("participants", "array-contains", this.user_uuid),
          orderBy("lastUpdated", "desc"),
          limit(firebaseCollectionEnum.limit)
        );
        const SnapParticipants = onSnapshot(
          q,
          (snapshot) => {
            this.data = [];
            this.users = [];
            this.all_users = [];
            this.loading = false;
            if (!APIinterface.empty(this.refresh_page)) {
              this.refresh_page();
            }
            snapshot.forEach((doc) => {
              let data = doc.data();
              let isTyping = data.isTyping || null;
              let participants = data.participants || null;
              if (participants) {
                if (Object.keys(participants).length > 0) {
                  Object.entries(participants).forEach(([key, items]) => {
                    this.all_users.push(items);
                  });
                }

                let resp_participants = participants.filter(
                  (i) => !i.includes(this.user_uuid)
                );
                let user_uuid = resp_participants[0]
                  ? resp_participants[0]
                  : null;
                this.users.push(user_uuid);
                this.data.push({
                  doc_id: doc.id,
                  user_uuid: user_uuid,
                  is_typing: isTyping[resp_participants[0]]
                    ? isTyping[resp_participants[0]]
                    : false,
                  orderID: data.orderID || null,
                  orderUuid: data.orderUuid || null,
                });
              }
            });

            if (Object.keys(this.users).length > 0) {
              this.getUser();
              this.getLastMessage();
              this.getWhoIsTyping();
            }
          },
          (error) => {
            this.loading = false;
            if (!APIinterface.empty(this.refresh_page)) {
              this.refresh_page();
            }
            console.log("Error fetching chat documents:", error);
          }
        );
      } catch (error) {
        APIinterface.notify("dark", error, "error", this.$q);
      }
    },
    getUser() {
      this.loading_user = true;
      APIinterface.fetchDataChats("getUsers", {
        main_user_type: this.main_user_type,
        users: this.users,
      })
        .then((data) => {
          this.users_data = data.details;
        })
        .catch((error) => {
          this.users_data = [];
        })
        .then((data) => {
          this.loading_user = false;
        });
    },
    async getLastMessage() {
      try {
        const batch = this.all_users.splice(0, 10);
        const conversationsRef = collection(
          firebaseDb,
          firebaseCollectionEnum.chats
        );
        const querySnapshot = await getDocs(
          query(
            conversationsRef,
            where("participants", "array-contains-any", this.users)
          )
        );
        querySnapshot.forEach(async (doc) => {
          const conversationID = doc.id;
          const messagesRef = collection(
            firebaseDb,
            firebaseCollectionEnum.chats,
            conversationID,
            "messages"
          );
          const messagesSnapshot = await getDocs(
            query(
              messagesRef,
              where("senderID", "in", batch),
              orderBy("timestamp", "desc"),
              limit(1)
            )
          );
          messagesSnapshot.forEach((messageDoc) => {
            let results = messageDoc.data();
            let timestamp = results.timestamp.toDate().toISOString();
            this.last_message_data[conversationID] = {
              message: results.message,
              timestamp: timestamp,
              time: date.formatDate(timestamp, "hh:mm a"),
            };
          });
        });
      } catch (error) {
        console.error("Error fetching last message:", error);
      }
    },
    async getWhoIsTyping() {
      const q = query(
        collection(firebaseDb, firebaseCollectionEnum.chats),
        where("participants", "array-contains-any", this.users),
        orderBy("lastUpdated", "desc"),
        limit(firebaseCollectionEnum.limit)
      );

      const unsubscribe = onSnapshot(q, (querySnapshot) => {
        querySnapshot.forEach((doc) => {
          let results = doc.data();
          let data = results.isTyping || [];
          if (Object.keys(data).length > 0) {
            Object.entries(data).forEach(([key, items]) => {
              this.whoistyping_data[key] = items;
            });
          }
        });
      });
    },
    isTyping(user_uuid) {
      if (Object.keys(this.whoistyping_data).length > 0) {
        let istyping = this.whoistyping_data[user_uuid] || false;
        return istyping;
      }
      return false;
    },
    async searchConversation(user_uuid) {
      try {
        this.loading_searchat = true;
        const collectionRef = collection(
          firebaseDb,
          firebaseCollectionEnum.chats
        );
        const q = query(
          collectionRef,
          where("participants", "array-contains", user_uuid),
          orderBy("lastUpdated", "desc"),
          limit(1)
        );

        let current_doc_id = "";
        const querySnapshot = await getDocs(q);
        querySnapshot.forEach((doc) => {
          let data = doc.data();
          let participants = data.participants || null;
          if (participants.includes(this.user_uuid) === true) {
            current_doc_id = doc.id;
          }
        });

        if (!APIinterface.empty(current_doc_id)) {
          this.loading_searchat = false;
          this.loadConversation(current_doc_id);
        } else {
          this.createConversation(user_uuid);
        }
      } catch (error) {
        APIinterface.notify("dark", error, "error", this.$q);
      }
    },
    async createConversation(user_uuid) {
      try {
        const newConversationRef = await addDoc(
          collection(firebaseDb, firebaseCollectionEnum.chats),
          {
            lastUpdated: serverTimestamp(),
          }
        );
        const chatId = newConversationRef.id;
        const chatDocRef = doc(
          firebaseDb,
          firebaseCollectionEnum.chats,
          chatId
        );

        let main_user_uuid = this.user_uuid;

        let data = {
          lastUpdated: serverTimestamp(),
          dateCreated: serverTimestamp(),
          participants: [user_uuid, main_user_uuid],
          isTyping: {
            [`${user_uuid}`]: false,
            [`${main_user_uuid}`]: false,
          },
        };
        setDoc(chatDocRef, data)
          .then(() => {
            this.loading_searchat = false;
            this.loadConversation(chatId);
          })
          .catch((error) => {
            APIinterface.notify("dark", error, "error", this.$q);
          });
      } catch (error) {
        APIinterface.notify("dark", error, "error", this.$q);
      }
    },
    loadConversation(docId) {
      this.$router.push({
        path: "/account/chat/conversation",
        query: { doc_id: docId },
      });
    },
    //
  },
};
</script>
