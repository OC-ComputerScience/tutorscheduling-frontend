<template>
  <div>
    <v-container>
      <v-toolbar>
        <v-toolbar-title
          >Providing Feedback for {{ this.personAppointment }}</v-toolbar-title
        >
      </v-toolbar>
      <br />
      <br />
      <v-form ref="form" v-model="valid" lazy validation>
        <div class="text-xs-center">
          <v-layout justify-center>
            <h4>What would you rate this appointment experience?</h4>
          </v-layout>
            <br />
          <v-layout justify-center>
            <v-rating
              class="justify-center"
              v-model="personAppointment.feedbacknumber"
              background-color="grey"
              color="primary"
              empty-icon="mdi-star-outline"
              full-icon="mdi-star"
              hover
              length="5"
              size="45"
              value="3"
            ></v-rating>
          </v-layout>
        </div>
        <v-text-field
          v-model="personAppointment.feedbacktext"
          id="description"
          :counter="500"
          label="Provide Feedback..."
          required
        ></v-text-field>

        <v-btn
          :disabled="!valid"
          color="success"
          class="mr-4"
          @click="updatePersonAppointment"
        >
          Save
        </v-btn>

        <v-btn color="error" class="mr-4" @click="cancel"> Cancel </v-btn>
      </v-form>
    </v-container>
  </div>
</template>

<script>
import PersonAppointmentServices from "@/services/personAppointmentServices.js";

export default {
  props: ["id"],

  data() {
    return {
      personAppointment: {},
      message: "Make updates to the PersonAppointment",
      roles: ["admin"],
    };
  },
  created() {
    PersonAppointmentServices.getPersonAppointment(this.id)
      .then((response) => {
        this.personAppointment = response.data;
        console.log(response.data);
      })
      .catch((error) => {
        console.log("There was an error:", error.response);
      });
  },

  methods: {
    updatePersonAppointment() {
      PersonAppointmentServices.updatePersonAppointment(
        this.id,
        this.personAppointment
      )
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