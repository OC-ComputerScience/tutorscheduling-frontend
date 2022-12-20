<template>
  <div>
    <v-container>
      <v-toolbar>
        <v-toolbar-title>{{ this.message }}</v-toolbar-title>
      </v-toolbar>
      <br /><br />
      <v-row justify="center">
        <v-col justify="center">
          <v-card
            @click="openCards = true"
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
      <Registration v-if="this.user !== null && openCards"></Registration>
    </v-container>
  </div>
</template>

<script>
import Utils from "@/config/utils.js";
import Registration from "../components/Registration.vue";

export default {
  components: {
    Registration,
  },
  data() {
    return {
      message: "Apply for more help or another position:",
      openCards: false,
    };
  },
  created() {
    this.user = Utils.getStore("user");
  },
  methods: {},
};
</script>
