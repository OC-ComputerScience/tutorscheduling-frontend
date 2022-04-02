<template>
  <div>
    <v-container>
      <v-toolbar>
        <v-toolbar-title>Add Request</v-toolbar-title>
      </v-toolbar>
      <br>
    <v-form
      ref="form" 
      v-model="valid"
      lazy validation
    >
      <v-select
          v-model="request.problem"
          :items="Problems"
          label="Why are you making this request?"
          required
      >
      </v-select>
      <v-text-field
        v-model="request.courseNum"
        id="courseNum"
        :counter="50"
        label="Course Number"
        hint="Enter n/a if non applicable"
        persistent-hint
        required
      ></v-text-field>

      <v-select
        v-model="request.topicId"
        :items="topics"
        item-text="name"
        item-value="id"
        label="Topic"
        required
      >
      </v-select>

      <v-text-field
        v-model="request.description"
        id="description"
        :counter="500"
        label="Description"
        hint="Description..."
        persistent-hint
        required
      ></v-text-field>

      <br><br>
      <v-btn
        :disabled="!valid"
        color="success"
        class="mr-4"
        @click="addRequest"
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
import RequestServices from "@/services/requestServices.js";
import TopicServices from "@/services/topicServices.js";
import PersonServices from "@/services/personServices.js";

export default {
  data() {
    return {
      Problems: ["No times work for me", "The topic I am looking for is not here", "Report an Issue", "Other"],
      request: {
        status: "Recieved"
      },
      person: {},
      topics: [],
      roles: [
        'admin'
      ],
    };
  },
  
  async created() {
    this.getPerson()
      .then(() => {
        this.getRequests();
      });
    this.getAllTopics();
  },
  methods: {
    getAllTopics() {
      TopicServices.getAllTopics()
        .then((response) => {
          this.topics = response.data;

        })
        .catch((error) => {
          console.log("There was an error:", error.response);
        });
    },
    async addRequest() {
      this.request.personId = this.person.id
      RequestServices.addRequest(this.request)
        .then(() => {
          this.$router.push({ name: "requestList" });
        })
        .catch((error) => {
          console.log(error);
        });
    },
    cancel() {
      this.$router.push({ name: "requestList" });
    },
    async getPerson() {
      if (this.$store.state.loginUser.userID !== undefined && this.$store.state.loginUser !== null) {
        await PersonServices.getPerson(this.$store.state.loginUser.userID)
          .then(response => {
            this.person = response.data;
  
            return;
          })
          .catch(error => {
            console.log("There was an error:", error.response)
          });
      }
    },
  },
};
</script>