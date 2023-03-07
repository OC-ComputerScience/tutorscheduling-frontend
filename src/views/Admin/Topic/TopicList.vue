<template>
  <div>
    <v-container>
      <v-toolbar>
        <v-toolbar-title>{{ message }}</v-toolbar-title>
      </v-toolbar>
      <br /><br />
      <v-card>
        <v-card-title>
          <v-text-field
            v-model="search"
            append-icon="mdi-magnify"
            label="Search"
            single-line
            hide-details
          ></v-text-field>
          <v-spacer></v-spacer>
          <v-btn color="primary" class="mr-4" elevation="2" @click="addTopic">
            Add
          </v-btn>
        </v-card-title>
        <v-dialog v-model="topicDialog" persistent max-width="800px">
          <TopicDialogBody
            :sent-topic="selectedTopic"
            :sent-bool="isTopicDialogEdit"
            @closeTopicDialog="topicDialog = false"
            @saveOrAddTopic="saveOrAddTopic"
            @deleteTopic="deleteTopic"
          ></TopicDialogBody>
        </v-dialog>
        <v-data-table
          :headers="headers"
          :search="search"
          :items="topics"
          :items-per-page="50"
          @click:row="rowClick"
        ></v-data-table>
      </v-card>
    </v-container>
  </div>
</template>

<script>
import Utils from "@/config/utils.js";
import PersonRoleServices from "@/services/personRoleServices.js";
import TopicServices from "@/services/topicServices.js";
import PersonTopicServices from "../../../services/personTopicServices";
import TopicDialogBody from "../../../components/Admin/Topic/TopicDialogBody.vue";

export default {
  name: "TopicList",
  components: { TopicDialogBody },
  props: {
    id: {
      type: [Number, String],
      default: 0,
    },
  },
  data() {
    return {
      topicDialog: false,
      isTopicDialogEdit: true,
      selectedTopic: {},
      search: "",
      topics: [],
      user: {},
      headers: [
        { text: "ID", value: "id" },
        { text: "Name", value: "name" },
        { text: "Abbreviation", value: "abbr" },
        { text: "Status", value: "status" },
      ],
      message:
        "Topics - click topic to view or edit topic or click Add to add new topic",
    };
  },
  async created() {
    this.user = Utils.getStore("user");
    await this.getGroupByPersonRoleId();
    await this.getTopicsForGroup();
    await this.checkForDisabled();
  },
  methods: {
    async getGroupByPersonRoleId() {
      await PersonRoleServices.getGroupForPersonRole(this.id)
        .then((response) => {
          this.group = response.data[0].role.group;
        })
        .catch((error) => {
          this.message = error.response.data.message;
          console.log("There was an error:", error.response);
        });
    },
    async getTopicsForGroup() {
      await TopicServices.getAllForGroup(this.group.id)
        .then((response) => {
          this.topics = response.data;
        })
        .catch((error) => {
          this.message = error.response.data.message;
          console.log("There was an error:", error.response);
        });
    },
    async checkForDisabled() {
      for (let i = 0; i < this.topics.length; i++) {
        let topic = this.topics[i];
        if (topic.status === "disabled") {
          await PersonTopicServices.deletePersonTopicByTopicId(topic.id).catch(
            (error) => {
              this.message = error.response.data.message;
              console.log("There was an error:", error.response);
            }
          );
        }
      }
    },
    async deleteTopic() {
      let id = this.selectedTopic.id;
      let name = this.selectedTopic.name;
      let confirmed = confirm(`Are you sure you want to delete ${name}`);
      if (confirmed) {
        await TopicServices.deleteTopic(id)
          .then(async () => {
            this.topicDialog = false;
            await this.getTopicsForGroup();
          })
          .catch((error) => {
            this.message = error.response.data.message;
            console.log("There was an error:", error.response);
          });
      }
    },
    rowClick: function (item) {
      this.isTopicDialogEdit = true;
      this.selectedTopic = item;
      this.topicDialog = true;
    },
    addTopic() {
      this.selectedTopic = {
        name: "",
        abbr: "",
        status: "",
        createdAt: new Date(),
        updatedAt: new Date(),
        groupId: this.group.id,
      };
      this.isTopicDialogEdit = false;
      this.topicDialog = true;
    },
    cancel() {
      this.$router.go(-1);
    },
    async saveOrAddTopic(topic, isEdit) {
      topic.groupId = this.group.id;
      if (isEdit) {
        await TopicServices.updateTopic(topic.id, topic)
          .then(() => {
            this.topicDialog = false;
          })
          .catch((error) => {
            this.message = error.response.data.message;
            console.log("There was an error:", error.response);
          });
      } else {
        await TopicServices.addTopic(topic)
          .then(async () => {
            this.topicDialog = false;
            await this.getTopicsForGroup();
          })
          .catch((error) => {
            this.message = error.response.data.message;
            console.log(error);
          });
      }
    },
  },
};
</script>
