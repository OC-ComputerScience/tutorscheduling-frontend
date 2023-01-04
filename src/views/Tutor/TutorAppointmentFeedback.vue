<template>
  <div>
    <v-container>
      <v-toolbar>
        <v-toolbar-title>{{ message }}</v-toolbar-title>
        <v-spacer></v-spacer>
        <InformationComponent
          message="Provide feedback for your recent session."
        ></InformationComponent>
      </v-toolbar>
      <br />
      <v-alert v-model="showAlert" dismissible :type="alertType">{{
        alert
      }}</v-alert>
      <br />
      <v-row justify="center">
        <v-card flat color="grey lighten-4" min-width="500px">
          <v-card-title class="justify-center">
            Appointment on {{ dateText }} with {{ studentText }}
          </v-card-title>
          <v-card-text>
            <b>Time: </b>{{ appointment.startTime }} -
            {{ appointment.endTime }}
            <br />
            <b>Type: </b>{{ appointment.type }}
            <br />
            <b>Location: </b>{{ appointment.location.name }}
            <br />
            <b>Topic: </b>{{ appointment.topic.name }}
            <br />
            <b>Pre-Session Info: </b>{{ appointment.preSessionInfo }}
            <br />
            <b>Other Tutor(s): </b>{{ tutorText }}
          </v-card-text>
        </v-card>
      </v-row>
      <br /><br />
      <v-row justify="center">
        <v-form ref="form" v-model="valid" lazy validation>
          <div class="text-xs-center">
            <v-layout justify-center>
              <h2>What would you rate this appointment experience?</h2>
            </v-layout>
            <br />
            <v-layout justify-center>
              <v-rating
                v-model="numericalfeedback"
                class="justify-center"
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
            id="description"
            v-model="textualfeedback"
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
      <br /><br />
    </v-container>
  </div>
</template>

<script>
import PersonAppointmentServices from "@/services/personAppointmentServices.js";
import AppointmentServices from "@/services/appointmentServices.js";
import InformationComponent from "../../components/InformationComponent.vue";

export default {
  name: "TutorAppointmentFeedback",
  components: {
    InformationComponent,
  },
  props: {
    id: {
      type: Number,
      default: 0,
    },
    userId: {
      type: Number,
      default: 0,
    },
  },
  data() {
    return {
      selected: false,
      showAlert: false,
      alert: "",
      alertType: "success",
      valid: false,
      personAppointment: {},
      appointment: {
        startTime: "",
        endTime: "",
        type: "",
        location: {
          name: "",
        },
        topic: {
          name: "",
        },
        preSessionInfo: "",
      },
      dateText: "",
      tutorText: "",
      studentText: "",
      numericalfeedback: null,
      textualfeedback: "",
      personAppointmentId: "",
      status: "",
      message: "Tutor's Feedback",
      roles: ["admin"],
    };
  },

  async created() {
    await this.getAppointment();
    this.dateText =
      this.appointment.date.toString().substring(5, 10) +
      "-" +
      this.appointment.date.toString().substring(0, 4);
  },

  methods: {
    async getAppointment() {
      await AppointmentServices.getAppointmentForFeedback(this.id)
        .then((response) => {
          this.appointment = response.data[0];
          for (let i = 0; i < this.appointment.personappointment.length; i++) {
            let personApp = this.appointment.personappointment[i];
            if (personApp.personId === this.userId) {
              this.personAppointment = personApp;
              this.personAppointmentId = this.personAppointment.id;
            } else {
              if (personApp.isTutor) {
                if (this.tutorText !== "") this.tutorText += ", ";
                this.tutorText +=
                  personApp.person.fName + " " + personApp.person.lName;
              } else {
                if (this.studentText !== "") this.studentText += ", ";
                this.studentText +=
                  personApp.person.fName + " " + personApp.person.lName;
              }
            }
          }
        })
        .catch((error) => {
          this.alertType = "error";
          this.alert = error.response.data.message;
          this.showAlert = true;
          console.log("There was an error:", error.response);
        });
    },
    async updatePersonAppointment() {
      if (
        (this.status != "No-Show" && this.numericalfeedback == null) ||
        this.textualfeedback.length == 0
      ) {
        this.message = "Please enter a star value and a comment";
      } else {
        if (this.status) {
          console.log("no-show");
          this.appointment.status = "no-show";
        } else {
          console.log("complete");
          this.appointment.status = "complete";
        }
        this.personAppointment.feedbacktext = this.textualfeedback;
        this.personAppointment.feedbacknumber = this.numericalfeedback;
        await AppointmentServices.updateAppointment(
          this.id,
          this.appointment
        ).catch((error) => {
          this.alertType = "error";
          this.alert = error.response.data.message;
          this.showAlert = true;
          console.log("There was an error:", error.response);
        });

        await PersonAppointmentServices.updatePersonAppointment(
          this.personAppointment.id,
          this.personAppointment
        )
          .then((response) => {
            console.log(response.data);
            this.$router.go(-1);
          })
          .catch((error) => {
            this.alertType = "error";
            this.alert = error.response.data.message;
            this.showAlert = true;
            console.log("There was an error:", error.response);
          });
      }
    },

    cancel() {
      this.$router.go(-1);
    },
  },
};
</script>
