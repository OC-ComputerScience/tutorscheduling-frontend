<template>
  <div>
    <v-container>
      <v-toolbar>
        <v-toolbar-title>{{this.message}}</v-toolbar-title>
        <v-spacer></v-spacer>
        <v-tooltip bottom>
          <template v-slot:activator="{ on, attrs }">
              <v-icon
              class="mx-2"
              color="grey darken"
              dark
              v-bind="attrs"
              v-on="on"
              >
              mdi-information
              </v-icon>
          </template>
          <span>
            Provide feedback for your recent session.
          </span>
        </v-tooltip>
      </v-toolbar>
      <br />
      <br />
      <v-row justify="center">
        <v-card
          flat
          color="grey lighten-4"
          min-width="500px"
        >
          <v-card-title
            class="justify-center"
          >
            Appointment on {{this.dateText}} with {{this.studentText}}
          </v-card-title>
          <v-card-text>
            <b>Time: </b>{{this.appointment.startTime}} - {{this.appointment.endTime}}
            <br>
            <b>Type: </b>{{this.appointment.type}}
            <br>
            <b>Location: </b>{{this.appointment.location.name}}
            <br>
            <b>Topic: </b>{{this.appointment.topic.name}}
            <br>
            <b>Pre-Session Info: </b>{{this.appointment.preSessionInfo}}
            <br>
            <b>Other Tutor(s): </b>{{this.tutorText}}
          </v-card-text>
        </v-card>
      </v-row>
      <br><br>
      <v-row justify="center">
        <v-form ref="form" v-model="valid" lazy validation>
          <div class="text-xs-center">
            <v-layout justify-center>
              <h2>What would you rate this appointment experience?</h2>
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
          <v-container fluid>
            <v-checkbox
              v-model="status"
              label="This student was a no-show"
              value="No-Show"
            
            ></v-checkbox>
          </v-container>
          <v-btn
            :disabled="!valid || !textualfeedback"
            color="success"
            class="mr-4"
            @click="updatePersonAppointment"
          >
            Save
          </v-btn>

          <v-btn color="error" class="mr-4" @click="cancel"> Cancel </v-btn>
        </v-form>
      </v-row>
      <br><br>
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
      selected: false,
      valid: false,
      personAppointment: {},
      appointment: {
        startTime: "",
        endTime: "",
        type: "",
        location: {
          name: ""
        },
        topic: {
          name: ""
        },
        preSessionInfo: ""
      },
      dateText: '',
      tutorText: '',
      studentText: '',
      numericalfeedback: null,
      textualfeedback: "",
      personAppointmentId: "",
      status: "",
      message: "Tutor's Feedback",
      roles: ["admin"]
    }
  },
  
  async created() {
    await this.getAppointment();
    this.dateText = this.appointment.date.toString().substring(5,10) + "-" + this.appointment.date.toString().substring(0,4)  
  },

  methods: {
    async getAppointment() {
      await AppointmentServices.getAppointmentForFeedback(this.id)
      .then((response) => {
        this.appointment = response.data[0];
        for(let i = 0; i < this.appointment.personappointment.length; i++) {
          let personApp = this.appointment.personappointment[i];
          if(personApp.personId === this.userId) {
            this.personAppointment = personApp;
            this.personAppointmentId = this.personAppointment.id
          }
          else {
            if(personApp.isTutor) {
              if(this.tutorText !== '')
                this.tutorText += ", ";
              this.tutorText += personApp.person.fName + " " + personApp.person.lName;
            }
            else {
              if(this.studentText !== '')
                this.studentText += ", ";
              this.studentText += personApp.person.fName + " " + personApp.person.lName;
            }
          }
        }
      })
      .catch((error) => {
        this.message = error.response.data.message
        console.log("There was an error:", error.response);
      });
    },
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
