
<template>
  <div>
    <v-container>
      <v-toolbar>
        <v-toolbar-title>{{ this.message }}</v-toolbar-title>
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
        required
      ></v-text-field>
      
      <v-text-field
        v-model="topic.abbr"
        id="abbr"
        :counter="25"
        label="Abbreviation"
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
        @click="updateTopic"
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
  props: ["id"],

  data() {
    return {
      topic: {},
      group: {},
      groups: {},
      message: "Edit Topic - make updates to the fields and click Save",
        roles: [
        'admin'
      ],
    };
  },
  created() {
    TopicServices.getTopic(this.id)
      .then((response) => {
        this.topic = response.data;
        console.log(response.data);
      })
      .catch((error) => {
        this.message = error.response.data.message
        console.log("There was an error:", error.response);
      }),
    GroupServices.getGroup(this.groupid)
      .then((response) => {
        this.group = response.data;
        console.log(response.data);
      })
      .catch((error) => {
        this.message = error.response.data.message
        console.log("There was an error:", error.response);
      }),
    GroupServices.getAllGroups()
        .then((response) => {
          this.groups = response.data;
        })
        .catch((error) => {
          this.message = error.response.data.message
          console.log("There was an error:", error.response);
      });
  },

  methods: {
    updateTopic() {
      TopicServices.updateTopic(this.id, this.topic)
        .then(() => {
          this.$router.go(-1);
        })
        .catch((error) => {
          this.message = error.response.data.message
          console.log("There was an error:", error.response);
        });
    },
    cancel() {
      this.$router.go(-1);
    },
  },
};
</script>

