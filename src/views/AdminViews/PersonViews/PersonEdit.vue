
<template>
  <div>
    <v-container>
      <v-toolbar>
        <v-toolbar-title>{{ this.person.fName }} {{ this.person.lName }}</v-toolbar-title>
      </v-toolbar>
      <br>
    <v-form
      ref="form" 
      v-model="valid"
      lazy validation
    >
      <v-text-field
        v-model="person.fName"
        id="fname"
        :counter="25"
        label="First Name"
        required
      ></v-text-field>
      
      <v-text-field
        v-model="person.lName"
        id="lname"
        :counter="25"
        label="Last Name"
        required
      ></v-text-field>

      <v-text-field
        v-model="person.email"
        id="email"
        :counter="25"
        label="email"
        hint="you@email.com"
        persistent-hint
        required
      ></v-text-field>

      <v-text-field
        v-model="person.phoneNum"
        id="phoneNum"
        :counter="13"
        label="phoneNum"
        hint="111-222-3333"
        persistent-hint
        required
      ></v-text-field>

      <v-btn
        :disabled="!valid"
        color="success"
        class="mr-4"
        @click="updatePerson"
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
import PersonServices from "@/services/personServices.js";

export default {
  props: ["id"],

  data() {
    return {
      person: {},
      message: "Make updates to the Person",
        roles: [
        'admin'
      ],
    };
  },
  created() {
    PersonServices.getPerson(this.id)
      .then((response) => {
        this.person = response.data;
        console.log(response.data);
      })
      .catch((error) => {
        console.log("There was an error:", error.response);
      });
  },

  methods: {
    updatePerson() {
      PersonServices.updatePerson(this.id, this.person)
        .then(() => {
          this.$router.go(-1);
        })
        .catch((error) => {
          console.log(error);
        });
    },
    cancel() {
      this.$router.go(-1);
    },
  },
};
</script>
