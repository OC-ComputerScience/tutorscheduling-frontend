<template>
  <div>
    <v-container>
      <v-toolbar>
        <v-toolbar-title>{{ message }}</v-toolbar-title>
        <v-spacer></v-spacer>
        <InformationComponent
          message="Confirm or cancel your appointment."
        ></InformationComponent>
      </v-toolbar>
      <br />
      <br />
      <v-dialog v-model="showDeleteConfirmation" persistent max-width="750px">
        <DeleteConfirmationComponent
          type="appointment"
          :item="appointment"
          @handleReturningCancel="showDeleteConfirmation = false"
          @handleReturningSuccess="directToCancel()"
        ></DeleteConfirmationComponent>
      </v-dialog>
      <v-dialog
        v-model="showSessionExpiredConfirmation"
        persistent
        max-width="750px"
      >
        <v-card>
          <v-card-title>This link has expired.</v-card-title>
          <v-card-text> </v-card-text>
          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn
              color="grey"
              class="white--text"
              @click="$emit('handleReturningCancel')"
              >Send me a new link</v-btn
            >
          </v-card-actions>
        </v-card>
      </v-dialog>
      <v-row justify="center">
        <v-card
          v-if="appointment.date !== undefined"
          flat
          color="grey lighten-4"
          min-width="500px"
        >
          <v-card-title class="justify-center">
            Appointment on {{ formatDate(appointment.date) }} with
            {{ appointment.students[0].person.fName }}
            {{ appointment.students[0].person.lName }}
          </v-card-title>
          <v-card-text>
            <b>Time: </b>{{ calcTime(appointment.startTime) }} -
            {{ calcTime(appointment.endTime) }}
            <br />
            <b>Type: </b>{{ appointment.type }}
            <br />
            <b>Location: </b>{{ appointment.location.name }}
            <br />
            <b>Topic: </b>{{ appointment.topic.name }}
            <br />
            <b>Pre-Session Info: </b>{{ appointment.preSessionInfo }}
          </v-card-text>
        </v-card>
      </v-row>
      <br />
      <br />
      <v-row justify="center">
        <v-btn color="success" class="mr-4" @click="confirmAppointment()">
          Confirm
        </v-btn>
        <v-btn
          color="error"
          class="mr-4"
          @click="showDeleteConfirmation = true"
        >
          Reject
        </v-btn>
      </v-row>
    </v-container>
  </div>
</template>

<script>
import Utils from "@/config/utils.js";
import AppointmentServices from "@/services/appointmentServices";
import DeleteConfirmationComponent from "../components/DeleteConfirmationComponent.vue";
import InformationComponent from "../components/InformationComponent.vue";
import { TimeFunctionsMixin } from "../mixins/TimeFunctionsMixin";

export default {
  name: "ConfirmAppointment",
  components: {
    DeleteConfirmationComponent,
    InformationComponent,
  },
  mixins: [TimeFunctionsMixin],
  props: ["id", "sessionToken"],
  data() {
    return {
      message: "Confirm or Cancel Appointment",
      showDeleteConfirmation: false,
      showSessionExpiredConfirmation: false,
      appointment: {},
      user: {
        token: "",
      },
    };
  },
  async created() {
    this.user.token = this.sessionToken;
    Utils.setStore("user", this.user);
    await this.getAppointment();
  },
  methods: {
    async getAppointment() {
      await AppointmentServices.getInfoForText(this.id)
        .then(async (response) => {
          this.appointment = response.data[0];
          this.appointment.students = this.appointment.personappointment.filter(
            (pa) => pa.isTutor === false
          );
          this.appointment.tutors = this.appointment.personappointment.filter(
            (pa) => pa.isTutor === true
          );
        })
        .catch((error) => {
          this.showSessionExpiredConfirmation = true;
          console.log("There was an error: ", error);
        });
    },
  },
};
</script>
