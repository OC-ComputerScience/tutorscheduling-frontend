<template>
  <v-card>
    <v-card-title class="primary white--text mb-2 headline">{{
      isEdit ? "Edit Topic" : `Send A Request to ${selectedGroup}`
    }}</v-card-title>
    <v-card-subtitle class="primary white--text pb-2 mb-2">
      {{ formatReadableDate(request.date) }} •
      {{ calcTime(request.createdAt) }}
    </v-card-subtitle>
    <v-card-text>
      <v-select
        v-model="request.problem"
        :items="problems"
        label="Why are you making this request?"
        :readonly="isEdit"
        required
      >
      </v-select>
      <v-text-field
        v-model="request.courseNum"
        :counter="50"
        label="Course Number"
        hint="Enter n/a if non applicable"
        persistent-hint
        :readonly="isEdit"
        required
      ></v-text-field>

      <v-select
        v-model="request.topicId"
        :items="topics"
        item-text="name"
        item-value="id"
        label="Topic"
        :readonly="isEdit"
        required
      >
      </v-select>

      <v-text-field
        v-model="request.description"
        label="Description"
        hint="What would you like to request?"
        persistent-hint
        :readonly="isEdit"
        required
      ></v-text-field>

      <v-select
        v-if="isEdit"
        v-model="request.status"
        :items="StatusSelect"
        label="Status"
        required
      >
      </v-select>
    </v-card-text>
    <v-card-actions>
      <v-spacer></v-spacer>
      <v-btn color="grey white--text" @click="$emit('closeRequestDialog')">
        {{ isEdit ? "Discard Changes" : "Cancel" }}
      </v-btn>
      <v-btn color="accent" @click="saveOrAddRequest()">{{
        isEdit ? "Save Changes" : "Send Request"
      }}</v-btn>
    </v-card-actions>
  </v-card>
</template>

<script>
import Utils from "@/config/utils.js";
import TopicServices from "@/services/topicServices.js";

export default {
  name: "RequestDialogBody",
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
      topics: [],
      request: this.sentRequest,
      isEdit: this.sentBool,
    };
  },
  watch: {
    sentRequest(newRequest) {
      this.request = newRequest;
    },
    sentBool(newVal) {
      this.isEdit = newVal;
    },
  },
  async created() {
    this.user = Utils.getStore("user");
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
      this.$emit("saveOrAddRequest", this.request, this.isEdit);
    },
  },
};
</script>
