<template>
  <div>
    <v-container>
      <v-toolbar>
        <v-toolbar-title>Help</v-toolbar-title>
        <v-spacer></v-spacer>
        <InformationComponent
          message="This document details how to use this application."></InformationComponent>
      </v-toolbar>
      <br />
      <v-alert v-model="showAlert" dismissible :type="alertType">{{
        this.alert
      }}</v-alert>
      <br />
      <!-- <button @click="$refs.myPdfComponent.print()">print</button> -->
      <vue-pdf-embed
        v-for="i in tutorial.pages"
        :key="i"
        :source="tutorial.pdf"></vue-pdf-embed>
    </v-container>
  </div>
</template>

<script>
import Utils from "@/config/utils.js";
import VuePdfEmbed from "vue-pdf-embed/dist/vue2-pdf-embed";
import PersonRoleServices from "@/services/personRoleServices.js";
import RoleServices from "@/services/roleServices.js";
import InformationComponent from "../components/InformationComponent.vue";

export default {
  name: "Help",
  props: ["id"],
  components: {
    VuePdfEmbed,
    InformationComponent,
  },
  data() {
    return {
      showAlert: false,
      alert: "",
      alertType: "success",
      user: {},
      tutorial: {},
      currentRole: {},
      files: [
        { pdf: "StudentTutorial.pdf", pages: 24 },
        { pdf: "TutorTutorial.pdf", pages: 29 },
      ],
    };
  },
  async created() {
    this.user = Utils.getStore("user");
    await this.getCurrentRole();
    if (this.checkRole("Student")) {
      this.tutorial = this.files[0];
    } else if (this.checkRole("Tutor")) {
      this.tutorial = this.files[1];
    }
    console.log(this.tutorial);
  },
  methods: {
    async getCurrentRole() {
      await PersonRoleServices.getPersonRole(this.id)
        .then(async (response) => {
          await RoleServices.getRole(response.data.roleId)
            .then((result) => {
              this.currentRole = result.data;
            })
            .catch((error) => {
              this.alertType = "error";
              this.alert = error.response.data.message;
              this.showAlert = true;
              console.log("There was an error:", error.response);
            });
        })
        .catch((error) => {
          this.alertType = "error";
          this.alert = error.response.data.message;
          this.showAlert = true;
          console.log("There was an error:", error.response);
        });
    },
    checkRole(type) {
      if (this.currentRole != null && this.currentRole.type == type) {
        return true;
      } else {
        return false;
      }
    },
  },
};
</script>
