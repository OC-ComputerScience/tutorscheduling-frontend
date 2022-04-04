
<template>
  <div style="">
    <v-container>
      <v-toolbar>
        <v-toolbar-title>{{ this.person.fName }} {{ this.person.lName }}</v-toolbar-title>
      </v-toolbar>
      <br>
      <v-btn
        color="accent"
        elevation="2"
        class="mr-4"
        @click="toEdit"
      >
        Edit
    </v-btn>

    <v-btn
        color="error"
        class="mr-4"
        @click="deletePerson(person.id, person.fName)"
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
        v-model="person.fName"
        id="fName"
        :counter="25"
        label="First Name"
        readonly
      ></v-text-field>

      
    <v-text-field
        v-model="person.lName"
        id="lName"
        :counter="25"
        label="Last Name"
        readonly
      ></v-text-field>

      <v-text-field
        v-model="person.email"
        id="email"
        :counter="25"
        label="Email"
        readonly
      ></v-text-field>
      
      <v-text-field
        v-model="person.phoneNum"
        id="phoneNum"
        :counter="13"
        label="Phone Number"
        readonly
      ></v-text-field>
    </v-container>
  </div>
</template>

<script>
import PersonServices from "@/services/personServices.js";
//import UserDisplay from '@/components/UserDisplay.vue'
export default {
  props: ["id"],

  data() {
    return {
      person: {},
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
    deletePerson(id, fName) {
      let confirmed = confirm(`Are you sure you want to delete ${fName}`);
      if (confirmed) {
        PersonServices.deletePerson(id)
          .then(() => {
            this.$router.push({ name: "personList" });
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
      this.$router.push({ name: "personEdit", params: { id: this.person.id } });
    },
  },
};
</script>