
<template>
  <div style="">
    <v-container>
      <v-toolbar>
        <v-toolbar-title>{{ this.topic.name }}</v-toolbar-title>
      </v-toolbar>
      <br>
      <v-btn
        color="accent"
        elevation="2"
        @click="toEdit"
      >
        Edit
    </v-btn>

    <v-btn
        color="error"
        class="mr-4"
        @click="deleteTopic(topic.id, topic.name)"
      >
        Delete
    </v-btn>

    <v-btn
        class="mr-4"
        @click="cancel"
      >
        Back
    </v-btn>

    <br><br>

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
import GroupServices from "@/services/groupServices.js";

//import UserDisplay from '@/components/UserDisplay.vue'
export default {
  props: ["id"],

  data() {
    return {
      topic: {},
      group: {},
    };
  },
  created() {
    TopicServices.getTopic(this.id)
      .then((response) => {
        this.topic = response.data;
        console.log(response.data);
      })
      .catch((error) => {
        console.log("There was an error:", error.response);
      }),
    GroupServices.getGroup(this.groupid)
      .then((response) => {
        this.group = response.data;
        console.log(response.data);
      })
      .catch((error) => {
        console.log("There was an error:", error.response);
      });
  },
  methods: {
    deleteTopic(id, name) {
      let confirmed = confirm(`Are you sure you want to delete ${name}`);
      if (confirmed) {
        TopicServices.deleteTopic(id)
          .then(() => {
            this.$router.push({ name: "topicList" });
          })
          .catch((error) => {
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