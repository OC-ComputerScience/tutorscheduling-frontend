<template>
  <v-card>
    <v-card-title class="primary white--text mb-2 headline">{{
      isAdminView
        ? `Request from ${request.fullName}`
        : `Send A Request to ${user.selectedGroup}`
    }}</v-card-title>
    <v-card-subtitle v-if="isAdminView" class="primary white--text pb-2 mb-2">
      {{ formatReadableDate(request.createdAt) }} •
      {{ request.time }}
    </v-card-subtitle>
    <v-card-text>
      <v-select
        v-model="request.problem"
        :items="problems"
        label="Why are you making this request?"
        :readonly="isAdminView"
        required
      >
      </v-select>
      <v-text-field
        v-model="request.courseNum"
        :counter="50"
        label="Course Number"
        hint="Enter n/a if non applicable"
        persistent-hint
        :readonly="isAdminView"
        required
      ></v-text-field>

      <v-select
        v-model="request.topicId"
        :items="topics"
        item-text="name"
        item-value="id"
        label="Topic"
        :prepend-icon="
          isAdminView ? 'mdi-book-outline' : 'mdi-book-edit-outline'
        "
        :readonly="isAdminView"
        required
      >
      </v-select>

      <v-textarea
        v-model="request.description"
        label="What would you like to request?"
        rows="2"
        persistent-hint
        :prepend-icon="
          isAdminView ? 'mdi-comment-outline' : 'mdi-comment-edit-outline'
        "
        :readonly="isAdminView"
        required
      ></v-textarea>

      <v-select
        v-if="isAdminView"
        v-model="request.status"
        :items="statuses"
        label="Status"
        required
      >
      </v-select>
    </v-card-text>
    <v-card-actions>
      <v-spacer></v-spacer>
      <v-btn color="grey white--text" @click="$emit('closeRequestDialog')">
        {{ isAdminView ? "Discard Changes" : "Cancel" }}
      </v-btn>
      <v-btn color="accent" @click="saveOrAddRequest()">{{
        isAdminView ? "Save Changes" : "Send Request"
      }}</v-btn>
    </v-card-actions>
  </v-card>
</template>

<script>
import Utils from "@/config/utils.js";
import TopicServices from "@/services/topicServices.js";
import { TimeFunctionsMixin } from "../mixins/TimeFunctionsMixin";

export default {
  name: "RequestDialogBody",
  mixins: [TimeFunctionsMixin],
  props: {
    sentBool: { type: [Boolean], default: false },
    groupId: { type: [Number], default: 0 },
    sentRequest: {
      type: [Object],
      default() {
        return {
          problem: "",
          courseNum: "",
          description: "",
          status: "Received",
          personId: 0,
          topicId: 0,
          groupId: 0,
        };
      },
    },
  },
  data() {
    return {
      problems: [
        "No times work for me.",
        "The topic I am looking for is not here.",
        "I need to report an issue.",
        "Other",
      ],
      statuses: ["Received", "In-Progress", "Completed"],
      topics: [],
      request: this.sentRequest,
      isAdminView: this.sentBool,
    };
  },
  watch: {
    sentRequest(newRequest) {
      this.request = newRequest;
      console.log(this.request);
    },
    sentBool(newVal) {
      this.isAdminView = newVal;
    },
  },
  async created() {
    this.user = Utils.getStore("user");
    console.log(this.user);
    if (this.user.selectedRole.type === "Student") {
      await this.getTopicsForGroup();
    }
  },
  methods: {
    async getTopicsForGroup() {
      await TopicServices.getAllForGroup(this.groupId)
        .then((response) => {
          this.topics = response.data;
        })
        .catch((error) => {
          this.alertType = "error";
          this.alert = error.response.data.message;
          this.showAlert = true;
          console.log("There was an error:", error.response);
        });
    },
    saveOrAddRequest() {
      this.$emit("saveOrAddRequest", this.request, this.isAdminView);
    },
  },
};
</script>
