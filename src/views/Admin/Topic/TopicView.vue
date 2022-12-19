<template>
  <div style="">
    <v-container>
      <v-toolbar>
        <v-toolbar-title>{{ this.message }}</v-toolbar-title>
      </v-toolbar>
      <br />
      <v-btn color="accent" elevation="2" class="mr-4" @click="toEdit">
        Edit
      </v-btn>

      <v-btn
        color="error"
        class="mr-4"
        @click="deleteTopic(topic.id, topic.name)"
      >
        Delete
      </v-btn>

      <v-btn class="mr-4" @click="cancel"> Back </v-btn>

      <br /><br />

      <v-text-field
        v-model="topic.name"
        id="name"
        :counter="50"
        label="Name"
        readonly
      ></v-text-field>

      <v-text-field
        v-model="topic.abbr"
        id="abbr"
        :counter="25"
        label="Abbreviation"
        readonly
      ></v-text-field>

      <v-text-field
        v-model="group.name"
        id="name"
        :counter="25"
        label="Group Name"
        readonly
      ></v-text-field>
    </v-container>
  </div>
</template>

<script>
import TopicServices from "@/services/topicServices.js";
import PersonRoleServices from "@/services/personRoleServices.js";

export default {
  props: ["id", "topicId"],

  data() {
    return {
      topic: {},
      group: {},
      message: "View Topic - click Edit to update or Delete to remove topic",
    };
  },
  created() {
    this.getGroupByPersonRoleId();
    this.getTopic();
  },
  methods: {
    async getGroupByPersonRoleId() {
      await PersonRoleServices.getGroupForPersonRole(this.id)
        .then(async (response) => {
          this.group = response.data[0].role.group;
        })
        .catch((error) => {
          this.message = error.response.data.message;
          console.log("There was an error:", error.response);
        });
    },
    getTopic() {
      TopicServices.getTopic(this.topicId)
        .then((response) => {
          this.topic = response.data;
        })
        .catch((error) => {
          console.log("There was an error:", error.response);
        });
    },
    deleteTopic(id, name) {
      let confirmed = confirm(`Are you sure you want to delete ${name}`);
      if (confirmed) {
        TopicServices.deleteTopic(id)
          .then(() => {
            this.$router.push({ name: "topicList", params: { id: this.id } });
          })
          .catch((error) => {
            this.message = error.response.data.message;
            console.log("There was an error:", error.response);
          });
      }
    },
    cancel() {
      this.$router.go(-1);
    },
    toEdit() {
      this.$router.push({ name: "topicEdit", params: { id: this.topic.id } });
    },
  },
};
</script>
