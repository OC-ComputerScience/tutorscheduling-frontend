<template>
  <div>
    <v-container>
      <v-toolbar>
        <v-toolbar-title>{{ this.message }}</v-toolbar-title>
      </v-toolbar>
      <br /><br />
      <v-text-field v-model="fullName" label="Name" readonly></v-text-field>

      <v-text-field
        v-model="person.email"
        label="Email"
        readonly
      ></v-text-field>

      <v-text-field
        v-model="person.phoneNum"
        id="phoneNum"
        :counter="13"
        label="Mobile Phone"
        hint="111-222-3333"
        persistent-hint
        required
      ></v-text-field>

      <br />
      <v-btn
        color="accent"
        @click="savePhoneNum()"
        class="justify-center white--text"
      >
        Update Phone Number
      </v-btn>

      <br /><br />
    </v-container>
  </div>
</template>

<script>
import PersonServices from "@/services/personServices";
import Utils from "@/config/utils.js";

export default {
  name: "App",
  components: {},
  data() {
    return {
      search: "",
      person: {},
      fullName: "",
      message: "Edit Admin Account",
    };
  },
  async created() {
    this.user = Utils.getStore("user");
    await this.getPerson();
  },
  methods: {
    async getPerson() {
      await PersonServices.getPerson(this.user.userID)
        .then((response) => {
          this.person = response.data;
          this.fullName = this.person.fName + " " + this.person.lName;
        })
        .catch((error) => {
          this.message = error.response.data.message;
          console.log("There was an error:", error.response);
        });
    },
    savePhoneNum() {
      PersonServices.updatePerson(this.person.id, this.person);
    },
  },
};
</script>
