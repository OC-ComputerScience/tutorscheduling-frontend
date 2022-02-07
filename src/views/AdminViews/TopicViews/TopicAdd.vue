
<template>
  <div>
    <v-container>
      <v-toolbar>
        <v-toolbar-title>Add Topic</v-toolbar-title>
      </v-toolbar>
      <br>
    <v-form
      ref="form" 
      v-model="valid"
      lazy validation
    >
      <v-text-field
        v-model="topic.name"
        id="name"
        :counter="50"
        label="Name"
        hint="Name"
        persistent-hint
        required
      ></v-text-field>
      
      <v-text-field
        v-model="topic.abbr"
        id="abbr"
        :counter="25"
        label="Abbreviation"
        hint="Abbreviation"
        persistent-hint
        required
      ></v-text-field>

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
        @click="addTopic"
      >
        Save
      </v-btn>

      <v-btn
        color="error"
        class="mr-4"
        @click="cancel"
      >
        Cancel
      </v-btn>
    </v-form>
    </v-container>
  </div>
</template>

<script>
import TopicServices from "@/services/topicServices.js";
import GroupServices from "@/services/groupServices.js";

export default {
  components: {
  },
  data() {
    return {
      topic: {},
      groups: [],
      roles: [
        'admin'
      ],
    };
  },
  created() {
    this.getAllGroups();
  },
  methods: {
    getAllGroups() {
      GroupServices.getAllGroups()
        .then((response) => {
          this.groups = response.data;
        })
        .catch((error) => {
          console.log("There was an error:", error.response);
        });
    },
    addTopic() {
      TopicServices.addTopic(this.topic)
        .then(() => {
          this.$router.push({ name: "topicList" });
        })
        .catch((error) => {
          console.log(this.topic);
          console.log(error.responde.data);
        });
    },
    cancel() {
      this.$router.push({ name: "topicList" });
    }
  },
};
</script>