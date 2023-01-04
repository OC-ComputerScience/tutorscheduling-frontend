<template>
  <div>
    <v-container>
      <v-toolbar>
        <v-toolbar-title>{{ message }}</v-toolbar-title>
      </v-toolbar>
      <br />

      <v-dialog v-model="showDisableConfirmation" persistent max-width="750px">
        <DeleteConfirmationComponent
          type="topic"
          :item="topic"
          @handleReturningCancel="showDisableConfirmation = false"
          @handleReturningSuccess="updateTopic()"
        ></DeleteConfirmationComponent>
      </v-dialog>

      <v-form ref="form" v-model="valid" lazy validation>
        <v-text-field
          id="name"
          v-model="topic.name"
          :counter="50"
          label="Name"
          required
        ></v-text-field>

        <v-text-field
          id="abbr"
          v-model="topic.abbr"
          :counter="25"
          label="Abbreviation"
          required
        ></v-text-field>

        <v-select
          v-model="topic.status"
          :items="status"
          label="Status"
          required
          @change="statusChanged = true"
        >
        </v-select>

        <v-select
          v-model="topic.groupId"
          :items="groups"
          item-text="name"
          item-value="id"
          label="Group"
          required
        >
        </v-select>

        <v-btn
          :disabled="!valid"
          color="success"
          class="mr-4"
          @click="directToCancel()"
        >
          Save
        </v-btn>

        <v-btn color="error" class="mr-4" @click="cancel"> Cancel </v-btn>
      </v-form>
    </v-container>
  </div>
</template>

<script>
import TopicServices from "@/services/topicServices.js";
import GroupServices from "@/services/groupServices.js";
import DeleteConfirmationComponent from "../../../components/DeleteConfirmationComponent.vue";
import Utils from "@/config/utils.js";

export default {
  components: {
    DeleteConfirmationComponent,
  },
  props: {
    id: {
      type: Number,
      default: 0,
    },
  },
  data() {
    return {
      showDisableConfirmation: false,
      statusChanged: false,
      valid: false,
      user: {},
      topic: {},
      group: {},
      groups: [],
      message: "Edit Topic - make updates to the fields and click Save",
      roles: ["admin"],
      status: ["active", "disabled"],
    };
  },
  async created() {
    this.user = Utils.getStore("user");
    await this.getTopic();
    await this.getGroup();
    await this.getAllGroups();
  },
  methods: {
    directToCancel() {
      if (this.topic.status === "disabled" && this.statusChanged) {
        this.showDisableConfirmation = true;
      } else {
        this.updateTopic();
      }
    },
    // only updating this replace issue once edits can be done on view page
    // also this.id is topic id
    async getTopic() {
      await TopicServices.getTopic(this.id)
        .then((response) => {
          this.topic = response.data;
        })
        .catch((error) => {
          this.message = error.response.data.message;
          console.log("There was an error:", error.response);
        });
    },
    async getGroup() {
      await GroupServices.getGroup(this.topic.groupId)
        .then((response) => {
          this.group = response.data;
        })
        .catch((error) => {
          this.message = error.response.data.message;
          console.log("There was an error:", error.response);
        });
    },
    async getAllGroups() {
      await GroupServices.getAllGroups()
        .then((response) => {
          this.groups = response.data;
        })
        .catch((error) => {
          this.message = error.response.data.message;
          console.log("There was an error:", error.response);
        });
    },
    async updateTopic() {
      await TopicServices.updateTopic(this.id, this.topic)
        .then(() => {
          this.$router.push({
            name: "topicList",
            params: { id: this.user.selectedRole.personRoleId },
          });
        })
        .catch((error) => {
          this.message = error.response.data.message;
          console.log("There was an error:", error.response);
        });
    },
    cancel() {
      this.$router.go(-1);
    },
  },
};
</script>
