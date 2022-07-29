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
      <v-form ref="form" >
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
         
        ></v-text-field>

        <v-container fluid>
          <p>{{ selected }}</p>
          <v-checkbox
            v-model="status"
            label="This student was a no-show"
            value="No-Show"
           
          ></v-checkbox>
        </v-container>
        <v-btn
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
import AppointmentServices from "@/services/appointmentServices.js";

export default {
  props: ["id", "userId"],

  data() {
    return {
      personAppointment: {},
      numericalfeedback: null,
      textualfeedback: "",
      personAppointmentId: "",
      status: "",
      appointment: {},
      message: "Provide feedback for your recent session",
      roles: ["admin"]


    }
  },
  
  async created() {
    await PersonAppointmentServices.findPersonAppointmentByPersonAndAppointment(
      this.userId,
      this.id
    )
      .then((response) => {
        this.personAppointment = response.data;
        this.personAppointmentId = this.personAppointment.id;
        console.log(this.personAppointment);
      })
      .catch((error) => {
        this.message = error.response.data.message
        console.log("There was an error:", error.response);
      });
    await AppointmentServices.getAppointment(this.id)
      .then((response) => {
        this.appointment = response.data;
        console.log(response.data);
      })
      .catch((error) => {
        this.message = error.response.data.message
        console.log("Appointment: " + this);
        console.log("There was an error:", error.response);
      });
    
  },

  methods: {
    async updatePersonAppointment() {

      if (this.status!= 'No-Show' && (this.numericalfeedback == null) || this.textualfeedback.lenght ==0) {
         this.message = "Please enter a star value and a comment"

      }

      else {
      if (this.status) {
        console.log('no-show')
        this.appointment.status = 'no-show'
      } else {
        console.log('complete')
        this.appointment.status = "complete";
      }
      this.personAppointment.feedbacktext = this.textualfeedback;
      this.personAppointment.feedbacknumber = this.numericalfeedback;
      AppointmentServices.updateAppointment(this.id, this.appointment)
      .catch(error =>{
        this.message = error.response.data.message
      })

      PersonAppointmentServices.updatePersonAppointment(
        this.personAppointment.id,
        this.personAppointment
      )
        .then((response) => {
          console.log(response.data)
          this.$router.go(-1);
        })
        .catch((error) => {
          this.message = error.response.data.message
          console.log(error);
        });
    }
    },

   
    cancel() {
      this.$router.go(-1);
    },
  },
};
</script>
