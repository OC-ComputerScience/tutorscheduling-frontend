<template>
  <div>
    <v-container>
      <v-toolbar>
        <v-toolbar-title
          >{{this.message}}</v-toolbar-title
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
              v-model="numericalfeedback"
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
          v-model="textualfeedback"
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
import AppointmentServices from "@/services/appointmentServices.js";
import PersonAppointmentServices from "@/services/personAppointmentServices.js";

export default {
  props: ["id", "userId"],

  data() {
    return {
      personAppointment: {},
      appointment: {},
      numericalfeedback: null,
      textualfeedback: "",
      personAppointmentId: "",

      message: "Provide Feedback for your recent appointment",
      roles: ["admin"],

    }; 
  },
  async created() {
    await AppointmentServices.getAppointmentForFeedback(this.id)
    .then((response) => {
      this.appointment = response.data;
      for(let i = 0; i < this.appointment.personappointment.length; i++) {
        let personApp = this.appointment.personappointment[i];
        if(personApp.personId === this.userId) {
          this.personAppointment = personApp;
          this.personAppointmentId = this.personAppointment.id
          console.log(this.personAppointment);
        }
      }
    })
    .catch((error) => {
      this.message = error.response.data.message
      console.log("There was an error:", error.response);
    });
    // await PersonAppointmentServices.findPersonAppointmentByPersonAndAppointment(
    //   this.userId,
    //   this.id
    // )
    //   .then((response) => {
    //     this.personAppointment = response.data;
    //     this.personAppointmentId = this.personAppointment.id;
    //     console.log(this.personAppointment);
    //   })
    //   .catch((error) => {
    //     this.message = error.response.data.message
    //     console.log("There was an error:", error.response);
    //   });
  },

  methods: {
    async updatePersonAppointment() {
      delete this.personAppointment.person;
      this.personAppointment.feedbacktext = this.textualfeedback;
      this.personAppointment.feedbacknumber = this.numericalfeedback;
      await PersonAppointmentServices.updatePersonAppointment(
        this.personAppointmentId,
        this.personAppointment
      )
        .then((response) => {
          console.log(response.data);
          this.$router.go(-1);
        })
        .catch((error) => {
          this.message = error.response.data.message
          console.log(error);
        });
    },
    cancel() {
      this.$router.go(-1);
    },
  },
};
</script>
