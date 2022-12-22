<template>
  <div>
    <v-container>
      <v-toolbar>
        <v-toolbar-title>{{ this.message }}</v-toolbar-title>
        <v-spacer></v-spacer>
        <InformationComponent
          message="Apply to be a student or a tutor in a different group."></InformationComponent>
      </v-toolbar>
      <br />
      <br />
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
import InformationComponent from "@/components/InformationComponent.vue";

export default {
  name: "Apply",
  components: {
    RegistrationComponent,
    InformationComponent,
  },
  data() {
    return {
      message: "Apply",
      openRegistration: false,
    };
  },
  created() {
    this.user = Utils.getStore("user");
  },
  methods: {},
};
</script>
