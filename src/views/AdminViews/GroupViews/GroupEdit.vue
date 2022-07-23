<template>
  <div>
    <v-container>
      <v-toolbar>
        <v-toolbar-title>{{this.message}}</v-toolbar-title>
      </v-toolbar>
      <br>
    <v-form
      ref="form" 
      v-model="valid"
      lazy validation
    >
      <v-text-field
        v-model="group.name"
        id="name"
        :counter="50"
        label="Name"
        required
      ></v-text-field>

      <v-text-field
        v-model="group.description"
        id="description"
        :counter="500"
        label="Description..."
        required
      ></v-text-field>

      <v-btn
        :disabled="!valid"
        color="success"
        class="mr-4"
        @click="updateGroup"
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
import GroupServices from "@/services/groupServices.js";

export default {
  props: ["id"],

  data() {
    return {
      group: {},
      message: "Edit Group - make updates to the fields and click Save",
        roles: [
        'admin'
      ],
    };
  },
  created() {
    GroupServices.getGroup(this.id)
      .then((response) => {
        this.group = response.data;
        console.log(response.data);
      })
      .catch((error) => {
        this.message = error.response.data.message
        console.log("There was an error:", error.response);
      });
  },

  methods: {
    updateGroup() {
      GroupServices.updateGroup(this.id, this.group)
        .then(() => {
          this.$router.go(-1);
        })
        .catch((error) => {
          this.message = error.response.data.message
          console.log(error);
        });
    },
    cancel() {
      this.$router.go(-1);
    },
  },
};
</script>
