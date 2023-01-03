<template>
  <div>
    <v-container>
      <v-toolbar>
        <v-toolbar-title>{{ message }}</v-toolbar-title>
      </v-toolbar>
      <br />
      <v-form ref="form" v-model="valid" lazy validation>
        <v-text-field
          id="fName"
          v-model="person.fName"
          :counter="25"
          label="First Name"
          hint="First Name"
          persistent-hint
          required
        ></v-text-field>

        <v-text-field
          id="lName"
          v-model="person.lName"
          :counter="25"
          label="Last Name"
          hint="Last Name"
          persistent-hint
          required
        ></v-text-field>

        <v-text-field
          id="email"
          v-model="person.email"
          :counter="25"
          label="email"
          hint="you@email.com"
          persistent-hint
          required
        ></v-text-field>

        <v-text-field
          id="phoneNum"
          v-model="person.phoneNum"
          :counter="13"
          label="Mobile Phone"
          hint="111-222-3333"
          persistent-hint
          required
        ></v-text-field>

        <v-checkbox v-model="person.textOptIn" label="Text Opt In"></v-checkbox>

        <v-btn
          :disabled="!valid"
          color="success"
          class="mr-4"
          @click="addPerson"
        >
          Save
        </v-btn>

        <v-btn color="error" class="mr-4" @click="cancel"> Cancel </v-btn>
      </v-form>
    </v-container>
  </div>
</template>

<script>
import PersonServices from "@/services/personServices.js";
export default {
  data() {
    return {
      person: {},
      roles: ["admin"],
      message: "Add Person - enter data and click Save",
    };
  },
  methods: {
    addPerson() {
      PersonServices.addPerson(this.person)
        .then(() => {
          this.$router.push({ name: "personList" });
        })
        .catch((error) => {
          this.message = error.response.data.message;
          console.log(error);
        });
    },
    cancel() {
      this.$router.push({ name: "personList" });
    },
  },
};
</script>
