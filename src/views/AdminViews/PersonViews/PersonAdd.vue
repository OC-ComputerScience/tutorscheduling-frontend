
<template>
  <div>
    <v-container>
      <v-toolbar>
        <v-toolbar-title>Add Person</v-toolbar-title>
      </v-toolbar>
      <br>
    <v-form
      ref="form" 
      v-model="valid"
      lazy validation
    >
      <v-text-field
        v-model="person.fName"
        id="fName"
        :counter="25"
        label="First Name"
        hint="First Name"
        persistent-hint
        required
      ></v-text-field>
      
      <v-text-field
        v-model="person.lName"
        id="lName"
        :counter="25"
        label="Last Name"
        hint="Last Name"
        persistent-hint
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
        @click="addPerson"
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
  data() {
    return {
      person: {},
      roles: [
        'admin'
      ],
    };
  },
  methods: {
    addPerson() {
      PersonServices.addPerson(this.person)
        .then(() => {
          this.$router.push({ name: "personList" });
        })
        .catch((error) => {
          console.log(error);
        });
    },
    cancel() {
      this.$router.push({ name: "personList" });
    }
  },
};
</script>