<template>
  <div>
    <v-container>
      <v-toolbar>
        <v-toolbar-title>{{ this.message }}</v-toolbar-title>
        <v-spacer></v-spacer>
        <v-tooltip bottom>
          <template v-slot:activator="{ on, attrs }">
            <v-icon
              class="mx-2"
              color="grey darken"
              dark
              v-bind="attrs"
              v-on="on">
              mdi-information
            </v-icon>
          </template>
          <span> Apply for more help or another position. </span>
        </v-tooltip>
      </v-toolbar>
      <br /><br />
      <v-row justify="center">
        <v-col justify="center">
          <v-card
            @click="openRegistration = true"
            height="100"
            elevation="10"
            color="primary"
            class="d-flex justify-center align-center">
            <v-card-title class="justify-center white--text">
              Apply
            </v-card-title>
          </v-card>
        </v-col>
      </v-row>
      <RegistrationComponent
        v-if="this.user !== null && openRegistration"></RegistrationComponent>
    </v-container>
  </div>
</template>

<script>
import Utils from "@/config/utils.js";
import RegistrationComponent from "../components/RegistrationComponent.vue";

export default {
  name: "Apply",
  components: {
    RegistrationComponent,
  },
  data() {
    return {
      message: "Apply for more help or another position:",
      openRegistration: false,
    };
  },
  created() {
    this.user = Utils.getStore("user");
  },
  methods: {},
};
</script>
